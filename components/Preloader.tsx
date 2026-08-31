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

/** Spacing of the dot lattice, in px of the rasterised mark, and the dot's
    own radius. The dots are deliberately smaller than the spacing so they stay
    visibly separate: this reads as a mark built from pixels, not as a solid
    shape. 5px gives ~1,700 dots at the desktop size — four times the density
    of the coarse version, with the gaps kept. */
const DOT_SPACING = 5;
const DOT_R = 1.9;
/** Radius multipliers while a dot is still flying, so the scattered cloud has
    a mix of sizes (~2.4x between smallest and largest) that resolves to the
    even lattice as they land. */
const FLY_MIN = 0.55;
const FLY_MAX = 1.35;
/** Fraction of the dots present in the opening cloud. The rest arrive as it
    contracts. Packing the mark solid needs ~4,700 dots, but showing all of
    them scattered makes a dense blob; the cloud only has to read as a cloud,
    so it carries a third of them and the remainder fade up while still in
    flight — which is also what a contracting cloud would do anyway. */
const CLOUD_FRACTION = 0.34;
/** The mark's own tight viewBox, from GaLogo. */
const VB = { x: 72, y: 82, w: 183, h: 116.5 };

type Particle = {
  tx: number; ty: number;   // destination, relative to centre
  sx: number; sy: number;   // scattered origin, relative to centre
  r: number;                // radius once landed
  rf: number;               // radius while flying
  vis: number;              // local progress at which this dot fades up, 0 = in the opening cloud
  d: number;                // stagger, 0..1
  ph: number;               // drift phase
  gold: boolean;            // part of the swoosh
};

/**
 * Paint the mark into a context at `scale`.
 *
 * The A's counter is painted OVER the body in the colour symbol rather than cut
 * out of it, so drawing the body alone gives a solid A. Punching it with
 * `destination-out` is the difference between a legible mark and a blob — and
 * on the live canvas it clears to transparent, which is the navy panel.
 */
function paintMark(
  g: CanvasRenderingContext2D,
  scale: number,
  bodyFill: string,
  swooshFill: string
) {
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
  draw(GA_BODY, 146, 88, bodyFill);
  draw(GA_A_COUNTER, 201, 114, "#000000", "destination-out");
  draw(GA_SWOOSH, 109, 143, swooshFill);
}

/**
 * Rasterise the mark and place one dot per lattice cell that lands on it.
 *
 * The dots are smaller than the lattice spacing on purpose, so they never
 * touch: the mark should read as built from pixels rather than as a filled
 * shape. Each dot flies in at its own randomised size and settles to the even
 * lattice radius, so the scattered cloud has variety and the finished mark
 * does not.
 */
