import * as THREE from 'three';
import { GRAVITY } from './world.js';

// --- The canonical landscape frame / canonical 横屏坐标系 ---
//
// Three frames matter, and keeping them explicit is what keeps physics
// and presentation from silently disagreeing (the 2026-07-05 iPad
// mirror bug was a missing frame term):
//
//   DEVICE  — the physical sensor frame, portrait-referenced
//             (+X short-axis right, +Y toward top edge, +Z out of screen).
//   HOLD    — how the user physically holds the device. Resolved from
//             gravity with hysteresis + debounce. H = 270° (canonical,
//             top edge left) or 90° (flipped, top edge right).
//   FRAMEBUFFER — the box the OS hands us to draw in, relative to the
//             device. F ∈ {0, 90, 180, 270}. The OS moves this when it
//             auto-rotates; rotation-locked devices keep it fixed.
//
// Physics: device → canonical is one fixed rotation, plus 180° when the
// hold is flipped. Gravity only — no orientation APIs.
//
// Presentation: CSS rotation R = −(H + F) mod 360. H comes from gravity.
// F is tracked WITHOUT trusting any API absolutely:
//   - angle DELTAS only (a lying zero-point cancels out in differences),
//   - one calibration on the first sensor reading: the user just tapped
//     a button they could read, so the screen was readable → R ≈ 0 at
//     that instant pins F. Physical ground truth, not API trust.

// One Euro Filter (Casiez, Roussel & Vogel, CHI 2012), written from the
// paper's equations. Adaptive low-pass: the cutoff frequency rises with
// signal speed — heavy smoothing near stillness (sensor noise dies),
// light smoothing under fast motion (no lag when the phone whips).
class OneEuro1D {
  constructor() {
    this.minCutoff = 1; // Hz; overwritten from MotionInput each sample
    this.beta = 0;
    this.dCutoff = 1; // derivative filter cutoff; fixed, rarely needs tuning
    this._x = null;
    this._dx = 0;
  }

  static alpha(cutoff, dt) {
    const tau = 1 / (2 * Math.PI * cutoff);
    return 1 / (1 + tau / dt);
  }

  filter(x, dt) {
    if (this._x === null) {
      this._x = x;
      return x;
    }
    const dx = (x - this._x) / dt;
    const aD = OneEuro1D.alpha(this.dCutoff, dt);
    this._dx = aD * dx + (1 - aD) * this._dx;
    const cutoff = this.minCutoff + this.beta * Math.abs(this._dx);
    const a = OneEuro1D.alpha(cutoff, dt);
    this._x = a * x + (1 - a) * this._x;
    return this._x;
  }
}

export function screenAngle() {
  if (screen.orientation && typeof screen.orientation.angle === 'number') {
    return screen.orientation.angle;
  }
  return typeof window.orientation === 'number' ? window.orientation : 0;
}

// Hysteresis threshold for the gravity-resolved hold flip (m/s²).
// ~3.5 ≈ 21° of tilt past level before a flip is even considered.
const FLIP_THRESHOLD = 3.5;

// If field testing shows the frame going WRONG after OS rotations
// (rather than staying correct), the platform's angle sign convention
// is opposite to assumed — negate the delta here.
const ANGLE_DELTA_SIGN = 1;

export class MotionInput {
  constructor(world) {
    this.world = world;
    this.enabled = false; // listening for events
    this.active = false; // real sensor data has actually arrived
    this.flipSign = true; // field-tested on iPhone: raw reading needs flipping
    this.frameOffset = 'auto'; // 'auto' (gravity-resolved) | 0 | 180
    // One Euro params. Tune minCutoff FIRST (hold still, lower it until
    // calm), then beta (whip the phone, raise it until no lag).
    this.minCutoff = 0.6; // Hz — still-state calm
    this.beta = 0.12; // cutoff gain per unit derivative — motion response
    // Flip ergonomics (Problem 2, 2026-07-05):
    this.flipDelay = 1.0; // s past threshold before a flip commits
    this.holdFrame = false; // 🔒 workshop tool: freeze flip + framebuffer tracking
    this.flipped = false; // gravity-resolved hold: false = canonical (H 270°)
    this._pendingFlipAt = null; // debounce timer start (ms)
    this._filters = [new OneEuro1D(), new OneEuro1D(), new OneEuro1D()];
    // Filtered true-gravity direction in the DEVICE frame (continuous
    // there; the filter never sees our 180° frame snaps).
    this._device = new THREE.Vector3(0, -GRAVITY, 0);
    this._canonical = new THREE.Vector3(0, -GRAVITY, 0);
    this._lastT = null;
    this._calibrated = false;

    // Framebuffer tracking: initial guess, then deltas only.
    // Portrait viewport → F = 0 (portrait framebuffer). Landscape →
    // iPhone-convention guess from the angle; lying devices get fixed
    // by the readable-prior calibration on first sensor reading.
    const a = ((screenAngle() % 360) + 360) % 360;
    this._F =
      window.innerHeight > window.innerWidth
        ? 0
        : a === 270 || a === 180
          ? 270
          : 90;
    this._lastAngle = a;
    this._onAngle = this._onAngle.bind(this);
    window.addEventListener('resize', this._onAngle);
    if (screen.orientation) {
      screen.orientation.addEventListener('change', this._onAngle);
    }
    this._onMotion = this._onMotion.bind(this);
  }

