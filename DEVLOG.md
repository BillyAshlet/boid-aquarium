# DEVLOG — the boid 水族馆

One short entry per work session: **what** happened, **why**, and what
we **learned**. Written at session end, alongside CLAUDE.md's "Current
state". This is the narrative record — richer than commits, queryable
unlike chat — and the raw material for any future write-up.

*(Entries before 2026-07-12 are backfilled from CLAUDE.md's dated
history and git log.)*

---

## 2026-07-04 — Session zero: the pipeline
Repo, CLAUDE.md (conventions + locked decisions), MILESTONES.md
(M0–M5, each a playable state), Vite with HTTPS-on-LAN, spinning-ring
placeholder. Phone test passed same day (61 fps).
**Learned:** do the scary platform unknowns (iOS permissions, HTTPS)
while the codebase is ten files small.

## 2026-07-04 — M0 build + first field feedback
world/scene/input/debug scaffold: fixed 60 Hz timestep, auto-framing
camera, glass tank, DeviceMotion permission flow, gravity arrow,
Tweakpane. Field test drove immediate revisions: landscape-only
design, flip-sign default from measurement, smoothing range from feel.
**Learned:** the debug arrow found every axis lie faster than any
amount of reasoning about specs. Visualizers are instruments, not
decoration.

## 2026-07-04 — The canonical frame
iPad testing proved orientation APIs lie (angle 0 in docked landscape,
sensors portrait-referenced). Rebuilt: game world anchored to the
physical device frame; presentation = CSS rotation + dimension swap;
rotate-prompt overlay deleted — wrong holds self-correct physically,
like the real toy.
**Learned:** when a platform API lies, stop asking it questions.
Anchor to physics.

## 2026-07-05 — Symmetric landscapes, One Euro, the three-frame model
Gravity-resolved 180° flip made both landscape holds first-class; a
second iPad bug (mirrored tilt physics) exposed the missing third
frame — the framebuffer. Final model: R = −(hold + framebuffer), F
tracked by angle deltas + a readable-prior calibration. Replaced fixed
smoothing with per-axis One Euro (Casiez et al. 2012) in the device
frame. Added flip debounce + hold-frame tuning lock.
**Learned:** physics and presentation must derive from one shared
state or they will disagree by exactly 180° where you can't see it.
Also: distrust your test instrument before your code (background-tab
throttling faked a bug).

## 2026-07-06 — M0 closed; M1 built
Panel gained recursive zoom (⊕/⊖ re-centered on current value);
field-tuned One Euro values became code defaults, bottled as the first
preset. Then M1 in one session: Reynolds flock (separation/alignment/
cohesion + forward-ray avoidance + speed keeper), 5DOF with roll
locked, InstancedMesh, 16 panel params, perception-radii and
steering-line visualizers, `window.aquarium` debug handle. Verified:
mean nearest-neighbor 0.055 m ≈ just under separation radius — the
statistical signature of schooling; 60 fps at 200 fish.
**Learned:** M0's boring infrastructure (fixed timestep, addParam,
systems array) made M1 land in a single session with zero wiring pain.

## 2026-07-11 — Panel scroll; the A/B/C design conversation
Scroll unblocked tuning (native overflow + touch-action exemption).
Design review: gravity's influence on fish = up-vector swap, not a
force (M2); cursor repulsion = FluidField source, not a sixth rule
(M3); attractor framework rejected as speculative generality — orbit
stays a plain point-function (M5).
**Learned:** the FluidField interface keeps absorbing design ideas
that would otherwise become special cases. Good interfaces are greedy.

## 2026-07-12 — The M1 design review: desktop becomes its own thing
Billy's ratification pivoted the product frame: **mobile = the game
(tilt-coupled ring toss, undiluted); desktop = the world (no jets, no
rings, no win state — an inhabitable aquarium, cursor as current)**.
New top-level principle recorded: core technology must remain
migratable across complete visual/layout redesigns. Surface affinity
(weak attraction opposing avoidance → emergent contour-following)
ratified as an M2 posts-only prototype — Billy's correction: it is a
distinct Reynolds behavior, not orbit. M3.5 look-development inserted
(DoF/grain feasibility must precede M4 perf tuning). M6 stretch parked
(shelf aquarium: dropped objects, first-person fish view). Doc
infrastructure: this DEVLOG created; inline revision-color annotations
evaluated and rejected (git is the revision record); Notion = design
intent, engineering docs never mirrored, milestone digests on request.
**Learned:** watching a system run (M1 fish on desktop) generates
better design decisions than planning it did — three of today's four
decisions came from observation, not speculation.

