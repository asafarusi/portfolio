import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile } from "../data/profile";
import { bus, REDUCED } from "../fx/env";
import { sound } from "../fx/sound";

export default function Continue() {
  const root = useRef<HTMLElement>(null);
  const countEl = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(10);
  const [running, setRunning] = useState(false);
  const over = n <= 0;

  // The countdown runs only while the section is on screen
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top 60%",
      end: "bottom 20%",
      onToggle: (self) => setRunning(self.isActive),
    });
    return () => st.kill();
  }, []);

  useEffect(() => {
    if (!running || over) return;
    const t = window.setTimeout(() => setN((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [running, n, over]);

  useEffect(() => {
    if (!countEl.current || REDUCED) return;
    gsap.fromTo(countEl.current, { scale: over ? 1.6 : 1.25, opacity: 0.2 }, { scale: 1, opacity: 1, duration: over ? 0.7 : 0.5, ease: over ? "elastic.out(1, 0.4)" : "expo.out" });
    if (running) sound.blip(over ? 110 : 440, over ? 0.6 : 0.06, over ? "sawtooth" : "square");
  }, [n, over, running]);

  useLayoutEffect(() => {
    if (REDUCED) return;
    const ctx = gsap.context(() => {
      gsap.from(".continue h2, .continue-sub, .cta", { y: 40, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 70%" } });
    }, root);
    return () => ctx.revert();
  }, []);

  const insertCoin = () => {
    sound.coin();
    setN(10);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      bus.emit("toast", `COPIED: ${profile.email} // opening mail…`);
    } catch {
      /* clipboard blocked: the mailto still works */
    }
  };

  return (
    <section id="continue" className="continue" ref={root}>
      <div className="wrap">
        <div className="stage-label">
          <span className="kicker">Stage 05 · Final screen</span>
          <span className="bar" />
        </div>
        <h2 className="poster glitch" data-text={over ? "GAME OVER" : "CONTINUE?"}>
          {over ? "GAME OVER" : "CONTINUE?"}
        </h2>
        <div className={`count${over ? " over poster" : ""}`} ref={countEl} aria-live="off" aria-hidden="true">
          {over ? "INSERT COIN" : n}
        </div>
        <p className="continue-sub">
          {over ? "You let the timer run out. Bold strategy." : "Hiring, building something wild, or just want to talk football? Make your move."}
        </p>
        <div className="cta-row">
          {over ? (
            <button className="cta primary" onClick={insertCoin} data-magnetic>
              ● INSERT COIN
            </button>
          ) : (
            <a className="cta primary" href={profile.links.email} onClick={copyEmail} data-magnetic>
              ▶ Email me
            </a>
          )}
          <a className="cta" href={profile.links.linkedin} target="_blank" rel="noreferrer" data-magnetic>
            LinkedIn ↗
          </a>
          <a className="cta" href={profile.links.github} target="_blank" rel="noreferrer" data-magnetic>
            GitHub ↗
          </a>
        </div>
      </div>
    </section>
  );
}
