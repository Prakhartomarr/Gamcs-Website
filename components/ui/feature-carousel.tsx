"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * 21st.dev feature-carousel, re-skinned for the platforms band: a rail of
 * category chips on a brand-blue panel spins to the active one while a card
 * stack on the right shows that category's logo grid. Autoplays every 3s,
 * pauses on hover/focus, and stays put under prefers-reduced-motion.
 */
export type CarouselItem = {
  id: string;
  /** Short label on the chip rail. */
  chip: string;
  /** Full name, shown on the card. */
  title: string;
  description: string;
  /** A rendered 18px icon (an element, so server components can pass it). */
  icon: ReactNode;
  tools: { name: string; src: string }[];
};

const AUTO_PLAY_INTERVAL = 3000;
const ITEM_HEIGHT = 65;

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export function FeatureCarousel({ items }: { items: CarouselItem[] }) {
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const len = items.length;

  const currentIndex = ((step % len) + len) % len;

  const nextStep = useCallback(() => setStep((prev) => prev + 1), []);

  const handleChipClick = (index: number) => {
    const diff = (index - currentIndex + len) % len;
    if (diff > 0) setStep((s) => s + diff);
  };

  useEffect(() => {
    if (isPaused || reduceMotion) return;
    const interval = setInterval(nextStep, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextStep, isPaused, reduceMotion]);

  const getCardStatus = (index: number) => {
    let diff = index - currentIndex;
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;
    if (diff === 0) return "active";
    if (diff === -1) return "prev";
    if (diff === 1) return "next";
    return "hidden";
  };

  const pause = {
    onMouseEnter: () => setIsPaused(true),
    onMouseLeave: () => setIsPaused(false),
    onFocus: () => setIsPaused(true),
    onBlur: () => setIsPaused(false),
  };

  return (
    <div className="mx-auto w-full max-w-7xl" {...pause}>
      <div className="relative flex min-h-[600px] flex-col overflow-hidden rounded-[2rem] border border-line lg:aspect-video lg:flex-row lg:rounded-[3rem]">
        {/* Chip rail */}
        <div className="relative z-30 flex min-h-[350px] w-full flex-col items-start justify-center overflow-hidden bg-gradient-to-br from-blue to-blue-dark px-6 md:min-h-[420px] md:px-16 lg:h-full lg:w-[42%] lg:pl-14">
          <div className="absolute inset-x-0 top-0 z-40 h-12 bg-gradient-to-b from-blue via-blue/80 to-transparent md:h-20 lg:h-16" />
          <div className="absolute inset-x-0 bottom-0 z-40 h-12 bg-gradient-to-t from-blue-dark via-blue-dark/80 to-transparent md:h-20 lg:h-16" />
          <div className="relative z-20 flex h-full w-full items-center justify-center lg:justify-start">
            {items.map((item, index) => {
              const isActive = index === currentIndex;
              const wrappedDistance = wrap(-(len / 2), len / 2, index - currentIndex);

              return (
                <motion.div
                  key={item.id}
                  style={{ height: ITEM_HEIGHT, width: "fit-content" }}
                  animate={{
                    y: wrappedDistance * ITEM_HEIGHT,
                    opacity: 1 - Math.abs(wrappedDistance) * 0.25,
                  }}
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 22, mass: 1 }}
                  className="absolute flex items-center justify-start"
                >
                  <button
                    type="button"
                    onClick={() => handleChipClick(index)}
                    aria-pressed={isActive}
                    tabIndex={Math.abs(wrappedDistance) > 2 ? -1 : 0}
                    className={cn(
                      "relative flex items-center gap-3 rounded-full border px-5 py-3.5 text-left transition-all duration-700 md:px-8 md:py-4",
                      isActive
                        ? "z-10 border-white bg-white text-blue"
                        : "border-white/20 bg-transparent text-white/70 hover:border-white/40 hover:text-white",
                    )}
                  >
                    <span aria-hidden className={cn("transition-colors duration-500", isActive ? "text-blue" : "text-white/50")}>
                      {item.icon}
                    </span>
                    <span className="whitespace-nowrap text-sm font-medium uppercase tracking-tight md:text-[15px]">
                      {item.chip}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Card stack */}
        <div className="relative flex min-h-[520px] flex-1 items-center justify-center overflow-hidden border-t border-line bg-soft px-6 py-14 md:min-h-[600px] md:px-12 lg:h-full lg:border-l lg:border-t-0 lg:px-10 lg:py-12">
          <div className="relative flex h-[540px] w-full max-w-[420px] sm:h-auto sm:aspect-[4/5] items-center justify-center" aria-live="polite">
            {items.map((item, index) => {
              const status = getCardStatus(index);
              const isActive = status === "active";
              const isSide = status === "prev" || status === "next";

              return (
                <motion.div
                  key={item.id}
                  initial={false}
                  animate={{
                    x: isActive ? 0 : status === "prev" ? -100 : status === "next" ? 100 : 0,
                    scale: isActive ? 1 : isSide ? 0.85 : 0.7,
                    opacity: isActive ? 1 : isSide ? 0.4 : 0,
                    rotate: status === "prev" ? -3 : status === "next" ? 3 : 0,
                    zIndex: isActive ? 20 : isSide ? 10 : 0,
                  }}
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 25, mass: 0.8 }}
                  aria-hidden={!isActive}
                  className={cn(
                    "absolute inset-0 flex origin-center flex-col overflow-hidden rounded-[2rem] border border-line bg-white p-6 shadow-[0_24px_60px_-28px_rgba(10,65,105,.35)] md:rounded-[2.5rem] md:p-8",
                    !isActive && "pointer-events-none",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-blue" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#5B6067]">
                      {String(index + 1).padStart(2, "0")} / {String(len).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold leading-tight tracking-tight text-ink md:text-2xl [text-wrap:balance]">
                    {item.title}
                  </h3>

                  <ul
                    className={cn(
                      "my-auto grid gap-x-3 gap-y-5 py-4",
                      item.tools.length <= 4 ? "grid-cols-2" : "grid-cols-3",
                    )}
                  >
                    {item.tools.map((tool) => (
                      <li key={tool.name} className="flex flex-col items-center gap-2 text-center">
                        <span className="flex h-12 w-full items-center justify-center rounded-2xl border border-line/70 bg-white px-2 sm:h-14 md:h-16">
                          {/* eslint-disable-next-line @next/next/no-img-element -- mixed svg/png/jpg logos at intrinsic ratio */}
                          <img
                            src={tool.src}
                            alt=""
                            loading="lazy"
                            className="max-h-8 max-w-full object-contain md:max-h-9"
                          />
                        </span>
                        <span className="text-xs font-medium leading-tight text-charcoal">{tool.name}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="border-t border-line pt-4 text-sm leading-snug text-[#5B6067]">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeatureCarousel;
