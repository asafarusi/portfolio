import { Fragment, useEffect, useRef, type CSSProperties, type MouseEvent, type PointerEvent } from "react";
import { clamp, FINE, observeReveals, onFrame, pointer, REDUCED, scrollTo, startMotion } from "./motion";
import { contact, hero, now, profile, stack, statement, work } from "./data/profile";

const nav = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

// Which nav item each section belongs to
const sectionToNav: [string, string][] = [
  ["about", "about"],
  ["work", "work"],
  ["stack", "work"],
  ["contact", "contact"],
];

const vars = (o: Record<string, string | number>) => o as CSSProperties;

function jump(e: MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  scrollTo(`#${id}`);
}

export default function App() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const stop = startMotion();
    const unobserve = observeReveals();
    // Two frames so the initial state paints before the intro transitions start
    requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("ready")));
    return () => {
      stop();
      unobserve();
    };
  }, []);

  return (
    <>
      <Nav />
      <Ambient />
      <main>
        <Hero />
        <Statement />
        <Now />
        <Work />
        <Stack />
        <Contact />
      </main>
      <footer className="foot">
        <div className="wrap foot-row">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span>{profile.base}</span>
        </div>
      </footer>
    </>
  );
}

/* ---------- shared pieces ---------- */

/** A heading whose words slide up out of their own masks. */
function Title({ text, className = "title", as: Tag = "h2" }: { text: string; className?: string; as?: "h2" | "h3" }) {
  const words = text.split(" ");
  return (
    <Tag className={`${className} split`} aria-label={text}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="mask" aria-hidden="true">
            <span style={vars({ "--i": i })}>{w}</span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </Tag>
  );
}

function Arrow({ href, children, onClick, external }: { href: string; children: string; onClick?: (e: MouseEvent<HTMLAnchorElement>) => void; external?: boolean }) {
  return (
    <a className="link" href={href} onClick={onClick} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
      <span className="ul">{children}</span>
      <svg className="chev" viewBox="0 0 8 14" aria-hidden="true">
        <path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

/** A faint light that trails the cursor across the whole page. */
function Ambient() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (REDUCED || !FINE) return;
    return onFrame(() => {
      const el = ref.current;
      if (!el || !pointer.active) return;
      el.style.opacity = "1";
      el.style.transform = `translate3d(${pointer.sx - 400}px, ${pointer.sy - 400}px, 0)`;
    });
  }, []);
  return <div className="ambient" ref={ref} aria-hidden="true" />;
}

/* ---------- sections ---------- */

