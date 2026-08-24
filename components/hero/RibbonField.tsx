"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's animated ribbon field.
 *
 * Diagonal bands of light sweep across a near-white ground, with the brand
 * blue bleeding through the middle of the run and a thin warm fringe on the
 * band edges — the same device as the reference, in the GAMCS palette.
 *
 * Three decisions that keep it cheap enough to run forever:
 *
 *  - It is drawn at a fixed 320px-wide backing store and stretched to fill by
 *    CSS. The upscale is a free bilinear blur, so the soft bleed costs nothing
 *    and the per-frame fill work is independent of screen size. A retina
 *    2x canvas here would be ~50x the pixels for a blurrier-looking result.
 *  - The only per-frame work is a phase increment and N gradient fills; no
 *    filters, no shadows, no per-pixel loops. `filter: blur()` lives on the
 *    element in CSS, so the GPU compositor applies it once, not the CPU.
 *  - It stops entirely when the hero is off screen, and paints exactly one
 *    frame under prefers-reduced-motion.
 */

/** Ribbon colours, front to back. Blue core, warm fringe, white body. */
const BLUE = "15,94,151";
const BLUE_LIGHT = "62,140,196";
const WARM = "242,194,48";

type Band = {
  /** position along the sweep axis, 0..1 */
  p: number;
  /** half-width of the band, in sweep units */
  w: number;
  /** 0 = plain light band, 1 = fully saturated blue core */
  heat: number;
  /** drift speed multiplier */
  v: number;
};

const W = 420; // backing-store width; height follows the element's aspect

export default function RibbonField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* A fixed cast of bands. Deterministic — no Math.random, so the hero looks
       the same on every load and in every screenshot. */
    const bands: Band[] = [
      { p: -0.10, w: 0.020, heat: 0.0, v: 0.90 },
      { p: -0.04, w: 0.013, heat: 0.0, v: 1.10 },
      { p: 0.02, w: 0.026, heat: 0.10, v: 0.80 },
      { p: 0.08, w: 0.011, heat: 0.0, v: 1.25 },
      { p: 0.13, w: 0.021, heat: 0.30, v: 0.95 },
      { p: 0.19, w: 0.014, heat: 0.0, v: 1.05 },
      { p: 0.24, w: 0.024, heat: 0.62, v: 0.85 },
      { p: 0.30, w: 0.010, heat: 0.0, v: 1.30 },
      { p: 0.35, w: 0.019, heat: 0.95, v: 1.00 },
      { p: 0.40, w: 0.013, heat: 0.0, v: 0.88 },
      { p: 0.45, w: 0.027, heat: 1.00, v: 1.15 },
      { p: 0.52, w: 0.011, heat: 0.0, v: 0.92 },
      { p: 0.57, w: 0.022, heat: 0.85, v: 1.08 },
      { p: 0.63, w: 0.015, heat: 0.0, v: 0.78 },
      { p: 0.68, w: 0.020, heat: 0.55, v: 1.20 },
      { p: 0.74, w: 0.012, heat: 0.0, v: 0.96 },
      { p: 0.79, w: 0.025, heat: 0.28, v: 1.02 },
      { p: 0.85, w: 0.013, heat: 0.0, v: 1.18 },
      { p: 0.90, w: 0.021, heat: 0.12, v: 0.86 },
      { p: 0.96, w: 0.016, heat: 0.0, v: 1.06 },
      { p: 1.02, w: 0.023, heat: 0.0, v: 0.94 },
      { p: 1.09, w: 0.012, heat: 0.0, v: 1.12 },
    ];

    let h = 200;
    let raf = 0;
    let running = false;
    let phase = 0;

    const size = () => {
      const rect = canvas.getBoundingClientRect();
      h = Math.max(1, Math.round((W * rect.height) / Math.max(1, rect.width)));
      canvas.width = W;
      canvas.height = h;
    };

    /*
     * The sweep axis runs bottom-left to top-right. Each band is a stripe
     * perpendicular to it, drawn as a parallelogram wide enough to cover the
     * canvas at any angle.
     */
    const TILT = 0.55; // how far a band leans across, as a fraction of height

    const paint = () => {
      const lean = h * TILT;
      const span = W + lean;

      ctx.fillStyle = "#EFEFEF";
      ctx.fillRect(0, 0, W, h);

      /*
       * Each band is drawn as an upright rectangle inside a sheared space, so
       * the gradient shears with it. Filling a leaning parallelogram with a
       * plain horizontal gradient does not work: past the lean the geometry
       * runs outside the gradient's span and clamps to its transparent end,
       * which renders every band as a triangle fading to nothing.
       *
       * The shear maps (x, y) -> (x - (lean/h)y + lean, y): no shift along the
       * bottom edge, a full lean along the top.
       */
      for (const b of bands) {
        const drift = (b.p + phase * b.v) % 1.35;
        const x = drift * span - lean * 0.6 - 0.18 * span;
        const halfW = b.w * span;
        const pulse = 0.5 + 0.5 * Math.sin(phase * 6.0 * b.v + b.p * 12);

        /* Colour concentrates through the middle of the run and washes out to
           near-white at both edges, the way the reference bleeds. */
        const centre = (x + lean * 0.5) / W;
        const falloff = Math.max(0, 1 - Math.abs(centre - 0.55) * 1.25);
        const heat = b.heat * (0.72 + 0.28 * pulse) * falloff;

        ctx.save();
        ctx.transform(1, 0, -lean / h, 1, lean, 0);

        const grad = ctx.createLinearGradient(x - halfW, 0, x + halfW, 0);
        if (heat > 0.015) {
          grad.addColorStop(0, "rgba(255,255,255,0)");
          grad.addColorStop(0.14, `rgba(${WARM},${0.16 * heat})`);
          grad.addColorStop(0.36, `rgba(${BLUE_LIGHT},${0.82 * heat})`);
          grad.addColorStop(0.54, `rgba(${BLUE},${0.95 * heat})`);
          grad.addColorStop(0.74, `rgba(${BLUE_LIGHT},${0.5 * heat})`);
          grad.addColorStop(0.9, `rgba(${WARM},${0.1 * heat})`);
          grad.addColorStop(1, "rgba(255,255,255,0)");
        } else {
          grad.addColorStop(0, "rgba(255,255,255,0)");
          grad.addColorStop(0.5, "rgba(255,255,255,1)");
          grad.addColorStop(1, "rgba(255,255,255,0)");
        }
        ctx.fillStyle = grad;
        ctx.fillRect(x - halfW, 0, halfW * 2, h);
        ctx.restore();
      }
    };

    const frame = () => {
      phase += 0.00035;
      paint();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reduce) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    size();
    paint(); // one frame immediately, so there is never an empty hero

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    io.observe(canvas);

    let rt = 0;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(() => {
        size();
        paint();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      io.disconnect();
      window.clearTimeout(rt);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="ribbon-field" aria-hidden="true">
      <canvas ref={canvasRef} className="ribbon-canvas" />
    </div>
  );
}
