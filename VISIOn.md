# the boid 水族馆 — Vision Document
*Written for myself, not for anyone else.*

---

## Where This Came From

Two things collided.

The first is a toy I played with as a kid — a handheld water-pressure ring-toss game (水压套圈游戏机). Two buttons, left and right. Press one and water jets out, pushing floating rings toward a set of posts. The goal is to land the rings onto the posts. But the actual experience is something else entirely: you're learning. The water bounces off the walls. The rings drift with inertia. If you tilt the device, gravity pulls them sideways. After enough play, your hands start to know things your head doesn't — the angle of a bounce, how long to hold the button, how much tilt to apply before releasing. This is physical intuition being built in real time.

The second is Craig Reynolds' Boid algorithm (1986). Three rules — separation, alignment, cohesion — applied to a group of independent agents. No choreography, no central control. Just local rules, and from them: a school of fish that moves like it's alive. The complexity is emergent. It comes from the interaction, not from the design.

These two things share a DNA: **simple rules, complex systems**. A small number of laws, operating on many units, producing behavior that feels rich and alive and surprising. This is the aesthetic I keep coming back to — in optics, in information theory, in everything I find beautiful about how systems work. This project is me building something that lives in that space.

---

## What I Want It to Feel Like

I want someone to pick up their phone, tilt it, press a side of the screen, and immediately understand what to do — not because they read instructions, but because their body already knows how water and gravity work.

I want the water to feel *real enough*. Not physically accurate — real enough. The jet should spread. It should bounce off the walls and come back. Two jets crossing should create turbulence. A ring caught in the middle of all that should wobble, tilt, drift somewhere unexpected, and make you recalibrate.

I want the fish to feel alive. Not animated — alive. They should react to the water flow, scatter when a jet passes through, regroup after it dissipates. They're not decoration. They're evidence that the world has physics.

I want the rings to have personality. A little elastic. When water hits them they should deform slightly and spring back. When they finally drop onto a post, there should be a small, satisfying settle — like the real toy.

I want the feeling of getting better at it. The first few tries feel chaotic. Then you start to feel the timing. Then the angles. Then you're placing rings with intention. That arc — from chaos to intuition — is the whole game.

---

## Core Aesthetic

**Visual reference: TDC typography + Kota Iguchi (井口浩太)**

Not a game aesthetic. A design aesthetic. The scene should feel like it could be a page in a design annual — restrained, intentional, beautiful in a way that doesn't announce itself.

- Deep water color, not black. Something like a dark ink-blue or deep ocean teal. (Working value: `#0c54a6` as accent, background TBD — probably something like `#071e3d` or `#081828`)
- Fish and rings: cel-shaded or flat-shaded, with optional hand-drawn outlines. The rendering should feel slightly graphic, like an illustration rather than a simulation.
- Subtle paper/grain texture overlay. Enough to give warmth, not enough to distract.
- Depth of field. Things in the background go soft. Creates the sense of looking through glass into water.
- Minimal UI. No score, no timer, no tutorial text. Just the scene and a toggleable debug panel for tuning parameters.
- Typography (if any): Space Mono. Geometric, monospace, calm.

The water itself shouldn't look like water in a AAA game. It should look like the *idea* of water — implied through light, movement, and the behavior of things inside it.

---

## Systems Overview (Intent, Not Implementation)

### Fish (Boid Flock)
The fish are the life of the scene. They exist because they make the world feel inhabited, and because they respond to water flow — which gives the player visual feedback about what the fluid is doing.

They follow three rules (separation, alignment, cohesion) and avoid obstacles via forward ray-casting. When water flows through them, they scatter and regroup. When enough rings have been placed, they begin to orbit the posts — a slow, ceremonial circling that marks the end of the game approaching.

They are not fully free in 3D. Roll is locked. Fish don't flip sideways. They turn and pitch but always swim right-side up.

### Gravity (Device Tilt)
The phone's physical orientation defines the direction of gravity in the world. This is not a camera tilt — the world itself tilts. When you rotate the device, the gravity vector rotates with it, and everything inside the tank responds: rings drift toward the low side, fish adjust their swim planes, water flow interacts with a world that is no longer "flat."

This is the direct digital equivalent of picking up the toy and rotating it in your hands. The ring-toss game was always a two-handed coordination problem — one hand managing the buttons, the other managing the tilt. That's what we're recreating. Tilt is not an optional feature. It is half the game.

On desktop, gravity is fixed downward. The game is still playable, but it's a simplified version. Mobile is the full experience.

