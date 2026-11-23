// Synthesized UI blips with no audio files. Off by default.
let ctx: AudioContext | null = null;
let enabled = false;
const listeners = new Set<(on: boolean) => void>();

export const sound = {
  get enabled() {
    return enabled;
  },
  toggle() {
    enabled = !enabled;
    if (enabled && !ctx) ctx = new AudioContext();
    if (enabled) this.blip(880, 0.08);
    listeners.forEach((l) => l(enabled));
  },
  subscribe(fn: (on: boolean) => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  blip(freq = 660, dur = 0.05, type: OscillatorType = "square", vol = 0.04) {
    if (!enabled || !ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + dur);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  },
  coin() {
    this.blip(988, 0.08);
    setTimeout(() => this.blip(1319, 0.25), 80);
  },
};
