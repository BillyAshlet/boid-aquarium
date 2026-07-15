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
