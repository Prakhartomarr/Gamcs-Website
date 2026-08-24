"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Counts a published figure up from zero when it scrolls into view.
 *
 * The real value is rendered on the server, so it is correct with JS off,
 * for crawlers, and under prefers-reduced-motion — the animation only ever
 * replaces text that is already there. Prefix and suffix are preserved, so
 * "$525Mn" counts the 525 and keeps "$" and "Mn", and "10,000+" regains its
 * thousands separator on every frame.
 */
export default function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const parts = value.match(/^([^\d]*)([\d,]+)(.*)$/);
    if (!parts) return; // nothing numeric to count — leave the text alone
    const [, prefix, digits, suffix] = parts;
    const target = Number(digits.replace(/,/g, ""));
    if (!Number.isFinite(target)) return;
    const grouped = digits.includes(",");
    const render = (n: number) =>
      prefix + (grouped ? n.toLocaleString("en-US") : String(n)) + suffix;

    el.textContent = render(0);

    const counter = { n: 0 };
    let tween: gsap.core.Tween | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        tween = gsap.to(counter, {
          n: target,
          duration: 1.5,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = render(Math.round(counter.n));
          },
          /* snap back to the published string so formatting is never
             something this component invented */
          onComplete: () => {
            el.textContent = value;
          },
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      tween?.kill();
      el.textContent = value;
    };
  }, [value]);

  return <span ref={ref}>{value}</span>;
}
