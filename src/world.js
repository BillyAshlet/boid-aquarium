import * as THREE from 'three';

// Tank interior, meters. Dimensions are tunable; the convention
// (meters, origin at tank center, +Y up) is not.
export const TANK = { width: 1.2, height: 0.8, depth: 0.5 };

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
