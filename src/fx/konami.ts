import { bus } from "./env";
import { sound } from "./sound";

const CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

let chaos = false;

export function setChaos(on: boolean) {
  chaos = on;
  document.documentElement.classList.toggle("chaos", on);
  bus.emit("chaos", on);
  bus.emit("toast", on ? "CHAOS MODE: ON  // ↑↑↓↓←→←→BA to restore sanity" : "CHAOS MODE: OFF // sanity restored (allegedly)");
  sound.coin();
}

export function listenKonami() {
  let i = 0;
  const onKey = (e: KeyboardEvent) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    i = k === CODE[i] ? i + 1 : k === CODE[0] ? 1 : 0;
    if (i === CODE.length) {
      i = 0;
      setChaos(!chaos);
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}
