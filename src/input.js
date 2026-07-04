import * as THREE from 'three';
import { GRAVITY } from './world.js';

// --- The canonical landscape frame / canonical 横屏坐标系 ---
//
// The game world is ALWAYS landscape, anchored to the PHYSICAL DEVICE —
// not to what the OS claims about orientation. Orientation APIs lie:
// iPadOS reports screen.orientation.angle 0 in docked landscape while
// motion sensors stay portrait-referenced (field-tested 2026-07).
//
// Canonical hold: device top edge pointing LEFT (rotate CCW from
// portrait). Sensors report in the portrait-referenced device frame
// (+X short-axis right, +Y toward top edge, +Z out of screen), so the
// device → canonical remap is one fixed rotation, no API in the loop:
//   canonical_x = −device_y,  canonical_y = +device_x,  canonical_z = device_z
//
// Held the wrong way round, the world appears upside down and the
// player flips the device — like the real toy. No detection, no overlay.
//
// The one ambiguity left: with auto-rotate ON, the OS rotates the page
// to whichever landscape the user holds, and the two landscapes differ
// by 180°. `frameOffset: auto` guesses from screen.orientation.angle;
// the panel stepper (0/90/180/270) is the manual override and the
// diagnosis tool for devices that lie.

export function screenAngle() {
  if (screen.orientation && typeof screen.orientation.angle === 'number') {
    return screen.orientation.angle;
  }
  return typeof window.orientation === 'number' ? window.orientation : 0;
}

export class MotionInput {
  constructor(world) {
    this.world = world;
    this.enabled = false; // listening for events
    this.active = false; // real sensor data has actually arrived
    this.flipSign = true; // field-tested on iPhone: raw reading needs flipping
    this.smoothing = 0.15; // 0..1, fraction of raw value blended in per frame
    this.frameOffset = 'auto'; // 'auto' | 0 | 90 | 180 | 270 (degrees)
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

  resolveOffset() {
    if (this.frameOffset !== 'auto') return Number(this.frameOffset);
    // Portrait viewport: the OS didn't rotate anything, our own CSS
    // rotation handles presentation, device frame is frozen → no offset.
    if (window.innerHeight > window.innerWidth) return 0;
    // Landscape viewport: the OS may have picked the flipped landscape.
    // Best guess from the (sometimes lying) angle — angle 270 is treated
    // as the flipped hold. UNVERIFIED heuristic: confirm on real devices
    // with the panel stepper and refine.
    const norm = ((screenAngle() % 360) + 360) % 360;
    return norm === 270 ? 180 : 0;
  }

  _onMotion(event) {
    const g = event.accelerationIncludingGravity;
    if (!g || g.x === null) return;
    this.active = true;
    const sign = this.flipSign ? -1 : 1;
    // Device → canonical: fixed rotation, API-free.
    const x = -g.y * sign;
    const y = g.x * sign;
    const z = g.z * sign;
    // Auto-rotate correction (0° in the locked/portrait cases).
    const off = THREE.MathUtils.degToRad(this.resolveOffset());
    const c = Math.cos(off);
    const s = Math.sin(off);
    this._raw.set(x * c - y * s, x * s + y * c, z);
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
