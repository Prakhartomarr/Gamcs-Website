"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { preloader, site } from "@/lib/content/gamcs";

/**
 * First-paint overlay: a counter to 100, then a wipe that lifts to reveal the
 * hero.
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
 * Progress is real: fonts, window load, and the hero's WebGL canvas actually
 * existing. The counter eases to 90 while those resolve and only then
 * completes, with a floor on total on-screen time so it never flashes.
 */
const MIN_ON_SCREEN = 1200;

export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const num = numRef.current;
    if (!root || !num) return;

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
      let tries = 0;
      const poll = () => {
        if (document.querySelector(".hero-shader canvas, .hero-shader-fallback")) return resolve();
        if (++tries > 120) return resolve(); // ~4s ceiling; never hang on it
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
      ready.then(() => {
        const wait = Math.max(0, MIN_ON_SCREEN - (Date.now() - started));
        window.setTimeout(() => {
          num.textContent = "100";
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

    const counter = { n: 0 };
    const ctx = gsap.context(() => {
      /* Ease to 90 while the real signals resolve, then finish. */
      gsap.to(counter, {
        n: 90,
        duration: 1.6,
        ease: "power2.out",
        onUpdate: () => {
          num.textContent = String(Math.round(counter.n)).padStart(3, "0");
        },
      });

      ready.then(() => {
        const wait = Math.max(0, MIN_ON_SCREEN - (Date.now() - started));
        gsap.to(counter, {
          n: 100,
          duration: 0.35,
          delay: wait / 1000,
          ease: "power2.inOut",
          onUpdate: () => {
            num.textContent = String(Math.round(counter.n)).padStart(3, "0");
          },
          onComplete: () => {
            gsap.to(root, {
              /* wipe upward off the top edge */
              clipPath: "inset(100% 0 0 0)",
              duration: 0.85,
              delay: 0.2,
              ease: "power3.inOut",
              onComplete: () => {
                release();
                setGone(true);
              },
            });
          },
        });
      });
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

      <div className="preloader-inner" aria-hidden="true">
        <span className="preloader-edge">{preloader.label}</span>

        <span className="preloader-mark">
          <span className="preloader-ga">GA</span>
          <span className="preloader-rule" />
          <span className="preloader-count">
            <span ref={numRef}>000</span>%
          </span>
        </span>

        <span className="preloader-edge is-right">{preloader.label}</span>
      </div>
      <span className="sr-only">{site.name}</span>
    </div>
  );
}
