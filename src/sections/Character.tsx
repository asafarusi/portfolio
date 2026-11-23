import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { lore, idcard, stats, inventory } from "../data/profile";
import { REDUCED } from "../fx/env";
import { sound } from "../fx/sound";

const MANIFESTO = ["IDEA", "TO PROD.", "SAME DAY."];

const icons: Record<string, ReactNode> = {
  controller: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M18 20h28c8 0 12 6 13 14l2 12c1 6-6 9-10 4l-6-7H19l-6 7c-4 5-11 2-10-4l2-12c1-8 5-14 13-14z" />
      <path d="M19 28v10M14 33h10" />
      <circle cx="44" cy="30" r="2.5" fill="currentColor" />
      <circle cx="50" cy="36" r="2.5" fill="currentColor" />
    </svg>
  ),
  ball: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <circle cx="32" cy="32" r="26" />
      <path d="M32 20l10 7-4 12H26l-4-12z" fill="currentColor" />
      <path d="M32 20V7M42 27l12-4M38 39l7 11M26 39l-7 11M22 27l-12-4" />
    </svg>
  ),
  headphones: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M10 40v-8a22 22 0 0144 0v8" />
      <rect x="6" y="38" width="12" height="18" rx="3" />
      <rect x="46" y="38" width="12" height="18" rx="3" />
    </svg>
  ),
};

export default function Character({ onBall }: { onBall: () => void }) {
  const root = useRef<HTMLElement>(null);
  const [itemDesc, setItemDesc] = useState("Inventory: hover an item.");

  useLayoutEffect(() => {
    if (REDUCED) return;
    const ctx = gsap.context(() => {
      // Poster type: letters fly in from chaos and lock into place as you scroll
      const chars = gsap.utils.toArray<HTMLElement>(".manifesto .char");
      gsap.fromTo(
        chars,
        {
          x: () => gsap.utils.random(-400, 400),
          y: () => gsap.utils.random(-300, 300),
          rotate: () => gsap.utils.random(-180, 180),
          scale: () => gsap.utils.random(0.2, 2.2),
          opacity: 0,
        },
        {
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          opacity: 1,
          ease: "power3.out",
          stagger: { each: 0.015, from: "random" },
          scrollTrigger: { trigger: ".manifesto", start: "top 95%", end: "bottom 55%", scrub: 0.6 },
        }
      );
      gsap.to(".manifesto .row:nth-child(2)", {
        xPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "bottom top", scrub: true },
      });

      gsap.from(".lore p", {
        y: 40,
        autoAlpha: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".lore", start: "top 80%" },
      });

      gsap.utils.toArray<HTMLElement>(".stat").forEach((s) => {
        const fill = s.querySelector(".stat-fill");
        const num = s.querySelector<HTMLElement>(".stat-val");
        const target = Number(s.dataset.value);
        const o = { v: 0 };
        gsap
          .timeline({ scrollTrigger: { trigger: s, start: "top 88%" } })
          .fromTo(fill, { scaleX: 0 }, { scaleX: target / 100, duration: 1.3, ease: "expo.out" })
          .to(o, { v: target, duration: 1.3, ease: "expo.out", onUpdate: () => num && (num.textContent = String(Math.round(o.v))) }, 0);
      });

      gsap.from(".item", { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.6, ease: "back.out(2)", scrollTrigger: { trigger: ".inventory", start: "top 90%" } });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="character" className="character" ref={root}>
      <div className="wrap">
        <div className="stage-label">
          <span className="kicker">Stage 01 · Character select</span>
          <span className="bar" />
        </div>

        <h2 className="manifesto poster" aria-label={MANIFESTO.join(" ")}>
          {MANIFESTO.map((word, r) => (
            <span className={`row${r === 1 ? " outline" : r === 2 ? " acid" : ""}`} key={word} aria-hidden="true">
              {word.split("").map((c, i) => (
                <span className="char" key={i}>
                  {c === " " ? " " : c}
                </span>
              ))}
            </span>
          ))}
        </h2>

        <div className="sheet">
          <div className="panel lore">
            <h3 className="kicker">Lore</h3>
            {lore.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <div className="idcard">
              {idcard.map((f) => (
                <div key={f.k}>
                  <small>{f.k}</small>
                  <strong className={f.hot ? "acid" : undefined}>{f.v}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h3 className="kicker">Stats</h3>
            {stats.map((s) => (
              <div className="stat" key={s.label} data-value={s.value}>
                <div className="stat-head">
                  <span>{s.label}</span>
                  <span>
                    <span className="stat-val">{REDUCED ? s.value : 0}</span>/100
                  </span>
                </div>
                <div className="stat-track">
                  <div className="stat-fill" style={REDUCED ? { transform: `scaleX(${s.value / 100})` } : undefined} />
                </div>
                <div className="stat-note">{s.note}</div>
              </div>
            ))}

            <h3 className="kicker" style={{ marginTop: 32 }}>
              Inventory
            </h3>
            <div className="inventory">
              {inventory.map((it) => {
                const isBall = it.id === "ball";
                return (
                  <button
                    key={it.id}
                    className="item"
                    data-magnetic
                    data-ball={isBall ? "" : undefined}
                    aria-label={isBall ? "Football: play the keepie-uppie mini-game" : it.name}
                    onPointerEnter={() => {
                      setItemDesc(`${it.name}: ${it.desc}`);
                      sound.blip(isBall ? 520 : 340, 0.04);
                    }}
                    onFocus={() => setItemDesc(`${it.name}: ${it.desc}`)}
                    onClick={() => (isBall ? onBall() : setItemDesc(`${it.name}: ${it.desc}`))}
                  >
                    {icons[it.id]}
                    <span className="tip">{isBall ? "PLAY" : it.name.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>
            <p className="item-desc" aria-live="polite">
              {itemDesc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
