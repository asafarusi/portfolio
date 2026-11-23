import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { bus } from "./env";

export default function Toast() {
  const [msg, setMsg] = useState<string | null>(null);
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let t = 0;
    const off = bus.on<string>("toast", (m) => {
      setMsg(m);
      clearTimeout(t);
      t = window.setTimeout(() => setMsg(null), 2800);
    });
    return () => {
      off();
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (msg && el.current) gsap.fromTo(el.current, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: "back.out(2)" });
  }, [msg]);

  if (!msg) return null;
  return (
    <div className="toast" ref={el} role="status">
      {msg}
    </div>
  );
}
