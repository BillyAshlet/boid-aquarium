# M1 exploration report + four requests

## Observation report

Big tank feels great on desktop. The camera work you did is genuinely excellent — the damped orbit gives it a soft, physical quality, like moving a real object rather than jumping to angles. It reminded me of those childhood transparent-resin sculptures with fish suspended inside them, where you tilt them to see the fish from different sides. That's the feeling I got walking around this tank. Well done.

Multi-gyre observation: from top view (`7`), the flow does look more differentiated than the sideview reading suggested — you can see local swirls and eddies that were being flattened when I looked at it from the front — but I wouldn't yet call it multiple distinct gyres. It's more like one broad current with visible internal texture. So the tank size alone isn't enough to force multi-gyre — but it makes the current state more legible.

Toy ↔ aquarium quick-buttons: switching live is fun. The immediate collapse from spacious flow into crowded pressure is felt rather than analyzed. This is a good tuning instrument.

Phone regression: same as before. Nothing broken.

**Aside I want to record:** desktop and mobile are becoming genuinely different ecosystems, and honestly, I think I prefer the desktop version. That's an interesting realization for a "mobile-first" project — worth noting somewhere, though it doesn't change the plan.

## Four requests

### 1. Fish forward field-of-view — this is what I most want to try

Current perception is omnidirectional — every neighbor within a radius counts, regardless of direction. Real fish don't work that way; they have a limited field of view (~270° with a rear blind spot, biologically). Reynolds' original paper flagged this as a legitimate boid variant.

Technically cheap: after the distance check, one dot product against the fish's forward vector to reject neighbors behind. Something like:

```
if (dist < radius && dot(normalize(neighbor - self), self.forward) > cos(fovAngle)) {
    // count this neighbor
}
```

I want this because I have a hypothesis: **omnidirectional perception may be exactly what's preventing multi-gyre.** With every fish "seeing" every other fish equally in all directions, alignment information propagates instantly across the tank, forcing a global consensus. With a forward view, direction information has to *travel* through the school — a fish only aligns with those it can see, and it takes time for a directional decision to reach the back. That delay might be what lets local pockets form and persist.

Please add this as separate parameters per rule (some rules might want forward-only, others might not) — or as a single global `perceptionFOV` if you think that's cleaner. Your call. Include a smooth falloff at the edge of the field if it doesn't cost much (fish don't perceive sharply at the edge of their vision) — but a hard cone is fine as a v1.

### 2. Spatial hashing — worth revisiting now, I think

Your previous verdict was "not worth it because cohesion radius spans most of the tank." That was true in the small tank. In the 2m desktop tank, cohesion radius 0.30 covers a much smaller fraction — most fish are outside it. Combined with my next two asks (more fish, complex environment eventually), the O(N²) neighbor loop may finally be the bottleneck it wasn't before.

Please re-evaluate. If you now think it's worth building, do it. If not, tell me what the new trigger condition is so I know when to ask again.

### 3. Multiple fish species — architectural discussion, not code

This is a real design conversation, so **please don't build anything yet**. I want your read.

The idea: two or three fish "species" in the tank simultaneously, each with its own boid parameters, coexisting with defined inter-species interaction rules.

Interaction possibilities I can see:

- **Independent coexistence** — species A only aligns/coheres with A, species B only with B. They see each other only through avoidance. Two flocks sharing space.
- **Treat as obstacle** — species see each other as obstacles to steer around, without alignment or cohesion coupling.
- **Asymmetric predator/prey** — A attracts to B (predator seeking prey), B repels from A (prey fleeing predator). Classic emergent chase dynamics.
- **Weak mixing** — species interact with reduced weights across species boundaries. Blurred mixed schooling.

Each produces genuinely different aesthetics. Independent coexistence might be the most direct route to multi-gyre — two flocks, two currents. Predator/prey would give a totally different rhythm — the school as reactive, not just circulating.

Questions for you:

- Is this a natural extension of the current architecture (multiple `Flock` instances registered as separate `world.systems` citizens with a shared perception pass?), or does it require rethinking `boids.js` structurally?
- How does this interact with the mode system? The instinctive answer is "different species combinations become different named modes" — pure single-species meditation mode, multi-species ecology mode, predator/prey drama mode. Is that the right framing, or does species-mixing want its own axis independent of modes?
- Is there a "start small" version where I get one extra species with independent behavior only, and we defer the asymmetric interactions until they prove wanted? Or is the architectural cost of doing "any multi-species at all" already committing us to a full framework?
- If you build it, what's the smallest scope that would let me actually experiment?

### 4. Loosen fish count and formalize tank size

Two small requests, both about not being artificially bounded:

- **Raise or remove `fishCount` hardMax.** 1000 is arbitrary — the phone is the real ceiling and it hasn't spoken yet. Let me push until fps drops, whatever that number is.
- **Confirm tank size is a proper first-class parameter now** — with zoom, reset, preset serialization, all the addParam treatment. The panel sliders exist and work, but I want to make sure the full ergonomic treatment is there (in case it's currently a lighter-weight registration).

Both trivial, but they remove artificial constraints while I'm still exploring.

## Order I'd suggest

1. **Forward FOV** (build) — most likely to change my rendering of the school, cheapest experiment, might solve multi-gyre without needing (3)
2. **Loosen limits** (trivial) — remove artificial ceilings
3. **Spatial hashing decision** (judgment first, then build if yes)
4. **Multi-species architecture** (discuss only) — commit to a shape, don't build yet

But your call. If you see reasons to reorder, do.

## Small aside — Fibonacci sphere, parked forever

I keep noticing the Fibonacci sphere/sunflower distribution in boid videos online and getting curious. But it's for evenly-distributed 3D direction sampling, and our obstacle avoidance isn't performance-bound and doesn't want 3D-uniform candidates anyway (roll is locked, pitch is clamped — horizontal-biased sampling is *more* correct for us, not less). It's a beautiful algorithm looking for a problem I don't have. Recording that I looked at it and passed, so future sessions don't re-relitigate.
