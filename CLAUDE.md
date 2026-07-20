# the boid 水族馆 — boid-aquarium

A living 3D aquarium（活的水族馆）— boid fish school, fluid water,
emergent structure at the order/chaos edge. Born from a childhood
water-pressure ring-toss toy (水压套圈游戏机); the ring-toss GAME is
currently shelved (MILESTONES.md § Game Shelf), while the aquarium —
the project's literal namesake — is the product. Desktop is the full
experience; the phone is a tilt-responsive window into the same tank.
No score, no timer, no fail state. Feel over accuracy, always.

Full design docs live in Notion ("the boid 水族馆") and in
`career/personal projects/practices/aquarium prompt/VISIOn.md` (iCloud).
This file is the engineering source of truth; if they conflict, this file wins.

## Locked decisions 已定决策

- **Core technology must remain migratable（核心技术可迁移）— revised M1.**
  The tank you see today is not the tank at M5, and M5's is not M6's.
  Boid rules, the FluidField interface, ring 6DOF physics,
  gravity/frame handling, and input abstraction must survive complete
  visual and layout redesigns — a different tank shape, a vertical
  column, a hexagonal panel arrangement, an exhibition layout. No core
  algorithm may hardcode the current tank box, camera, or art. This is
  the criterion for whether the architecture is doing its job.
- **One product: the living aquarium（一个产品：活的水族馆）—
  Framing B, ratified 2026-07-18. Supersedes "mobile = the game;
  desktop = the world" (which itself superseded "desktop = simplified
  fallback").** The product is the desktop living aquarium. The phone
  is a supported WINDOW into the same aquarium — tilt-responsive,
  reduced ★ preset; M0's input stack is a finished organ kept alive at
  five minutes per milestone (see Workflow: phone-window check). The
  ring-toss game is SHELVED, not deleted: modules intact in
  MILESTONES § Game Shelf, revisited at the **mobile-derivation
  checkpoint (F4 close or D3 complete, whichever first)** — build /
  defer with a new date / retire, decided out loud. Death by decision,
  never by inertia. Products are modes (per the ratified mode
  principle): aquarium + pure-flock (M1) + the shelved game = the full
  2–3 mode budget. **Performance budget: desktop primary; the phone
  window's ★ preset must stay alive** (supersedes "mobile is the
  performance budget"). Rationale on record: desktop is the technical
  superset; Billy's interest decisively there; this is the vision
  doc's own exit clause ("if it feels like grinding, stop and ask
  why") exercised deliberately, at a genuine crossroads, not drifted
  past.
- **Two posts only.** Challenge comes from physics, not layout.
- **The order/chaos edge is the aesthetic thesis（秩序与混沌的边界）—
  recorded M1.** The target regime for every dynamic system in this
  project: regular enough that you sense pattern, irregular enough
  that you can't describe it in one or two sentences. Fixed orbits are
  dead (field-verified: pure central containment settles into
  describable loops); noise is worse. "简单规则，复杂系统" means
  complexity *living at this edge*, not just complexity. Use it as the
  acceptance test for tuning: if you can summarize the motion in a
  sentence, it's too ordered; if you can't sense coordination, too wild.
- **M1 preservation = a living mode, not an archive（活的模式）—
  revised 2026-07-15, supersedes the tag+bundle plan.** "Pure flock,
  nothing else" stays permanently loadable inside the evolving game:
  preset JSON grows from parameter capture into **intent capture**
  (params + mode + visual theme + which systems participate), so M1
  mode inherits every future perf win and bug fix automatically.
  Hard requirement from day one of M2: **every new world system is
  born with an enable flag** — disabled = never constructed (the
  `world.systems` array is the seam; the FluidField interface already
  makes "fluid off" = zero field). Monochrome as a preset-selectable
  theme lands with M3.5/M5 look work.
  **Ratified 2026-07-17 — architecture discussion closed:**
  (1) **Named modes are a hard cap: two or three, curated, total.**
  A mode is not a thing that runs — it is a list of what gets built.
  Free-form system toggling belongs to the debug panel: exploration,
  never production. Future session thinking "one more mode won't
  hurt": that instinct is precisely what this sentence exists to stop.
  (2) **Intent vs appearance is an explicit principle.** The mode
  preserves what M1 is *for* — it evolves with the engine, and opening
  meditation mode after M4 and getting "a different meditation" is a
  feature, not drift: the intent survived, the engine lived. The
  `m1-standing-wave` tag preserves what M1 *was* — frozen, exact, a
  safety net. Both roles are legitimate; never ask either to do the
  other's job.
  (3) **Preset schema keys are additive-only** — hard workflow
  discipline; the rule itself lives under Workflow rules.
  A `"ui": "minimal"` schema field was evaluated and REJECTED: UI
  presentation is its own design axis, to be designed when modes have
  faces — not smuggled in as a boolean.
