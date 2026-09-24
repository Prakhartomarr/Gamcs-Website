"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Logo cloud swap — the published component, adapted for this project.
 *
 * Every so often a wave crosses the wall: each mark wipes away to the left
 * behind a blur and comes back, one a tenth of a second after the last. The
 * wipe's numbers are the published ones — 0.92s, keyframed at 0/0.4/1, easing
 * in and then out on [0.16, 1, 0.3, 1] — and so is the hover spring.
 *
 * What changed, and why:
 *
 *   - `motion/react`, not `framer-motion`. They are the same library under two
 *     names, and this project already ships `motion`; importing the other name
 *     would put a second animation runtime on the page.
 *   - One list, not two. The original renders every logo twice — a flex row
 *     for `sm:` and up, a three-column grid below it — and hides one with
 *     `hidden`/`sm:hidden`. That is every mark in the DOM twice, and on this
 *     site a mark is a next/image. The default `gridClassName` is both of its
 *     layouts on a single element.
 *   - The wave is a chain of timeouts, not `setInterval` + `onAnimationComplete`.
 *     The original fires on a fixed interval and only clears its flag when the
 *     last logo reports in, so a wave that runs longer than the interval
 *     (twenty-one marks at 0.11 stagger take 3.2s, which is the default
 *     interval) requests the next wave while the flag is still set — and the
 *     request is dropped. Here the wave's length is arithmetic, `interval` is
 *     the rest between waves, and waves cannot overlap.
 *   - It only waves while it is on screen, and never under
 *     `prefers-reduced-motion`.
 *   - No `aria-label` on the item. It sits on a plain div with no role, where
 *     ARIA does not expose it; the mark itself carries the name — here as the
 *     `alt` on its image.
 *   - `gridClassName`/`itemClassName`, so a caller with a fixed roster can
 *     hand it real columns, and `entrance`, which fades the wall up out of a
 *     blur the first time it is scrolled to.
 */

export type LogoEntry = {
  icon: React.ReactNode;
  name?: string;
  id?: string;
};

export type LogoCloudSwapProps = {
  logos: LogoEntry[];
  /** null drops it, for a section that carries its own heading */
  title?: string | null;
  subtitle?: string | null;
  /** the rest between waves, in ms */
  interval?: number;
  /** the delay from one mark's wipe to the next, in seconds */
  stagger?: number;
  className?: string;
  /** replaces the default layout: a 3-column grid on phones, a wrapping row above */
  gridClassName?: string;
  itemClassName?: string;
  /** the published component prints each name under its mark */
  showNames?: boolean;
  /** fade the marks up out of a blur when the wall first scrolls in */
  entrance?: boolean;
};

const WIPE_DURATION = 0.92;
const WIPE_TIMES = [0, 0.4, 1];

const REST = {
  clipPath: "inset(0 0% 0 0)",
  filter: "blur(0px)",
  opacity: 1,
} as const;

const WIPE = {
  clipPath: ["inset(0 0% 0 0)", "inset(0 100% 0 0)", "inset(0 0% 0 0)"],
  filter: ["blur(0px)", "blur(8px)", "blur(0px)"],
  opacity: [1, 0.2, 1],
};

function LogoItem({
  logo,
  index,
  isWaving,
  stagger,
  reduced,
  className,
  showName,
}: {
  logo: LogoEntry;
  index: number;
  isWaving: boolean;
  stagger: number;
  reduced: boolean;
  className?: string;
  showName: boolean;
}) {
  /* Two elements, because the two animations want the same properties — both
     move `filter` and `opacity`. The entrance blurs the outer one in as a
     variant the wall propagates; the wipe drives the inner one from its own
     `animate`. They cannot collide: a variant only propagates to a child that
     is itself a variant node, which motion defines as one carrying `variants`
     or an `animate` that names a variant (isControllingVariants). The inner
     div has neither — its `animate` is a target object — so the wall's variant
     never reaches it. */
  return (
    <motion.div
      variants={{
        hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 20, filter: "blur(12px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: reduced ? 0 : 1.2, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      className={cn("flex items-center justify-center px-2", className)}
    >
      <motion.div
        animate={isWaving ? WIPE : REST}
        transition={
          isWaving
            ? {
                clipPath: {
                  duration: WIPE_DURATION,
                  times: WIPE_TIMES,
                  ease: ["easeIn", [0.16, 1, 0.3, 1]],
                  delay: index * stagger,
                },
                filter: {
                  duration: WIPE_DURATION * 0.9,
                  times: WIPE_TIMES,
                  ease: "easeInOut" as const,
                  delay: index * stagger,
                },
                opacity: {
                  duration: WIPE_DURATION * 0.85,
                  times: WIPE_TIMES,
                  ease: "easeInOut" as const,
                  delay: index * stagger,
                },
              }
            : { duration: 0.3, ease: "easeOut" }
        }
        whileHover={{
          scale: 1.07,
          opacity: 1,
          filter: "blur(0px)",
          transition: { type: "spring", stiffness: 340, damping: 24 },
        }}
        className="flex shrink-0 cursor-default flex-col items-center gap-2"
      >
        <span className="flex items-center justify-center">{logo.icon}</span>
        {showName && logo.name && (
          <span className="select-none whitespace-nowrap text-[10px] font-medium tracking-wide text-muted-foreground sm:text-[11px]">
            {logo.name}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function LogoCloudSwap({
  logos,
  title = "Trusted by the best companies",
  subtitle = "The world's most ambitious teams build with our platform.",
  interval = 3200,
  stagger = 0.11,
  className,
  gridClassName,
  itemClassName,
  showNames = true,
  entrance = false,
}: LogoCloudSwapProps) {
  const reduced = useReducedMotion() ?? false;
  const wall = React.useRef<HTMLDivElement>(null);
  /* `once: false` — a wall that has scrolled away stops waving. */
  const inView = useInView(wall, { margin: "0px 0px -80px 0px" });
  const [waving, setWaving] = React.useState(false);

  /* How long one wave takes: the last mark starts after every stagger and then
     runs the full wipe. */
  const waveMs = ((logos.length - 1) * stagger + WIPE_DURATION) * 1000;

  React.useEffect(() => {
    if (reduced || !inView) {
      setWaving(false);
      return;
    }
    let t = window.setTimeout(function wave() {
      setWaving(true);
      t = window.setTimeout(() => {
        setWaving(false);
        t = window.setTimeout(wave, interval);
      }, waveMs);
    }, interval);
    return () => window.clearTimeout(t);
  }, [reduced, inView, interval, waveMs]);

  const items = logos.map((logo, i) => (
    <LogoItem
      key={logo.id ?? logo.name ?? i}
      logo={logo}
      index={i}
      isWaving={waving}
      stagger={stagger}
      reduced={reduced}
      className={itemClassName}
      showName={showNames}
    />
  ));

  return (
    <section className={cn("w-full bg-background px-4 py-12 sm:py-16", className)}>
      {(title || subtitle) && (
        <div className="mx-auto max-w-2xl text-center">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h2>
          )}
          {subtitle && <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}

      {/* `initial={false}` starts the wall at its resting state, so the
          entrance is a prop rather than a second branch of markup. */}
      <motion.div
        ref={wall}
        initial={entrance ? "hidden" : false}
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          visible: { transition: { staggerChildren: reduced ? 0 : 0.1 } },
          hidden: {},
        }}
        className={cn(
          gridClassName ??
            "grid grid-cols-3 place-items-center gap-y-6 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-6 md:gap-8 lg:gap-10",
          (title || subtitle) && "mt-10 sm:mt-12",
        )}
      >
        {items}
      </motion.div>
    </section>
  );
}
