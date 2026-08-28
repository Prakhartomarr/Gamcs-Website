"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { GA_A_COUNTER, GA_BODY, GA_SWOOSH } from "@/components/ui/GaLogo";
import { preloader, site } from "@/lib/content/gamcs";

/**
 * First-paint overlay: dots scattered across the screen that gather into the
 * GA monogram, hold, then the whole panel wipes up to reveal the hero.
 *
 * Rendered on the server so there is no flash of unstyled page before it
 * mounts. It plays on every full page load, by request — there is no session
 * memory. Client-side navigation does not replay it: this lives in the root
 * layout, which does not remount between routes, so once it has finished it
 * stays gone until the next real load.
 *
 * The dots do not resolve into the solid vector mark. They stay dots, which
 * is the same device as the dot-matrix wordmark in the footer — the page
 * opens and closes on the same idea.
 *
 * The targets are sampled from the real logo geometry rather than hand-placed:
 * GA_BODY and GA_SWOOSH are rasterised once into an offscreen canvas and the
 * lit cells of a grid become the particle destinations. So the shape cannot
 * drift from the brand mark, and changing the logo changes this automatically.
 *
 * Progress is still real: fonts, window load, and the hero's shader canvas
 * actually existing. Those gate the hand-off from "gathered" to "wipe", so the
 * animation cannot finish before the page behind it is ready, and a floor on
 * total on-screen time keeps it from flashing on a fast connection.
 */
const MIN_ON_SCREEN = 1200;

/** Sampling grid, in px of the rasterised mark. 10px gives ~450 dots at the
    desktop size — half what a 7px cell produced, and large enough that they
    read as dots rather than as a screened solid. */
const STEP = 10;
/** Dot radius while still flying, and once packed into the mark. The dots
    thicken as they land: held at the packed radius the cloud reads heavy while
    it is still scattered, and held at the flying radius the finished mark is
    airy rather than tightly set. Growing one into the other gets both.
    4 in a 10px cell leaves a ~2px gap — they still read as dots, but the mark
    sets tight. Past ~4.6 they merge and the A's counter starts to clog. */
const DOT_R_FLYING = 2.4;
const DOT_R_PACKED = 4;
/** The mark's own tight viewBox, from GaLogo. */
const VB = { x: 72, y: 82, w: 183, h: 116.5 };

type Particle = {
  tx: number; ty: number;   // destination, relative to centre
  sx: number; sy: number;   // scattered origin, relative to centre
  d: number;                // stagger, 0..1
  ph: number;               // drift phase
  gold: boolean;            // part of the swoosh
};

/**
 * Rasterise the mark and read its lit cells back as points.
 *
 * Only the two shapes the light lockup uses (`#ga-mark-light`) are drawn: the
 * body and the swoosh. The dozen slivers in the full colour symbol are
 * anti-aliasing artefacts of the original trace and would just add noise at
 * this density.
 */
function sampleMark(width: number) {
  const scale = width / VB.w;
  const height = Math.round(VB.h * scale);
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const g = c.getContext("2d", { willReadFrequently: true });
  if (!g) return { pts: [] as Particle[], height };

  const draw = (
    d: string,
    tx: number,
    ty: number,
    fill: string,
    op: GlobalCompositeOperation = "source-over"
  ) => {
    g.save();
    g.globalCompositeOperation = op;
    g.scale(scale, scale);
    g.translate(-VB.x, -VB.y);
    g.translate(tx, ty);
    g.fillStyle = fill;
    g.fill(new Path2D(d));
    g.restore();
  };
  /* Pure red marks the swoosh: it survives scaling losslessly and is trivial
     to tell apart from the white body when reading pixels back. The colour
     never reaches the screen. */
  draw(GA_BODY, 146, 88, "#ffffff");
  /* The A's counter is painted OVER the body in the colour symbol, not cut out
     of it, so sampling the body alone gives a solid A. Punching it here is the
     difference between a legible mark and a blob. */
  draw(GA_A_COUNTER, 201, 114, "#000000", "destination-out");
  draw(GA_SWOOSH, 109, 143, "#ff0000");

  const { data } = g.getImageData(0, 0, width, height);
  const pts: Particle[] = [];
  for (let y = 0; y < height; y += STEP) {
    for (let x = 0; x < width; x += STEP) {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 128) continue;
      pts.push({
        tx: x - width / 2,
        ty: y - height / 2,
        sx: 0, sy: 0, d: 0, ph: 0,
        gold: data[i + 1] < 120,
      });
    }
  }
  return { pts, height };
}

