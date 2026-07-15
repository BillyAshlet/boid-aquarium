# Observation report + Go signal for the session plan

## What I actually saw

Went back and watched, and — you were partially right, but the answer is more interesting than either "milling" or "one intent." After I tweaked a few more parameters (new set at the bottom), the school started forming something I can only describe as a **wave**: one large-scale coherent flow cycling through the tank, like a slow current or a water ripple made of fish. Not milling, not marching — closer to a **standing gyre**.

**500 fish + tank = exactly one wave.** I want *multiple* waves — smaller cells, several flows coexisting, more turbulence — but I suspect the tank is just too small to accommodate that: at these numbers there isn't spatial room for two independent alignment regions to form. My guess: it collapses to one because 500 fish fully saturate the volume and alignment radius 0.106 still couples the halves of the tank enough to force unification.

Two questions parked, not urgent:
- Would smaller alignment radius (say 0.04–0.06) give me multiple waves, or just fragment into noise?
- Will M2 posts naturally break the symmetry and produce two-lobe flow?

Either way, one large wave is genuinely beautiful on its own — this is a legitimate stopping point aesthetically.

## Updated parameter set

```
fishCount:          500
cruiseSpeed:        0.23
maxSpeed:           0.46
maxForce:           5.2      (still not touched — this is the retune target)
separationRadius:   0.12
separationWeight:   0.55
alignmentRadius:    0.106
alignmentWeight:    0.45
cohesionRadius:     0.30
cohesionWeight:     0.40
detectionLength:    0.23
avoidanceWeight:    1.0
angleStep:          18
maxPitch:           57
turnSpeed:          2.8
```

Key changes from before: `maxSpeed 0.20 → 0.46` (fish can actually reach cruise), `alignmentRadius 0.037 → 0.106` (alignment is now real), `alignmentWeight 2.25 → 0.45` (compensated for the working radius), `avoidanceWeight 2.5 → 1.0` (softer wall reactions).

`maxForce` still 5.2 — I want to see what happens when you drop it in the live retune, since your analysis says everything above becomes more responsive/audible once that clamp comes down.

## Go signal — session plan approved with two additions

Green-lit on your five-step plan (preset tool → perf wins → live retune → optional separation A/B → phone pass + bottle). Two extensions:

**1. Raise `fishCount` hardMax to 1000** — I've been at 500 the whole time but haven't stress-tested higher. If my phone tolerates 800, I want the room to explore "much denser school" as an aesthetic option. You said the extension is a two-constant change; please include it in the same session as the preset tool.

**2. Raise `detectionLength` hardMax significantly** — I want the room to *deliberately* recreate the accidental central-containment effect from your first (incorrect) diagnosis. Even though it was misdiagnosed, the described behavior ("everyone gently drawn to tank center, no wall-hugging") sounds like a real aesthetic worth being able to A/B against the current wall-avoidance behavior. If it makes sense to expose a proper `centeringWeight` alongside so it's an honest knob rather than "abuse detectionLength," even better — your call.

## Numbers I want to *find*, not be given

On the "cruise 0.18 / max 0.25" suggestion — that was one specific example, not a target. I'd rather find the actual right values live during the retune. When you drop maxForce, I expect all my other numbers to want adjusting too, and I want to feel my way to them rather than accept prescribed values. Consider your suggestions as "restore this *relationship*" not "hit these specific numbers."

## One workflow note

The preset tool needs to land first not just for phone tuning but because I want to **checkpoint the current one-wave configuration before we touch anything**. Even if we improve on it, "500-fish standing wave, unmodified maxForce" is a legitimate aesthetic I want preserved as an early preset so I can always come back to it.

Go. 🐟
