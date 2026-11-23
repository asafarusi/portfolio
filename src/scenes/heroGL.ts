// Hero scene: thousands of particles assemble into the name, run from the cursor,
// and blow apart as you scroll. The frame passes through a glitch / RGB-split / scanline pass.
// Plain three.js, lazy-loaded so it never blocks first paint.
import * as THREE from "three";

export type HeroGL = {
  assemble(): void;
  setScatter(v: number): void;
  setChaos(on: boolean): void;
  pulse(strength?: number): void;
  dispose(): void;
};

const particleVert = /* glsl */ `
uniform float uTime, uAssemble, uScatter, uChaos, uPR, uSize, uForce;
uniform vec2 uMouse;
attribute vec3 aStart;
attribute float aSeed;
attribute float aDust;
varying float vSeed;
varying float vGlow;
varying float vDust;

vec3 hash3(float n) { return fract(sin(vec3(n, n + 1.7, n + 3.1)) * 43758.5453) * 2.0 - 1.0; }

void main() {
  float t = clamp(uAssemble * 1.7 - aSeed * 0.7, 0.0, 1.0);
  t = 1.0 - pow(1.0 - t, 4.0);
  vec3 p = mix(aStart, position, t);

  float w = uTime * (0.7 + aSeed) + aSeed * 60.0;
  float jitter = 0.9 + aDust * 9.0 + uChaos * 7.0;
  p.xy += vec2(sin(w), cos(w * 1.31)) * jitter;

  vec2 d = p.xy - uMouse;
  float dist = length(d);
  float f = smoothstep(150.0, 0.0, dist) * uForce;
  p.xy += normalize(d + 1e-4) * f * (70.0 + uChaos * 90.0);
  // A slight swirl around the cursor
  p.xy += vec2(-d.y, d.x) / (dist + 1.0) * f * 30.0;
  vGlow = f;

  vec3 dir = normalize(hash3(aSeed * 113.0) + vec3(0.0, 0.0, 0.0001));
  p += dir * uScatter * uScatter * (500.0 + aSeed * 1400.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  float s = uSize * mix(1.0, 0.55, aDust) * (1.0 + f * 1.8) * (0.55 + aSeed * 0.9);
  gl_PointSize = s * uPR;
  vSeed = aSeed;
  vDust = aDust;
}`;

const particleFrag = /* glsl */ `
uniform float uChaos, uTime;
varying float vSeed;
varying float vGlow;
varying float vDust;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.05, d);
  vec3 white = vec3(0.93, 0.93, 0.95);
  vec3 acid = vec3(0.776, 1.0, 0.0);
  vec3 cyan = vec3(0.0, 0.898, 1.0);
  vec3 mag = vec3(1.0, 0.18, 0.533);
  vec3 col = mix(white, acid, step(0.84, vSeed));
  col = mix(col, cyan, step(0.95, vSeed));
  col = mix(col, mag, clamp(vGlow * 1.4, 0.0, 1.0));
  col = mix(col, mix(mag, acid, step(0.5, fract(vSeed * 9.0 + uTime))), uChaos * 0.7);
  float alpha = a * mix(0.95, 0.28, vDust);
  gl_FragColor = vec4(col * alpha, 1.0);
}`;

const postVert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const postFrag = /* glsl */ `
uniform sampler2D tDiffuse;
uniform float uTime, uRGB, uGlitch;
uniform vec2 uRes;
varying vec2 vUv;
float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 uv = vUv;
  float band = floor(uv.y * 28.0);
  float tick = floor(uTime * 14.0);
  float g = step(1.0 - uGlitch * 0.4, rand(vec2(band, tick)));
  uv.x += g * (rand(vec2(band, tick + 7.0)) - 0.5) * 0.16 * uGlitch;
  vec2 dir = uv - 0.5;
  float amt = uRGB * 0.007 + g * 0.012;
  float r = texture2D(tDiffuse, uv + dir * amt + vec2(amt, 0.0)).r;
  float gg = texture2D(tDiffuse, uv).g;
  float b = texture2D(tDiffuse, uv - dir * amt - vec2(amt, 0.0)).b;
  vec3 col = vec3(r, gg, b) * 1.55;
  col *= 0.9 + 0.1 * sin(vUv.y * uRes.y * 1.25);
  col *= smoothstep(1.25, 0.25, length(dir * vec2(1.0, 0.85)) * 1.5);
  col += (rand(vUv * uRes + fract(uTime)) - 0.5) * 0.045;
  col += vec3(0.027, 0.027, 0.039);
  gl_FragColor = vec4(col, 1.0);
}`;