function Nav() {
  const ref = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const ind = useRef<HTMLSpanElement>(null);
  const links = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    let current = "";
    return onFrame(() => {
      const header = ref.current;
      if (!header) return;
      header.classList.toggle("scrolled", scrollY > 8);
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max) : 0})`;

      let active = "";
      for (const [sec, navId] of sectionToNav) {
        const el = document.getElementById(sec);
        if (el && el.getBoundingClientRect().top < innerHeight * 0.45) active = navId;
      }
      if (scrollY >= max - 4) active = "contact";
      if (active === current) return;
      current = active;
      Object.entries(links.current).forEach(([id, a]) => a?.classList.toggle("active", id === active));
      const a = active ? links.current[active] : null;
      if (ind.current) {
        if (a) {
          ind.current.style.opacity = "1";
          ind.current.style.transform = `translateX(${a.offsetLeft}px) scaleX(${a.offsetWidth})`;
        } else ind.current.style.opacity = "0";
      }
    });
  }, []);

  return (
    <header className="nav" ref={ref}>
      <div className="wrap nav-row">
        <a href="#top" className="nav-name" onClick={(e) => jump(e, "top")}>
          {profile.name}
        </a>
        <nav aria-label="Sections">
          {nav.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={(e) => jump(e, n.id)} ref={(el) => void (links.current[n.id] = el)}>
              {n.label}
            </a>
          ))}
          <span className="nav-ind" ref={ind} aria-hidden="true" />
        </nav>
      </div>
      <span className="nav-progress" ref={bar} aria-hidden="true" />
    </header>
  );
}

function Hero() {
  const glow = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (REDUCED) return;
    return onFrame(() => {
      const p = clamp(scrollY / (innerHeight * 0.9));
      // The name hangs back and flies toward you as it dissolves; the copy below fades out first
      if (top.current) {
        top.current.style.transform = `translate3d(0, ${p * 34}vh, 0) scale(${1 + p * 0.45})`;
        top.current.style.opacity = String(clamp(1 - p * 1.3));
        top.current.style.filter = p > 0.001 ? `blur(${(p * 16).toFixed(2)}px)` : "";
      }
      if (bottom.current) {
        bottom.current.style.transform = `translate3d(0, ${p * 26}vh, 0) scale(${1 - p * 0.1})`;
        bottom.current.style.opacity = String(clamp(1 - p * 2.8));
      }
      if (glow.current) {
        const gx = pointer.active ? pointer.nx * 60 : 0;
        const gy = pointer.active ? pointer.ny * 40 : 0;
        glow.current.style.transform = `translate(calc(-50% + ${gx.toFixed(1)}px), calc(-50% + ${(gy - p * 120).toFixed(1)}px)) scale(${1 + p * 0.6})`;
      }
    });
  }, []);

  const words = `${profile.name}.`.split(" ");
  let n = 0;

  return (
    <section className="hero" id="top">
      <div className="hero-glow-wrap" aria-hidden="true">
        <div className="hero-glow" ref={glow} />
      </div>
      <div className="hero-inner">
        <div className="hero-top" ref={top}>
          <p className="eyebrow intro" style={vars({ "--d": "0.15s" })}>
            {profile.role} at {profile.company}
          </p>
          <h1 className="hero-name" aria-label={`${profile.name}.`}>
            {words.map((w, wi) => (
              <Fragment key={wi}>
                <span className="hero-word" aria-hidden="true">
                  {[...w].map((ch, ci) => (
                    <span className="ch" key={ci} style={vars({ "--i": n++ })}>
                      {ch}
                    </span>
                  ))}
                </span>
                {wi < words.length - 1 ? " " : ""}
              </Fragment>
            ))}
          </h1>
        </div>
        <div className="hero-bottom" ref={bottom}>
          <p className="hero-lede intro" style={vars({ "--d": "0.85s" })}>
            {hero.lede}
          </p>
          <div className="hero-cta intro" style={vars({ "--d": "1.05s" })}>
            <a className="pill" href="#contact" onClick={(e) => jump(e, "contact")} data-magnetic>
              Get in touch
            </a>
            <Arrow href="#work" onClick={(e) => jump(e, "work")}>
              See my work
            </Arrow>
          </div>
        </div>
      </div>
      <div className="scroll-cue intro" style={vars({ "--d": "1.6s" })} aria-hidden="true">
        <span />
      </div>
    </section>
  );
}

function Statement() {
  const section = useRef<HTMLElement>(null);
  const words = statement.split(" ");

  useEffect(() => {
    const spans = section.current?.querySelectorAll<HTMLSpanElement>(".word");
    if (!spans) return;
    if (REDUCED) {
      spans.forEach((s) => s.style.setProperty("--lit", "1"));
      return;
    }
    let last = -1;
    return onFrame(() => {
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // 0 when the block pins, 1 a little before it releases
      const p = clamp((-r.top / (r.height - innerHeight)) * 1.15);
      if (Math.abs(p - last) < 0.0005) return;
      last = p;
      const n = spans.length;
      // Each word eases in over ~2.5 word-lengths, so several are mid-transition at once
      spans.forEach((s, i) => {
        s.style.setProperty("--lit", clamp((p * (n + 2.5) - i) / 2.5).toFixed(3));
      });
    });
  }, []);

  return (
    <section className="statement" ref={section} aria-label="What I do">
      <div className="statement-pin">
        <p className="wrap statement-text" aria-label={statement}>
          {words.map((w, i) => (
            <span key={i} aria-hidden="true">
              <span className="word">{w}</span>{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

function Now() {
  return (
    <section className="section" id="about">
      <div className="wrap">
        <p className="eyebrow reveal">Currently</p>
        <Title text={now.title} />
        <div className="now-copy">
          <p className="body reveal">{now.body}</p>
          <p className="body muted reveal" style={vars({ "--d": "0.12s" })} data-speed="-0.04">
            {now.aside}
          </p>
        </div>
        <div className="facts">
          {now.facts.map((f, i) => (
            <div className="fact draw" key={f.big} style={vars({ "--d": `${i * 0.12}s` })}>
              <span className="fact-big">{f.big}</span>
              <span className="fact-small">{f.small}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ p, i }: { p: (typeof work)[number]; i: number }) {
  const body = useRef<HTMLDivElement>(null);

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (REDUCED || !FINE || !body.current) return;
    const r = body.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const s = body.current.style;
    s.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    s.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    s.setProperty("--ry", `${((x - 0.5) * 10).toFixed(2)}deg`);
    s.setProperty("--rx", `${((0.5 - y) * 8).toFixed(2)}deg`);
  };
  const leave = () => {
    const s = body.current?.style;
    s?.setProperty("--ry", "0deg");
    s?.setProperty("--rx", "0deg");
  };

  return (
    <article className="card reveal" style={vars({ "--d": `${i * 0.1}s`, "--h": p.hue })}>
      <div className="card-body" ref={body} onPointerMove={move} onPointerLeave={leave}>
        <div className="card-glow" aria-hidden="true" />
        <div className="card-top">
          <span className="card-index">{String(i + 1).padStart(2, "0")}</span>
          <span className="card-status">{p.status === "live" ? "Live" : "Coming soon"}</span>
        </div>
        <h3 className="card-title">{p.title}</h3>
        <p className="card-line">{p.line}</p>
        <p className="card-tags">{p.tags.join(" · ")}</p>
        {(p.live || p.github) && (
          <div className="card-links">
            {p.live && (
              <Arrow href={p.live} external>
                Visit
              </Arrow>
            )}
            {p.github && (
              <Arrow href={p.github} external>
                Source
              </Arrow>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function Work() {
  return (
    <section className="section" id="work">
      <div className="wrap">
        <p className="eyebrow reveal">Selected work</p>
        <Title text="Things I’m building." />
        <div className="cards">
          {work.map((p, i) => (
            <Card p={p} i={i} key={p.title} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Stack() {
  return (
    <section className="section" id="stack">
      <div className="wrap">
        <p className="eyebrow reveal">Toolkit</p>
        <Title text="Comfortable at every layer." />
        <div className="stack">
          {stack.map((g, i) => (
            <div className="stack-col draw" key={g.group} style={vars({ "--d": `${i * 0.1}s` })}>
              <h3>{g.group}</h3>
              <ul>
                {g.items.map((s, j) => (
                  <li key={s} style={vars({ "--j": j })}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const section = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (REDUCED) return;
    return onFrame(() => {
      const s = section.current;
      const t = title.current;
      if (!s || !t) return;
      // 0 as the section enters, 1 once its top reaches a third of the screen
      const top = s.getBoundingClientRect().top;
      const p = clamp((innerHeight - top) / (innerHeight * 0.75));
      const e = 1 - Math.pow(1 - p, 3);
      t.style.transform = `translate3d(0, ${(1 - e) * 80}px, 0) scale(${0.78 + e * 0.22})`;
      t.style.opacity = String(clamp(e * 1.4));
      t.style.filter = e < 0.999 ? `blur(${((1 - e) * 16).toFixed(2)}px)` : "";
    });
  }, []);

  return (
    <section className="contact" id="contact" ref={section}>
      <div className="wrap">
        <h2 className="contact-title" ref={title}>
          {contact.title}
        </h2>
        <p className="contact-body reveal">{contact.body}</p>
        <div className="contact-cta reveal" style={vars({ "--d": "0.12s" })}>
          <a className="pill" href={profile.links.email} data-magnetic>
            Email me
          </a>
          <Arrow href={profile.links.linkedin} external>
            LinkedIn
          </Arrow>
          <Arrow href={profile.links.github} external>
            GitHub
          </Arrow>
        </div>
      </div>
    </section>
  );
}
