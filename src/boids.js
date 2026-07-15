import * as THREE from 'three';
import { TANK } from './world.js';

// The flock 鱼群. Craig Reynolds (1986): each fish, each step, sums a
// handful of local steering forces — separation, alignment, cohesion,
// obstacle avoidance, and a speed keeper. Nothing is choreographed;
// everything the school appears to "decide" emerges from these weights.
// 简单规则，复杂系统。

// Defaults = Billy's M1 "standing wave" checkpoint (2026-07-15): 500 fish
// forming one large coherent gyre cycling through the tank. Field-tuned
// on iPhone; bottled in presets/m1-standing-wave.json; ↺ returns here.
// maxForce 5.2 is deliberately untouched — it is the live-retune target.
export const BOID_PARAMS = {
  fishCount: 500,
  cruiseSpeed: 0.23, // m/s — preferred swimming speed
  maxSpeed: 0.46, // m/s — hard ceiling (~2× cruise so fish can actually reach it)
  maxForce: 5.2, // m/s² — steering clamp per rule
  separationRadius: 0.12, // personal space
  separationWeight: 0.55,
  alignmentRadius: 0.106, // conformity neighborhood
  alignmentWeight: 0.45,
  cohesionRadius: 0.3, // belonging neighborhood
  cohesionWeight: 0.4,
  detectionLength: 0.23, // forward ray length
  avoidanceWeight: 1.0,
  // Gentle constant pull toward tank center (向心). 0 = off (checkpoint
  // behavior). The honest version of the accidental containment that a
  // tank-sized detectionLength once produced — A/B it against pure wall
  // avoidance without abusing the ray length.
  centeringWeight: 0,
  angleStep: 18, // degrees per rotation attempt when the ray hits
  maxPitch: 57, // degrees — fish never swim like submarines
  turnSpeed: 2.8, // rad/s — heading change cap; makes turns read as swimming
};

// Fish keep this far off the glass — the avoidance ray tests against
// this shrunken inner box, not the visual walls.
const WALL_MARGIN = 0.05;
const UP = new THREE.Vector3(0, 1, 0);

// Scratch vectors — step() runs 60×/s over every fish; no allocations.
const _sep = new THREE.Vector3();
const _ali = new THREE.Vector3();
const _coh = new THREE.Vector3();
const _desired = new THREE.Vector3();
const _force = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _cand = new THREE.Vector3();
const _newVel = new THREE.Vector3();
const _axis = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up2 = new THREE.Vector3();
const _m = new THREE.Matrix4();

// Distance from a point along a direction to the inner box boundary
// (ray-vs-AABB from inside). Returns Infinity for degenerate directions.
function distToWall(p, d) {
  const hx = TANK.width / 2 - WALL_MARGIN;
  const hy = TANK.height / 2 - WALL_MARGIN;
  const hz = TANK.depth / 2 - WALL_MARGIN;
  let t = Infinity;
  if (Math.abs(d.x) > 1e-8) t = Math.min(t, ((d.x > 0 ? hx : -hx) - p.x) / d.x);
  if (Math.abs(d.y) > 1e-8) t = Math.min(t, ((d.y > 0 ? hy : -hy) - p.y) / d.y);
  if (Math.abs(d.z) > 1e-8) t = Math.min(t, ((d.z > 0 ? hz : -hz) - p.z) / d.z);
  return Math.max(t, 0);
}

// desired direction (not necessarily unit) → clamped steering force
function steerToward(desired, vel, out) {
  out
    .copy(desired)
    .normalize()
    .multiplyScalar(BOID_PARAMS.maxSpeed)
    .sub(vel)
    .clampLength(0, BOID_PARAMS.maxForce);
  return out;
}

export class Flock {
  constructor(world, scene) {
    this.scene = scene;
    this.positions = [];
    this.velocities = [];
    this.forces = []; // last net steering per fish — fed to the visualizer
    this._geo = new THREE.CapsuleGeometry(0.008, 0.03, 4, 8);
    this._geo.rotateX(Math.PI / 2); // capsule length along +Z = forward
    this._mat = new THREE.MeshStandardMaterial({
      color: '#6fa8dc',
      roughness: 0.8,
    });
    this.mesh = null;
    this.setCount(BOID_PARAMS.fishCount);
    world.systems.push(this);
  }

