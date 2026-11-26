# asafarusi.co.il

Source for **[asafarusi.co.il](https://asafarusi.co.il)**, my portfolio. It's one page, deliberately quiet, and fast.

## Design

- **One typeface.** Inter Variable, with tight tracking on display sizes.
- **One canvas.** True black, `#f5f5f7` text, `#86868b` secondary, and a single blue for links.
- **Motion that stays out of the way.** Lenis smooth scroll, a slow fade and focus on first paint, a hero that eases back as you scroll, a statement that lights up word by word, and fade-up reveals. Everything animates transform and opacity only.
- `prefers-reduced-motion` gets a fully static page.

## Stack

Vite · React 19 · TypeScript · Lenis. No UI kit and no animation library: the motion is one rAF loop and an IntersectionObserver ([src/motion.ts](src/motion.ts)).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

## Edit content

All copy lives in [src/data/profile.ts](src/data/profile.ts). To publish a project, set its `status` to `"live"` and add `live` and/or `github` links.

---

© Asaf Arusi. The code is here to read and learn from. Please don't redeploy it as your own portfolio.
