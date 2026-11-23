import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { bootLines } from "../data/profile";
import { sound } from "../fx/sound";

/** Terminal boot, then PRESS START. Any key or tap skips it, and it finishes on its own after about 3.2 seconds. */
export default function Boot({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const [ready, setReady] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    sound.coin();
    const el = root.current!;
    gsap
      .timeline({ onComplete: onDone })
      .to(el.querySelector(".boot-term"), { scaleY: 0.004, scaleX: 1.15, duration: 0.18, ease: "power4.in" })
      .to(el.querySelector(".boot-term"), { scaleX: 0, duration: 0.12, ease: "power4.in" })
      .to(el, { autoAlpha: 0, duration: 0.25 }, "-=0.05");
  };

  useEffect(() => {
    const timers: number[] = [];
    bootLines.forEach((_, i) => timers.push(window.setTimeout(() => setShown(i + 1), 120 + i * 190)));
    timers.push(window.setTimeout(() => setReady(true), 120 + bootLines.length * 190 + 100));
    timers.push(window.setTimeout(finish, 3200));
    const onAny = (e: Event) => {
      if (e instanceof KeyboardEvent && ["Shift", "Meta", "Alt", "Control", "Tab"].includes(e.key)) return;
      finish();
    };
    window.addEventListener("keydown", onAny);
    window.addEventListener("pointerdown", onAny);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", onAny);
      window.removeEventListener("pointerdown", onAny);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (shown) sound.blip(400 + shown * 60, 0.03);
  }, [shown]);

  return (
    <div className="boot" ref={root} role="dialog" aria-label="Loading">
      <div className="boot-term">
        {bootLines.slice(0, shown).map((l) => (
          <div className="boot-line" key={l.text}>
            <span className="acid">&gt;</span>
            <span>{l.text}</span>
            <span className="dots">{".".repeat(80)}</span>
            {l.status && (
              <span className={`st-${l.status}`}>{l.status === "ok" ? "[ OK ]" : l.status === "fail" ? "[FAIL]" : "[ ¯\\_(ツ)_/¯ ]"}</span>
            )}
          </div>
        ))}
        {ready && <div className="boot-start">▶ PRESS START</div>}
      </div>
      <div className="boot-skip">any key / tap to skip</div>
    </div>
  );
}
