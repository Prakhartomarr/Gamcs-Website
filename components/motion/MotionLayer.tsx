"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

/**
 * Page-wide motion: in-view reveals plus hover/press micro-interactions.
 *
 * Two deliberate choices, both measured:
 *
 * 1. Reveals use ONE IntersectionObserver and a CSS class. An earlier attempt
 *    used ScrollTrigger.batch, which created ~50 scroll-measured triggers and
 *    doubled style-recalc (298ms → 583ms in profiling) because it reads layout
 *    on the main thread. IntersectionObserver does that work off it, and the
 *    reveal itself is a plain CSS transition — no ticker involved at all.
 *
 * 2. Hover uses per-element pointerenter/leave on the ~15 interactive nodes,
 *    not document-level delegation. `pointerover` fires on every DOM boundary
 *    the pointer crosses, so delegation meant two `closest()` walks per event
 *    across the whole page; direct listeners fire only on the elements that
 *    actually animate.
 *
 * Both of those query the DOM once, which is only correct if this remounts
 * with the page. It does not — it sits in the root layout, which survives
 * client-side navigation. So it re-runs on `pathname`: without that, every
 * page reached by CLICKING kept its sections at opacity 0 (`.reveal` is
 * hidden until this observer marks it) and its buttons unbound. The result
 * was a blank-looking page and dead buttons on every route but the first one
 * loaded.
 *
 * A timer backstop reveals anything still hidden shortly after each run, so a
 * missed observation can never strand content invisible; CSS covers the
 * no-JS case separately.
 */
export default function MotionLayer() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
      return;
    }

    // --- reveals: one observer, CSS does the animating ---
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    // --- hover/press: GSAP owns transform; quickTo retargets on interruption ---
    const cleanups: (() => void)[] = [];
    const bind = (el: HTMLElement, y: number, scale?: number) => {
      const yTo = gsap.quickTo(el, "y", { duration: 0.25, ease: "power3" });
      const sTo = scale ? gsap.quickTo(el, "scale", { duration: 0.2, ease: "power3" }) : null;
      const enter = () => {
        yTo(y);
        sTo?.(scale!);
      };
      const leave = () => {
        yTo(0);
        sTo?.(1);
      };
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
      });
    };

    /* A distinct pressed state. Hover alone gave no acknowledgement of the
       click itself, so a button felt inert in the moment it was actually
       doing something. Pushes past the resting position, then releases back
       to hover. */
    const bindPress = (el: HTMLElement) => {
      const yTo = gsap.quickTo(el, "y", { duration: 0.12, ease: "power2" });
      const sTo = gsap.quickTo(el, "scale", { duration: 0.12, ease: "power2" });
      const down = () => {
        yTo(1);
        sTo(0.975);
      };
      const up = () => {
        yTo(-2);
        sTo(1.03);
      };
      const off = () => {
        yTo(0);
        sTo(1);
      };
      el.addEventListener("pointerdown", down);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", off);
      cleanups.push(() => {
        el.removeEventListener("pointerdown", down);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", off);
      });
    };

    document.querySelectorAll<HTMLElement>("[data-lift]").forEach((el) => bind(el, -8));
    document.querySelectorAll<HTMLElement>("[data-press]").forEach((el) => {
      bind(el, -2, 1.03);
      bindPress(el);
    });

    /* Backstop. An element that is never intersected — because it sits below a
       lazy image that has not sized yet, or the observer was set up mid-paint —
       would otherwise stay invisible for good. Content winning over animation
       is the right trade here. */
    const net = window.setTimeout(() => {
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("visible");
      });
    }, 1200);

    return () => {
      window.clearTimeout(net);
      io.disconnect();
      cleanups.forEach((c) => c());
      /* Reset transforms GSAP owns: the same node can be reused across routes,
         and a half-finished hover would otherwise persist into the next page. */
      gsap.set("[data-press],[data-lift]", { clearProps: "transform" });
    };
  }, [pathname]);

  return null;
}