type Pts = { target: Float32Array; start: Float32Array; seed: Float32Array; dust: Float32Array; count: number };

function samplePoints(w: number, h: number, lines: string[], mobile: boolean): Pts {
  const cvs = document.createElement("canvas");
  cvs.width = w;
  cvs.height = h;
  const ctx = cvs.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Fit the widest line to the target width, capped by height
  const font = (s: number) => `900 ${s}px Unbounded, "Arial Black", sans-serif`;
  ctx.font = font(100);
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const size = Math.min((100 * w * (mobile ? 0.88 : 0.74)) / widest, h * (mobile ? 0.17 : 0.3));
  ctx.font = font(size);
  const lh = size * 1.02;
  const y0 = h * (mobile ? 0.42 : 0.44) - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => ctx.fillText(l, w / 2, y0 + i * lh));

  const data = ctx.getImageData(0, 0, w, h).data;
  const gap = 2;
  const raw: number[] = [];
  for (let y = 0; y < h; y += gap)
    for (let x = 0; x < w; x += gap) if (data[(y * w + x) * 4 + 3] > 140) raw.push(x, y);

  const maxText = mobile ? 5200 : 14000;
  const textCount = Math.min(maxText, raw.length / 2);
  // Pick textCount points spread evenly over the sampled grid
  const stride = raw.length / 2 / textCount;
  const dustCount = mobile ? 700 : 1800;
  const count = textCount + dustCount;

  const target = new Float32Array(count * 3);
  const start = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const dust = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const s = Math.random();
    seed[i] = s;
    if (i < textCount) {
      const k = Math.floor(i * stride) * 2;
      target[i * 3] = raw[k] - w / 2 + (Math.random() - 0.5) * gap;
      target[i * 3 + 1] = h / 2 - raw[k + 1] + (Math.random() - 0.5) * gap;
    } else {
      dust[i] = 1;
      target[i * 3] = (Math.random() - 0.5) * w * 1.1;
      target[i * 3 + 1] = (Math.random() - 0.5) * h * 1.1;
    }
    target[i * 3 + 2] = 0;
    // Start positions: a spiral vortex far outside the screen
    const a = s * Math.PI * 14 + Math.random() * 0.6;
    const r = Math.max(w, h) * (0.6 + Math.random() * 0.9);
    start[i * 3] = Math.cos(a) * r;
    start[i * 3 + 1] = Math.sin(a) * r;
    start[i * 3 + 2] = 0;
  }
  return { target, start, seed, dust, count };
}

