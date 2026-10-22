"use client";

import { useEffect, useRef } from "react";
import { ASCENT, amplitude, curveY, guessTier, progressT, stepDown, type Tier } from "./ascent";

/**
 * The Ascent's WebGL layer: the maturity curve as a glowing line whose noise
 * damps as progress rises, with after-images that fan out while it is noisy
 * and fold into it when it is calm. Raw WebGL, one program, one 322-vertex
 * strip drawn 1 + echoes times — no three.js for a line.
 *
 * Loaded with next/dynamic only when the instrument nears the viewport. It
 * owns the clock, so it also places the DOM marker each frame (the marker has
 * to sit on the line, and the line moves with time).
 *
 * Degrades on its own: a first guess from device memory and cores, then a
 * measured probe of real frames; too slow steps high → mid → onFallback(),
 * which hands back to the instrument's static SVG.
 */

type Props = {
  count: number;
  /** Read every frame, so dragging never re-renders React. */
  getProgress: () => number;
  /** 0..1 draw-in of the line, for the entrance. */
  getReveal: () => number;
  reduced: boolean;
  marker: React.RefObject<HTMLSpanElement>;
  onReady: () => void;
  /** Hands back to the SVG; `reason` lands on the instrument as data-fallback. */
  onFallback: (reason: string) => void;
};

/* The vertex shader rebuilds the curve from `t` alone. baseY and noise are
   ascent.ts's functions transcribed — keep the two in step. The strip's two
   sides are offset along the normal, found by sampling the curve a hair
   ahead (cheaper and steadier than differentiating three sines). */
const VERT = `
attribute vec2 aVert; // x: t along the line 0..1, y: side -1|1
uniform vec2 uRes;
uniform float uAmp, uTime;
// Shared with the fragment shader, so it must match its precision exactly
// (GLSL ES 1.0 refuses to link a uniform declared at two precisions).
uniform mediump float uWidth;
varying float vSide, vT;
float baseY(float t){ float s = t*t*(3.0-2.0*t); return 0.14 + 0.66*(0.3*t + 0.7*s); }
float n3(float t, float k){
  return 0.5*sin(17.0*t + 1.3*k) + 0.3*sin(31.0*t - 2.1*k + 1.7) + 0.2*sin(53.0*t + 0.7*k + 4.1);
}
vec2 at(float t){ return vec2(t*uRes.x, (1.0 - (baseY(t) + n3(t, uTime)*uAmp)) * uRes.y); }
void main(){
  float t = aVert.x;
  vec2 p = at(t);
  vec2 d = normalize(at(t + 0.002) - p);
  vec2 q = p + vec2(-d.y, d.x) * aVert.y * uWidth * 0.5;
  gl_Position = vec4(q.x/uRes.x*2.0 - 1.0, 1.0 - q.y/uRes.y*2.0, 0.0, 1.0);
  vSide = aVert.y; vT = t;
}`;

/* A crisp core plus a gaussian glow, measured in CSS px from the centreline.
   The travelled stretch (t < uMark) is brand blue; the road ahead is pale.
   Premultiplied output to match the blend func. */