function packMark(width: number) {
  const scale = width / VB.w;
  const height = Math.round(VB.h * scale);
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const g = c.getContext("2d", { willReadFrequently: true });
  if (!g) return { pts: [] as Particle[], height };

  /* Pure red marks the swoosh: it survives scaling losslessly and is trivial
     to tell apart from the white body when reading pixels back. This colour
     never reaches the screen. */
  paintMark(g, scale, "#ffffff", "#ff0000");
  const { data } = g.getImageData(0, 0, width, height);

  const pts: Particle[] = [];
  for (let y = 0; y < height; y += DOT_SPACING) {
    for (let x = 0; x < width; x += DOT_SPACING) {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 128) continue;
      pts.push({
        tx: x - width / 2,
        ty: y - height / 2,
        r: DOT_R,
        rf: DOT_R * (FLY_MIN + Math.random() * (FLY_MAX - FLY_MIN)),
        /* Roughly half the dots are in the opening cloud; the rest fade up
           during the gather. At four times the old density the cloud would
           otherwise read as a solid disc rather than as scattered pixels. */
        vis: Math.random() < 0.5 ? 0 : 0.15 + Math.random() * 0.55,
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
    const { pts } = packMark(markWidth);
    /* Dots are drawn opaque into their own layer and that layer is composited
       once. Fading thousands of OVERLAPPING soft dots individually double-
       composites every overlap, so the packed mark mottles exactly while it is
       cross-fading to the vector — which is the one moment it must look
       solid. */
    const layer = document.createElement("canvas");
    const lctx = layer.getContext("2d");

    /* Each dot starts offset from ITS OWN target, not from a point in a disc
       shared by all of them.

       A shared disc is what the reference appears to do and it was the first
       attempt, but it balls up: every dot travels inward, so around 60% of the
       way there they are all crowded into a region smaller than the cloud and
       not yet spread into the letterforms, and the mark appears to emerge from
       a saturated blob. Offsetting from the target makes the cloud a blurred
       copy of the logo instead — it comes into focus rather than condensing,
       and the density never spikes. The offsets are large enough relative to
       the mark that it still opens as a round cloud with nothing readable in
       it. */
    const R = Math.min(markWidth * 0.6, Math.min(vw, vh) * 0.4);
    for (const p of pts) {
      const a = Math.random() * Math.PI * 2;
      const r = R * (0.35 + 0.65 * Math.pow(Math.random(), 0.6));
      p.sx = p.tx + Math.cos(a) * r;
      p.sy = p.ty + Math.sin(a) * r;
      /* Biased toward early, with a long tail. */
      p.d = Math.pow(Math.random(), 0.65) * 0.46;
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
      layer.width = canvas.width;
      layer.height = canvas.height;
      lctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener("resize", size);

    /* One tween target; the render loop reads it. Tweening 1,300 particles
       individually would allocate 1,300 tweens for what is one curve. */
    const S = { t: 0, alpha: 0, exit: 0 };
    /* Ease OUT, not in-out. With an in-out curve every dot crosses the crowded
       middle of its path at the same instant, and the cloud balls up into a
       saturated lump that the mark then emerges from. Easing out sends them off
       immediately and lands them on a long deceleration, so they spread along
       their paths and the mark assembles instead of condensing. */
    const ease = (x: number) => 1 - Math.pow(1 - x, 3);

    const render = () => {
      const now = performance.now() / 1000;
      ctx2d.clearRect(0, 0, vw, vh);
      ctx2d.save();
      /* The mark rides the exit. Left where it was, it is simply clipped away
         by the rising panel edge — the lift and the logo read as two unrelated
         things happening at once. Carrying it up with the panel, and letting it
         go once the panel is most of the way gone, makes the ending one
         gesture. */
      const exitRise = S.exit * vh * 0.22;
      const exitFade = 1 - Math.max(0, Math.min(1, (S.exit - 0.5) / 0.5));
      ctx2d.translate(vw / 2, vh / 2 - exitRise);

      /* The swoosh's yellow only arrives at the end, so the mark lands white
         and the accent picks out last. */
      const gold = Math.max(0, Math.min(1, (S.t - 0.78) / 0.22));
      const dotsAlpha = S.alpha;

      if (dotsAlpha > 0.004 && lctx) {
        lctx.clearRect(0, 0, vw, vh);
        lctx.save();
        lctx.translate(vw / 2, vh / 2);

        /* Real arcs, not stamped sprites. A 24px sprite scaled down to a ~4px
           dot is too big a step for the browser's filter and comes out as a
           hard 4x3 rectangle — measured, at 8x zoom. Arcs are round at any
           size, and batching them into one path per bucket is fewer draw calls
           than stamping was.

           Dots fading up mid-flight need their own alpha, which cannot share a
           fill, so opacity is quantised into a few buckets. At this dot size
           the banding is invisible and it keeps the frame to a dozen fills. */
        const BUCKETS = 6;
        const white: Path2D[] = [];
        const goldPaths: Path2D[] = [];
        for (let i = 0; i < BUCKETS; i++) {
          white.push(new Path2D());
          goldPaths.push(new Path2D());
        }

        for (const p of pts) {
          const local = Math.max(0, Math.min(1, (S.t - p.d) / (1 - p.d)));
          const e = ease(local);
          /* Squared, so the wobble is gone well before the dots land rather
             than trailing into the moment the logo settles. */
          const drift = (1 - e) * (1 - e) * 7;
          const x = p.sx + (p.tx - p.sx) * e + Math.sin(now * 0.9 + p.ph) * drift;
          const y = p.sy + (p.ty - p.sy) * e + Math.cos(now * 1.1 + p.ph) * drift;
          const r = p.rf + (p.r - p.rf) * e;
          /* Dots held back from the opening cloud fade up mid-flight. */
          const born = p.vis === 0 ? 1 : Math.max(0, Math.min(1, (e - p.vis) / 0.26));
          if (born <= 0) continue;
          const b = Math.min(BUCKETS - 1, Math.floor(born * BUCKETS));
          const path = p.gold && gold > 0 ? goldPaths[b] : white[b];
          path.moveTo(x + r, y);
          path.arc(x, y, r, 0, Math.PI * 2);
        }

        for (let i = 0; i < BUCKETS; i++) {
          lctx.globalAlpha = (i + 1) / BUCKETS;
          lctx.fillStyle = "#FEFEFE";
          lctx.fill(white[i]);
          lctx.fillStyle = "#F7E43A";
          lctx.fill(goldPaths[i]);
        }
        lctx.globalAlpha = 1;

        lctx.restore();
        ctx2d.globalAlpha = dotsAlpha;
        ctx2d.setTransform(1, 0, 0, 1, 0, 0);
        ctx2d.drawImage(layer, 0, 0);
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx2d.translate(vw / 2, vh / 2);
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



      /* 5. hold on the assembled mark until the page behind is genuinely
            ready */
      tl.addPause(">-0.05", () => {
        ready.then(() => {
          const wait = Math.max(0, MIN_ON_SCREEN - (Date.now() - started));
          window.setTimeout(() => tl.play(), wait);
        });
      });

      /* 6. the panel lifts — the BOTTOM inset is what grows, so the visible
            band stays anchored to the top and its lower edge travels upward.
            Growing the top inset instead (inset(100% 0 0 0)) anchors the last
            sliver at the bottom, which reads as the panel dropping away. */
      tl.to(root, {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.95,
        ease: "power2.inOut",
        onComplete: () => {
          cancelAnimationFrame(raf);
          release();
          setGone(true);
        },
      }, "+=0.35");
      /* Same curve, same start: the canvas needs the exit's progress to carry
         the mark, and reading it off the DOM tween every frame would not. */
      tl.to(S, { exit: 1, duration: 0.95, ease: "power2.inOut" }, "<");
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
