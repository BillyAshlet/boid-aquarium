# M1 continuation — three requests

## Confirmed: tank is a proper param

Found the `tank 水槽` folder — dimensions, presets, quick buttons all there. Good.

Starting the FOV experiment shortly. But before I do, three things.

## 1. FOV visualizer + confirm parameter status

Following your own principle ("every invisible force should be drawable"): I want a **vision cone visualizer** on the sample fish. Same fish as the perception radii — a semi-transparent cone extending from its head, opening angle bound to the `perceptionFOV` slider. Radii show *how far*; the cone shows *which direction*. Together they make "what this fish perceives" completely legible.

Please add it as a toggle in the `boids 鱼群` folder, next to the existing visualizers.

Also confirm: is `perceptionFOV` already registered with the full `addParam` treatment (zoom, reset, preset serialization)? I'd expect yes given the pattern, but flag if not.

## 2. Multi-species architecture — extension to hierarchical agents

I understand the K×K interaction matrix as you designed it. Now I want to extend the conversation before you finalize v1, because I've had an idea that might affect the architecture.

**The idea: agents that aren't fish.**

Imagine a second "species" that isn't a biological creature — it's environmental. Think **flowing architecture**: a set of point-agents that form persistent structures (waves, ribbons, standing patterns) inside the tank. Fish swim *through* or *around* these structures. The structures don't respond to fish — they're driven by their own rules, or by external data streams.

Concrete examples of what this could be:
- A **standing wave** made of agents with strong global alignment among themselves, forming a stable current shape in the tank (visible or invisible to render)
- A **real-time 3D visualization of external data** — stock prices, audio spectrum, heart rate — driving the positions or velocities of these agents, creating living data-sculpture with fish swimming through it
- Purely aesthetic **flowing environmental structures** — think of the transparent-resin-fish sculpture aesthetic, but the "structure" itself is emergent and dynamic

**Key property: these agents don't receive influence, only emit it.** The fish might see them, avoid them, be pushed by their flow — but nothing the fish do disturbs them.

**My question — does your K×K matrix design already handle this?**

My guess (please correct me): a "hierarchical agent" species is just a species where **the entire row is zero** (this species receives nothing from anyone), while **its columns can be non-zero** (others can be influenced by it). Predator/prey already gave you the non-symmetric case, so the matrix machinery seems to support it — but I want to be sure.

**A deeper question**: some of these agents wouldn't run boid rules at all — they'd be driven by external data (a stock price array, an audio buffer, a fixed formula). Does that require a new abstraction? Or is it "a species whose rule weights are all zero, with position updates coming from outside the flock system"?

**Questions:**

1. Does the current K×K matrix plan naturally support zero-row species (agents that emit but don't receive)?
2. Are externally-driven agents (position from data, not from boid rules) a natural species variant, or do they want their own architectural home?
3. **Should v1 be scoped to accommodate this — even minimally — so we don't have to restructure later?** Or is it cleaner to defer entirely, and rework the design at v2 when the concept becomes concrete?
4. If v1 accommodates it: what's the minimum shape? A `type` field on species that distinguishes `biological` vs `driven`? A separate array of `driven agents` alongside the flock?

**Please don't build any of this yet.** Judgment first. I want to know whether the multi-species v1 you already designed already welcomes this, or whether it needs one small extension to leave the door open.

## 3. MILESTONES.md sync

M1 has grown significantly beyond what MILESTONES.md currently says. What's actually in M1 now, versus what it originally scoped:

- Spatial hashing (built)
- Forward FOV (built, experiment pending)
- Perception cone visualizer (upcoming, request 1)
- Multi-species v1 (2 species) architecture (agreed, not built)
- Hierarchical agents / flowing architecture concept (discussion pending, request 2)
- Big desktop tank + platform-specific dims (built)
- Desktop camera navigation (built)

CLAUDE.md and DEVLOG have all been kept current, but MILESTONES.md still describes M1 as the original 5-item checklist — the gap is now large enough that it stops being a useful map.

**Please propose what M1 in MILESTONES.md should look like now** — restructured to reflect actual scope, with clear "done" vs "pending" markers, plus placement of multi-species v1 and the hierarchical agents question relative to M1 close.

Give me the proposed rewrite (or diff) and I'll ratify or amend before you commit. I want you to have the pen on this because you have the clearest view of code state — but I want to see the shape before it lands.

## Order

1. **FOV visualizer** — build, so I can run the experiment with proper instruments
2. **MILESTONES proposal** — draft for my review, no commit yet
3. **Hierarchical agents architecture** — discussion only, no code

Once (1) is in and (2) is agreed, I run the FOV sweep and see if it delivers multi-gyre. Multi-species and hierarchical agents get built in response to what that experiment shows.
