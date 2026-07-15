# Tuning Report + Separation Function Discussion

## 1. First real tuning pass — a set of numbers that feels reasonable

I've spent time on the phone with the fishCount cap raised (⊖'d up per your advice) and landed on a preliminary set that reads as "flock-like" to my eye. Sharing it in full rather than isolating separation, because parameters interact and you'll read the picture better than I can:

- `fishCount = 500`
- `separationRadius = 0.23`
- `separationWeight = 0.20`
- `alignmentRadius = 5.2`
- `alignmentWeight = 0.120`
- `cohesionRadius = 0.55`
- `cohesionWeight = 0.0368`
- `detectionLength = 2.25`
- `avoidanceWeight = 0.30`
- `angleStep = 0.40`
- `speedTarget = 0.20`
- `speedWeight = 2.5`
- `maxPitchAngle = 18`
- `turnSpeed = 80`
- (one param I may have missed the label of, value = 2.8)

**Aesthetic I seem to be converging toward:** loosely-distributed school with strong directional alignment across the whole tank (alignment radius > tank width is deliberate — I want the whole population reading as one intent), soft cohesion (they don't clump), firm personal space (separation active but not aggressive), and stable cruising speed. Less "sardine ball," more "open-water patrol." Curious whether that reads as coherent to you or if some of these numbers are compensating for others in ways I can't see.

Two things I'd like from you before I bottle this as `presets/m1-boids-baseline.json`:

1. **Sanity check the whole set** — anything obviously fighting itself? Any parameter that's doing nothing at its current value because another parameter dominates? Any that would benefit from being tuned differently *given* the others?
2. **Read back what you think the school looks like from these numbers** — a "predicted behavior" summary. If your prediction and my observation match, we've got a shared understanding of the model. If they diverge, one of us has a bug in their mental model of the system.

## 2. Separation force function — I want to discuss the math, not just the parameter

Here's the real question I want your input on. I've been tuning `separationWeight` and `separationRadius` under the assumption that the underlying function is fixed, but the function itself is a design decision I never made deliberately — it was inherited from your implementation, and I want to open it up.

**What I need from you first:** please explain exactly how separation is currently computed in `boids.js`. Specifically:

- What's the distance-to-force relationship? Is it linear falloff `(radius − d) / radius`? Inverse `1/d`? Inverse-square `1/d²`? Something else?
- Where does `separationWeight` enter — as a linear multiplier on the summed force, or somewhere else?
- Is the force capped, or does it scale unboundedly as fish approach zero distance?
- Is there any smoothing/normalization I should know about?

**Then, my design question.** From tuning I've noticed something that made me wonder if the function shape is the right one. When I raise `separationWeight`, the school feels *jittery* rather than *more spaced* — as if the force spikes when neighbors get close, rather than fish maintaining a comfortable minimum distance smoothly. This suggests to me the function might be too aggressive near zero and too weak near the radius edge — which is what an inverse-type function would produce, and what a linear function would *not*.

Candidate functions I'm considering, with my rough physical intuition for each:

- **Linear falloff `(r − d) / r`** — smooth throughout, weak near edge, moderate near center. Comfortable but might feel "loose."
- **Inverse `k / d`** — dramatic near zero, gentle at range. Enforces personal space strongly but risks jitter and numerical instability at very close distances.
- **Inverse-square `k / d²`** — Coulomb-like. Even more aggressive near zero. Probably too much for this aesthetic.
- **Inverse-log `log(r / d)`** — flat through the middle band, sharp rise only at very close approach. My intuition says this is closer to how real fish "notice personal space" — they don't care about neighbors until they're actually too close, then they respond decisively.

**Questions:**

1. Given how I'm tuning (loosely-distributed patrol school), which function shape do you think fits the aesthetic best? Or is the current shape actually right and I'm mis-diagnosing the jitter?
2. Are there any hidden costs to swapping the function? Numerical stability, tuning-parameter-scale changes, coupling with the One Euro filter's velocity smoothing?
3. Should this be a *panel choice* (a dropdown selecting the function, with parameters that re-scale) or a *code decision* (pick one, commit to it, delete the others)? My instinct says panel — different functions produce different aesthetics and I'd like to A/B feel them. But adding a function selector to every force in the flock is a slippery slope.
4. If we do swap, are alignment and cohesion in the same position? They also compute forces from distance-to-neighbor, and the same question of shape applies.

I'm not attached to the answer. I want the honest read: "your intuition is right, we should try inverse-log," or "no, the current shape is fine and jitter is coming from somewhere else — probably `X`."

**Don't build anything yet.** I want to understand the current implementation, hear your analysis, and decide together whether this is a real design lever or premature optimization of aesthetics.
