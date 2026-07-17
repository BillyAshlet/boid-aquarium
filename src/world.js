import * as THREE from 'three';

// Tank interior, meters — PLATFORM-SPECIFIC (decided 2026-07-15).
// Mobile keeps toy scale (the original toy is small for a reason);
// desktop gets aquarium scale — space to inhabit, and the direct
// experiment for the multi-gyre target. The convention (meters, origin
// at tank center, +Y up) is universal; only the numbers diverge.
//
// Scaling model A (ratified 2026-07-17): ONLY the tank scales. Fish
// size, perception radii, detectionLength, wall margin are creature
// properties and stay fixed — the dimensionless ratios (radius vs tank
// span, fish per volume) ARE the experiment. fishCount is the density
// knob.
export const TANK_PRESETS = {
  mobile: { width: 1.2, height: 0.8, depth: 0.5 },
  desktop: { width: 2.0, height: 1.2, depth: 0.8 },
};
const platform = navigator.maxTouchPoints === 0 ? 'desktop' : 'mobile';
export const TANK = { ...TANK_PRESETS[platform] };

// Dims are live-tunable: the panel mutates TANK.* directly (every
// consumer reads at use time), then calls notifyTankChange() so the
// shell rebuilds and the camera re-homes.
const tankListeners = [];
export function onTankChange(fn) {
  tankListeners.push(fn);
}
export function notifyTankChange() {
  for (const fn of tankListeners) fn();
}

export const GRAVITY = 9.81;

const FIXED_DT = 1 / 60;
const MAX_CATCHUP_STEPS = 5; // after a tab-switch, don't replay the whole gap

export class World {
  constructor() {
    // The one gravity vector. Input writes it; everyone else reads it.
    this.gravity = new THREE.Vector3(0, -GRAVITY, 0);
    // Anything with step(dt), executed in order. Empty until M1.
    this.systems = [];
    this._accumulator = 0;
    this._lastMs = null;
  }

  // Fixed-timestep physics: however fast the display renders, physics
  // advances in identical 1/60 s steps so the game feels the same on a
  // 60 Hz iPhone and a 120 Hz one.
  step(nowMs) {
    if (this._lastMs === null) this._lastMs = nowMs;
    const elapsed = (nowMs - this._lastMs) / 1000;
    this._lastMs = nowMs;
    this._accumulator = Math.min(
      this._accumulator + elapsed,
      MAX_CATCHUP_STEPS * FIXED_DT
    );
    while (this._accumulator >= FIXED_DT) {
      for (const system of this.systems) system.step(FIXED_DT);
      this._accumulator -= FIXED_DT;
    }
  }
}