- **Tank dimensions are platform-specific — decided 2026-07-15,
  implement before M2.** Mobile keeps the toy scale (1.2 × 0.8 × 0.5 —
  the original is small for a reason); desktop gets aquarium scale
  (~2.0 × 1.2 × 0.8 as the starting guess) — space to inhabit, and the
  direct experiment for the multi-gyre target (space is the suspected
  constraint). The meters/origin/+Y convention stays universal; only
  the numbers diverge. Must land before M2 so ring/post physics is
  born tank-relative. Consequences accepted: presets become
  platform-scoped (name them `m-*` / `d-*`; preset JSON should record
  the tank it was tuned in), and radius params tuned on one platform
  won't transfer verbatim — that's inherent, not a bug.
  **Scaling model A ratified 2026-07-17 (built same day):** only the
  tank scales. Fish size, perception radii, detectionLength, wall
  margin are creature properties and stay fixed — B (scale everything)
  is scientifically empty (preserves every dimensionless ratio, same
  gyre in a roomier costume). Density and radius-vs-span ratios ARE
  the experiment; `fishCount` is the density knob. TANK is
  live-mutable (panel `tank 水槽` folder; `notifyTankChange()` rebuilds
  shell + re-homes camera); preset JSON now records the tank it was
  tuned in (additive `tank` key).