export async function createHeroGL(canvas: HTMLCanvasElement, opts: { mobile: boolean; lines: string[] }): Promise<HeroGL> {
  try {
    await document.fonts.load(`900 120px Unbounded`);
  } catch {
    /* fall back to a system font */
  }

  const host = canvas.parentElement!;
  let w = host.clientWidth;
  let h = host.clientHeight;
  const pr = Math.min(window.devicePixelRatio || 1, 1.5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(pr);
  renderer.setSize(w, h, false);
  renderer.setClearColor(0x000000, 1);

  const camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, -2000, 2000);
  const scene = new THREE.Scene();

  const uniforms = {
    uTime: { value: 0 },
    uAssemble: { value: 0 },
    uScatter: { value: 0 },
    uChaos: { value: 0 },
    uPR: { value: pr },
    uSize: { value: opts.mobile ? 2.8 : 2.9 },
    uForce: { value: 0 },
    uMouse: { value: new THREE.Vector2(9999, 9999) },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: particleVert,
    fragmentShader: particleFrag,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  let geometry = new THREE.BufferGeometry();
  const build = () => {
    const p = samplePoints(w, h, opts.lines, opts.mobile);
    geometry.dispose();
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(p.target, 3));
    geometry.setAttribute("aStart", new THREE.BufferAttribute(p.start, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(p.seed, 1));
    geometry.setAttribute("aDust", new THREE.BufferAttribute(p.dust, 1));
    points.geometry = geometry;
  };
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);
  build();

  // Post pass
  let rt = new THREE.WebGLRenderTarget(w * pr, h * pr, { depthBuffer: false });
  const post = {
    tDiffuse: { value: rt.texture },
    uTime: { value: 0 },
    uRGB: { value: 0 },
    uGlitch: { value: 0 },
    uRes: { value: new THREE.Vector2(w * pr, h * pr) },
  };
  const postScene = new THREE.Scene();
  const postCam = new THREE.Camera();
  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ vertexShader: postVert, fragmentShader: postFrag, uniforms: post, depthTest: false, depthWrite: false })
  );
  postScene.add(quad);

  // State
  let assembleStart = -1;
  let scatter = 0;
  let chaos = 0;
  let chaosTarget = 0;
  let glitch = 0;
  let nextGlitch = 2.5;
  let forceTarget = 0;
  const mouse = new THREE.Vector2(9999, 9999);
  const mouseTarget = new THREE.Vector2(9999, 9999);
  let lastMx = 0;
  let lastMy = 0;
  let vel = 0;

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = r.height / 2 - (e.clientY - r.top);
    if (mouseTarget.x > 9000) mouse.set(x, y);
    mouseTarget.set(x, y);
    vel = Math.min(1, vel + Math.hypot(e.clientX - lastMx, e.clientY - lastMy) / 120);
    lastMx = e.clientX;
    lastMy = e.clientY;
    forceTarget = 1;
  };
  const onLeave = () => (forceTarget = 0);
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave);

  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
  io.observe(canvas);

  let resizeT = 0;
  const onResize = () => {
    clearTimeout(resizeT);
    resizeT = window.setTimeout(() => {
      const nw = host.clientWidth;
      const nh = host.clientHeight;
      // Mobile URL-bar height jitter: ignore small height-only changes
      if (nw === w && Math.abs(nh - h) < 120) return;
      w = nw;
      h = nh;
      renderer.setSize(w, h, false);
      camera.left = -w / 2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();
      rt.dispose();
      rt = new THREE.WebGLRenderTarget(w * pr, h * pr, { depthBuffer: false });
      post.tDiffuse.value = rt.texture;
      post.uRes.value.set(w * pr, h * pr);
      build();
    }, 180);
  };
  window.addEventListener("resize", onResize);

  // Own clock: elapsed time advances only while the scene renders
  const clock = { elapsedTime: 0, last: performance.now() };
  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const now = performance.now();
    const rawDt = (now - clock.last) / 1000;
    clock.last = now;
    if (!visible || document.hidden) return;
    const dt = Math.min(rawDt, 0.05);
    clock.elapsedTime += dt;
    const t = clock.elapsedTime;

    if (assembleStart >= 0) uniforms.uAssemble.value = Math.min(1, (t - assembleStart) / 2.2);
    mouse.lerp(mouseTarget, 1 - Math.pow(0.0008, dt));
    uniforms.uMouse.value.copy(mouse);
    uniforms.uForce.value += (forceTarget - uniforms.uForce.value) * (1 - Math.pow(0.01, dt));
    vel *= Math.pow(0.04, dt);
    chaos += (chaosTarget - chaos) * (1 - Math.pow(0.02, dt));

    // Random glitch pulses, more often in chaos mode
    if (t > nextGlitch) {
      glitch = 0.6 + Math.random() * 0.5;
      nextGlitch = t + (chaosTarget ? 0.4 + Math.random() * 1.2 : 2.5 + Math.random() * 4);
    }
    glitch *= Math.pow(0.02, dt);

    uniforms.uTime.value = t;
    uniforms.uScatter.value = scatter;
    uniforms.uChaos.value = chaos;
    post.uTime.value = t;
    post.uRGB.value = 0.25 + vel * 1.6 + scatter * 3 + chaos * 1.5;
    post.uGlitch.value = Math.min(1, glitch + chaos * 0.5 + scatter * 0.6);

    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCam);
  };
  loop();

  return {
    assemble() {
      assembleStart = clock.elapsedTime;
      glitch = 1;
    },
    setScatter(v) {
      scatter = v;
    },
    setChaos(on) {
      chaosTarget = on ? 1 : 0;
      glitch = 1;
    },
    pulse(strength = 1) {
      glitch = Math.max(glitch, strength);
    },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      quad.geometry.dispose();
      (quad.material as THREE.Material).dispose();
      rt.dispose();
      renderer.dispose();
    },
  };
}
