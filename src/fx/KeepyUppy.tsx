import { useEffect, useRef, useState } from "react";
import { lockScroll } from "./scroll";
import { sound } from "./sound";
import { storage } from "./env";

/** Hidden mini-game: keep the ball in the air. Click or tap the ball to kick it. */
export default function KeepyUppy({ onClose }: { onClose: () => void }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(storage.getLocal("asaf:best") || 0));
  const [dead, setDead] = useState(false);
  const reset = useRef<() => void>(() => {});

  useEffect(() => {
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    const c = cvs.current!;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    const size = () => {
      W = c.clientWidth;
      H = c.clientHeight;
      c.width = W * dpr;
      c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener("resize", size);

    const R = Math.max(26, Math.min(W, H) * 0.045);
    const ball = { x: W / 2, y: H * 0.35, vx: 0, vy: 0, rot: 0, alive: true, started: false };
    let hits = 0;
    let trail: { x: number; y: number }[] = [];

    reset.current = () => {
      Object.assign(ball, { x: W / 2, y: H * 0.35, vx: 0, vy: 0, rot: 0, alive: true, started: false });
      hits = 0;
      trail = [];
      setScore(0);
      setDead(false);
    };

    const kick = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      if (!ball.alive || Math.hypot(px - ball.x, py - ball.y) > R * 1.8) return;
      ball.started = true;
      ball.vy = -Math.min(1100, 720 + hits * 12);
      ball.vx = (ball.x - px) * 14 + (Math.random() - 0.5) * 160;
      hits++;
      setScore(hits);
      sound.blip(300 + hits * 25, 0.07, "triangle", 0.08);
    };
    c.addEventListener("pointerdown", kick);

    const drawBall = () => {
      ctx.save();
      ctx.translate(ball.x, ball.y);
      ctx.rotate(ball.rot);
      ctx.fillStyle = "#e8e8ea";
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#07070a";
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * R * 0.72, Math.sin(a) * R * 0.72, R * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      if (ball.started && ball.alive) {
        ball.vy += 1900 * dt;
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;
        ball.rot += ball.vx * dt * 0.02;
        if (ball.x < R || ball.x > W - R) {
          ball.vx *= -0.8;
          ball.x = Math.max(R, Math.min(W - R, ball.x));
        }
        if (ball.y < R) {
          ball.y = R;
          ball.vy = Math.abs(ball.vy) * 0.5;
        }
        if (ball.y > H + R) {
          ball.alive = false;
          sound.blip(90, 0.5, "sawtooth", 0.06);
          setDead(true);
          setBest((b) => {
            const nb = Math.max(b, hits);
            storage.setLocal("asaf:best", String(nb));
            return nb;
          });
        }
      } else if (!ball.started) {
        ball.y = H * 0.35 + Math.sin(now / 300) * 8;
      }
      trail.push({ x: ball.x, y: ball.y });
      if (trail.length > 14) trail.shift();

      ctx.clearRect(0, 0, W, H);
      trail.forEach((p, i) => {
        ctx.fillStyle = `rgba(198,255,0,${(i / trail.length) * 0.25})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, R * (i / trail.length), 0, Math.PI * 2);
        ctx.fill();
      });
      drawBall();
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      c.removeEventListener("pointerdown", kick);
      window.removeEventListener("resize", size);
    };
  }, []);

  return (
    <div className="game" role="dialog" aria-modal="true" aria-label="Keepie-uppie mini-game">
      <canvas ref={cvs} />
      <div className="game-ui">
        <div className="kicker">{dead ? "FULL TIME" : score ? "KEEP IT UP" : "TAP THE BALL"}</div>
        <div className="score poster">{score}</div>
        <div style={{ color: "var(--dim)", fontSize: 12 }}>BEST {best}</div>
        {dead && (
          <button className="cta primary" style={{ marginTop: 24, pointerEvents: "auto" }} onClick={() => reset.current()} autoFocus>
            ▶ Again
          </button>
        )}
      </div>
      <button className="game-close" onClick={onClose}>
        ESC ✕
      </button>
    </div>
  );
}