- **Fixed camera, world tilts — revised M1: a MOBILE GAME rule, not
  project-wide.** On mobile, device gravity rotates the in-world
  gravity and the tank stays fixed on screen — the rule's reason is
  that camera motion must never fight tilt, which is tilt-specific.
  Desktop (the world) has navigation: drag = orbit, right-drag = pan,
  wheel = zoom, `0` = home, `1/3/7` = front/side/top snaps
  (OrbitControls; damping momentum flushed on snaps so home is exact).
  Ortho projection toggle parked — the only expensive item.
  Camera-follow rule for later (answers the "arbitrary target"
  question): when fish-cam (M6) is built, it is built as
  camera-follows-a-TARGET-PROVIDER (position + orientation source),
  never hardcoded fish access — the general version then costs
  nothing. No target system before a second customer exists.
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
- **Fish orient to gravity, not canonical up (re-slotted to the phone
  window / F2-era — it's what makes the handheld window slosh).** The 5DOF basis and
  pitch clamp swap hardcoded +Y for smoothed −gravity, so the school
  re-levels its swim plane when the world tilts. Orientation only —
  never a sinking force ("swimmers, not sinkers"). Optional
  `gravityBias` steering weight parked as fallback if pure re-leveling
  feels too subtle.
- **Pointer touches the world only through FluidField.** The cursor
  current (desktop's primary interaction) is a moving source term in
  the field — never a direct force on fish or rings. Lands early M3 as
  the FluidField interface's first test-driver.
- **Fish-around-geometry, split three ways (M1 design review):**
  point orbit = M5, a plain function of a point, no attractor
  framework; surface affinity = weak attraction toward nearby
  colliders opposing avoidance → emergent contour-following (shelved
  with the posts; revisit if D-track grows geometry sooner); field
  influence = the cursor current above.
- **Vanilla JS + Three.js. No framework. Vite is a dev server only.**
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

- **Units: meters, seconds.** Tank interior is platform-specific
  (`TANK_PRESETS` in world.js: mobile 1.2×0.8×0.5, desktop 2.0×1.2×0.8),
  origin at tank center. Dims live-tunable; the convention is not.
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
  every param carries live value + range + default, a per-param ↺ reset
  (restores value AND range), and recursive zoom on numeric sliders:
  ⊕ halves the range, ⊖ doubles it, both re-centered on the current
  value. Optional `hardMin`/`hardMax` clamp how far ⊖ can widen (use for
  physically meaningless regions, e.g. negative beta). Global "reset
  all". Presets export/import as JSON in `presets/`.
- **Language:** English primary, Chinese annotations where they help. 主英文辅中文。

## Documentation 文档

- **Repo = engineering truth** (CLAUDE.md, MILESTONES.md, DEVLOG.md).
  Git history is the revision record — no inline revision-mark or
  color-annotation system (evaluated and rejected 2026-07-12: it
  pollutes the files their primary consumers read and duplicates git
  blame). When a locked decision is materially revised, append
  "— revised M\<n\>" to its bullet; that's the whole convention.
- **DEVLOG.md** is the chronological narrative: one short entry per
  work session (what / why / what we learned), written at session end.
  It is the raw material for any future write-up (portfolio, blog,
  grad-school essay) — richer than commits, queryable unlike chat.
- **Notion = design intent** (Core Concept, Logic, vision). Read-only
  from the repo's perspective; updated only when design philosophy
  actually changes. Engineering docs are never mirrored (manual
  duplication = drift). At each milestone close, a short digest
  generated from DEVLOG can be pushed to Notion on request
  ("sync notion") — one-directional, generated, no hand-syncing.

## Workflow rules 工作方式

- Billy is a self-taught creative coder — explain structural decisions in
  plain language at decision points; keep the module map stable.
- **Desktop tunes, phone verifies（桌面调，手机验）— recorded M1.**
  Phone sliders are miserable and desktop can't judge tilt feel, so the
  loop is: tune on desktop → copy preset JSON → paste-apply on phone →
  feel. Never attempt precision tuning on the phone again.
- **Coupled-parameter tuning order: by radius of influence, smallest
  last-to-first; amplifiers before behaviors.** (1) Clamps/caps first —
  maxForce, maxSpeed, turnSpeed — they're the amplifier every weight is
  heard through; weights tuned against a saturated clamp are lies.
  (2) Solo behaviors (speed keeper, wall avoidance). (3) Local pairwise
  (separation). (4) Collective (alignment, cohesion — the
  macro-structure engine). (5) Global fields LAST (centeringWeight has
  no radius = infinite radius = couples to everything; zero it while
  tuning locals, reintroduce at the end). One knob per pass; watch ≥30 s
  per change — the gyre period is long and slider-sweeping reads
  transients, not equilibria. Bottle every keeper preset BEFORE
  touching an amplifier.
- **localStorage presets are scratch, not archive.** Anything you'd
  mourn gets exported and committed to `presets/` in the same session
  you find it — clearing site data (or a browser update) wipes the
  scratchpad silently.
- **Preset schema keys are additive-only（只增不删改）— hard rule,
  ratified 2026-07-17.** Never rename, repurpose, or delete a key any
  committed preset uses. New keys ship with defaults; old presets
  degrade gracefully (unknown keys ignored, missing keys → defaults).
  Renaming a key feels harmless in the moment and breaks every
  archived preset silently — this is the rule a future session
  violates innocently unless it reads this sentence first.
- **Milestone close = phone-window check（关卡收尾查手机）— Framing B
  rule.** Five minutes on the real phone: boots, tilts, holds frame
  rate on the mobile ★ preset. Keeps the mobile door PHYSICALLY open
  regardless of intentions — the guard against desktop-only habit rot
  (8 ms steps, hover-only interactions) silently closing it.
- One system per session. Every session ends with a visible change on screen.
- Commit every working state. Before risky changes, commit first.
- Infrastructure code (textbook stuff) can land in big chunks; anything
  touching **feel or coupling** moves in small, individually observable steps.
- Build visualizers as a reflex: every force should be drawable.
- At session end: update "Current state" below, add a DEVLOG.md entry
  (a few sentences: what / why / learned), then commit. Every entry is
  dated (YYYY-MM-DD) — the docs should tell you *when* things
  happened, not just what.

## Open questions 待决

- **Per-axis tilt gain（横竖轴增益差）— revisit during M2 ring tuning.**
  Observed 2026-07-06: horizontal arrow response feels subtly damped vs
  vertical in landscape holds. Billy's hypothesis: human wrist
  kinematics produce less angular velocity along the phone's short axis
  than its long axis — the sensor reads real, smaller signals, not
  filter attenuation (both axes share the same One Euro). Candidate fix
  if it matters: per-axis gain compensation after the canonical remap.
  Also check before building anything: 3D perspective foreshortening of
  the arrow may exaggerate the perception. **Do not act until rings
  drift under tilt in M2** — an arrow alone can't judge gameplay impact.
- **Mobile poke-vs-charge（M3）:** does touch-repulsion exist on mobile
  (moving drag = poke vs stationary hold = charge), or does it stay
  desktop-only? Tap already means "gentle pulse" in the charge design —
  don't muddy it. Decide with the jet working.
- **Desktop framing tone（M3.5）:** one design language regardless, but
  desktop may get "aquarium on a shelf" framing (visible frame,
  letterbox, furniture) vs mobile full-bleed. Discuss at look
  development.
- **Möbius / multi-gyre target（parked aesthetic, M1）:** a school
  whose flow curves through itself, folds back, has no stable
  front/back — multiple interpenetrating gyres, not one wave.
  Suspected space-constrained at toy-tank scale (500 fish + alignment
  radius 0.106 saturate the volume into one unified flow). Two
  candidate paths, in order: the desktop aquarium-scale tank (direct
  space experiment), and M2 posts breaking the symmetry (the measured
  low global polarization of the single gyre says the school is
  locally aligned but globally circulating — the regime where
  obstacles can pin counter-rotating lobes). If it proves impossible
  without space, record that: it's a finding, not a failure.
  Observation for the record (Billy, M1): separation is anti-collision;
  **alignment + cohesion are the macro-structure engine** — macro
  reorganization comes from those two.
- **Layered rendering（分层渲染）— parked 2026-07-17, revisit at M3.5.**
  Possibility to preserve, not to build: one engine running once, with
  the render pipeline supporting multiple simultaneous visual
  treatments — e.g. monochrome pure-flock as layer 1, full colored game
  as layer 2 — and a spatial reveal mechanism (cursor-following region)
  choosing which layer displays where. Same fish, same physics, two
  visual channels; motivated by future portfolio/website integration.
  Architecturally distinct from modes: **modes decide what gets BUILT
  at boot; layers would decide what gets RENDERED at runtime.**
  Binding constraint on M3.5's theme design: themes must be structured
  as independent render passes/treatments, NOT a single mutually
  exclusive global switch — "one theme active at a time" baked in would
  make layers expensive to retrofit. Leave the door open cheaply; do
  not walk through it.
- **Multi-species — architecture agreed in discussion (2026-07-17),
  awaiting Billy's ratification + scheduling (not before M1 close).**
  Shape: ONE Flock, per-fish species id, per-species visual, and a
  K×K **interaction matrix** (per-rule weight multipliers across
  species boundaries) — NOT multiple Flock instances (cross-instance
  pair passes duplicate the grid and the perception loop). All four
  interaction styles are just matrix entries: independent coexistence
  = identity on ali/coh; treat-as-obstacle = zero ali/coh, full sep;
  weak mixing = fractional off-diagonals; predator/prey = asymmetric
  entries (P3 — needs a seek rule, defer until wanted). Species
  configs are a **preset axis, not a mode axis** — the 2–3 mode hard
  cap stands; an "ecology mode" is exactly the temptation the cap
  exists to resist. **Phase naming: multi-species evolves through
  P1/P2/P3（阶段）— "P" avoids collision with Billy's Vn/vn/Mn file
  scheme.** Start-small P1: 2 species, shared behavior params,
  2×2 matrix, per-species color.
- **Fibonacci-sphere avoidance sampling — evaluated and REJECTED
  (Billy, 2026-07-17). Do not re-litigate.** Uniform 3D direction
  candidates are wrong for roll-locked, pitch-clamped fish — the
  existing horizontal-biased yaw-sweep-then-pitch sampling is MORE
  correct for this creature, and avoidance isn't performance-bound.
  A beautiful algorithm without a problem here.
- **First-person fish view（M6 stretch）:** camera bound to one boid,
  swimming with it — cheap (a camera attachment), philosophically
  aligned (inhabit an agent driven by simple rules, no scripted camera
  choreography). Parked, not scheduled.

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
- **2026-07-06 — Done:** Panel recursive zoom + wider smoothing bounds.
  minCutoff 0.05–10 Hz (hard cap 60; ≥10 ≈ near-raw at 60 Hz sensors),
  beta 0–1.5 (hard cap 10). addParam() gained ⊕/⊖ zoom (halve/double
  range, re-centered on current value; step auto-scales; hardMin/Max
  clamp; ↺ restores value + range). Verified: zoom math, clamps,
  value preservation across rebuilds, reset.
- **2026-07-06 — M0 CLOSED ✅.** Device re-test passed: both landscape
  holds symmetric in physics and visuals. Field-tuned values promoted
  to code defaults (minCutoff 2.0, beta 1.3, flipDelay 3.0) and bottled
  in `presets/m0-input-baseline.json`; flipDelay slider max widened to
  5 (tuned value sat at the old edge). Per-axis tilt-gain observation
  recorded under Open questions, deferred to M2.
- **2026-07-06 — M1 built (desktop-verified).** boids.js: Reynolds
  flock as the first `world.systems` citizen — separation/alignment/
  cohesion + forward-ray wall avoidance (yaw sweep, pitch fallback,
  generic for M2 obstacles) + speed keeper; 5DOF integration (turn-speed
  cap, pitch clamp, roll locked via world-up basis); InstancedMesh
  capsules. 16 params via addParam (fishCount rebuilds on slider
  release). Visualizers: perception-radius spheres on fish[0], steering
  lines for all fish. `window.aquarium` debug handle added in main.js —
  automated verification reads real state now, not the panel DOM.
  Verified: 80 fish school (mean nearest-neighbor 0.055 ≈ just under
  separation radius), zero escapes/NaN at 80 and 200 fish, 60 fps both.
- **2026-07-12 — M1 design review recorded.** Product reframe:
  mobile = the game, desktop = the world (no jets/rings/win state on
  desktop — inhabitable aquarium, cursor current as primary
  interaction). New top principle: migratable core. Ratified: gravity
  up-vector swap (M2), cursor current via FluidField (early M3),
  C-split (orbit M5 / surface affinity M2 / field influence M3).
  Inserted M3.5 look development; added M6 stretch (shelf aquarium;
  first-person fish view parked). DEVLOG.md created + backfilled;
  doc policy recorded (repo = engineering truth, Notion = design
  intent, no mirroring; inline revision-color annotations rejected in
  favor of git + "revised M<n>" tags). Panel scroll re-verified live.
- **2026-07-15 — Done: M1 tooling session (Billy's go signal).**
  Billy's tuning found the **standing wave**: 500 fish, one large
  coherent gyre. That set is promoted to BOID_PARAMS defaults (↺
  returns here) and bottled as `presets/m1-standing-wave.json`, a ★
  built-in. New panel folder `presets 预设`: save/load/delete named
  presets (localStorage scratchpad), copy-as-JSON + paste-apply — the
  desktop-tunes/phone-feels bridge; presets cover BOID_PARAMS only
  (input tuning stays per-device). Preset-apply widens slider windows
  rather than clamping (addParam registry + ensureVisible). Headroom:
  fishCount → 1000, detectionLength slider → 2.5 (hardMax 10).
  `centeringWeight` added — honest central-containment knob (constant
  steer toward center, 0 = off; 1.0 pulls mean center-distance 0.37 →
  0.05, gentle range likely ≤0.15). `sepFalloff` dropdown
  (inverse/linear/invlog; steerToward normalizes the sum, so shape
  re-weights direction, not magnitude). Perf: symmetric flat-typed-
  array pair pass — 500: 2.37→1.08 ms, 1000: 9.23→3.59 ms; grid
  deferred until radii shrink. `window.aquarium` exposes BOID_PARAMS.
- **2026-07-15 (later) — M1 deep-observation decisions recorded.**
  Pipeline confirmed (desktop tunes, phone verifies — now a workflow
  rule). Decided: platform-specific tank dimensions (before M2);
  M1 preserved by TAG not branch — `m1-standing-wave` tagged on the
  tooling commit, final `m1-close` tag at milestone close (plus a
  built static bundle then, so the artifact runs without the
  toolchain; `?m1` pure-flock query flag noted as an M2-era
  convenience). Coupled-parameter tuning order recorded as a workflow
  rule (amplifiers first, global fields last). Order/chaos edge
  recorded as the project's aesthetic thesis. Möbius/multi-gyre
  recorded as parked target. Billy keeps exploring M1 — no rush to
  close.
- **2026-07-17 — Architecture ratifications recorded (cross-window
  handoff).** The mode-not-museum discussion (parallel session,
  2026-07-15 evening) is closed and recorded: named-modes hard cap
  (2–3 curated, total; panel = exploration, modes = production),
  intent-vs-appearance principle (mode = what M1 is *for*, tag = what
  M1 *was*), additive-only preset schema keys (new Workflow rule),
  `"ui"` schema field rejected as a smuggled design axis. Bonus
  cleanup: deleted the stale "Desktop = simplified fallback" bullet
  that had survived its own supersession since 07-12.
- **2026-07-17 — Tank divergence + desktop navigation built
  (desktop-verified).** TANK platform-selected at boot
  (`TANK_PRESETS`), live-mutable via panel `tank 水槽` folder
  (sliders + mobile/desktop quick buttons; `notifyTankChange()` →
  shell rebuild + camera re-home). Scaling model A. Desktop camera:
  OrbitControls (drag/right-drag/wheel), `0` home, `1/3/7` view
  snaps; damping momentum flushed on snaps (undamped update BEFORE
  placing the camera — after placement it flings, field-tested);
  resizes never stomp a user-moved camera. Preset copy-JSON gains
  additive `tank` key. Hardened: 0×0 viewport (hidden tab /
  mid-rotation) can no longer NaN the camera. Verified: orbit via
  synthetic pointers, exact home after momentum drag, framing scales
  with tank (2.21→2.94 on widen), 500 fish zero escapes in the
  2.0×1.2×0.8 tank, mobile paths untouched (controls/keys
  desktop-only). Billy's phone: quick regression check when convenient.
- **2026-07-17 — FOV + spatial grid + loosened limits
  (desktop-verified).** Space alone didn't force multi-gyre (Billy:
  "one broad current with visible internal texture" — top view is the
  legible instrument). New experiment: `perceptionFOV` (default 360 =
  off) gates alignment + cohesion per-direction (separation stays
  omni — lateral line); breaks pair symmetry so direction information
  must travel. Verified live: polarization shifts at FOV 150, zero
  escapes, no perf cost. Spatial hash grid built (counting sort, cells
  ≥ max social radius, 13-cell half neighborhood, auto-fallback to
  brute when n<200 or grid ≤8 cells — mobile-tank dims fall back by
  design): 500 fish 1.08→0.70 ms, 2000 fish 8.7 ms (grid) vs ~14
  (brute est.) — win is ~1.6× at cohesion 0.3 in the desktop tank and
  GROWS as radii shrink; `flock.lastStepMs` / `lastPairMode` are the
  instruments. fishCount slider → 3000 (hardMax 10000). Pasted presets
  now warn when tuned in a different tank (tank key = informational,
  never applied — a preset describes the school, the tank is the
  venue). Billy's aside recorded: desktop is becoming the preferred
  ecosystem — noted, plan unchanged.
- **2026-07-18 — Vision-cone visualizer + preset defaults-fill fix
  (desktop-verified).** `vision cone` toggle (visualizers folder): a
  ray-fan on the sample fish marking the FOV boundary — honest at any
  angle (solid cones lie above 180°; at 360° the fan degenerates to a
  single backward ray, correctly). Scaled to max(aliR, cohR), same
  roll-locked basis as the fish mesh. Fixed a real gap vs the
  additive-schema rule: applyParams now restores keys MISSING from a
  preset to code defaults (captured at panel init) — an old preset
  reproduces its bottled aesthetic even after new params join the
  schema; a preset is a full snapshot, not a partial tweak.
  MILESTONES M1 restructure proposed to Billy (not committed —
  awaiting ratification). Hierarchical/driven-agents architecture
  discussed: zero-receive species already fit the matrix; externally
  driven agents = same agent pool, integration delegated to a driver
  system (P2+ blueprint; P1 needs only per-direction rule application,
  which FOV already introduced).
- **2026-07-18 — FRAMING B RATIFIED ✦ the project's crossroads.**
  One product: the desktop living aquarium; phone = tilt window;
  ring-toss game = shelved behind the mobile-derivation checkpoint
  (F4 close or D3 complete). MILESTONES fully restructured: Legacy M0
  (mobile input foundation, honestly labeled), F-track (F1 flock →
  F2 fake water + cursor current → F3 real water → F3.5 look dev →
  F4 skin), D-track (D1 species / D2 formula drivers / D3 data
  agents), Game Shelf, standing phone-window check. Locked bullets
  rewritten: product bullet (Framing B), perf budget (desktop
  primary), fish-gravity re-slotted to the window, surface affinity
  shelved with the posts. Decided at a stop, not in drift — the
  vision doc's exit clause, exercised.
- **Next up:** website deploy prep (aquarium goes on Billy's personal
  site), then the F1 close list: FOV experiment → maxForce retune →
  keepers → baseline → `m1-close` tag + phone-window check. Then F2.
