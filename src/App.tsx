import { useEffect, useRef, type MouseEvent } from "react";
import { clamp, observeReveals, onFrame, REDUCED, scrollTo, startMotion } from "./motion";
import { contact, hero, now, profile, stack, statement, work } from "./data/profile";

const nav = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

function jump(e: MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  scrollTo(id === "top" ? "#top" : `#${id}`);
}

export default function App() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const stop = startMotion();
    const unobserve = observeReveals();
    requestAnimationFrame(() => document.documentElement.classList.add("ready"));
    return () => {
      stop();
      unobserve();
    };
  }, []);

  return (
    <>
      <Nav />
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

function Nav() {
  const ref = useRef<HTMLElement>(null);
  useEffect(
    () =>
      onFrame(() => {
        ref.current?.classList.toggle("scrolled", window.scrollY > 8);
      }),
    []
  );
  return (
    <header className="nav" ref={ref}>
      <div className="wrap nav-row">
        <a href="#top" className="nav-name" onClick={(e) => jump(e, "top")}>
          {profile.name}
        </a>
        <nav aria-label="Sections">
          {nav.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={(e) => jump(e, n.id)}>
              {n.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  const inner = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (REDUCED) return;
    return onFrame(() => {
      const el = inner.current;
      if (!el) return;
      const p = clamp(window.scrollY / (window.innerHeight * 0.85));
      el.style.transform = `translate3d(0, ${p * -6}vh, 0) scale(${1 - p * 0.08})`;
      el.style.opacity = String(1 - p * 1.1);
    });
  }, []);

  return (
    <section className="hero" id="top">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-inner" ref={inner}>
        <p className="eyebrow intro" style={{ ["--d" as string]: "0.1s" }}>
          {profile.role} at {profile.company}
        </p>
        <h1 className="hero-name intro" style={{ ["--d" as string]: "0.25s" }}>
          {profile.name}.
        </h1>
        <p className="hero-lede intro" style={{ ["--d" as string]: "0.5s" }}>
          {hero.lede}
        </p>
        <div className="hero-cta intro" style={{ ["--d" as string]: "0.7s" }}>
          <a className="pill" href="#contact" onClick={(e) => jump(e, "contact")}>
            Get in touch
          </a>
          <a className="link" href="#work" onClick={(e) => jump(e, "work")}>
            See my work <Chevron />
          </a>
        </div>
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
      const vh = window.innerHeight;
      // 0 when the sticky block pins, 1 just before it unpins
      const p = clamp(-r.top / (r.height - vh) * 1.15);
      if (Math.abs(p - last) < 0.001) return;
      last = p;
      const n = spans.length;
      spans.forEach((s, i) => {
        s.style.setProperty("--lit", String(clamp(p * n - i)));
      });
    });
  }, []);

  return (
    <section className="statement" ref={section} aria-label="What I do">
      <div className="statement-pin">
        <p className="wrap statement-text">
          {words.map((w, i) => (
            <span className="word" key={i}>
              {w}{" "}
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
        <h2 className="title reveal">{now.title}</h2>
        <div className="now-copy">
          <p className="body reveal">{now.body}</p>
          <p className="body muted reveal">{now.aside}</p>
        </div>
        <div className="facts">
          {now.facts.map((f, i) => (
            <div className="fact reveal" key={f.big} style={{ ["--d" as string]: `${i * 0.08}s` }}>
              <span className="fact-big">{f.big}</span>
              <span className="fact-small">{f.small}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section className="section" id="work">
      <div className="wrap">
        <p className="eyebrow reveal">Selected work</p>
        <h2 className="title reveal">Things I’m building.</h2>
        <div className="cards">
          {work.map((p, i) => (
            <article
              className="card reveal"
              key={p.title}
              style={{ ["--d" as string]: `${i * 0.08}s`, ["--h" as string]: p.hue }}
            >
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
                    <a className="link" href={p.live} target="_blank" rel="noreferrer">
                      Visit <Chevron />
                    </a>
                  )}
                  {p.github && (
                    <a className="link" href={p.github} target="_blank" rel="noreferrer">
                      Source <Chevron />
                    </a>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stack() {
  return (
    <section className="section">
      <div className="wrap">
        <p className="eyebrow reveal">Toolkit</p>
        <h2 className="title reveal">Comfortable at every layer.</h2>
        <div className="stack">
          {stack.map((g, i) => (
            <div className="stack-col reveal" key={g.group} style={{ ["--d" as string]: `${i * 0.06}s` }}>
              <h3>{g.group}</h3>
              <ul>
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
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
  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <h2 className="contact-title reveal">{contact.title}</h2>
        <p className="contact-body reveal">{contact.body}</p>
        <div className="contact-cta reveal">
          <a className="pill" href={profile.links.email}>
            Email me
          </a>
          <a className="link" href={profile.links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn <Chevron />
          </a>
          <a className="link" href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub <Chevron />
          </a>
        </div>
      </div>
    </section>
  );
}

function Chevron() {
  return (
    <svg className="chev" viewBox="0 0 8 14" aria-hidden="true">
      <path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
