"use client";

import { useEffect, useRef } from "react";

/**
 * The strip inside the decision-gap band: scattered numbers resolving into a
 * single decision, drawn left to right.
 *
 * It carries the band's question rather than decorating it. The left third is
 * incoherent scatter — figures produced and nothing concluded. Through the
 * middle the field collapses onto a path. The right third is one bright line,
 * and a slow highlight travels along the resolved part so the eye reads the
 * direction of travel, not just the shape.
 *
 * It renders its own <canvas> and nothing else, so the markup drops
 * `<DecisionGapSignal />` inside `div.dg-signal` and never holds a ref. The
 * alternative — markup owns the canvas, this reaches in with a selector — only
 * buys a ref the section has no other use for, and makes the class name in two
 * files load-bearing instead of one.
 *
 * Deliberate, because each one is the cost of a thing like this:
 *
 * 1. The loop is gated by an IntersectionObserver on the section. An ungated
 *    rAF loop runs at 60fps for the entire page's lifetime over a 72px strip
 *    nobody is looking at; that, not the drawing, is what such a strip
 *    normally costs. `visibilitychange` stops it for a backgrounded tab too.
 * 2. The clock advances by clamped dt rather than reading the rAF timestamp
 *    directly, so coming back from a pause resumes where it stopped instead of
 *    teleporting the highlight and re-rolling the whole field.
 * 3. Nothing is allocated per frame. The field is four Float32Arrays filled
 *    once; colour varies through `globalAlpha` and two passes, because a
 *    per-point `rgba()` string is 168 strings a frame. The one gradient is
 *    rebuilt only when the width changes.
 *
 * Under prefers-reduced-motion it draws one static frame and never starts the
 * loop. That frame keeps the full scatter-to-line composition with the
 * highlight parked at the right edge: the left-to-right journey IS the
 * content, so a strip showing only the clean line would drop the argument
 * instead of stilling it. The media query is watched, not just read once.
 *
 * The CSS size stays the stylesheet's (72px desktop, 56px phone). This only
 * measures it and sizes the backing store — putting the height in JS too
 * would mean the breakpoint existing in two places and disagreeing.
 */

const POINTS = 240;

/* Literals, not custom properties: a canvas fill cannot take a var(), and
   resolving one through getComputedStyle is a style read per frame. These are
   --blue-light and a dimmer blue for the unresolved scatter. */
const RESOLVED = "#4A93C9";
const SCATTER = "#2E6D9E";

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
/* Where a point sits between raw number and decision. Flat until the first
   third, fully resolved before the last — smoothstep so neither end has a
   visible seam. */
const coherence = (t: number) => {
  const n = clamp01((t - 0.3) / 0.4);
  return n * n * (3 - 2 * n);
};

