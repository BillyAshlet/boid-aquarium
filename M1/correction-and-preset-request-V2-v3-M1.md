# Correction — parameter order was wrong

I misread the panel order when I listed the parameters. Your entire diagnosis (detectionLength 2.25 as accidental centering, turnSpeed 80 disabling the limiter, the 27M-ray-tests perf bomb) was based on my mis-mapping — **please discard that read**. The actual values, in the code's actual order:

```
fishCount:          500
cruiseSpeed:        0.23
maxSpeed:           0.20
maxForce:           5.2
separationRadius:   0.120
separationWeight:   0.55
alignmentRadius:    0.0368
alignmentWeight:    2.25
cohesionRadius:     0.30
cohesionWeight:     0.40
detectionLength:    0.20
avoidanceWeight:    2.5
angleStep:          18
maxPitch:           57
turnSpeed:          2.8
```

Please re-audit with these actual values. A couple of things I've noticed on my own that seem off:

- **`maxSpeed 0.20 < cruiseSpeed 0.23`** — fish can never actually reach the cruise target because the speed cap is lower. Is this doing what I think it's doing (constant "trying to accelerate but hitting a wall") and does it explain a component of the perceived jitter?
- **`alignmentRadius 0.0368`** — less than 4 cm — means almost no neighbor falls into the alignment perception at all, so the rule is effectively off despite `alignmentWeight 2.25` being high. So the school is behaving without meaningful alignment. Is that right, and if so, is what I'm reading as "coherent motion" coming from separation+cohesion+centering alone?
- **`detectionLength 0.20`** — much smaller than the tank now. Am I actually getting reasonable wall avoidance, or is 0.2 too short for fish to react to walls in time given `avoidanceWeight 2.5`?

Redo the same audit style — sanity check the whole set, tell me what's dead weight, tell me what's compensating for what, and give me your revised predicted behavior. My original observation stands regardless: the school reads as loosely-distributed, tank-filling, patrol-style, with a noticeable jitter component.

Once we're re-aligned on what the numbers actually do, I still want to have the separation function conversation from my previous message — but the diagnosis of *what's causing the jitter* needs redoing against the real parameters first, since your previous "turnSpeed off" verdict was based on a value of 80 that turns out to be 2.8.

## Separate request — preset import/export for mobile tuning

I ran into a real ergonomic problem tuning on the phone: sliders on a small screen are much harder to use precisely than on desktop, and holding the phone one-handed while poking at 15 params is genuinely miserable. But **desktop can't judge feel** for a tilt-based game — the tank has no gravity to react to, so I can't tune the tilt-coupled behaviors there.

I want a workflow that solves both:

1. **Tune on desktop** where sliders are precise (mouse) and I can rapidly A/B numbers
2. **Export current params as a copy-to-clipboard string** — some compact format, ideally something that survives being pasted into messages or notes
3. **Paste that string into a field on mobile**, hit "apply," and the phone instantly runs the same numbers so I can feel them in real conditions
4. **Save multiple presets locally in the browser** (localStorage or equivalent) so I can keep a stable of "sardine-ball," "patrol," "aggressive," etc., and swap between them for A/B feel testing

This isn't a milestone artifact — this is the tool that makes the whole tuning workflow humane for a mobile-first game. Two questions:

- Is this small enough to build in the same session as the audit fixes, or does it deserve its own?
- Should the string format be JSON (readable, larger) or a compressed encoding (compact, opaque)? My preference: JSON for legibility, but I'd take opaque if it fits in a single text message and JSON doesn't.

If we build this, the `presets/` folder becomes the archive of *committed* presets (the aesthetic decisions we've locked in), while the browser localStorage becomes the *scratchpad* for tuning-in-progress. Both live, both useful.
