import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Boot from "./sections/Boot";
import Hud from "./sections/Hud";
import Hero from "./sections/Hero";
import Character from "./sections/Character";
import SkillTree from "./sections/SkillTree";
import Quest from "./sections/Quest";
import Levels from "./sections/Levels";
import Continue from "./sections/Continue";
import Cursor from "./fx/Cursor";
import Toast from "./fx/Toast";
import { REDUCED, storage } from "./fx/env";
import { lockScroll, startSmoothScroll } from "./fx/scroll";
import { listenKonami } from "./fx/konami";
import { consoleBanner } from "./fx/console";
import { profile } from "./data/profile";

const KeepyUppy = lazy(() => import("./fx/KeepyUppy"));

export default function App() {
  const [booted, setBooted] = useState(() => REDUCED || storage.get("asaf:booted") === "1");
  const [game, setGame] = useState(false);

  useEffect(() => {
    consoleBanner();
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    return listenKonami();
  }, []);

  useEffect(() => {
    lockScroll(!booted);
    if (booted) {
      startSmoothScroll();
      // Fonts change layout, so recompute every trigger once they're in
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    }
  }, [booted]);

  const onBootDone = useCallback(() => {
    storage.set("asaf:booted", "1");
    setBooted(true);
  }, []);

  return (
    <>
      {!booted && <Boot onDone={onBootDone} />}
      <Hud />
      <main>
        <Hero started={booted} />
        <Character onBall={() => setGame(true)} />
        <SkillTree />
        <Quest />
        <Levels />
        <Continue />
      </main>
      <footer>
        <span>© {new Date().getFullYear()} {profile.name} · hand-coded, zero templates harmed</span>
        <span>↑↑↓↓←→←→BA</span>
      </footer>
      {game && (
        <Suspense fallback={null}>
          <KeepyUppy onClose={() => setGame(false)} />
        </Suspense>
      )}
      <Toast />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <div className="scan" aria-hidden="true" />
    </>
  );
}
