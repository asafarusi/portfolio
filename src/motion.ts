import Lenis from "lenis";

const mq = (q: string) => typeof window !== "undefined" && window.matchMedia(q).matches;
export const REDUCED = mq("(prefers-reduced-motion: reduce)");
export const FINE = mq("(hover: hover) and (pointer: fine)");

const NAV_OFFSET = -48;
let lenis: Lenis | null = null;

type Sub = () => void;
const subs = new Set<Sub>();

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const expoOut = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Pointer in px plus a smoothed copy; nx/ny are the smoothed position in -1..1 from the viewport center. */
export const pointer = { x: -1, y: -1, sx: -1, sy: -1, nx: 0, ny: 0, active: false };

/** Smooth scroll plus one rAF loop that drives every scroll- and pointer-linked effect. */
export function startMotion() {
  if (!REDUCED && !lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.2 });
  }
  const onMove = (e: PointerEvent) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    if (!pointer.active) {
      pointer.sx = e.clientX;
      pointer.sy = e.clientY;
      pointer.active = true;
    }
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  const stopParallax = parallax();
  const stopMagnets = magnets();

  let raf = 0;
  const tick = (t: number) => {
    lenis?.raf(t);
    if (pointer.active) {
      pointer.sx = lerp(pointer.sx, pointer.x, 0.08);
      pointer.sy = lerp(pointer.sy, pointer.y, 0.08);
      pointer.nx = (pointer.sx / innerWidth) * 2 - 1;
      pointer.ny = (pointer.sy / innerHeight) * 2 - 1;
    }
    subs.forEach((fn) => fn());
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onMove);
    stopParallax();
    stopMagnets();
    lenis?.destroy();
    lenis = null;
  };
}

/** Run `fn` every frame. Keep it cheap: read a rect or two, write transforms, opacity or CSS vars. */
export function onFrame(fn: Sub) {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

export function scrollTo(selector: string) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: NAV_OFFSET, duration: 1.6, easing: expoOut });
  else el.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
}

/** Adds `.in` to reveal targets once they enter the viewport. */
export function observeReveals(root: ParentNode = document) {
  const els = root.querySelectorAll<HTMLElement>(".reveal, .split, .draw");
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
    { rootMargin: "0px 0px -10% 0px", threshold: 0.01 }
  );
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

/**
 * `data-speed` elements drift against the scroll: positive values lag behind it, which reads as depth.
 * Their resting positions are measured with transforms cleared, so the effect never feeds back into itself.
 */
function parallax() {
  if (REDUCED) return () => {};
  let items: { el: HTMLElement; mid: number; speed: number }[] = [];
  const measure = () => {
    items = [...document.querySelectorAll<HTMLElement>("[data-speed]")].map((el) => {
      el.style.translate = "";
      const r = el.getBoundingClientRect();
      return { el, mid: r.top + scrollY + r.height / 2, speed: parseFloat(el.dataset.speed || "0") };
    });
  };
  measure();
  const ro = new ResizeObserver(measure);
  ro.observe(document.body);
  document.fonts?.ready.then(measure);
  const off = onFrame(() => {
    const center = scrollY + innerHeight / 2;
    for (const it of items) {
      const d = it.mid - center;
      if (Math.abs(d) > innerHeight * 1.5) continue;
      it.el.style.translate = `0 ${(d * it.speed).toFixed(2)}px`;
    }
  });
  return () => {
    ro.disconnect();
    off();
  };
}

/** `data-magnetic` elements lean toward a nearby cursor and spring back when it leaves. */
function magnets() {
  if (REDUCED || !FINE) return () => {};
  const state = new Map<HTMLElement, { x: number; y: number }>();
  return onFrame(() => {
    document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
      const s = state.get(el) ?? { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      const cx = r.left - s.x + r.width / 2;
      const cy = r.top - s.y + r.height / 2;
      const dx = pointer.x - cx;
      const dy = pointer.y - cy;
      const reach = 36;
      const near = Math.abs(dx) < r.width / 2 + reach && Math.abs(dy) < r.height / 2 + reach;
      s.x = lerp(s.x, near ? dx * 0.28 : 0, 0.16);
      s.y = lerp(s.y, near ? dy * 0.38 : 0, 0.16);
      if (Math.abs(s.x) < 0.01 && Math.abs(s.y) < 0.01 && !near) {
        if (el.style.translate) el.style.translate = "";
      } else {
        el.style.translate = `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px`;
      }
      state.set(el, s);
    });
  });
}