const FRAG = `
precision mediump float;
uniform float uWidth, uCore, uMark, uAlpha, uReveal, uGlow;
uniform vec3 uColor, uAhead;
varying float vSide, vT;
void main(){
  float px = abs(vSide) * uWidth * 0.5;
  float core = 1.0 - smoothstep(uCore*0.5, uCore*0.5 + 1.0, px);
  float s = uWidth * 0.2;
  float glow = exp(-px*px / (2.0*s*s)) * 0.3 * uGlow;
  float done = 1.0 - smoothstep(uMark - 0.004, uMark + 0.004, vT);
  vec3 col = mix(uAhead, uColor, done);
  float a = (core * mix(0.6, 1.0, done) + glow * done) * uAlpha;
  a *= 1.0 - smoothstep(uReveal - 0.03, uReveal, vT);
  gl_FragColor = vec4(col * a, a);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
}

export default function AscentScene({ count, getProgress, getReveal, reduced, marker, onReady, onFallback }: Props) {
  const host = useRef<HTMLDivElement>(null);
  /* Callbacks in refs, so a parent re-render never tears the context down. */
  const cb = useRef({ onReady, onFallback, getProgress, getReveal });
  cb.current = { onReady, onFallback, getProgress, getReveal };

  useEffect(() => {
    /* A fresh canvas per effect run. Cleanup loses its context on purpose
       (that frees the GPU at once rather than at GC), and a lost context
       cannot be handed back: re-using one canvas would give a remount (React
       dev's double effect, a hot reload) a dead context. */
    const box = host.current;
    if (!box) return;
    const el = document.createElement("canvas");
    el.className = "mc-ascent-gl";
    box.appendChild(el);
    const nav = navigator as Navigator & { deviceMemory?: number };
    const gl = el.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "low-power" });
    let tier: Tier = guessTier(!!gl, nav.deviceMemory, nav.hardwareConcurrency);
    if (!gl || tier === "low") {
      cb.current.onFallback(gl ? "low-tier" : "no-webgl");
      el.remove();
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) {
      cb.current.onFallback("shader");
      el.remove();
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      cb.current.onFallback("link");
      el.remove();
      return;
    }
    gl.useProgram(prog);

    const n = ASCENT.segments;
    const verts = new Float32Array((n + 1) * 4);
    for (let i = 0; i <= n; i++) verts.set([i / n, -1, i / n, 1], i * 4);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aVert");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(prog, name);
    const U = {
      res: u("uRes"), amp: u("uAmp"), time: u("uTime"), width: u("uWidth"), core: u("uCore"),
      mark: u("uMark"), alpha: u("uAlpha"), reveal: u("uReveal"), glow: u("uGlow"),
      color: u("uColor"), ahead: u("uAhead"),
    };
    gl.uniform3fv(U.color, ASCENT.color);
    gl.uniform3fv(U.ahead, ASCENT.ahead);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let w = 0, h = 0;
    const size = () => {
      const r = el.getBoundingClientRect();
      w = r.width;
      h = r.height;
      const dpr = Math.min(window.devicePixelRatio || 1, ASCENT.dpr[tier === "high" ? "high" : "mid"]);
      el.width = Math.max(1, Math.round(w * dpr));
      el.height = Math.max(1, Math.round(h * dpr));
      gl.viewport(0, 0, el.width, el.height);
      dirty = true;
    };

    let raf = 0, visible = false, dirty = true, ready = false;
    let clock = 0, last = performance.now();
    let probe = 0, probeSum = 0;
    let lastP = NaN, lastR = NaN;

    const draw = (p: number, reveal: number) => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.amp, amplitude(p, count));
      gl.uniform1f(U.mark, progressT(p, count));
      gl.uniform1f(U.reveal, reveal * 1.03);
      gl.uniform1f(U.width, ASCENT.glow);
      gl.uniform1f(U.core, ASCENT.core);
      const echoes = ASCENT.echoes.slice(0, ASCENT.echoCount[tier === "high" ? "high" : "mid"]);
      /* After-images first, under the line; thinner and glowless so they
         read as traces of where the line was, not as more lines. */
      gl.uniform1f(U.glow, 0);
      for (const e of echoes) {
        gl.uniform1f(U.time, clock - e.lag);
        gl.uniform1f(U.alpha, e.alpha);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, (n + 1) * 2);
      }
      gl.uniform1f(U.glow, 1);
      gl.uniform1f(U.time, clock);
      gl.uniform1f(U.alpha, 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, (n + 1) * 2);

      const m = marker.current;
      if (m) {
        const t = progressT(p, count);
        const y = (1 - curveY(t, p, count, clock)) * h;
        m.style.transform = `translate3d(${(t * w).toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        m.style.opacity = reveal >= t ? "1" : "0";
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(now - last, 100);
      last = now;
      const p = cb.current.getProgress();
      const r = cb.current.getReveal();
      if (!reduced) clock += dt / 1000;
      else if (!dirty && p === lastP && r === lastR) return; // nothing moved: skip the draw
      lastP = p;
      lastR = r;
      dirty = false;
      draw(p, r);
      if (!ready) {
        ready = true;
        cb.current.onReady();
      }
      /* The probe: real frame cost on this device, not a spec sheet. */
      if (!reduced && probe < ASCENT.probeFrames) {
        probe++;
        probeSum += dt;
        if (probe === ASCENT.probeFrames && probeSum / probe > ASCENT.slowFrameMs) {
          tier = stepDown(tier);
          if (tier === "low") {
            stop();
            cb.current.onFallback(`slow:${(probeSum / probe).toFixed(0)}ms`);
            return;
          }
          probe = probeSum = 0;
          size();
        }
      }
    };

    const start = () => {
      if (raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(el);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    const ro = new ResizeObserver(size);
    ro.observe(el);
    const onLost = (e: Event) => {
      e.preventDefault();
      stop();
      cb.current.onFallback("context-lost");
    };
    el.addEventListener("webglcontextlost", onLost);
    size();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      el.removeEventListener("webglcontextlost", onLost);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      el.remove();
    };
  }, [count, reduced, marker]);

  return <div ref={host} className="mc-ascent-host" aria-hidden="true" />;
}