## 2026-07-15 — The standing wave gets a name, and tuning gets a memory
Billy's parameter archaeology (his correction of my mis-mapped audit,
then his own retune) landed somewhere neither of us predicted: **one
large coherent gyre** — 500 fish cycling the tank like a slow current.
His go signal green-lit the tooling session. Landed: the **preset
tool** (localStorage stable + copy/paste JSON bridging
desktop-precision and phone-feel; ★ built-ins imported from
`presets/`), the standing wave bottled AND promoted to code defaults
before anything else changed — checkpoint first, his explicit
workflow rule. Headroom for 1000 fish plus a ~2.6× perf pass
(symmetric flat-array pair loop; grid consciously deferred — with
cohesionRadius spanning most of the tank it buys nothing yet).
`centeringWeight` gives the old misdiagnosis an honest knob, and
`sepFalloff` makes the separation-function discussion a dropdown
instead of a debate.
**Learned:** a wrong diagnosis can still find a real aesthetic — the
"accidental containment" read was based on mis-mapped numbers, but
the described behavior was worth building a knob for. And: bottle the
checkpoint *before* the session that might improve on it; the tool
that preserves an aesthetic has to exist before the retune that
endangers it.

## 2026-07-15 (later) — The observation report that named the thesis
Billy's deep-observation pass after real phone+desktop use. The
milestone's biggest outputs turned out to be conceptual: (1) the
**order/chaos edge** named as the project's aesthetic thesis —
"regular enough to sense pattern, irregular enough to defy a
one-sentence description" — with pure central containment
field-verified as the dead-regular end of the spectrum; (2) the
**Möbius/multi-gyre target** recorded, with the realization that the
tank-size question and the multi-gyre question are the same question
(space is the suspected constraint); (3) separation demoted to
anti-collision, alignment+cohesion recognized as the macro-structure
engine. Decisions: tank dimensions go platform-specific before M2;
M1 is preserved by tag (m1-standing-wave now, m1-close + built bundle
at close) — a branch invites drift in a thing meant to be immutable;
coupled parameters get a tuning ORDER (amplifiers → solo → local →
collective → global fields last), not just intuition.
**Learned:** Billy's aesthetic vocabulary is outrunning the parameter
vocabulary — "folds back through itself" has no knob. When that
happens the missing parameter is usually structural (space, obstacles,
boundary shape), not another weight.

## 2026-07-15 (evening) — Preservation gets rethought: the mode, not the museum
Billy pushed back on the tag+bundle plan, correctly: a tag is a
context switch ("make a whole moving job out of looking") and a built
bundle is frozen art that no future bug fix can reach. Revised
strategy: **M1 pure-flock becomes a permanent mode of the living
game** — preset JSON grows from parameter capture into intent capture
(params + mode + theme + participating systems), and every system
from M2 onward is born with an enable flag. The tag stays as an
exact-moment safety net; the mode carries the idea forward. Deeper
mode-system architecture (game.js as mode runner, theme axis, schema
versioning) under discussion — recorded when ratified.
**Learned:** archives preserve what a thing *was*; living modes
preserve what it *is for*. Billy wants the second, and the codebase
was accidentally already shaped for it (world.systems + interface
seams).

## 2026-07-17 — Ratifications recorded; the mode architecture is settled
Cross-window handoff: Billy ratified all three pending items from the
mode-not-museum discussion, and this session recorded them in
CLAUDE.md. Named modes are now a hard cap (two or three, curated —
"a mode is a list of what gets built, not a thing that runs";
free-form toggling stays in the panel). Intent-vs-appearance is an
explicit principle (mode = what M1 is for; tag = what M1 was). Preset
schema keys are additive-only, recorded as a workflow rule where
future preset-touching sessions will actually look. The `"ui"` schema
field died in review — presentation is its own axis, not a boolean.
Also swept out the stale "desktop = simplified fallback" bullet that
had outlived its supersession by five days.
**Learned:** cross-window continuity worked — memory + CLAUDE.md +
commits carried a whole architecture discussion between sessions that
never saw each other. The docs are doing their job as the shared
brain; the recording discipline is what makes parallel sessions safe.

