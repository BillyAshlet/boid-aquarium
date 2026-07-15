# M1 Deep Observation Report

Phone→desktop pipeline confirmed working, 60 fps maintained under real use. All the safety infrastructure holds. Now the real observations from playing with the system extensively.

## 1. Confirmed: desktop is where tuning happens, phone is where feel is verified

Just recording this as fact now: touch sliders on a phone are miserable, scrolling the panel with fingers is worse. The paste-apply workflow you built is the actual working mode — desktop tune → export JSON → phone verify. No more attempting to tune on mobile. This should be reflected somewhere in CLAUDE.md's workflow rules if it isn't already.

## 2. Tank size may need to diverge across platforms — a real architectural question

At 1000 fish the tank feels crowded on desktop. My gut says the desktop tank should just be **bigger** — the "aquarium on a shelf" reading calls for space to *inhabit*, not density that reads as pressure. But mobile is the ring-toss game, where a bigger tank makes the game harder in ways that don't help feel — the toy's original size is small for a reason.

So the question is: **should tank dimensions become platform-specific?** CLAUDE.md currently locks `1.2 × 0.8 × 0.5 m` as a convention (dimensions tunable, convention not). But this may have been written before the mobile/desktop split hardened. My proposal for consideration:

- **Mobile tank:** current dimensions (1.2 × 0.8 × 0.5) — the toy scale
- **Desktop tank:** something larger, maybe 2.0 × 1.2 × 0.8 or bigger — the aquarium scale

Consequences to think through: (a) more fish look at home in a bigger tank, so 1000+ becomes aesthetic rather than cramped on desktop; (b) all radius-based params tuned on desktop won't transfer cleanly to mobile — presets become platform-specific; (c) M2 ring physics may want to know which tank it's in. Your read: is this a clean divergence to make now (before M2 depends on tank size), or is it premature?

## 3. I want M1 preserved as a standalone playable artifact — permanently

The flocking system is genuinely mesmerizing on its own. Not "a step toward M2" — a thing I want to be able to open and play with **forever**, independent of whatever the project becomes. If M5 changes visuals radically or M6 adds droppable objects, I don't want to lose access to "pure M1 flocking on this exact commit."

Two ways I know to do this in git: **a tag** on the M1 close commit (immutable snapshot, `git checkout v1.0-flock`), or **a branch** (`m1-standalone` that stays alive and could even receive isolated fixes if the flock engine gets broken later). My preference is a tag — the M1 preservation is "look, don't touch." But if you see a reason to prefer a branch, say so.

Related: I'd like the deployed dev server (or eventually a built version) to potentially serve both — main URL for the current milestone, `?m1` for the preserved M1 pure-flock mode. That's a want, not a must.

## 4. Alignment and cohesion are the macro-structure engine — separation is just anti-collision

Independent finding I want to note for the record: after enough tuning I now understand `separation` primarily as a "don't clump into a point" guard, while **`alignment` and `cohesion` are what actually determine the shape and behavior of the entire school**. When I adjust separation, local spacing changes; when I adjust alignment or cohesion, the whole system reorganizes.

**My current aesthetic target, described as precisely as I can:** a *flowing Möbius-strip feel* — a system where flow curves through itself, folds back, doesn't have a stable "front" or "back," and contains **multiple gyres** rather than one. Not one wave — several coexisting flows that interpenetrate.

I'm skeptical this is achievable in the current tank size (see item 2 — space may be the constraint), but I want to record it as a persistent target that M1 tuning aspires to. If it's fundamentally impossible without physical space, that itself is useful information.

## 5. Parameters couple — and the coupling is currently my hardest tuning problem

`centeringWeight` was the wake-up call. It has no radius, so it applies to every fish equally — meaning it doesn't just add a force, it **multiplies with alignment and cohesion**: fish being pulled toward center *also* being told to align with neighbors *also* being pulled toward the flock's local mass = a compounding effect. Small centeringWeight changes → large system changes.

And `maxForce` still 5.2 amplifies all of this, per your earlier "master key" analysis.

**Question for you:** is there a principled tuning order for coupled parameters, or is this just something I have to feel my way through? My instinct is "reduce maxForce first, then centering, then alignment/cohesion, always adjust the coupling-heaviest thing last" — but I'm working blind here. Any structured approach would help.

Specifically for maxForce: I understand your prior recommendation was to reduce it and let all the weights "wake up." Now that I have the preset system, should I:
- (a) Save current-configuration-with-maxForce-5.2 as `m1-crowded-1000` first, THEN start reducing maxForce as a distinct exploration?
- (b) Do the reduction in-session and rebuild the weights fresh?

I'd like to preserve every genuine aesthetic *before* touching maxForce, so option (a) — but is there anything I should save separately first?

## 6. The order/chaos target — organic semi-regularity, described

Tried the central-containment aesthetic (via long detectionLength). Verdict: **too regular**. Without obstacles, fish settle into essentially fixed orbits — predictable, describable in one sentence, dead.

The aesthetic I actually want lives at a specific point on the spectrum: **regular enough that you sense pattern, irregular enough that you can't describe it in one or two sentences.** You watch it, you feel like something's coordinated, but you couldn't tell someone else exactly what — because it's genuinely different every moment while still not being noise.

This is real dynamical-systems territory — "the edge of chaos," between fixed points and true randomness — and I think it's the actual aesthetic thesis of the whole project ("simple rules, complex systems" isn't just about simple rules producing complex behavior, it's about complex behavior *that lives right at this order/chaos edge*). Worth recording as a design principle, I think.

**Practical implication for M2 planning:** rings and posts are exactly the kind of asymmetry-breakers that push a system from fixed-orbit regularity toward the semi-regular regime I'm chasing. Which is another reason to trust the "M2 might spontaneously produce multiple gyres" prediction you parked earlier.

## What I want from you before I keep exploring

Not a full session — three specific decisions plus some recording:

1. **Tank-size divergence (item 2)** — your read: yes, do it now before M2; yes but later; or no, keep one size?
2. **M1 preservation strategy (item 3)** — tag or branch, and please execute whichever we choose
3. **Coupled-parameter tuning order (item 5)** — general heuristic if one exists; specific answer on whether to save current preset before reducing maxForce
4. **Record in CLAUDE.md** — the "desktop tunes, phone verifies" workflow rule (item 1); the Möbius/multi-gyre target as a parked aesthetic (item 4); the order/chaos edge as a design principle (item 6)

Then I'll go back to playing. I'm in no rush to close M1 — this thing is a joy and I want to explore it thoroughly before bottling the final baseline.
