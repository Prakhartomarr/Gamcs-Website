"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Bklit-style mini bar chart. Bars grow in once, driven by GSAP so the page
 * runs a single animation ticker; The reveal is triggered by a lightweight
 * IntersectionObserver.
 * With reduced motion (or no JS) the bars render at full height.
 */
export default function BklitBars({
  values,
  caption,
  className = "",
}: {
  values: number[];
  caption?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* IntersectionObserver rather than ScrollTrigger: a one-shot reveal does not
       need a scroll-measured trigger, and the observer keeps the work off the
       main thread. */
    let tween: gsap.core.Tween | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        tween = gsap.from(root.querySelectorAll("i"), {
          scaleY: 0,
          transformOrigin: "bottom",
          duration: 0.9,
          stagger: 0.07,
          ease: "back.out(1.6)",
        });
      },
      { threshold: 0.35 }
    );
    io.observe(root);

    return () => {
      io.disconnect();
      tween?.kill();
    };
  }, []);

  return (
    <div className={`bklit ${className}`} ref={ref}>
      {caption && <div className="cap">{caption}</div>}
      <div className="bars">
        {values.map((v, i) => (
          <i key={i} style={{ height: `${v}%` }} />
        ))}
      </div>
    </div>
  );
}