export default function DecisionGapSignal() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    /* The gate is the section, not the strip: by the time a 72px strip is
       itself intersecting there is no margin left to have started in. */
    const section = canvas.closest<HTMLElement>(".dg") ?? canvas;
    /* Hover is taken from the whole dark band. The strip is too short a
       target to aim at, and the band is what the pointer is actually over. */
    const band = canvas.closest<HTMLElement>(".dg-turn") ?? canvas;

    const phase = new Float32Array(POINTS);
    const rate = new Float32Array(POINTS);
    const swing = new Float32Array(POINTS);
    const size = new Float32Array(POINTS);
    for (let i = 0; i < POINTS; i++) {
      phase[i] = Math.random() * Math.PI * 2;
      rate[i] = 0.45 + Math.random() * 1.05;
      swing[i] = Math.random() * 2 - 1;
      size[i] = 1.2 + Math.random() * 1.1;
    }

    let w = 0;
    let h = 0;
    let fade: CanvasGradient | null = null;
    let clock = 0;
    let last = 0;
    let raf = 0;
    let fitTimer = 0;
    let px = -1;
    let py = -1;
    let inView = false;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* Rises to the right, with a shallow undulation so the resolution reads as
       a signal rather than a ruled line. */
    const pathY = (t: number) =>
      h * (0.55 - 0.18 * (1 - (1 - t) ** 3)) + Math.sin(t * 4.2 + 0.6) * h * 0.04;

    const draw = (head: number) => {
      if (!fade) return;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      /* One path, stroked twice: a wide transparent pass for bloom then the
         line itself. shadowBlur would cost a full-strip blur every frame. */
      ctx.beginPath();
      ctx.moveTo(0, pathY(0));
      for (let s = 1; s <= 64; s++) {
        const t = s / 64;
        ctx.lineTo(t * w, pathY(t));
      }
      ctx.strokeStyle = fade;
      ctx.globalAlpha = 0.1;
      ctx.lineWidth = 4.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      /* The travelling highlight, as short segments of rising alpha: one
         stroke cannot fade along its own length, and a second gradient per
         frame would allocate. It is multiplied by coherence, so it exists
         only where there is a line to travel along. */
      ctx.strokeStyle = RESOLVED;
      ctx.lineWidth = 1.8;
      for (let s = 0; s < 16; s++) {
        const t0 = head - 0.26 * (1 - s / 16);
        const t1 = head - 0.26 * (1 - (s + 1) / 16);
        if (t1 <= 0 || t0 >= 1) continue;
        const a = (s / 16) ** 2.4;
        ctx.globalAlpha = a * coherence(t1) * 0.85;
        ctx.beginPath();
        ctx.moveTo(clamp01(t0) * w, pathY(clamp01(t0)));
        ctx.lineTo(clamp01(t1) * w, pathY(clamp01(t1)));
        ctx.stroke();
      }

      /* Two passes so the scatter reads a dimmer blue than the resolution
         without composing a colour per point per frame. Squares, not arcs: at
         2px on a 72px strip the difference is invisible and fillRect needs no
         path. */
      for (let pass = 0; pass < 2; pass++) {
        ctx.fillStyle = pass ? RESOLVED : SCATTER;
        for (let i = 0; i < POINTS; i++) {
          const t = i / (POINTS - 1);
          const c = coherence(t);
          const x = t * w;
          /* Each point drifts on its own period, so the field never crosses
             the path in unison — that would read as a pulse, not as noise. */
          const y =
            pathY(t) + swing[i] * (1 - c) * h * 0.4 * Math.sin(clock * rate[i] + phase[i]);

          /* Measured on screen rather than reasoned about: at 0.16 base alpha
             and 0.8x size the scatter was the faintest thing in a strip whose
             entire subject is the scatter, so the left third read as empty
             navy and the piece looked like a plain underline. The noise now
             starts at 0.28 and is drawn no smaller than the resolution — it
             is quieter in colour, not in presence. */
          let a = 0.28 + 0.42 * c;
          let r = size[i] * (1.02 + 0.3 * c);

          const scan = Math.max(0, 1 - Math.abs(t - head) / 0.1) * c;
          a += scan * 0.45;
          r += scan * 0.9;

          /* Brightening rather than repulsion: pushing points off a path they
             are in the middle of joining fights the one thing the strip is
             saying. Light under the cursor adds to it instead. */
          if (px >= 0) {
            const dx = x - px;
            const dy = y - py;
            const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 72);
            a += near * 0.5;
            r += near * 1.1;
          }

          ctx.globalAlpha = Math.min(1, a) * (pass ? c : 1 - c);
          ctx.fillRect(x - r / 2, y - r / 2, r, r);
        }
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(now - last, 50) / 1000 : 0;
      last = now;
      clock += dt;
      draw(0.18 + ((clock * 0.19) % 1) * 1.1);
    };

    const start = () => {
      if (raf || !inView || document.hidden || mql.matches) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

        /* The strip is display:none in the stylesheet until this lands. That is
       the only honest gate: this component existing at all IS the signal that
       JS ran, and an undrawn canvas would otherwise be 72px of empty dark
       inside the approved band. It must be added BEFORE the first fit(), or
       the box measures 0 and nothing ever draws — which would hide the strip
       permanently rather than temporarily. Reduced motion keeps it: the
       static frame below is still something worth showing. */
    const strip = canvas.parentElement;
    strip?.classList.add("is-ready");

const fit = () => {
      const r = canvas.getBoundingClientRect();
      const nw = Math.round(r.width);
      const nh = Math.round(r.height);
      /* A strip taller than 200px means the stylesheet that owns this
         element's height is not applied, in which case its measurement is the
         backing store's own size and writing it back would compound. */
      if (!nw || !nh || nh > 200 || (nw === w && nh === h)) return;
      w = nw;
      h = nh;
      /* Capped at 2: beyond that the extra fill rate buys nothing a 2px dot
         can show. */
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      fade = ctx.createLinearGradient(0, 0, w, 0);
      fade.addColorStop(0, "rgba(46,109,158,0)");
      fade.addColorStop(0.34, "rgba(46,109,158,0)");
      fade.addColorStop(0.58, "rgba(74,147,201,0.45)");
      fade.addColorStop(1, "rgba(74,147,201,1)");

      /* Resizing a paused or reduced-motion strip must leave a correct frame
         behind, not a cleared canvas. */
      if (!raf) draw(1);
    };

    const onPref = () => {
      if (mql.matches) {
        stop();
        px = -1;
        py = -1;
        draw(1);
      } else {
        start();
      }
    };
    const onVis = () => {
      if (document.hidden) stop();
      else start();
    };
    const onMove = (e: PointerEvent) => {
      if (mql.matches || e.pointerType === "touch") return; // a tap is not a hover
      /* Measured per event rather than cached: the strip's viewport position
         changes with every scroll, and this is outside the frame loop. */
      const r = canvas.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
    };
    const onLeave = () => {
      px = -1;
      py = -1;
    };

    fit();

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) start();
        else stop();
      },
      { rootMargin: "120px 0px" }
    );
    io.observe(section);

    const ro = new ResizeObserver(() => {
      window.clearTimeout(fitTimer);
      fitTimer = window.setTimeout(fit, 120);
    });
    /* The parent, not the canvas: observing an element whose backing store
       this writes to is how a resize loop starts. */
    ro.observe(canvas.parentElement ?? canvas);

    mql.addEventListener("change", onPref);
    document.addEventListener("visibilitychange", onVis);
    band.addEventListener("pointermove", onMove);
    band.addEventListener("pointerleave", onLeave);

    return () => {
      strip?.classList.remove("is-ready");
      stop();
      window.clearTimeout(fitTimer);
      io.disconnect();
      ro.disconnect();
      mql.removeEventListener("change", onPref);
      document.removeEventListener("visibilitychange", onVis);
      band.removeEventListener("pointermove", onMove);
      band.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas className="dg-signal-canvas" ref={ref} />;
}
