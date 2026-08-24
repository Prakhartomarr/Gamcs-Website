"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
};

/**
 * CTA link with a subtle magnetic pull toward the cursor (max ~8px).
 * Disabled on touch devices and for reduced-motion users.
 */
export default function MagneticButton({ href, className = "", children }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const canMagnetize =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canMagnetize) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    const MAX = 8;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const relX = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const relY = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      xTo(gsap.utils.clamp(-1, 1, relX) * MAX);
      yTo(gsap.utils.clamp(-1, 1, relY) * MAX);
    };
    const reset = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", reset);
    };
  }, []);

  return (
    <a ref={ref} href={href} className={`magnetic ${className}`} data-cursor="button">
      <span className="magnetic-inner">{children}</span>
    </a>
  );
}
