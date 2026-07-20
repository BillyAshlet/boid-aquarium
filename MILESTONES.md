# Milestones 里程碑 — restructured 2026-07-18 (Framing B ratified)

**One product: the living aquarium.** The phone is a supported *window*
into the same aquarium (tilt-responsive, reduced preset). The ring-toss
game is *shelved, not deleted* — modules intact on the Game Shelf,
revisited at a dated checkpoint. Death by decision, never by inertia.

Every milestone is a **complete, playable state**. That contract
survives every reframing. If it starts to feel like grinding — stop and
ask why (the vision doc's exit clause; exercised once already, 07-18).

---

## Legacy — M0: Mobile input foundation ✅ closed 2026-07-06

What it honestly was: the *mobile input* foundation — DeviceMotion
permission flow, One Euro filtering, the three-frame model (device /
hold / framebuffer), presentation rotation, tilt calibration. Under
Framing B this is **not dead weight — it is the finished organ that
makes the phone window free to keep.** Also where the project's
workflow discipline was forged (visualizer-first debugging, field-test
loops, the panel).

- [x] All original M0 items (see git history / DEVLOG 2026-07-04→06)
- [x] Field-tuned input baseline: `presets/m0-input-baseline.json`

## F-track — Foundation 基础线

### F1 — Life 鱼群 *(≈ old M1; in progress — close list below)*
**Playable state:** a school lives in the tank, tunable and legible;
the desktop world gained its first inhabitant instruments.

**Original scope — done:**
- [x] Boids (sep/ali/coh), ray avoidance, 5DOF, InstancedMesh
- [x] Perception + steering visualizers; all params via addParam
- [x] Phone check (60 fps, tilt running)

**Grown scope — done:**
- [x] Preset tool: localStorage stable + copy/paste JSON bridge + ★ built-ins; tank-stamp on export; missing-keys→defaults
- [x] Perf: flat symmetric pair pass → spatial hash grid with auto-fallback; `lastStepMs`/`lastPairMode` instruments
- [x] Platform-specific tanks (scaling model A) + live dims; desktop orbit camera (`0/1/3/7`)
- [x] `sepFalloff` A/B dropdown; `centeringWeight`; `perceptionFOV` + vision-cone visualizer

**Pending — the F1 close list:**
- [ ] FOV multi-gyre experiment (the open aesthetic question)
- [ ] maxForce retune per the tuning-order rule → rebuilt weights
- [ ] Bottle keepers (`m1-crowded-1000`, `m1-standing-wave-v2`, …) + post-retune baseline preset
- [ ] `m1-close` tag (no bundle — preservation is the living mode)
- [ ] Phone-window check (standing rule, first application)

### F2 — Water, Faked 假水
**Playable state:** the aquarium gets its medium. Move the cursor and
the water moves; fish scatter through a current and regroup; rings of
influence you can *feel* — before any real solver exists.

- [ ] `FluidField` interface: `sampleVelocity(pos)`, `addJet(origin, dir, strength)`
- [ ] Cursor current — the aquarium's primary interaction: pointer injects a gentle moving current (the interface's first test-driver)
- [ ] Fake field: analytic currents with spread, decay, crude wall reflection
- [ ] Fish take scatter forces from the field
- [ ] Velocity-field arrow visualizer (the fluid is invisible — this is how we see it)
- [ ] Fluid system born with an enable flag (mode rule, day-one requirement)

*(Charge mechanic + touch zones → Game Shelf.)*

### F3 — Water, Real 真水
**Playable state:** the water is alive — currents bounce off walls and
come back, crossing flows make turbulence, disturbances linger.

- [ ] Coarse Stable Fluids solver behind the same interface
- [ ] Boundary conditions: reflect at walls
- [ ] Trilinear sampling; fake field kept as an A/B toggle
- [ ] Perf: desktop budget primary; phone-window ★ preset stays alive (window may keep the fake field — decide here)

### F3.5 — Look Development 视觉定调
**Playable state:** the aquarium looks *decided* — art direction chosen
and proven affordable before F4 commits to it.

- [ ] Background color decided in-scene; tank framing + proportions finalized
- [ ] Fish silhouette direction chosen (informs F4 Blender work)
- [ ] DoF + grain feasibility at target budgets (desktop primary, phone-window checked)
- [ ] Layered-rendering revisit (parked constraint: themes = independent render passes)
- [ ] Desktop framing tone: "shelf aquarium" frame vs full-bleed

### F4 — Skin 皮肤 *(old M5 minus game ceremony)*
**Playable state:** the finished object — looks like a page from a
design annual. TDC + Kota Iguchi, restrained, considered.

- [ ] Blender assets: fish, tank → GLB (silhouette-first, low-poly)
- [ ] Cel/flat shading, outlines, DoF, grain (implementing what F3.5 proved)
- [ ] Monochrome as a preset-selectable theme (living-mode requirement)
- [ ] Sound decision: silence vs minimal ambient water
- [ ] **Mobile-derivation checkpoint fires here if D3 hasn't triggered it first (see Game Shelf)**

## D-track — Aquarium content 内容线 *(interleaved with F-track after F1 close)*
When F and D conflict for a session: foundation before content.

**D1 — Multi-species P1** · *after F1 close, interleaved with F2*
- [ ] Two species, shared behavior params, 2×2 interaction matrix, per-species color
- [ ] Includes hierarchical zero-row agents as a matrix configuration (emit-only species)
- [ ] Carries: per-direction application of all three rules

**D2 — Driver system P1 (formula agents)** · *after F2, before/alongside F3.5*
- [ ] Driver system (own `world.systems` citizen, enable flag) writes positions for a `driver: external` species
- [ ] First driver: pure formula (traveling wave / Lissajous ribbon — zero external deps)

**D3 — Data-driven agents** · *after F3.5*
- [ ] Audio spectrum first (WebAudio, self-contained); arbitrary data feeds later
- [ ] Coupled to the layered-rendering decisions from F3.5 (the portfolio-facing convergence object)
- [ ] **D3 complete → mobile-derivation checkpoint fires if F4 hasn't triggered it first**

## The Game Shelf 游戏架 *(shelved by decision 2026-07-18 — not deleted)*

The ring-toss game, intact and ordered, awaiting its checkpoint:
rings (6DOF bodies, ring–wall/post collision, success snap, visual
wobble, two posts); charge mechanic (non-linear buildup, release,
decay) + touch zones; progression (orbit trigger, quiet celebration);
tilt-game feel tuning; the parked per-axis tilt-gain question.

**Mobile-derivation checkpoint: at F4 close or D3 complete, whichever
comes first.** The question is asked out loud — **build / defer (new
dated checkpoint) / retire** — and the answer recorded. If desire
returns, the game lands on a mature fluid foundation and is *easier*
to build than it would have been in the old order.

## Phone window 手机之窗 *(standing rule, every milestone close)*
- Five minutes on the real phone: boots, tilts, holds frame rate on
  the mobile ★ preset. Keeps the door physically open regardless of
  intentions — guards against desktop-only habit rot.

## Stretch *(old M6 — unchanged gate: never queues ahead of F/D work)*
Shelf-aquarium objects (dropped rocks/driftwood — settling rigid
bodies, irregular collision), surface affinity generalized, exhibition
layouts, first-person fish view (camera-follows-target-provider).

---

**Parked questions live in CLAUDE.md § Open questions.** Surface
affinity (posts-only prototype) moved to the Game Shelf with the posts
themselves; revisit if D-track grows non-post geometry sooner.
