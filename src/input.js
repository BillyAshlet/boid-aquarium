import * as THREE from 'three';
import { GRAVITY } from './world.js';

// Reads device tilt and writes the world's gravity vector.
//
// Portrait mapping, device → world: x→x (right), y→y (up), z→z (toward
// viewer). iOS reports accelerationIncludingGravity as the gravity
// vector itself; the W3C spec (and most Android browsers) report the
// reaction force — same numbers, opposite sign. `flipSign` on the debug
// panel is the lie detector: if the arrow points at the ceiling when the
// phone is upright, toggle it.
export class MotionInput {
  constructor(world) {
    this.world = world;
    this.enabled = false; // listening for events
    this.active = false; // real sensor data has actually arrived
    this.flipSign = false;
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
    this._raw.set(g.x * sign, g.y * sign, g.z * sign);
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
