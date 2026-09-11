"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * A strip that scrolls its children in a seamless loop.
 *
 * From ibelick's InfiniteSlider (motion-primitives), adapted for this project:
 *
 *   - `speed` / `speedOnHover` are px per second — the API LogoCloud calls.
 *     The duration-based version this was pasted from accepted neither prop,
 *     so both were silently ignored.
 *   - motion/react rather than framer-motion. `motion` is already a dependency
 *     and is the same library, so the page ships one animation runtime, not two.
 *   - a ResizeObserver rather than react-use-measure: the same measurement,
 *     without the package.
 *   - the second copy that closes the loop is aria-hidden, so a screen reader
 *     hears each item once.
 *   - prefers-reduced-motion gets no motion at all: the items render once,
 *     wrapped and centred, rather than as a frozen strip with most of them
 *     clipped off. It is read in an effect, so the server render and the first
 *     client render always agree.
 */
export type InfiniteSliderProps = {
  children: ReactNode;
  gap?: number;
  /** px per second */
  speed?: number;
  /** px per second while the pointer is over the strip; omit to keep `speed` */
  speedOnHover?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  speed = 100,
  speedOnHover,
  direction = "horizontal",
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);
  const [reduced, setReduced] = useState(false);
  const translation = useMotionValue(0);
  const horizontal = direction === "horizontal";

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduced(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setSize(horizontal ? entry.contentRect.width : entry.contentRect.height)
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [horizontal, reduced]);

  useEffect(() => {
    if (reduced || !size) return;
    /* One copy plus one gap: after this distance the strip looks identical. */
    const period = (size + gap) / 2;
    const from = reverse ? -period : 0;
    const to = reverse ? 0 : -period;
    const controls = isTransitioning
      ? /* speed changed mid-lap: finish this lap at the new speed, then restart */
        animate(translation, [translation.get(), to], {
          ease: "linear",
          duration: Math.abs(translation.get() - to) / currentSpeed,
          onComplete: () => {
            setIsTransitioning(false);
            setKey((k) => k + 1);
          },
        })
      : animate(translation, [from, to], {
          ease: "linear",
          duration: period / currentSpeed,
          repeat: Infinity,
          repeatType: "loop",
          repeatDelay: 0,
          onRepeat: () => translation.set(from),
        });
    return () => controls.stop();
  }, [key, translation, currentSpeed, size, gap, isTransitioning, reverse, reduced]);

  if (reduced) {
    return (
      <div
        className={cn("flex flex-wrap items-center justify-center", className)}
        style={{ gap: `${gap}px` }}
      >
        {children}
      </div>
    );
  }

  const flow = { gap: `${gap}px`, flexDirection: horizontal ? "row" : "column" } as const;

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        ref={ref}
        className="flex w-max"
        style={{ ...(horizontal ? { x: translation } : { y: translation }), ...flow }}
        {...(speedOnHover
          ? {
              onHoverStart: () => {
                setIsTransitioning(true);
                setCurrentSpeed(speedOnHover);
              },
              onHoverEnd: () => {
                setIsTransitioning(true);
                setCurrentSpeed(speed);
              },
            }
          : {})}
      >
        {/* items-center: children of different heights share the strip's
            centre line instead of hanging from its top edge */}
        <div className="flex shrink-0 items-center" style={flow}>
          {children}
        </div>
        <div className="flex shrink-0 items-center" style={flow} aria-hidden="true">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
