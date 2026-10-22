import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A horizontal marquee: the children scroll right-to-left in an endless loop
 * (client, 2026-10-22, for the tools logo cloud). Used as the demo uses it —
 * `<Marquee>{items}</Marquee>`.
 *
 * The track holds the children twice and slides by exactly half its width,
 * so the second copy lands where the first began and the loop has no seam.
 * The copy is aria-hidden: a screen reader hears each item once. The edges
 * fade out, hover pauses it, and under reduced motion it stops and the one
 * real copy wraps onto as many centred rows as it needs instead.
 */
export function Marquee({
  children,
  duration = "40s",
  className,
}: {
  children: ReactNode;
  /** One full loop. */
  duration?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        "motion-reduce:[mask-image:none]",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-max [animation:marquee_var(--marquee-duration)_linear_infinite]",
          "group-hover:[animation-play-state:paused]",
          "motion-reduce:w-full motion-reduce:[animation:none]",
        )}
        style={{ "--marquee-duration": duration } as CSSProperties}
      >
        <div className="flex shrink-0 items-center motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center">
          {children}
        </div>
        <div className="flex shrink-0 items-center motion-reduce:hidden" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Marquee;
