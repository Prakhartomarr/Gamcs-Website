"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { preloader, site } from "@/lib/content/gamcs";

/**
 * First-paint overlay: three dots that resolve into the GA lockup, then a
 * wipe that lifts to reveal the hero.
 *
 * Rendered on the server so there is no flash of unstyled page before it
 * mounts. Repeat visits inside a session never see it at all — a blocking
 * inline script in the layout stamps `data-preloaded` on <html> before first
 * paint, and CSS hides this outright. Doing that in an effect instead would
 * show the overlay for a frame on every navigation.
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

    /* Already shown this session — the inline script has hidden it; just drop
       it from the tree without animating. */
    if (document.documentElement.hasAttribute("data-preloaded")) {
      setGone(true);
      return;
    }

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
      try {
        sessionStorage.setItem("gamcs_preloaded", "1");
      } catch {
        /* private mode — the overlay simply shows again next navigation */
      }
      document.documentElement.setAttribute("data-preloaded", "");
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

      /* Scattered starting offsets, in px from the row position. Fixed rather
         than random so the sequence is the same every time — a loading screen
         that plays differently on each visit reads as a glitch. */
      const scatter = [
        { x: -14, y: -18 },
        { x: 16, y: 12 },
        { x: -6, y: 22 },
      ];

      gsap.set(lock, { autoAlpha: 0 });
      gsap.set(dot, { scale: 0, autoAlpha: 0 });
      dot.forEach((d, i) => gsap.set(d, scatter[i]));

      const tl = gsap.timeline();

      /* 1. dots arrive, scattered */
      tl.to(dot, {
        scale: 1,
        autoAlpha: 1,
        duration: 0.5,
        ease: "back.out(2)",
        stagger: 0.11,
      });

      /* 2. they settle into the evenly spaced row */
      tl.to(dot, {
        x: 0,
        y: 0,
        duration: 0.75,
        ease: "power3.inOut",
        stagger: 0.05,
      }, "+=0.18");

      /* 3. hold on the row until the page behind is actually ready, and until
            the floor has elapsed. addPause keeps the timeline honest instead
            of guessing a duration. */
      tl.addPause("+=0.15", () => {
        ready.then(() => {
          const wait = Math.max(0, MIN_ON_SCREEN - (Date.now() - started));
          window.setTimeout(() => tl.play(), wait);
        });
      });

      /* 4. the row opens out into the lockup */
      tl.to(dot, {
        scale: 0,
        autoAlpha: 0,
        duration: 0.4,
        ease: "power2.in",
        stagger: 0.04,
      });
      tl.fromTo(
        lock,
        { autoAlpha: 0, scale: 0.94 },
        { autoAlpha: 1, scale: 1, duration: 0.6, ease: "power3.out" },
        "-=0.18"
      );
      /* the descriptor wipes in from the left beneath the mark */
      tl.fromTo(
        wordRef.current,
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 0.55, ease: "power2.out" },
        "-=0.32"
      );

      /* 5. hold, then lift the whole overlay off the top edge */
      tl.to(root, {
        clipPath: "inset(100% 0 0 0)",
        duration: 0.85,
        ease: "power3.inOut",
        onComplete: () => {
          release();
          setGone(true);
        },
      }, "+=0.55");
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
