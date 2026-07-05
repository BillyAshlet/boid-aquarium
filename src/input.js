import * as THREE from 'three';
import { GRAVITY } from './world.js';

// --- The canonical landscape frame / canonical 横屏坐标系 ---
//
// The game world is ALWAYS landscape, anchored to the PHYSICAL DEVICE —
// orientation APIs are never consulted for physics or presentation
// (they lie; field-tested on iPadOS 2026-07). Sensors report in the
// portrait-referenced device frame (+X short-axis right, +Y toward top
// edge, +Z out of screen). Device → canonical is one fixed rotation:
//   canonical_x = −device_y,  canonical_y = +device_x,  canonical_z = device_z
//
// BOTH landscape holds are first-class: which of the two 180°-apart
// frames is presented gets resolved from gravity itself — down swinging
// toward device +X (top edge right) means the flipped hold, toward −X
// the canonical hold, with a hysteresis dead band so near-vertical or
// face-up holds never flap. Physics and presentation flip together, so
// world-down stays honest and the player never has to know there were
// ever two landscapes.

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

// Kept for the debug panel's screen monitor only — never for logic.
export function screenAngle() {
  if (screen.orientation && typeof screen.orientation.angle === 'number') {
    return screen.orientation.angle;
  }
  return typeof window.orientation === 'number' ? window.orientation : 0;
}

// Hysteresis threshold for the gravity-resolved frame flip (m/s²).
// ~3.5 ≈ 21° of tilt past level before we commit to a hold.
const FLIP_THRESHOLD = 3.5;

export class MotionInput {
  constructor(world) {
    this.world = world;
    this.enabled = false; // listening for events
    this.active = false; // real sensor data has actually arrived
    this.flipSign = true; // field-tested on iPhone: raw reading needs flipping
    this.frameOffset = 'auto'; // 'auto' (gravity-resolved) | 0 | 180
    // One Euro params. Tune minCutoff FIRST (hold still, lower it until
    // calm), then beta (whip the phone, raise it until no lag). Defaults
    // are a prior for iOS Safari sensor noise — tune fresh on device.
    this.minCutoff = 0.6; // Hz — still-state calm
    this.beta = 0.12; // cutoff gain per unit derivative — motion response
    this.flipped = false; // gravity-resolved 180° frame state
    this._filters = [new OneEuro1D(), new OneEuro1D(), new OneEuro1D()];
    // Filtered true-gravity direction in the DEVICE frame (filter input
    // is continuous there; it never sees our 180° frame snaps).
    this._device = new THREE.Vector3(0, -GRAVITY, 0);
    this._canonical = new THREE.Vector3(0, -GRAVITY, 0);
    this._lastT = null;
    this._onMotion = this._onMotion.bind(this);
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

  resolveOffset() {
    if (this.frameOffset !== 'auto') return Number(this.frameOffset);
    return this.flipped ? 180 : 0;
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

    // 3. Resolve which landscape hold we're in, from gravity itself.
    if (this._device.x > FLIP_THRESHOLD) this.flipped = true;
    else if (this._device.x < -FLIP_THRESHOLD) this.flipped = false;

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
