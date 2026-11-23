const mq = (q: string) => typeof window !== "undefined" && window.matchMedia(q).matches;

export const REDUCED = mq("(prefers-reduced-motion: reduce)");
export const FINE_POINTER = mq("(pointer: fine)");
export const MOBILE = mq("(max-width: 767px)");

export function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export const storage = {
  get(k: string): string | null {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      sessionStorage.setItem(k, v);
    } catch {
      /* private mode */
    }
  },
  getLocal(k: string): string | null {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setLocal(k: string, v: string) {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* private mode */
    }
  },
};

/** Tiny event bus between React and the WebGL scene. */
export const bus = {
  emit<T>(name: string, detail?: T) {
    window.dispatchEvent(new CustomEvent(`asaf:${name}`, { detail }));
  },
  on<T>(name: string, fn: (detail: T) => void) {
    const h = (e: Event) => fn((e as CustomEvent<T>).detail);
    window.addEventListener(`asaf:${name}`, h);
    return () => window.removeEventListener(`asaf:${name}`, h);
  },
};
