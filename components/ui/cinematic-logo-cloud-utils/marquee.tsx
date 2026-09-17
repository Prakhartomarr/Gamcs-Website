"use client";

import type { ReactNode } from "react";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils";

/**
 * The looping strip the marquee variants of CinematicLogoCloud ask for.
 *
 * The published component ships its own marquee; this one wraps the
 * InfiniteSlider already in the project instead, so the page keeps ONE looping
 * implementation — the one that measures with a ResizeObserver, hands the
 * duplicate copy to aria-hidden, and renders the items once (wrapped) under
 * prefers-reduced-motion. `speed` stays the component's own prop, in px/s.
 */
export type MarqueeProps = {
  children: ReactNode;
  /** px per second */
  speed?: number;
  gap?: number;
  reverse?: boolean;
  className?: string;
};

export function Marquee({
  children,
  speed = 35,
  gap = 24,
  reverse = false,
  className,
}: MarqueeProps) {
  return (
    <InfiniteSlider
      speed={speed}
      /* Slowing rather than stopping: a stopped strip reads as broken. */
      speedOnHover={Math.max(8, Math.round(speed / 3))}
      gap={gap}
      reverse={reverse}
      className={cn(
        "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className
      )}
    >
      {children}
    </InfiniteSlider>
  );
}

export default Marquee;
