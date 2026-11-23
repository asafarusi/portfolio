# ASAF.EXE

> Serious. Slightly unhinged.

Source for **[asafarusi.co.il](https://asafarusi.co.il)**, a portfolio built as a video game. Every line is hand-written TypeScript and GLSL, with no template or page builder.

```
> init asaf.exe --mode=overdrive
> mounting /brain ................................ [ OK ]
> sanity check ................................... [FAIL]
> continuing anyway
```

## What's inside

| Stage | What happens |
|---|---|
| **00 · Start** | About 16k WebGL particles fly in to form the name. They scatter away from the cursor and explode as you scroll. A custom post pass adds RGB split, block glitch, scanlines and grain. |
| **01 · Character** | Poster letters fly in from chaos and lock into place with the scroll. Stat bars, lore, and an inventory where the ⚽ is a playable mini-game. |
| **02 · Skill tree** | A neural graph of the stack. Edges draw in as you scroll, signals run along them, and hovering a node lights up its neighbors. |
| **03 · Main quest** | Current role. The tickers skew with scroll velocity, plus a quest log. |
| **04 · Levels** | A pinned horizontal level select with 3D-tilt cards and scramble-text codenames. |
| **05 · Continue?** | A real 10-second countdown. Let it hit zero and see what happens. |

Hidden: `↑ ↑ ↓ ↓ ← → ← → B A`

## Stack

Vite · React 19 · TypeScript · three.js (raw shaders, no R3F) · GSAP + ScrollTrigger · Lenis

**Performance:**
- The WebGL chunk is lazy-loaded and pauses when off-screen or when the tab is hidden.
- Device pixel ratio is capped at 1.5.
- Mobile gets fewer particles.
- Animations only touch transform and opacity.
- `prefers-reduced-motion` gets a fully static version of the site.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

## Edit content

Content lives in data files, so you never need to touch a component:

- `src/data/profile.ts`: bio, lore, stats, quest log, boot lines
- `src/data/skills.ts`: skill-tree nodes and edges
- `src/data/levels.ts`: projects. Set `status: "unlocked"` and add `blurb`, `github` and `live` to reveal one.

---

© Asaf Arusi. The code is here to read and learn from. Please don't redeploy it as your own portfolio.
