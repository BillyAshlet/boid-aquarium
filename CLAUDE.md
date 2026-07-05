# the boid 水族馆 — boid-aquarium

A mobile-first 3D aquarium physics game recreating a childhood water-pressure
ring-toss toy (水压套圈游戏机). Boid fish school + fluid water + 6DOF rings +
device-tilt gravity. No score, no timer, no fail state — the game is building
physical intuition through play. Feel over accuracy, always.

Full design docs live in Notion ("the boid 水族馆") and in
`career/personal projects/practices/aquarium prompt/VISIOn.md` (iCloud).
This file is the engineering source of truth; if they conflict, this file wins.

## Locked decisions 已定决策

- **Two posts only.** Challenge comes from physics, not layout.
- **Fixed camera, world tilts.** Device gravity vector rotates the in-world
  gravity; the tank stays fixed on screen. No orbit camera.
- **Gravity = `accelerationIncludingGravity`** mapped to world down. Rotation
  around the gravity axis is a physical no-op — do not try to add it.
  Shake impulses via `acceleration` come later, as a layer on top.
- **Fluid: coarse CPU grid behind an interface.** All consumers use the
  `FluidField` API (`sampleVelocity(pos)`, `addJet(...)`) — never solver
  internals. Fake analytic jet first (M3), real Stable Fluids later (M4).
  The fluid is never rendered directly; only its effects are visible.
- **Rings: rigid 6DOF bodies + visual-only wobble.** No mass-spring physics.
  Impact drives a damped-oscillator deformation in the shader/mesh only.
- **Fish: 5DOF** (translation + yaw + pitch). Roll locked — always upright.
- **Vanilla JS + Three.js. No framework. Vite is a dev server only.**
- **Desktop = simplified fallback** (fixed gravity, mouse/keys). Mobile is
  the real game and the performance budget.
- **Canonical landscape frame（canonical 横屏系）.** The game world is
  always landscape and is anchored to the PHYSICAL DEVICE frame, never
  to orientation APIs (they lie: iPadOS reports angle 0 in docked
  landscape while sensors stay portrait-referenced — field-tested
  2026-07). **Three-frame model (input.js owns it):** DEVICE (sensor
  frame) → HOLD (H, from gravity: hysteresis ±3.5 m/s² + temporal
  debounce `flipDelay`) → FRAMEBUFFER (F, the box the OS hands us).
  Physics: device→canonical fixed rotation + 180° when hold is flipped
  — gravity only. Presentation: CSS rotation **R = −(H + F)**, applied
  to the #app wrapper (fullscreen, no letterbox). F is tracked without
  trusting APIs absolutely: angle DELTAS only (lying zero-points cancel
  in differences) + one readable-prior calibration at first sensor
  reading (user just tapped a button they could read → R≈0 pins F).
  Both landscape holds are first-class and indistinguishable. Panel:
  `frame` stepper (auto/0/180) manual override; `hold frame 🔒` freezes
  H and F for tuning sessions. `ANGLE_DELTA_SIGN` in input.js flips if
  field tests show frames going wrong after OS rotations.
- **Sensor smoothing = One Euro filter** (Casiez et al., CHI 2012),
  per-axis in the device frame, before the canonical remap. Panel
  params: `minCutoff` (still-state calm — tune first), `beta` (motion
  responsiveness — tune second). Tuned fresh on device.
- **Touch-coordinate constraint:** CSS transforms rotate pixels, not
  coordinates. ALL canvas-space touch math (M3 touch zones, raycasts)
  must go through `viewportToCanonical()` in scene.js — never use raw
  clientX/Y.

## Conventions 约定

- **Units: meters, seconds.** Tank interior: 1.2 wide (x) × 0.8 tall (y) ×
  0.5 deep (z), origin at tank center. (Dimensions tunable, convention not.)
- **Coordinates:** Three.js right-handed, +Y up (screen up), +X right,
  +Z toward viewer. Gravity is a world-space vector owned by `World`,
  default `(0, -9.8, 0)`.
- **Fixed timestep physics:** 60 Hz with accumulator; render at display rate.
  All physics code receives `dt = 1/60`, never raw frame delta.
- **Module map (keep it small enough to hold in your head):**
  - `src/world.js` — tank dims, gravity vector, clock/timestep. Everyone reads from here.
  - `src/scene.js` — Three.js renderer, camera, lights, tank shell.
  - `src/boids.js` — fish flock (separation/alignment/cohesion/avoidance/orbit).
  - `src/rings.js` — 6DOF ring bodies, collision, success snap, visual wobble.
  - `src/fluid/field.js` — the FluidField interface + fake analytic jet.
  - `src/fluid/solver.js` — real Stable Fluids solver (M4, same interface).
  - `src/input.js` — touch zones, charge mechanic, DeviceMotion, desktop fallback.
  - `src/game.js` — progression state (rings placed, orbit trigger, quiet celebration).
  - `src/debug.js` — Tweakpane panel, FPS counter, force/field visualizers, preset save/load.