  _onAngle() {
    const a = ((screenAngle() % 360) + 360) % 360;
    if (!this.holdFrame) {
      const delta = (((a - this._lastAngle) * ANGLE_DELTA_SIGN) % 360 + 360) % 360;
      this._F = (this._F + delta) % 360;
    }
    this._lastAngle = a;
  }

  // iOS 13+ gates motion data behind a permission prompt that can only
  // be triggered from a user tap.
  needsTapToEnable() {
    return (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function'
    );
  }

  async enable() {
    if (this.needsTapToEnable()) {
      const answer = await DeviceMotionEvent.requestPermission();
      if (answer !== 'granted') return false;
    }
    window.addEventListener('devicemotion', this._onMotion);
    this.enabled = true;
    return true;
  }

  // Physics 180°: manual stepper wins, else the gravity-resolved hold.
  resolveOffset() {
    if (this.frameOffset !== 'auto') return Number(this.frameOffset);
    return this.flipped ? 180 : 0;
  }

  // CSS rotation for the presentation half: R = −(H + F).
  // Same H as physics — the two halves cannot disagree by construction.
  presentationRotation() {
    const H = this.resolveOffset() === 180 ? 90 : 270;
    return (720 - H - this._F) % 360;
  }

  _onMotion(event) {
    const g = event.accelerationIncludingGravity;
    if (!g || g.x === null) return;
    this.active = true;

    const now = performance.now();
    const dt =
      this._lastT === null
        ? 1 / 60
        : Math.min(Math.max((now - this._lastT) / 1000, 1 / 120), 0.1);
    this._lastT = now;

    // 1. Sign correction → true gravity direction, device frame.
    const sign = this.flipSign ? -1 : 1;

    // 2. One Euro, per axis, in the device frame.
    for (const f of this._filters) {
      f.minCutoff = this.minCutoff;
      f.beta = this.beta;
    }
    this._device.set(
      this._filters[0].filter(g.x * sign, dt),
      this._filters[1].filter(g.y * sign, dt),
      this._filters[2].filter(g.z * sign, dt)
    );

    // 3. Which hold? Hysteresis dead band + temporal debounce: the
    // threshold must stay crossed for flipDelay seconds continuously.
    // Real rotations last much longer; hand tremor doesn't.
    const wantFlip =
      this._device.x > FLIP_THRESHOLD
        ? true
        : this._device.x < -FLIP_THRESHOLD
          ? false
          : null;

    if (!this._calibrated) {
      // First reading: the user just tapped/loaded a screen they could
      // read, so commit the hold immediately (no debounce) and, in a
      // landscape viewport, pin F so that R = 0 right now. This is the
      // readable-prior calibration — physical ground truth.
      this._calibrated = true;
      if (wantFlip !== null) this.flipped = wantFlip;
      if (window.innerWidth > window.innerHeight) {
        const H = this.flipped ? 90 : 270;
        this._F = (360 - H) % 360;
      }
    } else if (
      this.holdFrame ||
      this.frameOffset !== 'auto' ||
      wantFlip === null ||
      wantFlip === this.flipped
    ) {
      this._pendingFlipAt = null;
    } else if (this._pendingFlipAt === null) {
      this._pendingFlipAt = now;
    } else if ((now - this._pendingFlipAt) / 1000 >= this.flipDelay) {
      this.flipped = wantFlip;
      this._pendingFlipAt = null;
    }

    // 4. Device → canonical (fixed rotation), then the resolved 180°.
    let x = -this._device.y;
    let y = this._device.x;
    if (this.resolveOffset() === 180) {
      x = -x;
      y = -y;
    }
    this._canonical.set(x, y, this._device.z);
  }

  // Called once per rendered frame, before physics steps. The filter
  // already smooths; no extra lerp on top.
  update() {
    if (!this.active) return;
    this.world.gravity.copy(this._canonical);
  }
}

// Overlay button for the iOS permission dance. Hidden once granted, or
// never shown on platforms that don't need it.
export function mountEnableButton(input) {
  if (!input.needsTapToEnable()) {
    // Non-iOS: listen right away. On desktop the event simply never
    // fires and gravity keeps its fixed default — that's the fallback.
    input.enable();
    return;
  }
  const button = document.getElementById('enable-tilt');
  button.hidden = false;
  button.addEventListener('click', async () => {
    const ok = await input.enable();
    if (ok) button.hidden = true;
    else button.textContent = 'motion denied — check Settings › Safari';
  });
}