export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = Date.now();

    /* Lock scroll.
       On <body> alone this does nothing here: this site sets overflow-x on
       body, so body's overflow propagates to the viewport and the viewport
       keeps scrolling. The lock has to go on <html>. Padding compensates for
       the scrollbar the lock removes — the only thing that could shift
       layout. */
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    const html = document.documentElement;
    const prevPad = document.body.style.paddingRight;
    html.classList.add("is-locked");
    if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;

    const release = () => {
      html.classList.remove("is-locked");
      document.body.style.paddingRight = prevPad;
    };

    /* --- what "loaded" actually means here --- */
    const shaderUp = new Promise<void>((resolve) => {
      /* Only the homepage mounts the shader. Waiting for it anywhere else
         burned the full ceiling before the overlay would lift — measured at
         6.1s on /solutions and 6.9s on /team. */
      if (!document.querySelector(".hero")) return resolve();
      let tries = 0;
      const poll = () => {
        if (document.querySelector(".hero-shader canvas, .hero-shader-fallback")) return resolve();
        if (++tries > 60) return resolve(); // ~2s ceiling; never hang on a slow GPU
        window.setTimeout(poll, 33);
      };
      poll();
    });
    const windowLoad =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true }));
    const ready = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      windowLoad,
      shaderUp,
    ]);

    /* --- geometry --- */
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    const markWidth = Math.round(Math.min(360, vw * 0.62));
    const { pts } = sampleMark(markWidth);

    /* Scattered inside a disc roughly twice the width of the finished mark,
       not across the whole viewport: strewn edge to edge it read as wallpaper
       rather than as a thing that gathers. Clamped to the short side of the
       screen so the cloud never runs off a phone.

       The 0.75 exponent biases the draw toward the centre. sqrt (0.5) spreads
       dots evenly per unit AREA, which looks hollow because a disc's outer
       rings hold most of that area. */
    const R = Math.min(markWidth * 1.05, Math.min(vw, vh) * 0.44);
    for (const p of pts) {
      const a = Math.random() * Math.PI * 2;
      const r = R * Math.pow(Math.random(), 0.75);
      p.sx = Math.cos(a) * r;
      p.sy = Math.sin(a) * r;
      p.d = Math.random() * 0.34;
      p.ph = Math.random() * Math.PI * 2;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener("resize", size);

    /* One tween target; the render loop reads it. Tweening 1,300 particles
       individually would allocate 1,300 tweens for what is one curve. */
    const S = { t: 0, alpha: 0 };
    const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

    const render = () => {
      const now = performance.now() / 1000;
      ctx2d.clearRect(0, 0, vw, vh);
      ctx2d.save();
      ctx2d.translate(vw / 2, vh / 2);

      /* Two batched fills per frame — one path for the body, one for the
         swoosh — rather than a fillStyle change per dot. The swoosh's yellow
         only arrives at the end, so the mark lands white and the accent
         picks out last. */
      const gold = Math.max(0, Math.min(1, (S.t - 0.78) / 0.22));
      ctx2d.globalAlpha = S.alpha;

      for (let pass = 0; pass < 2; pass++) {
        ctx2d.beginPath();
        for (const p of pts) {
          if (p.gold !== (pass === 1)) continue;
          const local = Math.max(0, Math.min(1, (S.t - p.d) / (1 - p.d)));
          const e = ease(local);
          /* Drift decays as they gather, so the shape settles dead still
             instead of shimmering once it is formed. */
          const drift = (1 - e) * 7;
          const x = p.sx + (p.tx - p.sx) * e + Math.sin(now * 0.9 + p.ph) * drift;
          const y = p.sy + (p.ty - p.sy) * e + Math.cos(now * 1.1 + p.ph) * drift;
          const r = DOT_R_FLYING + (DOT_R_PACKED - DOT_R_FLYING) * e;
          ctx2d.moveTo(x + r, y);
          ctx2d.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx2d.fillStyle =
          pass === 1 && gold > 0
            ? `rgb(${Math.round(254 + (247 - 254) * gold)},${Math.round(254 + (228 - 254) * gold)},${Math.round(254 + (58 - 254) * gold)})`
            : "#FEFEFE";
        ctx2d.fill();
      }
      ctx2d.restore();
    };

    let raf = 0;
    const loop = () => {
      render();
      raf = requestAnimationFrame(loop);
    };

    if (reduce) {
      /* No scatter and no gathering: paint the assembled mark and lift. */
      S.t = 1;
      S.alpha = 1;
      render();
      ready.then(() => {
        const wait = Math.max(0, MIN_ON_SCREEN - (Date.now() - started));
        window.setTimeout(() => {
          gsap.to(root, {
            autoAlpha: 0,
            duration: 0.2,
            onComplete: () => {
              release();
              setGone(true);
            },
          });
        }, wait);
      });
      return () => {
        window.removeEventListener("resize", size);
        release();
      };
    }

    loop();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      /* 1. the scatter fades up where it lies */
      tl.to(S, { alpha: 1, duration: 0.45, ease: "power2.out" });

      /* 2. everything gathers. Overlaps the fade so there is never a frame of
            static dots waiting to move. */
      tl.to(S, { t: 1, duration: 1.5, ease: "power2.inOut" }, 0.25);

      /* 3. hold on the assembled mark until the page behind is genuinely
            ready */
      tl.addPause(">-0.05", () => {
        ready.then(() => {
          const wait = Math.max(0, MIN_ON_SCREEN - (Date.now() - started));
          window.setTimeout(() => tl.play(), wait);
        });
      });

      /* 4. the panel lifts — the BOTTOM inset is what grows, so the visible
            band stays anchored to the top and its lower edge travels upward.
            Growing the top inset instead (inset(100% 0 0 0)) anchors the last
            sliver at the bottom, which reads as the panel dropping away. */
      tl.to(root, {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.8,
        ease: "power3.inOut",
        onComplete: () => {
          cancelAnimationFrame(raf);
          release();
          setGone(true);
        },
      }, "+=0.45");
    }, rootRef);

    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
      window.removeEventListener("resize", size);
      html.classList.remove("is-locked");
      document.body.style.paddingRight = prevPad;
    };
  }, []);

  if (gone) return null;

  return (
    <div className="preloader" ref={rootRef} role="presentation">
      {/* Announced once. The animation itself is hidden from assistive tech. */}
      <span className="sr-only">{preloader.srLabel}</span>
      <canvas className="pl-canvas" ref={canvasRef} aria-hidden="true" />
      <span className="sr-only">{site.name}</span>
    </div>
  );
}
