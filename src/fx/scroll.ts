import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { REDUCED } from "./env";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function startSmoothScroll() {
  if (REDUCED || lenis) return;
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, touchMultiplier: 1.4 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function lockScroll(locked: boolean) {
  document.documentElement.classList.toggle("locked", locked);
  if (locked) lenis?.stop();
  else lenis?.start();
}

export function scrollToEl(el: HTMLElement | string, immediate = false) {
  const target = typeof el === "string" ? document.querySelector<HTMLElement>(el) : el;
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { immediate, force: true });
  else target.scrollIntoView({ behavior: immediate || REDUCED ? "auto" : "smooth" });
}

/** Warp: glitch bars cover the screen, jump, then uncover. */
export function warpTo(selector: string) {
  const bars = gsap.utils.toArray<HTMLElement>(".warp i");
  if (REDUCED || !bars.length) return scrollToEl(selector);
  const tl = gsap.timeline();
  tl.set(".warp", { autoAlpha: 1 })
    .fromTo(bars, { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.32, ease: "power3.in", stagger: 0.03 })
    .add(() => {
      scrollToEl(selector, true);
      ScrollTrigger.refresh();
    })
    .to(bars, { scaleY: 0, transformOrigin: "50% 0%", duration: 0.4, ease: "power3.out", stagger: 0.03 }, "+=0.06")
    .set(".warp", { autoAlpha: 0 });
}
