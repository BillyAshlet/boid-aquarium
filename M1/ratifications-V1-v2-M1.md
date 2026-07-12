# Ratifications v1 — M1

Yes to all four with important amendments — please read fully before recording, because point 1 has changed meaningfully.

---

## 1. Desktop parallel — accepted, with a strategic pivot

I've thought about "does desktop keep jets" and I'm going to answer differently than expected: **no jets, and more importantly, no ring-toss game on desktop at all.**

Here's why: the ring-toss game is fundamentally coupled to tilt gravity. That's the whole point of it — the toy is *about* controlling a shifting horizon with your hands. Forcing it onto desktop (where gravity is constant) turns it into a bad version of the mobile game rather than its own thing. "Parallel experience" only works if desktop stops trying to be mobile-without-tilt.

**The reframe:**

- **Mobile = the game.** Complete ring-toss experience, tilt-driven, jets, all of it.
- **Desktop = the world.** No completion condition, no scoring, no jets. Instead: an aquarium you can *inhabit* — cursor as gentle current (agreed B), fish schooling, water settling, ambient. Later possibilities: an exhibition-style layout (rearranged from mobile), decorative objects, view controls. It's a space to *be in*, not a game to *win*.

This actually strengthens both:
- Mobile stays clean and focused — the toy, undiluted.
- Desktop becomes something the current framing can't be — a considered, quiet, TDC-magazine-aquarium-object, more like an art piece or a live wallpaper than a game port.

**One principle that must be recorded prominently:**

**Core technology must remain migratable.** The tank you see today is not the tank we'll see at M5, and the tank at M5 is not the tank at M6 or beyond. Boid rules, fluid interface, ring 6DOF physics, gravity handling, input abstraction — all of this must survive complete visual and layout redesigns. When we later decide "actually the desktop version should be a hexagonal panel arrangement" or "the mobile tank should be a vertical column instead of a horizontal box," the core algorithms should just work. This isn't just a nice-to-have — it's the criterion for whether the architecture is doing its job. Please add this as a top-level locked principle in CLAUDE.md.

**Dropped objects (M6 stretch): still gated as you proposed, still after M5.** No change there — the "shelf aquarium" idea remains a post-summer stretch module.

**Small new open question to park (M6 territory):** first-person view bound to a single fish, camera swimming with it, VR-adjacent — surprisingly cheap to implement (just an attachment of camera to a boid instance), and philosophically aligned with the project ("visuals emerging from simple rules — you inhabit an agent following separation/alignment/cohesion, no scripted camera choreography"). Not now. Park it.

---

## 2. Surface affinity — ratified as specified

M2 prototype, posts-only. Your two-opposing-rules formulation ("affinity pulls in, avoidance pushes out, contour-tracing emerges") is exactly the aesthetic I want. Nothing to add.

---

## 3. M3.5 look-development — ratified, and I want to formalize documentation upgrades alongside it

Yes to M3.5 as you specified — art decisions before final assets, DoF/grain feasibility tested against the phone budget before M4 performance tuning. This is a real bug in the original ordering and you caught it.

**Two documentation infrastructure requests to bundle in this recording pass:**

**(a) Development log system with annotation conventions.**

Every meaningful change to docs (CLAUDE.md, MILESTONES.md, and going forward) should be trackable at a glance. Proposal:

- **Slash annotations for revision depth:** `/` first pass, `//` second revision, `///` third, and so on. Applied inline next to the changed line or bullet.
- **Color coding by milestone era:** initial content = default/white; M0-era changes = red; M1-era = blue; M2-era = green; and so on. Applied via HTML span colors in Notion, or via markdown convention (e.g., blockquote color codes) in md files.
- Together: I can look at any doc and see instantly "this was written during M0, revised once during M1, revised twice during M2." Version history without opening git blame.

Your call on the exact color scheme and whether the mechanism lives in the markdown, in Notion, or both. If it's easier to do in one place, do it there — but I need to be able to see the history from my side too.

