"use client";

import { useEffect } from "react";
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
 */
export default function MotionLayer() {
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

    document.querySelectorAll<HTMLElement>("[data-lift]").forEach((el) => bind(el, -8));
    document.querySelectorAll<HTMLElement>("[data-press]").forEach((el) => bind(el, -2, 1.03));

    return () => {
      io.disconnect();
      cleanups.forEach((c) => c());
    };
  }, []);

  return null;
}
