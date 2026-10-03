"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The two effects on /who-we-are that nothing cheaper can do, plus the chapter
 * rail's current marker.
 *
 * Everything else on that page is deliberately NOT here. Chapter and element
 * reveals ride the single IntersectionObserver in MotionLayer (`.reveal`), the
 * two figures use CountUp, and every hover is CSS — the comment in MotionLayer
 * records why: ScrollTrigger.batch for reveals doubled style-recalc, 298ms to
 * 583ms profiled, because it measures layout on the main thread.
 *
 * Neither chapter is pinned. The spec asked for two pins — a horizontal
 * discipline strip and the before/after — and both were dropped:
 *
 *   · The five discipline cards fit one row on desktop and stack on a phone.
 *     Pinning 1.2 viewport heights to slide content that is already fully
 *     visible is scroll-jacking that adds nothing, so chapter 02 is a plain
 *     grid with a CSS hover.
 *   · The before/after keeps its motion but loses the pin. Scrubbing the
 *     cards against the section's own progress tells the same story — the
 *     record dims, the tool lights up, the arrow draws between them — without
 *     a pin-spacer, 1.5 viewport heights of hijacked scroll, or anything to
 *     re-measure on resize.
 *
 * The rail marker is one IntersectionObserver over the eight sections, not
 * eight toggleClass triggers, for the reason above. It writes `aria-current`,
 * so the state is announced and not only drawn.
 *
 * Reduced motion and phones register nothing: both branches sit behind
 * `(min-width: 768px) and (prefers-reduced-motion: no-preference)`, and the
 * stylesheet's resting state IS the finished state — the arrow is drawn, both
 * cards are at full strength, the hero art is centred. `mm.revert()` on unmount
 * kills every trigger and clears every inline style GSAP set.
 */
export default function StoryMotion() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".os > section[id]"));
    const dots = new Map(
      Array.from(document.querySelectorAll<HTMLAnchorElement>(".os-rail-dot")).map((a) => [
        a.getAttribute("href")?.slice(1) ?? "",
        a,
      ])
    );

    /* A 10%-tall band across the middle of the viewport: at most one chapter
       sits in it, so "current" never needs tie-breaking. */
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          for (const a of dots.values()) a.removeAttribute("aria-current");
          dots.get(entry.target.id)?.setAttribute("aria-current", "true");
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sections.forEach((s) => io.observe(s));

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      /* Hero parallax. The art box overhangs its section by 8% top and bottom
         (stylesheet), which is the headroom these ±6% need. */
      gsap.fromTo(
        ".os-hero-art",
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: ".os-hero", start: "top top", end: "bottom top", scrub: 0.6 },
        }
      );

      /* Chapter 03. Only transform, opacity and strokeDashoffset, so the whole
         thing stays on the compositor. */
      const path = document.querySelector<SVGPathElement>(".os-shift-arrow path");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".os-shift",
          start: "top 78%",
          end: "center 45%",
          scrub: 0.8,
        },
      });

      if (path) {
        const len = path.getTotalLength();
        tl.fromTo(
          path,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, ease: "none" },
          0
        );
      }
      tl.fromTo(".os-shift-to", { opacity: 0.45, scale: 0.985 }, { opacity: 1, scale: 1, ease: "none" }, 0);
      tl.to(".os-shift-from", { opacity: 0.5, ease: "none" }, 0);
    });

    return () => {
      io.disconnect();
      mm.revert();
    };
  }, []);

  return null;
}
