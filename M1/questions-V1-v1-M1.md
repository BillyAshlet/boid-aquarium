# Questions v1 — M1

Multiple threads to work through. I've numbered them so we can address each cleanly, and I've flagged which need discussion vs. which are just checks. **Please don't build anything yet on 1–3 — I want to discuss.** Item 4 is a check-and-report, item 5 is a discussion but with less at stake.

---

## 1. The big one — Desktop as a parallel experience, not a fallback

**Context:** CLAUDE.md currently locks: *"Desktop = simplified fallback. Mobile is the real game and the performance budget."* I want to reopen this decision.

Watching M1 fish on desktop, I realized the desktop version isn't a "worse mobile" — it's a *different aesthetic*. Mobile is about the toy: tilt, jet, land the ring, build hand intuition. Desktop is about the aquarium: sit and watch, gentle interaction with a slow world, TDC-magazine restraint. Both are true to the project's philosophy ("physics is the teacher, no tutorial text"), but they're doing different jobs.

**The proposal:**

- **Mobile mode:** dynamic gravity from tilt (as now). Verb = *tilt*.
- **Desktop mode:** gravity is a *constant* pointing down — but it's *real*, not a stub. Physics feels weighty and settled, like a real aquarium sitting on a shelf. Verb = *poke, drop, guide*.

Two things follow if we accept this:

**A) B (cursor repulsion) gets promoted.** In our previous discussion you said "desktop-first as consolation prize." Under this reframing, cursor interaction isn't a consolation — it's the primary desktop verb. Cursor generates a small vortex/current through FluidField (as you specified), and fish scatter from it. Same architecture, higher status.

**B) A new capability — dropping objects.** Desktop-only sidebar or affordance where the player can drop irregular geometric objects into the tank (rocks, driftwood, small shapes). Fish then trace their surfaces (see item 2). Rings could presumably also interact with these — they'd collide, drift around them. This is a genuinely new interaction, distinct from the ring-toss endgame.

**What I need from you before we build anything:**

- **Cost estimate for pivoting now vs. later.** How much does "desktop as parallel experience" cost as an architectural change *today* (M1 tuning phase) vs. deferring the decision to M5? My gut says gravity source is the only real fork — everything else is additive — but you know the code, I don't.
- **Does this fit the project's philosophy, or does it split the product?** Two modes could be a strength (each aesthetic fully served) or a weakness (neither fully realized because attention is divided). Honest read?
- **What breaks in CLAUDE.md?** The "Desktop = simplified fallback" line becomes false. What other locked decisions get touched? Please audit before we change anything.
- **Do MILESTONES.md's M1–M5 need restructuring?** My hope is no — physics doesn't care about mode, mode just changes the gravity source and available interactions. But you should sanity-check.

If you agree this is worth doing, then we discuss what changes in CLAUDE.md before touching code. If you push back, I want to hear why.

---

## 2. Correcting C from last discussion — surface-following is a distinct behavior

I don't think we were talking about the same thing. Your response treated "orbit" as *circling a point* with tangential force — center + radius + weight. That's the M5 post-endgame case, and I agree with your reasoning there (one client, one function, no framework needed).

But what I actually meant is **surface-following**: real fish schools trace the *contour* of coral, rocks, and other irregular geometry. They hug the surface, follow bumps in and out, glide along shapes that aren't circular. This isn't a tangential force around a point — it's a **distance-maintaining, shape-tracking** steering behavior.

Reynolds himself listed "wall following" and "path following" as separate steering behaviors alongside separation/alignment/cohesion — a legitimate sixth rule, not a special case of anything else. So this reframes C:

- **B (cursor repulsion via FluidField)** covers "influence fish by pushing water around."
- **Point orbit function (your M5 spec)** covers "circle a center."
- **Surface-following** is something else — it's fish *actively tracking geometry* rather than being pushed by fields or curving around points.

**A circular pull field around a rock would just make fish pile up on the rock, not glide along its surface.** These are different algorithms.

**Two questions:**

- Is this a separate steering rule (sixth force in the sum), or does it fold into obstacle-avoidance as a *grazing bias* — where the avoidance ray, instead of steering fully away, leaves some tangential velocity so fish sweep along surfaces rather than swerving off them?
- Is it in scope for *this* project? Current geometry is round (posts, rings). Even under proposal 1, dropped objects would introduce irregular shapes — so if we adopt 1, this becomes real. If we don't, it stays theoretical.

Your call on how to categorize and where to place this. But please don't collapse it back into "orbit" or "cursor repulsion" — it's neither.

---

## 3. A recap for CLAUDE.md — please confirm my understanding

Just to make sure we're aligned before recording anything:

- **A (gravity influence on fish):** Yes, but as an *up-vector swap* (fish orient to `−gravity` instead of hardcoded +Y), not a sixth force. M2. Optional `gravityBias` steering weight parked as a fallback if pure re-leveling feels too subtle.
- **B (cursor/pointer repulsion):** Yes, via FluidField as a moving source. Whether it's "desktop-first consolation" or "desktop primary verb" depends on how we resolve item 1.
- **C (fish around geometry):** Split into two things — point orbit (M5, plain function, agreed) and surface-following (new question, see item 2).

Does this match your intent? If so, please hold on recording anything in CLAUDE.md until items 1 and 2 are resolved — they change what "B" and "C" actually mean.

---

## 4. Panel scroll — please check what actually landed

The panel scroll fix went in during our last session, but my Claude Code 5-hour window ended partway through and I'm not sure the final state is what you described. Please:

- Open the current `debug.js` and confirm the scroll CSS matches what you said you shipped (`overflow-y: auto` on the panel body, `touch-action: pan-y` on the holder overriding the parent's `touch-action: none`).
- Boot a live preview and verify: can you actually scroll the full param list with wheel/trackpad? Is mobile touch-drag scrolling working?
- Report what you find. If it's incomplete, finish it now — I need scroll to work before I can do M1 tuning.

---

## 5. Visual style — does it get its own step?

Watching M1 on desktop, I don't love the current visuals. The tank looks *too deep* — physically deeper than a real display tank should feel. And more broadly, the current placeholder look (dark navy, wireframe-ish tank, capsule fish) doesn't match what I want the finished thing to feel like (TDC + Kota Iguchi aesthetic — restrained, considered, illustrative).

**MILESTONES.md puts visual style in M5 (blender assets, cel shading, DoF, grain, etc.).** But now I'm second-guessing this — should visual style *actually* be a separate dedicated milestone/session earlier, or does it stay in M5?

Two related questions:

- **Tank depth:** should this be tuned now, or is it locked into geometry decisions elsewhere? A shallower tank might read better on both platforms.
- **Desktop vs. mobile visual identity:** if we adopt proposal 1, does the tank *look* different in the two modes? Desktop as "a real physical aquarium box" (with more visible framing, weight, glass edges), mobile as "the world seen through the phone" (fuller, immersive, less frame)? Or is that overcomplicating things?

If your view is "no, visuals stay in M5, ignore the placeholders" — that's a fine answer, I'll trust the plan. But if there's a case for a mid-milestone visual pass (M2.5 or M3.5), I want to hear it.

If we're only building *concept-level physics* right now and visuals are truly deferred, then disregard this item.

---

## What I need back

For items **1**, **2**, **3**, **5**: a discussion, not code. Structured if possible — cost, fit, milestone placement, and your honest advocate/pushback stance on each.

For item **4**: a check and, if needed, a fix.

Once we've resolved 1 and 2, we can update CLAUDE.md properly and I can go do the M1 tuning session (assuming the scroll actually works). That's the throughput bottleneck.
