import Lenis from "lenis";

export const REDUCED =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const NAV_OFFSET = -48;
let lenis: Lenis | null = null;

type Sub = () => void;
const subs = new Set<Sub>();

/** Smooth scroll plus one rAF loop that drives every scroll-linked effect. */
export function startMotion() {
  if (!REDUCED && !lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.2 });
  }
  let raf = 0;
  const tick = (t: number) => {
    lenis?.raf(t);
    subs.forEach((fn) => fn());
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    lenis?.destroy();
    lenis = null;
  };
}

/** Run `fn` every frame. Keep it cheap: read one rect, write transforms or opacity. */
export function onFrame(fn: Sub) {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

export function scrollTo(selector: string) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: NAV_OFFSET, duration: 1.4 });
  else el.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
}

/** Adds `.in` to every `.reveal` once it enters the viewport. */
export function observeReveals(root: ParentNode = document) {
  const els = root.querySelectorAll<HTMLElement>(".reveal");
  if (REDUCED || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("in"));
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.01 }
  );
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
