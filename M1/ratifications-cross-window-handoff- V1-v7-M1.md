# Ratifications — architecture discussion (cross-window handoff)

## Housekeeping first

I did the architecture discussion in a different Claude Code window earlier — the project memory + CLAUDE.md + MILESTONES.md carried context cleanly, so nothing was lost, but you didn't see it happen. Bringing you up to speed in one paragraph:

The tag/bundle preservation plan I approved last time — I pushed back on it. The friction of `git checkout` for every "I want to play M1" session was too high. I proposed instead: **M1 pure-flock stays a permanent MODE inside the living game**, where preset JSON captures not just parameters but also which systems are active and how they look. You (in the other window) responded with a strong architectural read: the idea passes the "no new manager layer needed" test because `world.systems` and the FluidField interface already provide the seams; the key reframe was **"a mode is not a thing that runs — it's a list of what gets built"**; hidden costs (combinatorial certification, drift of meaning, discipline tax, UI-as-trap) were identified with mitigations; versioning strategy landed on graceful degradation + additive-only schema discipline. Full response was recorded and pushed. What you're seeing now is my ratification of the pending items from that discussion.

If you want the full architectural response before ratifying anything on your end, it's in the repo's commit history from earlier today. Otherwise, ratifications follow.

---

## Ratifications

Ratified — all three of the pending items. The "modes are lists of what gets built, not runtime things that run" reframe is the sentence that made this click, and the four hidden costs are all worth paying with the mitigations named.

A few things I want confirmed in the recording:

1. **The named-modes rule is a hard boundary.** Two or three modes total, curated. Free-form system toggling stays in the debug panel where it belongs (for exploration, not production). Please word this strictly in CLAUDE.md — a future session that thinks "sure, one more mode won't hurt" is exactly what this rule exists to prevent.

2. **The intent-vs-appearance split is now an explicit principle.** Modes preserve *what M1 is for* through engine evolution; tags preserve *what M1 was* frozen in time. Both have legitimate roles. Future-me opening meditation mode getting "a different meditation" is a feature, not a bug — it means the engine is alive and the intent still applies.

3. **The additive-only key rule is a hard workflow discipline.** Worth flagging prominently in CLAUDE.md because this is the kind of thing a future session will violate innocently if it's not written down. Renaming a key feels harmless in the moment; it breaks every archived preset silently.

On the UI point (`"ui": "minimal"` as a trap): agreed, dropped from the schema. UI presentation is its own axis, we'll design it properly when we know what modes want to look like — not smuggle it in as a boolean.

---

## What happens next

M1 tuning continues on my end. When I have `m1-crowded-1000` and `m1-standing-wave-v2` bottled, I'll paste the JSONs and you can commit them.

The tank divergence session is still the next build session whenever I'm ready — but I want to do a bit more exploration with the current tank first. "One wave in a small tank" is genuinely worth understanding thoroughly before I change the geometry underneath it. The Möbius/multi-gyre experiment via bigger tank is exciting, but not urgent, and I don't want to lose access to the current aesthetic while I'm still learning it.

Please just do the recording pass (CLAUDE.md updates for the three ratified items) and confirm what changed. No code yet.