- **All tunable parameters** live in one exported object per module and are
  registered with the debug panel **through `addParam()` in debug.js** —
  every param carries live value + range + default, with a per-param ↺
  reset and a global "reset all". Presets export/import as JSON in `presets/`.
- **Language:** English primary, Chinese annotations where they help. 主英文辅中文。

## Workflow rules 工作方式

- Billy is a self-taught creative coder — explain structural decisions in
  plain language at decision points; keep the module map stable.
- One system per session. Every session ends with a visible change on screen.
- Commit every working state. Before risky changes, commit first.
- Infrastructure code (textbook stuff) can land in big chunks; anything
  touching **feel or coupling** moves in small, individually observable steps.
- Build visualizers as a reflex: every force should be drawable.
- At session end: update "Current state" below, then commit.
  Every entry is dated (YYYY-MM-DD) — the file should tell you *when*
  things happened, not just what.

## Current state 当前状态

- **2026-07-04 — Done:** Session zero — repo, docs, Vite + HTTPS-on-LAN
  pipeline, placeholder scene (spinning ring). Verified on iPhone
  (61 fps) and desktop. Design docs (VISIOn.md etc.) merged into repo;
  old iCloud folder deleted. Pushed to GitHub main (public repo).
- **2026-07-04 — Done (desktop-verified):** M0 built — world.js (fixed
  60 Hz timestep, shared gravity vector), scene.js (fixed auto-framing
  camera, glass tank shell), input.js (iOS permission button, sign-flip
  + smoothing, `active` = data actually arriving), debug.js (Tweakpane,
  gravity arrow, always-on FPS). `npm run dev` = HTTPS for phone,
  `npm run dev:http` = plain HTTP for preview tooling.
- **2026-07-04 — Done:** M0 phone-feedback round. Landscape-only guard
  (rotate-prompt overlay + Android lock attempt), gravity remap through
  `screen.orientation.angle` into screen axes, flip-sign defaults ON
  (field-tested on iPhone), smoothing range narrowed to 0.01–0.3
  (0.1 sluggish / 0.2 jittery per Billy). Zero-baseline decision:
  **physical zero (option A)** — real gravity is the reference, no
  session recalibration; revisit only if playtests demand a comfort offset.
- **2026-07-04 — Done:** Canonical-frame rework after iPad axis bug
  (orientation APIs proven unreliable). Gravity now remaps device→
  canonical via one fixed rotation; presentation rotates the #app
  wrapper (verified: fullscreen, no letterbox, panel/UI rotate as one
  unit); frame stepper `auto/0/90/180/270` added to panel; rotate
  overlay deleted; `viewportToCanonical()` helper added in scene.js.
  The `auto` heuristic (angle 270 → 180° offset) is UNVERIFIED — field
  data from iPhone/iPad will confirm or refine it.
- **2026-07-05 — Done:** Symmetric landscapes + One Euro. The 180°
  frame is now resolved from gravity itself (hysteresis, dead band
  ±3.5 m/s²) — the auto-heuristic from screen.orientation.angle is
  deleted; orientation APIs no longer feed any logic. Presentation has
  four states (90/270 portrait, 0/180 landscape); verified via
  synthetic DeviceMotionEvents: both holds yield identical world
  gravity (0,−9.8,0) with mirrored presentation. Smoothing lerp
  replaced by per-axis One Euro in the device frame (defaults
  minCutoff 0.6 / beta 0.12 — untuned prior). Panel: addParam()
  pattern — every param shows range+default, per-param ↺, reset all.
- **2026-07-05 — Done:** iPad mirror-bug fix + flip ergonomics. Root
  cause of the mirrored physics: presentation math was missing the
  FRAMEBUFFER frame term (OS auto-rotation double-applied our 180°).
  Now: three-frame model, R = −(H+F); F from angle deltas + readable-
  prior calibration; physics untouched (it was correct). Added
  `flipDelay` temporal debounce (default 1.0 s) and `hold frame 🔒`
  tuning lock. Emulation-verified: calibration pins R=0; short bursts
  rejected; long bursts flip with world gravity invariant; lock holds
  under 2.5 s of flipped gravity; unlock commits. Note: debounce clock
  starts when the FILTERED signal crosses threshold, so perceived delay
  ≈ flipDelay + filter convergence (~0.3–0.5 s).
- **Next up:** Billy's device re-test: (1) both landscape holds —
  symmetric visuals AND symmetric physics this time; (2) tuning session
  with 🔒 on: One Euro (minCutoff first, then beta) + flipDelay feel;
  save first preset values. Then M0 closes and M1 (boids) begins.
