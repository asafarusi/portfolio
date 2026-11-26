# asafarusi.co.il

Source for **[asafarusi.co.il](https://asafarusi.co.il)**, my portfolio. It's one page, deliberately quiet, and fast.

## Design

- **One typeface.** Inter Variable, with tight tracking on display sizes.
- **One canvas.** True black, `#f5f5f7` text, `#86868b` secondary, and a single blue for links.
- **Motion carries the personality, so the layout doesn't have to.**
  - The letters of the name flip up and come into focus.
  - Scrolling away zooms the name toward you as it dissolves.
  - The statement lights up word by word.
  - Headings rise out of masks, and hairlines draw themselves in.
  - Project cards tilt in 3D toward the cursor, with a spotlight and an edge that catches the light.
  - Buttons are magnetic, and a soft light trails the cursor.
  - Everything animates only transform, opacity and filter.
- `prefers-reduced-motion` gets a fully static page.

## Stack

Vite · React 19 · TypeScript · Lenis. No UI kit and no animation library: the motion is one rAF loop, an IntersectionObserver and CSS transitions ([src/motion.ts](src/motion.ts)).

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