### Water Pressure / Charge Mechanic
Press and hold to charge. Release to fire.

While held, jet force accumulates from zero up to `flow_max_force`. The charge curve is not linear — it builds quickly at first, then slows as it approaches the ceiling. This gives you fine control at low pressures (a gentle nudge) and makes maximum force feel earned.

When released, the jet fires at whatever force level was reached, then decays at `flow_decay_rate`. The water doesn't stop instantly — it dissipates, which means a well-timed tap can send a small pulse, while a long hold sends a sustained push that lingers in the fluid field.

This maps directly to squeezing the physical button on the toy. The button had resistance. More squeeze = more water. The timing and pressure were the skill. Here, time replaces physical force — but the feel should be the same.

### Water (Stable Fluids)
The fluid is the central mechanism. When you press, water jets out from the side of the tank, fans out, bounces off walls, creates eddies. The rings and fish sit inside this field and are carried by it.

The simulation doesn't need to be physically perfect. It needs to be *behaviorally convincing* — bounces feel right, turbulence feels right, holding longer gives more force. The wall bounce is the most important thing. That's what makes it feel like the toy.

Charge mechanic: press and hold to build force, release to fire. Longer hold = stronger jet. This exactly replicates squeezing the physical button.

### Rings (6DOF Rigid Bodies)
Each ring is a full 6-degree-of-freedom rigid body. It translates and rotates freely. Water applies both force and torque — a jet hitting an angled ring will spin it, not just push it. Gravity (from the phone's tilt) pulls it in whatever direction the device is oriented.

The rings have a little elasticity. They're modeled as a chain of spring-connected nodes. When hit hard, they deform slightly. They spring back. This is subtle — just enough to feel physical.

Success: when a ring's orientation aligns with a post's axis and its center is close enough, it snaps onto the post with a small settle animation. No score pops up. The ring is just there now.

### Progression
No levels. No score. No fail state.

At some point — roughly a third or half of rings placed — the fish begin orbiting the posts. This is the only marker of progress. The world changes. The game isn't over, but something has shifted.

When all rings are placed, the scene enters a quiet celebration: fish orbiting, water drifting gently. You've done it. The game doesn't tell you. You just feel it.

---

## What This Project Is (And Isn't)

This is a summer project. I have time. I'm not rushing toward a deliverable or a portfolio piece. I'm building something I genuinely want to exist — something I would want to play.

The childhood toy this is based on is one of those objects that stayed with me because it was purely about feel. No story, no progression system, no social features. Just: here is a small physical world, go understand it. I want to make a digital version of that feeling.

If I finish it, great. If I stop at M3 and the rings are just floating and spinning in water and I find that mesmerizing, that's also fine. Every milestone is a complete thing.

The one rule: if it starts to feel like work — like I'm grinding toward something I have to finish — I stop and ask why. That's the signal that I've confused this with something it isn't.

---

## Constraints & Decisions

**Two posts only.** The tank has exactly two ring-toss posts. Not three, not five. Two. This keeps the spatial problem simple and legible — you always know where you're aiming. The challenge comes from the physics, not from navigating a complex layout.

**Gravity follows full 3-axis rotation (and possibly translation).** The phone's gravity vector should map to all three rotational degrees of freedom — not just tilt left/right and forward/back, but also rotation around the vertical axis. In practice this means the world's "down" can point in any direction as the player rotates the device freely in 3D space.

If feasible: also read the 3 translational acceleration axes from the accelerometer (via `DeviceMotionEvent.acceleration`), so that physically shaking or jolting the phone creates impulse forces in the tank — like physically shaking the toy. This would be a layer on top of gravity, not a replacement.

**Depth axis (Z / in-out): undecided.** Whether the gravity vector and ring physics should respond to the depth axis (pushing the phone toward/away from you) is still open. It adds richness but may make control feel unmanageable on a flat phone screen. Decide after feeling the 3-rotation version first.

---

## Open Questions (Things I Haven't Decided Yet)

- **Background color**: `#071e3d`? `#081828`? Something warmer? Decide after seeing it lit in Blender.
- **Fish model**: How low-poly? Silhouette only, or some interior detail?
- **Number of posts**: 3? 5? How many rings per post?
- **Camera**: Fixed angle, or free orbit? Or somewhere in between — a soft camera that follows the action but has a home position?
- **Sound**: Completely silent, or minimal ambient water sound? No UI sounds either way.
- **The tank walls**: Visible glass, or invisible boundaries? Visible might help the player understand bounces.
