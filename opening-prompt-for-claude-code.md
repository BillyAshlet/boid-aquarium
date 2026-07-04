# Opening Prompt for Claude Code — the boid 水族馆

---

Hi — I'm starting a summer project and would love your strategic input before we write a single line of code. I've done a fair amount of thinking already, and I want to share all of it with you first, then ask for your honest assessment of the approach.

Please read the following sources in order before responding:

---

## Source 1 — Notion: "the boid 水族馆"

The project lives in Notion. Please read all three sub-pages:

- **💡 Core Concept** — project philosophy, principles, constraints already decided
  https://www.notion.so/3838c971d8f481598bafe3e0cf013413

- **⚙️ Logic** — every system's parameters and logic descriptions
  https://www.notion.so/3918c971d8f481859141cd15ff26b9a5

- **the vision/md** — a longer written document about what I want this to feel like (attached as a .md file inside this page)
  https://www.notion.so/3928c971d8f480e69346cde1d24644e2

---

## Source 2 — Working Directory

All project files will live at:
```
~/Library/Mobile Documents/com~apple~CloudDocs/billyashlet/career/personal projects/practices/aquarium prompt/
```

If there are any existing files here already, please read them too.

---

## Quick Summary (in case Notion access is limited)

The project is a **mobile-first 3D aquarium physics game** combining:

1. **Boid flocking** (Craig Reynolds, 1986) — fish school as living background, driven by separation / alignment / cohesion / obstacle avoidance / orbit force
2. **Stable Fluids** (Jos Stam, 1999) — water simulation with wall bounce, vortex, and cone-spread jets
3. **6DOF ring physics** — rings with spring elasticity, responding to water flow and device gravity
4. **Water-pressure ring-toss mechanic** — recreating a childhood toy: tilt the phone (gravity = world down), press-and-hold to charge a water jet, release to fire, guide rings onto two posts

Core aesthetic: **simple rules, complex systems**. The complexity is emergent, not designed. The game has no score, no timer, no fail state — just physics the player builds intuition for through play.

**Visual style**: TDC typography aesthetic + Kota Iguchi (井口浩太) illustration sensibility. Cel-shaded, minimal UI, depth of field, subtle grain texture. Dark deep-water background.

**Tech stack in mind**: Three.js (vanilla JS, no framework, no build tool) + Stable Fluids implementation + custom boid system + custom rigid body for rings. Blender for 3D assets (fish, rings, posts, tank), exported as GLB.

**Platform**: Mobile primary (iOS DeviceMotion for gravity + tilt), desktop secondary (keyboard + mouse).

**Scope**: Summer project with real time. Not a weekend demo. Want to do it properly.

---

## What I'm Asking

After reading the above, I'd like your honest strategic input on:

1. **Module structure** — does the breakdown (Scene, Boid, Fluid, Ring Physics, Input/DeviceMotion, Game Logic, Debug Panel, Blender Assets) make sense? What would you restructure?

2. **Build order** — my instinct is: Scene → Boid → Fluid → Ring Physics → Game Logic → Assets → Mobile. Does this hold up? Where are the hidden dependencies I might not see?

3. **Technical risks** — where is this most likely to go wrong or get stuck? Stable Fluids integration? Ring-fluid coupling? DeviceMotion on iOS?

4. **Scope check** — given this is one person over a summer, is there anything here that's significantly harder than it looks, or anything I'm underestimating?

5. **Anything I haven't thought of** — gaps in the design, decisions I should make now before they become expensive to change later.

I'm not looking for a full implementation plan yet — just your honest read on the strategy before we commit to an approach.

---

*Primary language for this project: English with Chinese annotations where helpful. 主英文辅中文。*
