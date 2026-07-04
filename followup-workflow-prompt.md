# Follow-up: Workflow Design for This Project

Your assessment was exactly what I needed — I'm accepting most of it, especially:
- Phone pipeline in week 1
- Fake FluidField interface first, real solver behind it later
- Visual-only ring wobble instead of spring-node physics
- Fixed camera, world tilts

Before we start building, I want to be transparent about how I work, and ask for your honest recommendation on workflow.

---

## My background

I have no formal CS or programming background. Almost everything I've built so far has been through **vibe coding** — working iteratively with AI assistants, describing what I want, reading the output, testing it, and steering from there. I've shipped real things this way (a personal website with physics demos, a visual novel game at a hackathon), but I don't have deep fluency in reading and writing code independently.

This project is significantly more technically complex than anything I've done before — multiple interacting physics systems, mobile device APIs, performance constraints. I want to do it properly, not just get something that looks like it works.

So my question is: **given this context, how would you design the workflow for this project if you were me?**

---

## Specific things I want to understand

**1. Solo vs. multi-agent**
Would you recommend I work with a single Claude Code session and build incrementally? Or does a project of this complexity benefit from multiple specialized agents working in parallel — one on boids, one on fluid, one on ring physics — and then integrating? What are the real tradeoffs?

**2. How to structure each session**
When I sit down to work on this, what does a good session look like? Do I give you one system at a time? Do I always start by re-reading the context files? How do I avoid the common failure mode of "AI wrote a lot of code that doesn't connect to anything"?

**3. How to stay in control without deep code literacy**
I can read code well enough to understand intent, but I can't always catch subtle bugs or architectural mistakes. What habits or checkpoints should I build into my workflow so I can catch problems early — before they're expensive to fix?

**4. Testing and validation**
Each system (boids, fluid, rings) needs to *feel* right before I integrate it. What's your recommended approach to testing feel-driven systems when you can't easily write unit tests for "does this feel like water"?

**5. When to ask for help vs. push through**
Vibe coding can go wrong in two directions: asking for too much at once (getting a pile of code I don't understand), or asking for too little (spending a week on something that should take an hour). Where are the natural "ask for a bigger chunk" vs. "do this one small thing" decision points in this project?

---

## What I'm NOT asking for

I'm not asking you to start writing code yet. I want your honest opinion on **how to run this project** given who I am and what I'm building. If your recommendation is "this workflow won't work for you, here's a better one" — I want to hear that.

Think of this as: if you were a senior developer mentoring a self-taught creative coder on their most ambitious project yet, what would you tell them before they write the first line?
