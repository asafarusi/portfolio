import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { edges, groups, nodes, type Group } from "../data/skills";
import { REDUCED } from "../fx/env";
import { sound } from "../fx/sound";

const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

export default function SkillTree() {
  const root = useRef<HTMLElement>(null);
  const [hot, setHot] = useState<string | null>(null);

  const linked = useMemo(() => {
    if (!hot) return new Set<string>();
    const s = new Set<string>([hot]);
    edges.forEach(([a, b]) => {
      if (a === hot) s.add(b);
      if (b === hot) s.add(a);
    });
    return s;
  }, [hot]);

  useLayoutEffect(() => {
    if (REDUCED) return;
    const ctx = gsap.context(() => {
      // Draw the network as you scroll
      gsap.fromTo(
        ".tree line",
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, ease: "none", stagger: 0.04, scrollTrigger: { trigger: ".tree", start: "top 85%", end: "center 55%", scrub: 0.5 } }
      );
      gsap.from(".tree .node", {
        scale: 0,
        transformOrigin: "50% 50%",
        ease: "back.out(3)",
        stagger: { each: 0.05, from: "center" },
        duration: 0.6,
        scrollTrigger: { trigger: ".tree", start: "top 75%" },
      });
      gsap.from(".skills-head h2 .w", { yPercent: 100, duration: 1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: ".skills-head", start: "top 85%" } });

      // Signal pulses travel along random edges while the section is on screen
      const pulses = gsap.utils.toArray<SVGCircleElement>(".tree .pulse");
      const fire = (p: SVGCircleElement) => {
        const [a, b] = edges[(Math.random() * edges.length) | 0];
        const [from, to] = Math.random() > 0.5 ? [byId[a], byId[b]] : [byId[b], byId[a]];
        gsap.fromTo(
          p,
          { attr: { cx: from.x, cy: from.y }, opacity: 1 },
          { attr: { cx: to.x, cy: to.y }, duration: gsap.utils.random(0.6, 1.4), ease: "power2.inOut", onComplete: () => fire(p) }
        );
      };
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => pulses.forEach((p, i) => gsap.delayedCall(i * 0.15, () => fire(p))),
        onLeave: () => gsap.killTweensOf(pulses),
        onEnterBack: () => pulses.forEach((p) => fire(p)),
        onLeaveBack: () => gsap.killTweensOf(pulses),
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="skills" className="skills" ref={root}>
      <div className="wrap">
        <div className="stage-label">
          <span className="kicker">Stage 02 · Skill tree</span>
          <span className="bar" />
        </div>
        <div className="skills-head">
          <h2 className="poster" style={{ overflow: "hidden" }}>
            <span className="w" style={{ display: "inline-block" }}>
              Neural
            </span>{" "}
            <span className="w outline" style={{ display: "inline-block" }}>
              Stack
            </span>
          </h2>
          <div className="legend" aria-hidden="true">
            {(Object.keys(groups) as Group[])
              .filter((g) => g !== "core")
              .map((g) => (
                <span key={g}>
                  <i style={{ background: groups[g].color }} />
                  {groups[g].name}
                </span>
              ))}
          </div>
        </div>

        <svg className="tree" viewBox="-40 0 1080 650" role="img" aria-label={`Skills: ${nodes.filter((n) => !n.core).map((n) => n.label).join(", ")}`}>
          {edges.map(([a, b]) => (
            <line
              key={a + b}
              x1={byId[a].x}
              y1={byId[a].y}
              x2={byId[b].x}
              y2={byId[b].y}
              pathLength={1}
              strokeDasharray="1"
              className={hot && linked.has(a) && linked.has(b) && (a === hot || b === hot) ? "hot" : ""}
            />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <circle key={i} className="pulse" r={3.5} cx={-100} cy={-100} />
          ))}
          {nodes.map((n) => {
            const r = n.core ? 54 : 9;
            const labelLeft = n.x > 500;
            return (
              <g
                key={n.id}
                className={`node${n.core ? " core" : ""}${linked.has(n.id) ? " hot" : ""}`}
                onPointerEnter={() => {
                  setHot(n.id);
                  sound.blip(300 + n.x * 0.6, 0.04, "sine", 0.05);
                }}
                onPointerLeave={() => setHot(null)}
              >
                <circle className="ring" cx={n.x} cy={n.y} r={r} />
                {!n.core && <circle cx={n.x} cy={n.y} r={r + 7} fill="none" stroke={groups[n.group].color} strokeOpacity={0.5} />}
                <text
                  x={n.core ? n.x : n.x + (labelLeft ? 22 : -22)}
                  y={n.y + 5}
                  textAnchor={n.core ? "middle" : labelLeft ? "start" : "end"}
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
