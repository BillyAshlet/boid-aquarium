import * as THREE from 'three';
import { GRAVITY } from './world.js';

// --- Orientation (this is a landscape game) ---

export function screenAngle() {
  if (screen.orientation && typeof screen.orientation.angle === 'number') {
    return screen.orientation.angle;
  }
  // Deprecated fallback for older iOS (-90/0/90/180 — cos/sin don't care)
  return typeof window.orientation === 'number' ? window.orientation : 0;
}

export function isPortrait() {
  if (screen.orientation && screen.orientation.type) {
    return screen.orientation.type.startsWith('portrait');
  }
  return window.innerHeight > window.innerWidth;
}

// Portrait blocks gameplay behind a "rotate your phone" overlay.
// iOS has no orientation lock API, so the overlay is the enforcement;
// Android additionally gets a real lock() attempt (may be ignored
// outside fullscreen — the overlay still covers that case).
export function mountOrientationGuard() {
  const prompt = document.getElementById('rotate-prompt');
  const isTouchDevice = navigator.maxTouchPoints > 0;
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(() => {});
  }
  function refresh() {
    prompt.hidden = !(isTouchDevice && isPortrait());
  }
  window.addEventListener('resize', refresh); // orientationchange fires this too
  if (screen.orientation) {
    screen.orientation.addEventListener('change', refresh);
  }
  refresh();
}

// --- Motion ---
//
// Reads device tilt and writes the world's gravity vector.
//
// Two coordinate corrections happen here, in order:
// 1. Sign. Field-tested on Billy's iPhone (2026-07): the raw reading
//    needs flipping, so `flipSign` defaults ON. The panel toggle stays
//    as the lie detector for other devices: if the arrow points at the
//    ceiling, flip it.
// 2. Screen remap. Sensors report in device-physical axes; when the
//    phone rotates to landscape, screen axes rotate 90° away from them.
//    W3C screen-coordinate transform, θ = screenAngle():
//    xs = x·cosθ + y·sinθ, ys = y·cosθ − x·sinθ, zs = z.
//    Verify on iPad (locks landscape) — the arrow must keep tracking
//    the real floor across all four orientations.
export class MotionInput {
  constructor(world) {
    this.world = world;
    this.enabled = false; // listening for events
    this.active = false; // real sensor data has actually arrived
    this.flipSign = true;
    this.smoothing = 0.15; // 0..1, fraction of raw value blended in per frame
    this._raw = new THREE.Vector3(0, -GRAVITY, 0);
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

  _onMotion(event) {
    const g = event.accelerationIncludingGravity;
    if (!g || g.x === null) return;
    this.active = true;
    const sign = this.flipSign ? -1 : 1;
    const theta = THREE.MathUtils.degToRad(screenAngle());
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    this._raw.set(
      (g.x * c + g.y * s) * sign,
      (g.y * c - g.x * s) * sign,
      g.z * sign
    );
  }

  // Called once per rendered frame, before physics steps.
  update() {
    if (!this.active) return;
    this.world.gravity.lerp(this._raw, this.smoothing);
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