## 2026-07-17 (later) — The tank diverges; desktop learns to walk
Billy's go on tank divergence, with three judgments first: scaling
model A chosen over B by dimensional analysis (B preserves every
dimensionless ratio — same gyre, roomier costume; A changes exactly
the ratios the multi-gyre hypothesis names); camera navigation bundled
(a 2 m tank judged through a fixed front window is half-invisible);
Blender's G/R/S politely declined — those are object-edit transforms,
not viewport nav; even Blender orbits with middle-drag. Built:
platform-selected live-tunable TANK, OrbitControls with view snaps
and an exact home (damping momentum must burn on the OLD pose —
flushing after placement flings the camera, found by test), preset
tank-stamp, 0×0-viewport NaN guard. "Fixed camera, world tilts" is
now explicitly scoped: a mobile game rule. Fish-cam future recorded
as camera-follows-target-provider — no system until a second customer.
**Learned:** the cheapest scaling question ("what scales?") was the
deepest one — the answer came from dimensionless ratios, not code.
And OrbitControls' damping is stateful in a way that punishes
teleporting cameras; every "snap to view" feature everywhere has
probably fought this exact bug.

## 2026-07-17 (evening) — Vision gets a cone; the pair loop gets cells
Billy's exploration verdict: space alone makes the current *legible*
(top view shows internal eddies the front view flattened) but doesn't
force multi-gyre. His new hypothesis is the best-argued yet:
omnidirectional perception lets direction information propagate
instantly, forcing global consensus — a forward FOV cone makes
information *travel*, and the delay may let pockets persist. Built:
`perceptionFOV` gating alignment + cohesion (separation stays omni —
it's lateral-line, and blind-behind separation causes rear-endings);
FOV breaks pair symmetry, which the new spatial hash grid was designed
around (counting sort, half-neighborhood, brute fallback for small
schools/tanks). Grid verdict reversed from the small tank: cohesion
0.3 in a 2 m tank skips ~⅔ of pairs. Measured: 500 fish 1.08→0.70 ms,
2000 @ 8.7 ms. Limits loosened (fishCount → 10000 hard). Multi-species
architecture discussed, not built: one flock + species ids + K×K
interaction matrix; a preset axis, not a mode axis. Fibonacci sphere
formally passed on (uniform 3D sampling is wrong for a roll-locked
fish). Billy's aside for the record: he prefers the desktop ecosystem
now — in a mobile-first project. Noted without alarm; the game is
still the game.
**Learned:** non-reciprocal perception (i sees j ≠ j sees i) is where
flocking literature says the interesting regimes live — and the FOV
cone is the cheapest door into it. Also: performance verdicts have
expiry dates; the tank change silently reversed the grid decision,
and only re-asking caught it.

## 2026-07-18 — The cone gets drawn; a routine question catches a real bug
Vision-cone visualizer built as a ray-fan (solid cones lie above 180°;
the fan folds honestly around the blind spot, and degenerates to a
single backward ray at 360°). Billy's routine "confirm addParam
treatment" question exposed a genuine schema-rule violation: presets
predating a param left it UNCHANGED instead of restoring the default —
m1-standing-wave loaded at FOV 90 would not have reproduced its
bottled aesthetic. Fixed: missing keys → code defaults; a preset is a
full snapshot. MILESTONES M1 restructure proposed (original scope /
grown scope / close list). Hierarchical-agents architecture discussed:
zero-receive species fit the interaction matrix natively; externally
driven agents = same agent pool, integration delegated to a driver
system. Multi-species phases renamed v1/v2/v3 → P1/P2/P3 (collision
with Billy's Vn/vn/Mn file scheme). Billy green-lit convergence-
noticing as standing practice — three parked ideas (driven agents,
layered rendering, desktop preference) point at one future object.
**Learned:** "confirm X works" questions from the person who can't
read the code are free audits — answer them by checking, never from
memory. And naming schemes are APIs between collaborators; collisions
deserve the same respect as code collisions.
