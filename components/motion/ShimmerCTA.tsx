"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * KokonutUI-style primary CTA: a sheen that sweeps across the fill plus a soft
 * conic glow behind the pill. Renders as a real link so it stays accessible.
 */
export default function ShimmerCTA({
  href,
  children,
  className = "",
  cta,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  /** Analytics label, e.g. "hero" — reported as cta_location. */
  cta?: string;
}) {
  return (
    <Link
      href={href}
      className={`btn btn-shimmer ${className}`}
      data-cta={cta}
      data-press
    >
      <span className="btn-label">{children}</span>
    </Link>
  );
}
