# Milestones 里程碑

Every milestone is a **complete, playable state**. Stopping at any point is
fine — that's the contract. If it starts to feel like grinding, stop and ask why.

---

## M0 — The Pipeline 管道 ✅→
**Playable state:** open the game on the iPhone over local HTTPS, grant motion
permission, and watch a gravity arrow track the phone's tilt in a lit, empty tank.

- [x] Tank shell rendered (visible glass edges — the player must see what water bounces off)
- [x] Fixed-timestep loop (60 Hz physics, accumulator)
- [x] DeviceMotion permission flow (user-tap gated, iOS quirks handled)
- [x] Gravity arrow visualizer driven by real device tilt (portrait-verified on iPhone, flip-sign defaults ON per field test)
- [x] Debug panel (Tweakpane) + always-on FPS counter
- [x] Desktop fallback: fixed gravity, panel works with mouse
- [x] Canonical landscape frame: gravity remap anchored to the device frame (API-free); presentation rotation (CSS 90° + dimension swap) for portrait viewports; frame stepper on panel; rotate overlay deleted
- [x] Core canonical-frame verify on device: arrow tracks the real floor through orientation changes
- [x] Symmetric landscapes: 180° frame resolved from gravity (hysteresis), physics + presentation flip together — emulation-verified, both holds identical
- [x] One Euro adaptive filter replaces fixed smoothing (device-frame, per-axis)
- [ ] **Device verify:** both landscape holds present identically on iPhone (auto-rotate on and off); flip transition feels clean, no flapping near vertical
- [ ] **One Euro tuning on device:** minCutoff first (hold still → calm), then beta (whip → no lag); note the values that feel right

## M1 — Life 鱼群
**Playable state:** a school of fish lives in the tank. You can't touch them
yet, but you can watch them forever — and tune them with sliders.

- [ ] Boids: separation / alignment / cohesion (placeholder capsule fish)
- [ ] Obstacle avoidance via forward ray (walls + posts, no special-casing)
- [ ] 5DOF: roll locked, pitch clamped, turn speed capped
- [ ] Perception-radius + steering-force visualizers, toggleable
- [ ] All params on the panel; first saved preset in `presets/`

## M2 — The Toy, Half of It 圈与重力
**Playable state:** rings drift and tumble as you tilt the phone. You can land
a ring on a post using tilt alone. This is already the toy — before any water.

- [ ] Rings as rigid 6DOF bodies (gravity from device tilt, damping)
- [ ] Ring–wall and ring–post collision (sampled-points vs capsule)
- [ ] Success snap: distance + angle thresholds → settle animation
- [ ] Visual-only impact wobble (damped oscillator, subtle)
- [ ] Two posts placed; fish avoid rings like any obstacle

## M3 — Water, Faked 假水
**Playable state:** the full game loop. Press-and-hold to charge, release to
fire, rings ride the jet, fish scatter and regroup. Water is an analytic fake —
if this milestone already feels mesmerizing, that's a fine place to live.

- [ ] `FluidField` interface: `sampleVelocity(pos)`, `addJet(origin, dir, strength)`
- [ ] Fake field: jet cone with spread, decay, crude wall reflection
- [ ] Charge mechanic: non-linear buildup, release fires, decay lingers
- [ ] Touch zones: full left/right screen halves
- [ ] Rings take force + torque from the field; fish take scatter forces
- [ ] Velocity-field arrow visualizer (the fluid is invisible — this is how we see it)

## M4 — Water, Real 真水
**Playable state:** same game, but the water is alive — jets bounce off walls
and come back, crossing jets make turbulence, held jets linger in the field.

- [ ] Coarse Stable Fluids solver (~32×20×16, typed arrays) behind the same interface
- [ ] Boundary conditions: reflect at walls, zero-slip at posts
- [ ] Trilinear sampling; fake field kept as a debug-panel toggle for A/B feel tests
- [ ] 60 fps on the actual phone with fish + rings + solver running

## M5 — Ceremony & Skin 仪式与皮肤
**Playable state:** the finished thing. Fish orbit the posts as rings land;
when the last ring settles, the tank quietly celebrates. It looks like a page
from a design annual.

- [ ] Orbit force at `orbit_trigger` placement ratio
- [ ] Quiet celebration state (no text, no fanfare — the world just shifts)
- [ ] Blender assets: fish, rings, posts, tank → GLB (silhouette-first, low-poly)
- [ ] Cel/flat shading, outlines, depth of field, paper-grain overlay
- [ ] Background color decided in-scene (`#071e3d` vs `#081828` vs warmer)
- [ ] Shake impulses via `acceleration` — feel test, keep only if it delights
- [ ] Sound decision: silence vs minimal ambient water (no UI sounds either way)

---

**Open questions parked until their milestone:** depth-axis (Z) response —
decide after feeling M2; rings-per-post count — decide during M2 tuning;
camera "soft follow" — only revisit if fixed camera feels wrong in M3.
