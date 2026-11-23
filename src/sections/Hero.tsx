import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile } from "../data/profile";
import { bus, hasWebGL, MOBILE, REDUCED } from "../fx/env";
import type { HeroGL } from "../scenes/heroGL";

function Bar({ filled, total = 12, mp }: { filled: number; total?: number; mp?: boolean }) {
  return (
    <div className={`hp-bar${mp ? " mp" : ""}`}>
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={i < filled ? "" : "empty"} />
      ))}
    </div>
  );
}

export default function Hero({ started }: { started: boolean }) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const gl = useRef<HeroGL | null>(null);
  const [useGL] = useState(() => !REDUCED && hasWebGL());

  // The WebGL scene is lazy-loaded so it stays out of the critical path
  useEffect(() => {
    if (!useGL || !canvas.current) return;
    let cancelled = false;
    import("../scenes/heroGL").then(async ({ createHeroGL }) => {
      if (cancelled || !canvas.current) return;
      gl.current = await createHeroGL(canvas.current, { mobile: MOBILE, lines: [profile.first, profile.last] });
      if (cancelled) {
        gl.current.dispose();
        gl.current = null;
        return;
      }
      if (startedRef.current) gl.current.assemble();
    });
    const offChaos = bus.on<boolean>("chaos", (on) => gl.current?.setChaos(on));
    return () => {
      cancelled = true;
      offChaos();
      gl.current?.dispose();
      gl.current = null;
    };
  }, [useGL]);

  const startedRef = useRef(started);
  useEffect(() => {
    startedRef.current = started;
    if (started) gl.current?.assemble();
  }, [started]);

  // Intro choreography plus the scroll-driven explosion
  useLayoutEffect(() => {
    if (!started) return;
    const ctx = gsap.context(() => {
      if (!REDUCED) {
        gsap.from(".hero-tag em", { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.09, delay: 0.9 });
        gsap.from(".hero-top > *, .scroll-cue, .hero-meta", { autoAlpha: 0, y: -12, duration: 0.6, stagger: 0.08, delay: 1.2 });
        gsap.from(".hp-bar i", { scaleY: 0, duration: 0.3, stagger: 0.025, delay: 1.3 });
      }
      ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => gl.current?.setScatter(self.progress),
      });
      if (!REDUCED) gsap.to(".hero-ui", { yPercent: -30, autoAlpha: 0, ease: "none", scrollTrigger: { trigger: section.current, start: "top top", end: "60% top", scrub: true } });
    }, section);
    return () => ctx.revert();
  }, [started]);

  return (
    <section id="start" className="hero" ref={section}>
      <h1 className="sr-only">
        {profile.name}: {profile.role} at {profile.company}
      </h1>
      {useGL ? (
        <canvas ref={canvas} aria-hidden="true" />
      ) : (
        <div className="hero-fallback poster" aria-hidden="true">
          <div>
            <span>{profile.first}</span>
            <span>{profile.last}</span>
          </div>
        </div>
      )}
      <div className="hero-ui">
        <div className="hero-top">
          <div className="hp">
            <div className="hp-row">
              <span>PLAYER 1 · HP</span>
              <span>∞</span>
            </div>
            <Bar filled={11} />
            <div className="hp-row" style={{ marginTop: 10 }}>
              <span>CAFFEINE</span>
              <span>82%</span>
            </div>
            <Bar filled={10} mp />
          </div>
          <div className="hero-meta">
            CLASS <b>{profile.role.toUpperCase()}</b>
            <br />
            GUILD <b>{profile.company.toUpperCase()}</b>
            <br />
            BASE <b>{profile.base.toUpperCase()}</b>
            <br />
            PARTY SIZE <b className="acid">1</b>
          </div>
        </div>
        <div />
        <div className="hero-bottom">
          <div className="scroll-cue">
            <span>SCROLL TO PLAY</span>
            <span className="line" />
          </div>
          <p className="hero-tag poster">
            {profile.tagline.map((t, i) => (
              <span key={t}>
                <em className={i === 2 ? "acid" : i === 1 ? "outline" : ""}>{t}</em>
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
