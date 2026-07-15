# Pushback on M1 preservation + architecture discussion request

## Pushback: the tag/bundle plan isn't right for what I want

Two problems with the plan we recorded:

**Tag = context switch cost.** Checking out an old commit changes my working tree, which means every time I want to play M1 I have to `git stash` current work, checkout, play, come back, restore. That's not "look, don't touch" — that's "make a whole moving job out of looking." Friction I won't pay repeatedly.

**Static bundle = frozen art.** A `vite build` archive can't benefit from any later engine improvements — perf wins, bug fixes, new rendering options — none of them reach the preserved M1. The bundle is dead the moment it's made.

## What I actually want — and I think this is a bigger idea

**M1 pure-flock stays a permanent MODE inside the living game**, not an archived past state. The code keeps evolving; the *experience* of "just fish, nothing else" is always available.

Concretely, the preset system's schema extends:

```json
{
  "boid": { ... boid params ... },
  "mode": "pure-flock" | "full-game" | ...future modes...,
  "visualTheme": "default" | "monochrome" | ...,
  "systemsEnabled": {
    "rings": false,
    "fluid": false,
    "ui": "minimal"
  }
}
```

Load this preset → the game runs in that mode. Different systems on/off, different visual theme, but always the current codebase (and current bug fixes and current perf).

**The core insight:** preset JSON is *intent capture*. It doesn't just fix parameters — it selects which systems participate and how they look. The engine stays one thing; the runtime configuration is what defines "M1 meditation mode" vs "M5 full game" vs any future mode I decide to define.

Tag `m1-standing-wave` can stay as a "just in case" safety net. But it's not the primary preservation strategy anymore.

## The bigger architecture question I want your take on

This preset-becomes-mode idea, if I'm reading it right, isn't just a preservation strategy — it's a **design philosophy** with implications for how M2 through M5 should be built. I want your architectural read before we commit.

**Things I think this implies:**

1. **Every new system should be born with an on/off switch.** When M2 adds rings, `rings.enabled` should exist from the first commit — not retrofitted later. When M3 adds fluid, same. When M5 adds cel-shading, the shading should be a theme-selectable option, not a permanent replacement. Cost of doing this from day one: tiny. Cost of retrofitting: real.

2. **The `game.js` (progression) module might need a rethink.** It's currently spec'd as "progression state (rings placed, orbit trigger, celebration)." Under the mode model, `game.js` might really be **"active mode runner"** — where "full game with progression" is one mode, and "pure-flock meditation" is another, and both are equally first-class. Progression isn't the *default*; it's *one option*.

3. **Visual themes as an orthogonal axis.** Monochrome M1 mode isn't just "no rings + gray fish" — it's a whole visual identity (color palette, lighting, post-processing choices) that could apply to *any* mode, in principle. This suggests visual style should be a system separate from what's rendered, applied at render time. Which sounds like standard graphics engine architecture, but I want to know if it's the right call for us or overkill.

4. **Preset validity across engine changes.** A preset saved today needs to still load meaningfully in 3 months when the engine has changed. What's the versioning strategy? Do we accept "old presets might not load," or design for forward compatibility from the start? Formats I know of: schema versioning (`"version": 3` and migration functions), or graceful degradation (unknown fields ignored, missing fields default). Your call.

**Questions:**

- **Is this whole framing an actual architectural improvement, or am I overcomplicating things?** Push back if you see this as premature — I'd rather build simple things now and refactor at M5 than build a mode system that carries dead weight through M2 and M3.
- **If it's the right direction, what does implementing it look like NOW vs. incrementally?** My guess: NOW is just "make sure rings.js and fluid.js are born with on/off flags, don't build the mode selector UI yet." But you know the codebase.
- **What are the hidden costs I'm not seeing?** Every architectural choice has consequences that don't show up until later. What would this one cost me?
- **Does this change the M1 close criteria?** Do I need mode infrastructure in place before M1 can be considered "done," or can M1 close first and mode infrastructure land as a separate M2-prep pass?

Don't build anything yet. I want to understand the shape of the decision before committing. And if the answer is "your original tag approach is actually fine, you're overthinking preservation," tell me that — I want the honest read.

## Practical bits, unchanged from before

- Please still do the tank divergence next session (mobile keeps small, desktop starts ~2×1.2×0.8, panel controls tank size live)
- Please still `git push` and `git push --tags` — everything should be off my Mac
- Please still commit whatever presets I feed you (`m1-crowded-1000`, `m1-standing-wave-v2` etc.) to `presets/` as I generate them

These aren't blocked by the architecture discussion. The mode question is about longer-term direction.
