"use client";
import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { LOGOS } from "@/components/ui/logo-clouds-utils/logos";

/**
 * Logo cloud with a staggered wipe.
 *
 * Four changes from the source component, each for a reason:
 *
 *  - imports from `motion/react`, not `framer-motion`. They are the same
 *    library (Framer Motion was renamed Motion); this project already ships
 *    `motion@13`, and installing `framer-motion` would bundle a second copy.
 *  - `w-18` / `sm:w-22.5` are Tailwind v4 spacing. This project is on v3,
 *    where both compile to nothing and the items collapse to auto width.
 *    Replaced with arbitrary values that resolve on v3.
 *  - the interval only runs while the row is on screen, matching how every
 *    other loop on this site behaves.
 *  - under prefers-reduced-motion the wipe never starts; the logos render
 *    at rest.
 */

export type LogoEntry = {
  icon: React.ReactNode;
  name?: string;
  id?: string;
};

export type LogoCloudSwapProps = {
  logos?: LogoEntry[];
  title?: string;
  subtitle?: string;
  interval?: number;
  stagger?: number;
  className?: string;
};

const WIPE_DURATION = 0.92;
const WIPE_TIMES = [0, 0.4, 1];

const DEFAULT_LOGOS: LogoEntry[] = LOGOS.map((l) => ({
  icon: <l.Icon className="h-8 w-8" style={{ color: l.color }} aria-hidden="true" />,
  name: l.name,
  id: l.name,
}));

function LogoItem({
  logo,
  index,
  isWaving,
  stagger,
  totalCount,
  onDone,
}: {
  logo: LogoEntry;
  index: number;
  isWaving: boolean;
  stagger: number;
  totalCount: number;
  onDone: () => void;
}) {
  return (
    <motion.div
      aria-label={logo.name ?? "Logo"}
      animate={
        isWaving
          ? {
              clipPath: ["inset(0 0% 0 0)", "inset(0 100% 0 0)", "inset(0 0% 0 0)"],
              filter: ["blur(0px)", "blur(8px)", "blur(0px)"],
              opacity: [1, 0.2, 1],
            }
          : { clipPath: "inset(0 0% 0 0)", filter: "blur(0px)", opacity: 1 }
      }
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
      onAnimationComplete={() => {
        if (isWaving && index === totalCount - 1) onDone();
      }}
      whileHover={{
        scale: 1.07,
        opacity: 1,
        filter: "blur(0px)",
        transition: { type: "spring", stiffness: 340, damping: 24 },
      }}
      className="flex w-[72px] shrink-0 cursor-default flex-col items-center gap-2 sm:w-[90px]"
    >
      <span className="flex h-9 w-9 items-center justify-center sm:h-10 sm:w-10">
        {logo.icon}
      </span>
      {logo.name && (
        <span className="select-none whitespace-nowrap text-[10px] font-medium tracking-wide text-muted-foreground sm:text-[11px]">
          {logo.name}
        </span>
      )}
    </motion.div>
  );
}

export default function LogoCloudSwap({
  logos = DEFAULT_LOGOS,
  title = "Trusted by the best companies",
  subtitle = "The world's most ambitious teams build with our platform.",
  interval = 3200,
  stagger = 0.11,
  className,
}: LogoCloudSwapProps) {
  const [waving, setWaving] = React.useState(false);
  const rootRef = React.useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    if (reduce) return;
    const root = rootRef.current;
    if (!root) return;

    let timer: number | undefined;
    const start = () => {
      if (timer) return;
      timer = window.setInterval(() => setWaving(true), interval);
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = undefined;
    };

    /* Costs nothing while the row is off screen, like every other loop here. */
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    io.observe(root);

    return () => {
      io.disconnect();
      stop();
    };
  }, [interval, reduce]);

  return (
    <section
      ref={rootRef}
      className={cn("w-full bg-background px-4 py-12 sm:py-16", className)}
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        {subtitle && <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      {/* 1240px with 32px gaps fits all ten at 90px on one row
          (10*90 + 9*32 = 1188). max-w-5xl wrapped them 7/3. */}
      <div className="mx-auto mt-10 max-w-[1240px] sm:mt-12">
        <div className="hidden items-center justify-center gap-4 sm:flex sm:flex-wrap sm:gap-5 md:gap-7 lg:gap-8">
          {logos.map((logo, i) => (
            <LogoItem
              key={logo.id ?? i}
              logo={logo}
              index={i}
              isWaving={waving}
              stagger={stagger}
              totalCount={logos.length}
              onDone={() => setWaving(false)}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 place-items-center gap-y-6 sm:hidden">
          {logos.map((logo, i) => (
            <LogoItem
              key={logo.id ?? i}
              logo={logo}
              index={i}
              isWaving={waving}
              stagger={stagger}
              totalCount={logos.length}
              onDone={() => setWaving(false)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
