import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { levels, type Level } from "../data/levels";
import { FINE_POINTER, REDUCED } from "../fx/env";
import { useScramble } from "../fx/scramble";
import { sound } from "../fx/sound";

function LevelCard({ level }: { level: Level }) {
  const locked = level.status === "locked";
  const title = useScramble<HTMLHeadingElement>(level.codename, { hover: true, duration: 700 });
  const card = useRef<HTMLElement>(null);

  // 3D tilt that follows the pointer
  const onMove = (e: React.PointerEvent) => {
    if (!FINE_POINTER || REDUCED || !card.current) return;
    const r = card.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(card.current, { rotateY: px * 14, rotateX: -py * 14, transformPerspective: 900, duration: 0.4, ease: "power3" });
  };
  const onLeave = () => card.current && gsap.to(card.current, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });

  return (
    <article className="level" ref={card} onPointerMove={onMove} onPointerLeave={onLeave} onPointerEnter={() => sound.blip(240, 0.06, "sawtooth", 0.03)}>
      <div className="level-num" aria-hidden="true">
        {level.id}
      </div>
      <span className={`level-status${locked ? "" : " open"}`}>
        {locked ? (
          <>
            <svg width="9" height="10" viewBox="0 0 9 10" aria-hidden="true">
              <rect x="0.5" y="4.5" width="8" height="5" fill="currentColor" />
              <path d="M2 4.5V3a2.5 2.5 0 015 0v1.5" stroke="currentColor" fill="none" />
            </svg>
            LOCKED
          </>
        ) : (
          "UNLOCKED"
        )}
      </span>
      <h3 ref={title}>{level.codename}</h3>
      <p>{locked ? level.teaser : level.blurb || level.teaser}</p>
      {locked && (
        <div className="redact" aria-hidden="true">
          <i style={{ width: "92%" }} />
          <i style={{ width: "70%" }} />
          <i style={{ width: "40%" }} />
        </div>
      )}
      <div className="tags">
        {level.tags.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      {!locked && (level.github || level.live) && (
        <div className="level-links">
          {level.github && (
            <a href={level.github} target="_blank" rel="noreferrer" data-magnetic>
              SOURCE ↗
            </a>
          )}
          {level.live && (
            <a href={level.live} target="_blank" rel="noreferrer" data-magnetic>
              PLAY ↗
            </a>
          )}
        </div>
      )}
    </article>
  );
}

export default function Levels() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (REDUCED) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      // Pinned horizontal run: vertical scroll drives the level select sideways
      const el = track.current!;
      const dist = () => el.scrollWidth - window.innerWidth;
      const tween = gsap.to(el, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: { trigger: root.current, pin: true, start: "top top", end: () => `+=${dist()}`, scrub: 0.8, invalidateOnRefresh: true },
      });
      gsap.utils.toArray<HTMLElement>(".level").forEach((c) => {
        gsap.from(c.querySelector(".level-num"), {
          xPercent: 60,
          ease: "none",
          scrollTrigger: { trigger: c, containerAnimation: tween, start: "left right", end: "center center", scrub: true },
        });
      });
    });
    mm.add("(max-width: 767px)", () => {
      gsap.utils.toArray<HTMLElement>(".level").forEach((c) =>
        gsap.from(c, { y: 60, autoAlpha: 0, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 88%" } })
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="levels" className="levels" ref={root}>
      <div className="levels-track" ref={track}>
        <div className="levels-intro">
          <div className="stage-label">
            <span className="kicker">Stage 04 · Level select</span>
            <span className="bar" />
          </div>
          <h2 className="poster">
            Select
            <br />
            <span className="outline">Level</span>
          </h2>
          <p>Classified builds in progress. Clearance pending. Scroll to inspect the vault.</p>
        </div>
        {levels.map((l) => (
          <LevelCard key={l.id} level={l} />
        ))}
        <div className="levels-end">
          <div>&gt; MORE LEVELS LOADING<span className="dots" /></div>
          <div className="mag">&gt; ETA: SOONER THAN YOU THINK</div>
        </div>
      </div>
    </section>
  );
}
