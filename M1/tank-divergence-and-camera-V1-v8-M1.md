# Tank divergence session — go, plus a camera discussion

## Go on the tank divergence

Ready. Don't need me to hand you specific dimensions — you already have the starting proposal (~2.0 × 1.2 × 0.8m desktop, current 1.2 × 0.8 × 0.5m mobile) and a plan for live-tunable dimensions on the panel, both of which sound right. Trust your defaults; I'll adjust from the panel.

## One design question I want your judgment on before you build

When we go from small tank to big tank, what actually scales? Three possibilities I can see:

**A) Only the tank scales.** Fish size, perception radii, all params unchanged. 500 fish in 2× volume means the school becomes *sparser* — which is exactly the condition that might let multiple gyres form, matching my Möbius/multi-gyre target.

**B) Everything scales proportionally.** Tank, fish, all radii scale together. Visually indistinguishable from small tank at same params — just "roomier." No multi-gyre effect.

**C) Something in between — or something you'd propose I haven't thought of.**

My gut says A (because it directly serves the multi-gyre experiment), but you know the code and the coupling. Which serves the design intent best? Pick whichever you think is right and tell me why.

## Camera navigation — related, and I want your read on scope

Here's the thing: a bigger tank is only useful if I can *look at it properly*. Right now the camera is fixed with auto-framing. Small tank + fixed camera = works fine. Bigger tank + fixed camera = I can't circle around and see whether multiple gyres actually form on the far side, or observe the flow from different angles. **Navigation feels like a required companion to the tank change, not a separate feature.**

Three levels I can think of:

**1. Orbit/pan/zoom camera controls (desktop only).** Basic 3D-viewer navigation:
- G + mouse = pan
- R + mouse = rotate
- S + mouse (or scroll) = zoom / dolly
- Double space = return to default
- Numpad 1/3/7 = front/side/top orthographic
- 5 = toggle orthographic/perspective
- 0 or I = enter/exit alternate views

These key bindings are Blender's conventions, roughly, because that's what I've been using. If they conflict with standard web/3D conventions you'd prefer, tell me — I care more about "feels right" than "matches Blender."

**2. First-person fish-cam.** Camera attached to a specific boid, view from its position, orientation following its heading. Already parked in M6 as "surprisingly cheap." Genuinely useful for feeling what "emergent from simple rules" means — you inhabit the algorithm.

**3. Camera-follows-arbitrary-target.** Generalize (2): the camera can attach to any object — a fish, later a ring, later a post, later even a coordinate frame. A general camera-target system.

## Two things I want your judgment on for the camera stack

**Compatibility with the "Fixed camera, world tilts" locked decision.** That rule is currently on the books. I read it as being about *the mobile game* — where camera-relative-to-device is the whole point of tilt gravity. Does adding orbit navigation on **desktop only** violate that rule, or is it clearly outside its scope? If it violates, we discuss. If not, please note explicitly in CLAUDE.md that "fixed camera" is a mobile game rule, not a project-wide rule.

**Scope for right now:**
- **(1) orbit/pan/zoom** — is this a "required companion to the bigger tank" (bundle in same session) or "separate, do after"? My gut says bundle, because the tank change is genuinely hard to evaluate without it.
- **(2) first-person fish-cam** — I want this recorded as a want, but I don't want to build it now. Confirm it stays parked at M6 unless you see a reason it should come earlier.
- **(3) arbitrary-target camera system** — please push back if this is premature generalization. You've done that once already (attractor framework) and I think the same principle applies here: no second customer exists yet (rings come in M2, decorative objects maybe M6). I'm not asking for this to be built. I'm asking you to note it as a possibility so a future session doesn't hardcode fish-cam in a way that blocks the general version cheaply.

## What I need back

Not code yet — judgments first:

- Which scaling model (A/B/C) do you recommend and why?
- Does (1) get bundled with the tank session, or split?
- Any friction with the fixed-camera locked decision that we need to resolve first?
- Are my proposed key bindings sensible, or do you have a better convention?

Then build. If (1) bundles in, we get bigger-tank + navigation in one shot and I can go straight to the multi-gyre experiment. If it splits, we do bigger-tank first, then navigation as a follow-up. Your call.