  setCount(n) {
    n = Math.max(1, Math.round(n));
    BOID_PARAMS.fishCount = n;
    const hx = TANK.width / 2 - WALL_MARGIN * 2;
    const hy = TANK.height / 2 - WALL_MARGIN * 2;
    const hz = TANK.depth / 2 - WALL_MARGIN * 2;
    while (this.positions.length < n) {
      this.positions.push(
        new THREE.Vector3(
          (Math.random() * 2 - 1) * hx,
          (Math.random() * 2 - 1) * hy,
          (Math.random() * 2 - 1) * hz
        )
      );
      const a = Math.random() * Math.PI * 2;
      this.velocities.push(
        new THREE.Vector3(Math.cos(a), 0, Math.sin(a)).multiplyScalar(
          BOID_PARAMS.cruiseSpeed
        )
      );
      this.forces.push(new THREE.Vector3());
    }
    this.positions.length = n;
    this.velocities.length = n;
    this.forces.length = n;

    // Flat scratch buffers for the social pair pass (see step()'s perf
    // note). Rebuilt with the school; never touched by consumers.
    this._f32 = {};
    for (const k of [
      'px', 'py', 'pz', 'vx', 'vy', 'vz',
      'sepX', 'sepY', 'sepZ', 'aliX', 'aliY', 'aliZ', 'cohX', 'cohY', 'cohZ',
    ]) {
      this._f32[k] = new Float32Array(n);
    }
    this._nSep = new Uint16Array(n);
    this._nAli = new Uint16Array(n);
    this._nCoh = new Uint16Array(n);

    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.dispose();
    }
    this.mesh = new THREE.InstancedMesh(this._geo, this._mat, n);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.mesh);
    this._writeMatrices();
  }

  step(dt) {
    const P = BOID_PARAMS;
    const n = this.positions.length;

    // --- The three social rules: one symmetric pair pass ---
    // Perf shape (1000 fish × 60 Hz ≈ 30M pair visits/s): flat typed
    // arrays instead of Vector3 method calls, squared distances with an
    // early-out at the largest radius, and each pair visited once but
    // applied to both fish (the math is symmetric). A spatial grid buys
    // little while cohesionRadius spans most of the tank — revisit if
    // the radii ever shrink (e.g. hunting multi-wave regimes).
    const { px, py, pz, vx, vy, vz, sepX, sepY, sepZ, aliX, aliY, aliZ, cohX, cohY, cohZ } = this._f32;
    const nSep = this._nSep;
    const nAli = this._nAli;
    const nCoh = this._nCoh;
    for (let i = 0; i < n; i++) {
      const p = this.positions[i];
      const v = this.velocities[i];
      px[i] = p.x; py[i] = p.y; pz[i] = p.z;
      vx[i] = v.x; vy[i] = v.y; vz[i] = v.z;
      sepX[i] = sepY[i] = sepZ[i] = 0;
      aliX[i] = aliY[i] = aliZ[i] = 0;
      cohX[i] = cohY[i] = cohZ[i] = 0;
      nSep[i] = nAli[i] = nCoh[i] = 0;
    }
    const sepR2 = P.separationRadius * P.separationRadius;
    const aliR2 = P.alignmentRadius * P.alignmentRadius;
    const cohR2 = P.cohesionRadius * P.cohesionRadius;
    const maxR2 = Math.max(sepR2, aliR2, cohR2);
    for (let i = 0; i < n; i++) {
      const xi = px[i];
      const yi = py[i];
      const zi = pz[i];
      for (let j = i + 1; j < n; j++) {
        const dx = xi - px[j];
        const dy = yi - py[j];
        const dz = zi - pz[j];
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 >= maxR2) continue;
        if (d2 < sepR2 && d2 > 1e-12) {
          // repulsion, stronger the closer: Δ/d² (magnitude 1/d)
          const w = 1 / d2;
          sepX[i] += dx * w; sepY[i] += dy * w; sepZ[i] += dz * w; nSep[i]++;
          sepX[j] -= dx * w; sepY[j] -= dy * w; sepZ[j] -= dz * w; nSep[j]++;
        }
        if (d2 < aliR2) {
          aliX[i] += vx[j]; aliY[i] += vy[j]; aliZ[i] += vz[j]; nAli[i]++;
          aliX[j] += vx[i]; aliY[j] += vy[i]; aliZ[j] += vz[i]; nAli[j]++;
        }
        if (d2 < cohR2) {
          cohX[i] += px[j]; cohY[i] += py[j]; cohZ[i] += pz[j]; nCoh[i]++;
          cohX[j] += xi; cohY[j] += yi; cohZ[j] += zi; nCoh[j]++;
        }
      }
    }

    for (let i = 0; i < n; i++) {
      const pos = this.positions[i];
      const vel = this.velocities[i];
      const force = this.forces[i].set(0, 0, 0);

      if (nSep[i] > 0) {
        _sep.set(sepX[i], sepY[i], sepZ[i]);
        force.add(steerToward(_sep, vel, _force).multiplyScalar(P.separationWeight));
      }
      if (nAli[i] > 0) {
        _ali.set(aliX[i], aliY[i], aliZ[i]);
        force.add(steerToward(_ali, vel, _force).multiplyScalar(P.alignmentWeight));
      }
      if (nCoh[i] > 0) {
        _coh.set(cohX[i], cohY[i], cohZ[i]).divideScalar(nCoh[i]).sub(pos);
        force.add(steerToward(_coh, vel, _force).multiplyScalar(P.cohesionWeight));
      }

      // --- Obstacle avoidance: forward ray, rotate until clear ---
      _dir.copy(vel).normalize();
      const dWall = distToWall(pos, _dir);
      if (dWall < P.detectionLength) {
        const urgency = 1 - dWall / P.detectionLength;
        let found = false;
        const stepRad = THREE.MathUtils.degToRad(P.angleStep);
        const tries = Math.ceil(Math.PI / stepRad);
        // yaw sweep first (fish prefer turning to climbing)…
        for (let k = 1; k <= tries && !found; k++) {
          for (const s of [1, -1]) {
            _cand.copy(_dir).applyAxisAngle(UP, s * k * stepRad);
            if (distToWall(pos, _cand) > P.detectionLength) {
              found = true;
              break;
            }
          }
        }
        // …then pitch as a fallback (floor/ceiling ahead)
        if (!found) {
          _axis.crossVectors(UP, _dir).normalize();
          for (const a of [0.6, -0.6, 1.1, -1.1]) {
            _cand.copy(_dir).applyAxisAngle(_axis, a);
            if (distToWall(pos, _cand) > P.detectionLength) {
              found = true;
              break;
            }
          }
        }
        if (!found) _cand.copy(pos).multiplyScalar(-1); // toward tank center
        force.add(
          steerToward(_cand, vel, _force).multiplyScalar(
            P.avoidanceWeight * (1 + urgency * 2)
          )
        );
      }

      // --- Centering: constant-magnitude drift toward tank center ---
      if (P.centeringWeight > 0) {
        _cand.copy(pos).multiplyScalar(-1);
        if (_cand.lengthSq() > 1e-8) {
          force.add(
            steerToward(_cand, vel, _force).multiplyScalar(P.centeringWeight)
          );
        }
      }

      // --- Speed keeper: drift back to cruise, never stall or rocket ---
      _desired.copy(_dir).multiplyScalar(P.cruiseSpeed).sub(vel);
      force.add(_desired.clampLength(0, P.maxForce * 0.5));
    }

    // Integrate in a second pass so all fish saw the same flock state.
    for (let i = 0; i < n; i++) {
      const pos = this.positions[i];
      const vel = this.velocities[i];
      _newVel.copy(vel).addScaledVector(this.forces[i], dt);

      // Turn-speed cap: rotate the heading no faster than turnSpeed rad/s
      const speed = Math.max(_newVel.length(), 1e-6);
      const maxAngle = BOID_PARAMS.turnSpeed * dt;
      const angle = vel.angleTo(_newVel);
      if (angle > maxAngle && vel.lengthSq() > 1e-10) {
        _axis.crossVectors(vel, _newVel);
        if (_axis.lengthSq() > 1e-12) {
          _axis.normalize();
          _newVel.copy(vel).applyAxisAngle(_axis, maxAngle).setLength(speed);
        }
      }

      // Pitch clamp: recompose vertical component if too steep
      const h = Math.hypot(_newVel.x, _newVel.z);
      const pitch = Math.atan2(_newVel.y, Math.max(h, 1e-6));
      const maxPitchRad = THREE.MathUtils.degToRad(BOID_PARAMS.maxPitch);
      if (Math.abs(pitch) > maxPitchRad) {
        _newVel.y = Math.max(h, 1e-6) * Math.tan(Math.sign(pitch) * maxPitchRad);
      }

      // Speed clamp
      _newVel.clampLength(BOID_PARAMS.cruiseSpeed * 0.3, BOID_PARAMS.maxSpeed);
      vel.copy(_newVel);
      pos.addScaledVector(vel, dt);

      // Hard containment (belt & suspenders under extreme tuning):
      // clamp inside the inner box and kill the escaping component.
      const hx = TANK.width / 2 - WALL_MARGIN;
      const hy = TANK.height / 2 - WALL_MARGIN;
      const hz = TANK.depth / 2 - WALL_MARGIN;
      if (pos.x > hx || pos.x < -hx) {
        pos.x = THREE.MathUtils.clamp(pos.x, -hx, hx);
        vel.x *= -0.5;
      }
      if (pos.y > hy || pos.y < -hy) {
        pos.y = THREE.MathUtils.clamp(pos.y, -hy, hy);
        vel.y *= -0.5;
      }
      if (pos.z > hz || pos.z < -hz) {
        pos.z = THREE.MathUtils.clamp(pos.z, -hz, hz);
        vel.z *= -0.5;
      }
    }

    this._writeMatrices();
  }

  // Orientation: yaw + pitch follow velocity, roll locked (right vector
  // built from world up), so fish always swim right-side up.
  _writeMatrices() {
    const n = this.positions.length;
    for (let i = 0; i < n; i++) {
      _dir.copy(this.velocities[i]).normalize();
      _right.crossVectors(UP, _dir);
      if (_right.lengthSq() < 1e-10) _right.set(1, 0, 0);
      _right.normalize();
      _up2.crossVectors(_dir, _right).normalize();
      _m.makeBasis(_right, _up2, _dir).setPosition(this.positions[i]);
      this.mesh.setMatrixAt(i, _m);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
