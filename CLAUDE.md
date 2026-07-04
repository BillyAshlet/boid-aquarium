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
  2026-07). Canonical hold = device top edge LEFT. Gravity remap
  device→canonical is one fixed rotation in input.js; a frame stepper
  (auto/0/90/180/270) on the panel covers the OS-auto-rotate ±180°
  ambiguity. Presentation: touch device + portrait viewport → CSS-rotate
  the #app wrapper 90° with swapped dimensions (fullscreen, no
  letterbox). No rotate overlay: wrong holds self-correct physically,
  like the real toy.
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
  registered with the debug panel. Presets export/import as JSON in `presets/`.
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
- **Next up:** Billy's device verify (see M0 last checkbox). Then M1:
  boids. See MILESTONES.md.
