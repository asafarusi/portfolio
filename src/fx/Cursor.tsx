import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FINE_POINTER, REDUCED } from "./env";
import { sound } from "./sound";

/** Crosshair dot, a lagging ring, and magnetic pull on elements with [data-magnetic]. Fine pointers only. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!FINE_POINTER) return;
    document.body.classList.add("has-cursor");
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.05 });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.05 });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.35, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.35, ease: "power3" });

    let magnet: HTMLElement | null = null;
    const move = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      if (magnet && !REDUCED) {
        const r = magnet.getBoundingClientRect();
        gsap.to(magnet, {
          x: (e.clientX - (r.left + r.width / 2)) * 0.3,
          y: (e.clientY - (r.top + r.height / 2)) * 0.3,
          duration: 0.4,
          ease: "power3",
        });
      }
    };
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("a, button, [data-magnetic], .node");
      ring.current?.classList.toggle("hot", !!t);
      const m = (e.target as HTMLElement).closest<HTMLElement>("[data-magnetic]");
      if (m !== magnet) {
        if (magnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
        magnet = m;
        if (m) sound.blip(1200, 0.02, "triangle", 0.025);
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    return () => {
      document.body.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, []);

  if (!FINE_POINTER) return null;
  return (
    <>
      <div className="cursor-ring" ref={ring} aria-hidden="true" />
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
    </>
  );
}
