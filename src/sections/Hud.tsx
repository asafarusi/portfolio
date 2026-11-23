import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { warpTo } from "../fx/scroll";
import { sound } from "../fx/sound";
import { useScramble } from "../fx/scramble";

export const STAGES = [
  { id: "start", n: "00", name: "START" },
  { id: "character", n: "01", name: "CHARACTER" },
  { id: "skills", n: "02", name: "SKILL TREE" },
  { id: "quest", n: "03", name: "MAIN QUEST" },
  { id: "levels", n: "04", name: "LEVELS" },
  { id: "continue", n: "05", name: "CONTINUE?" },
];

export default function Hud() {
  const [active, setActive] = useState("start");
  const [soundOn, setSoundOn] = useState(sound.enabled);
  const fill = useRef<HTMLDivElement>(null);
  const coords = useRef<HTMLSpanElement>(null);
  const stage = STAGES.find((s) => s.id === active)!;
  const stageRef = useScramble<HTMLSpanElement>(`STAGE ${stage.n} — ${stage.name}`);

  useEffect(() => sound.subscribe(setSoundOn), []);

  useEffect(() => {
    const triggers = STAGES.map((s) =>
      ScrollTrigger.create({
        trigger: `#${s.id}`,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (self) => self.isActive && setActive(s.id),
      })
    );
    const setFill = fill.current ? gsap.quickSetter(fill.current, "scaleX") : null;
    const progress = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => setFill?.(self.progress),
    });
    const onMove = (e: PointerEvent) => {
      if (coords.current)
        coords.current.textContent = `X:${String(Math.round(e.clientX)).padStart(4, "0")} Y:${String(Math.round(e.clientY)).padStart(4, "0")}`;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      triggers.forEach((t) => t.kill());
      progress.kill();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const go = (id: string) => {
    sound.blip(720, 0.05);
    warpTo(`#${id}`);
  };

  return (
    <>
      <header className="hud">
        <button className="hud-logo" onClick={() => go("start")} data-magnetic aria-label="Back to start">
          ASAF.EXE
        </button>
        <span className="hud-stage" ref={stageRef} aria-hidden="true" />
        <nav className="hud-nav" aria-label="Stages">
          {STAGES.slice(1).map((s) => (
            <button key={s.id} onClick={() => go(s.id)} aria-current={active === s.id} data-magnetic>
              {s.n}
              <span className="lbl"> {s.name}</span>
            </button>
          ))}
        </nav>
        <button className="hud-sound" onClick={() => sound.toggle()} aria-pressed={soundOn} data-magnetic>
          SND {soundOn ? "ON" : "OFF"}
        </button>
      </header>
      <div className="hud-bottom" aria-hidden="true">
        <div className="xp">
          XP
          <div className="xp-track">
            <div className="xp-fill" ref={fill} />
          </div>
        </div>
        <span className="hud-coords" ref={coords}>
          X:0000 Y:0000
        </span>
      </div>
      <div className="warp" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
    </>
  );
}
