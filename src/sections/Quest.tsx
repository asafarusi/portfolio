import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { quest } from "../data/profile";
import { REDUCED } from "../fx/env";

function Ticker({ words, rev }: { words: string[]; rev?: boolean }) {
  const track = (
    <div className="ticker-track">
      {words.map((w, i) => (
        <span key={i}>{w} ✦</span>
      ))}
    </div>
  );
  return (
    <div className={`ticker${rev ? " rev" : ""}`} aria-hidden="true">
      {track}
      {track}
    </div>
  );
}

export default function Quest() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (REDUCED) return;
    const ctx = gsap.context(() => {
      // The tickers skew with scroll velocity
      const skew = gsap.quickTo(".ticker", "skewX", { duration: 0.4, ease: "power3" });
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => skew(gsap.utils.clamp(-14, 14, self.getVelocity() / -250)),
      });

      gsap.from(".quest-company", {
        clipPath: "inset(0 100% 0 0)",
        duration: 1.4,
        ease: "expo.inOut",
        scrollTrigger: { trigger: ".quest-body", start: "top 80%" },
      });
      gsap.from(".quest-role, .quest-summary", { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.8, delay: 0.4, ease: "expo.out", scrollTrigger: { trigger: ".quest-body", start: "top 80%" } });
      gsap.from(".objectives li", {
        x: 60,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 0.6,
        ease: "expo.out",
        scrollTrigger: { trigger: ".objectives", start: "top 85%" },
      });
      gsap.from(".objectives .box", { scale: 0, stagger: 0.12, delay: 0.35, duration: 0.4, ease: "back.out(4)", scrollTrigger: { trigger: ".objectives", start: "top 85%" } });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="quest" className="quest" ref={root}>
      <div className="wrap">
        <div className="stage-label">
          <span className="kicker">Stage 03 · Main quest · In progress</span>
          <span className="bar" />
        </div>
      </div>
      <Ticker words={quest.ticker} />
      <Ticker words={[...quest.ticker].reverse()} rev />
      <div className="wrap">
        <div className="quest-body">
          <div>
            <span className="kicker">Current guild</span>
            <h2 className="quest-company poster glitch" data-text={quest.company}>
              {quest.company}
            </h2>
            <p className="quest-role poster">
              <span className="acid">{quest.title}</span> · <span className="outline">{quest.since}</span>
            </p>
            <p className="quest-summary">{quest.summary}</p>
          </div>
          <div className="panel">
            <h3 className="kicker">Quest log</h3>
            <ul className="objectives">
              {quest.objectives.map((o) => (
                <li key={o.text} className={o.done ? "done" : "fail"}>
                  <span className="box" aria-hidden="true">
                    {o.done ? "✓" : "✕"}
                  </span>
                  <span className="txt">{o.text}</span>
                  <span className="sr-only">{o.done ? "(complete)" : "(failed)"}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
