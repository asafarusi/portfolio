import { useEffect, useRef } from "react";
import { REDUCED } from "./env";

const GLYPHS = "!<>-_\\/[]{}—=+*^?#ABCDEFX0123456789";

/** Writes text into el, resolving characters left to right from noise. */
export function scrambleTo(el: HTMLElement, text: string, duration = 600): () => void {
  if (REDUCED) {
    el.textContent = text;
    return () => {};
  }
  const start = performance.now();
  let raf = 0;
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    const solved = Math.floor(p * text.length);
    let out = text.slice(0, solved);
    for (let i = solved; i < text.length; i++) {
      out += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (p < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

/** Scrambles whenever `text` changes. If hover is set, it also scrambles on pointer enter. */
export function useScramble<T extends HTMLElement>(text: string, opts: { hover?: boolean; duration?: number } = {}) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancel = scrambleTo(el, text, opts.duration);
    const enter = () => {
      cancel();
      cancel = scrambleTo(el, text, opts.duration ?? 450);
    };
    if (opts.hover) el.addEventListener("pointerenter", enter);
    return () => {
      cancel();
      el.removeEventListener("pointerenter", enter);
      el.textContent = text;
    };
  }, [text, opts.hover, opts.duration]);
  return ref;
}