**(b) Development log — do we need one?**

Right now, "what happened when" lives in CLAUDE.md's "Current state" (dated entries — good), git commit messages (chronological but terse), and this chat history (rich but not queryable). If I ever want to write this project up as a piece — portfolio, blog post, grad school essay, or (only half joking) an actual paper on the development process itself — I'd want a fuller record than commits provide.

Your evaluation: **do we need a dedicated `DEVLOG.md`, or is the current setup enough if we're a bit more disciplined about "Current state" entries?** If DEVLOG makes sense, is it in the repo, in Notion, or mirrored to both?

**(c) Content sync to Notion.**

I want the Notion side to stay up to date, because I read there too. Please evaluate: which content should live where?

- **Engineering source of truth (must stay in repo):** CLAUDE.md, MILESTONES.md, code comments. Reasons: git history, session context loading, code proximity.
- **Narrative/decision history/design intent (candidates for Notion):** VISIOn.md, the Core Concept / Logic pages that already exist there, potentially the DEVLOG if we make one, design decision records.

Your judgment on what mirrors, what stays in one place, and how sync happens. My preference: don't create manual duplication work — if a piece of content is truly in both places, it needs a story for how it stays consistent. If the answer is "some things just live in Notion and are read-only from repo perspective" — that's fine, just be explicit.

---

## 5. Visuals — ratified. And a personal note.

Tank depth experiment as the tuning session opener: yes. `TANK.depth` 0.5 → 0.35–0.4, look, judge.

The M3.5 insertion: yes.

Mode-specific visual identity: **still gently against for the reasons you gave, but** — under the reframing in item 1 (desktop = the world, not a lesser game), some framing divergence might genuinely be right later. Desktop as "aquarium on a shelf" with visible furniture/frame, mobile as "immersive full-bleed" — this is now an M3.5 discussion worth having explicitly, not a "no."

**Personal observation, half aside:** what I'm doing here — physics simulation, emergent behavior, per-frame force integration, low-poly rendering, adaptive filtering of input signals, considered visual language — is starting to feel *a lot* like graphics / creative coding as a discipline. Which is where I was pointed for grad school anyway, but it's the first time this project has felt like *training* for that direction rather than *practice at* it. Noting it because it might change how I want to write things up, and because M3.5 (look development) coincides plausibly with my design coursework finishing this semester — I'll bring what I'm learning there into that milestone directly.

---

## What I'm asking you to do now

**One recording pass, covering:**

1. **CLAUDE.md updates:**
   - Rewrite "Desktop = simplified fallback" → "Desktop = the world, mobile = the game" (with the strategic reasoning, not just the label)
   - New top-level locked principle: **core technology must remain migratable across visual/layout redesigns**
   - Record: A (up-vector swap, M2), B (cursor current as desktop primary interaction, M3 early), C-split (point orbit M5 / surface affinity M2 posts-only / cursor current already in B)
   - Park: mobile poke-vs-charge (M3), desktop framing tone (M3.5), first-person fish view (M6 stretch)
   - Add M6 as explicit stretch (dropped objects — "shelf aquarium")

2. **MILESTONES.md updates:**
   - Insert M3.5: look-development
   - M3 adds a line for cursor-current as desktop primary verb
   - M6 added as explicit stretch (no dates, no commitment — just a named parking spot)
   - Remove "no jets" from desktop scope in whatever milestone previously implied it, since it's now a positive design choice, not an omission

3. **Documentation infrastructure decisions:**
   - Slash + color annotation system: your call on scheme and implementation location (md, Notion, both)
   - DEVLOG: your call on whether it's warranted, and where it lives
   - Notion sync strategy: your evaluation of what mirrors and what stays repo-only

4. **After recording: summarize what changed** — I want to review before it settles. Especially the locked-principle rewording; that's the load-bearing sentence for a lot of future decisions.

Then, and only then, the tank is finally mine for the M1 tuning session (starting with the depth experiment). 🐟
