"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { preloader, site } from "@/lib/content/gamcs";

/**
 * First-paint overlay: three dots that resolve into the GA lockup, then a
 * wipe that lifts to reveal the hero.
 *
 * Rendered on the server so there is no flash of unstyled page before it
 * mounts. It plays on every full page load, by request — there is no session
 * memory. Client-side navigation does not replay it: this lives in the root
 * layout, which does not remount between routes, so once it has finished it
 * stays gone until the next real load.
 *
 * The mark is the GA lockup, not the platform logo cloud. The cloud is a
 * trust bar of third-party products (Power BI, SAP, AWS); parading vendor
 * logos on a loading screen reads as sponsorship, which is not something this
 * site should imply.
 *
 * The sequence: three dots fade in scattered, settle into an evenly spaced
 * row, then open out into the lockup — the mark scaling up from the middle
 * dot while the descriptor wipes in beneath it. Then the whole overlay lifts.
 *
 * Progress is still real: fonts, window load, and the hero's WebGL canvas
 * actually existing. Those gate the hand-off from the dots to the lockup, so
 * the animation cannot finish before the page behind it is ready, and a floor
 * on total on-screen time keeps it from flashing on a fast connection.
 */
const MIN_ON_SCREEN = 1200;

export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const dots = dotsRef.current;
    const lock = lockRef.current;
    if (!root || !dots || !lock) return;

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

    if (reduce) {
      /* No dots and no assembly: show the finished lockup and fade it. */
      gsap.set(dots, { autoAlpha: 0 });
      gsap.set(lock, { autoAlpha: 1 });
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
      return;
    }

    const ctx = gsap.context(() => {
      const dot = gsap.utils.toArray<HTMLElement>(dots.children);

      /* The dots ride an ellipse. Orbiting and then flattening that ellipse
         is what the reference actually does: as the vertical radius eases to
         zero the orbit becomes a horizontal row, so "tumbling" and "settling"
         are one continuous motion rather than two tweens stitched together.
         That continuity is the whole reason it reads as smooth. */
      const N = dot.length;
      const orbit = { angle: -Math.PI / 2, rx: 38, ry: 33, spread: 0, depth: 1 };

      const place = () => {
        for (let i = 0; i < N; i++) {
          const a = orbit.angle + (i * 2 * Math.PI) / N;
          /* spread blends from the orbit position to an evenly spaced row, so
             the landing is exact instead of wherever the angle happened to
             stop. */
          const ox = Math.cos(a) * orbit.rx;
          const oy = Math.sin(a) * orbit.ry;
          const rowX = (i - (N - 1) / 2) * 32;
          /* Size and brightness track the orbit: a dot at the near side of
             the ellipse is bigger and brighter than one at the far side. This
             is what makes it read as a tumble in space rather than a flat
             spin — the reference has it and its absence was most of why the
             first version looked mechanical. `depth` fades the effect out as
             the dots settle, so the row ends up uniform. */
          const near = (1 + Math.sin(a)) / 2;
          const k = orbit.depth;
          gsap.set(dot[i], {
            x: ox + (rowX - ox) * orbit.spread,
            y: oy * (1 - orbit.spread),
            scale: 1 + (0.62 + 0.5 * near - 1) * k,
            opacity: 1 - (1 - (0.55 + 0.45 * near)) * k,
          });
        }
      };

      gsap.set(lock, { autoAlpha: 0 });
      gsap.set(dots, { autoAlpha: 0 });
      place();

      const tl = gsap.timeline();

      /* 1. the cluster fades up as a whole — per-dot scale and opacity belong
            to `place()`, so animating them here would fight it. */
      tl.fromTo(dots, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "power2.out" });

      /* 2. a little over one revolution, decelerating the whole way */
      tl.to(orbit, {
        angle: orbit.angle + Math.PI * 2.4,
        duration: 2.0,
        ease: "power1.inOut",
        onUpdate: place,
      }, 0.15);

      /* 3. the ellipse flattens and the dots resolve onto the row. Overlaps
            the rotation, so there is never a moment of no motion. */
      tl.to(orbit, {
        ry: 0,
        rx: 32,
        spread: 1,
        depth: 0,
        duration: 1.15,
        ease: "power2.inOut",
        onUpdate: place,
      }, 1.25);

      /* 4. hold on the row until the page behind is genuinely ready */
      tl.addPause(">-0.05", () => {
        ready.then(() => {
          const wait = Math.max(0, MIN_ON_SCREEN - (Date.now() - started));
          window.setTimeout(() => tl.play(), wait);
        });
      });

      /* 5. the dots open into rings and expand away — the reference turns them
            into the counters of its letterforms; the GA mark has no matching
            counters, so they expand through it instead of pretending to. */
      tl.to(dot, {
        scale: 2.6,
        borderWidth: 6,
        backgroundColor: "rgba(254,254,254,0)",
        opacity: 0,
        duration: 0.85,
        ease: "power2.inOut",
        stagger: 0.06,
      });

      /* 6. the mark grows out of the same centre as they go */
      tl.fromTo(
        lock,
        { autoAlpha: 0, scale: 0.88 },
        { autoAlpha: 1, scale: 1, duration: 0.9, ease: "power3.out" },
        "-=0.62"
      );
      tl.fromTo(
        wordRef.current,
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power2.out" },
        "-=0.5"
      );

      /* 7. hold on the finished lockup, then lift */
      tl.to(root, {
        clipPath: "inset(100% 0 0 0)",
        duration: 0.9,
        ease: "power3.inOut",
        onComplete: () => {
          release();
          setGone(true);
        },
      }, "+=0.7");
    }, rootRef);

    return () => {
      ctx.revert();
      html.classList.remove("is-locked");
      document.body.style.paddingRight = prevPad;
    };
  }, []);

  if (gone) return null;

  return (
    <div className="preloader" ref={rootRef} role="presentation">
      {/* Announced once. The ticking number is hidden from assistive tech so
          it is not re-read on every frame. */}
      <span className="sr-only">{preloader.srLabel}</span>

      <div className="preloader-stage" aria-hidden="true">
        {/* The three dots and the lockup occupy the same cell, so the hand-off
            is a cross-fade in place rather than a jump between two layouts. */}
        <div className="pl-dots" ref={dotsRef}>
          <span />
          <span />
          <span />
        </div>

        <div className="pl-lockup" ref={lockRef}>
          <svg className="pl-mark" focusable="false">
            <use href="#ga-mark-light" />
          </svg>
          <span className="pl-word">
            <span ref={wordRef}>{preloader.wordmark}</span>
          </span>
        </div>
      </div>
      <span className="sr-only">{site.name}</span>
    </div>
  );
}
