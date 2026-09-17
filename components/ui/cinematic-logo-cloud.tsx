"use client";

import Image from "next/image";
import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/cinematic-logo-cloud-utils/marquee";

/**
 * Cinematic logo cloud — the published component, adapted for this project.
 *
 * Three differences from the source, each forced by something already true
 * here:
 *
 *   - `motion/react`, not `framer-motion`. They are the same library under two
 *     names, and the project already ships `motion`; importing the other name
 *     would put a second animation runtime on the page.
 *   - a `src` on a client, for artwork this project hosts itself. The original
 *     only knows `slug`, which it resolves against cdn.simpleicons.org — a set
 *     that has none of the twenty companies on this wall. `slug` still works,
 *     for a brand that happens to be in that set.
 *   - next/image for both, because this repo lints `<img>`. A `src` client
 *     carries its own `width`/`height`, which is how the caller keeps marks of
 *     very different shapes at one optical weight; a `slug` icon is the square
 *     24px simpleicons draws.
 *
 * Under prefers-reduced-motion the grid renders in place rather than flying in.
 */
export type LogoCloudClient = {
  name: string;
  /** artwork served by this site, e.g. /logos/clients/wwf.png */
  src?: string;
  /** display size for `src`, in px — set both to hold the aspect ratio */
  width?: number;
  height?: number;
  /** simpleicons slug, for a brand in that set */
  slug?: string;
  /** render the name as type instead of artwork */
  text?: boolean;
  className?: string;
  nameClassName?: string;
  invertDark?: boolean;
};

export interface CinematicLogoCloudProps {
  clients: LogoCloudClient[];
  variant?: "grid" | "marquee" | "marquee-named";
  className?: string;
  /** pass null to let the section's own heading stand alone */
  eyebrow?: string | null;
  description?: string | null;
  /**
   * Replaces the grid variant's own layout classes. The component wraps its
   * clients in a centred flex row, which leaves a short last row floating in
   * the middle; a caller with a fixed roster can hand it real columns instead.
   */
  gridClassName?: string;
  /**
   * Replaces the grid variant's inner container (`mx-auto max-w-7xl px-4 …`).
   * A caller whose own section already provides the measure and the gutters
   * passes its own, so the logos line up with everything else in it.
   */
  innerClassName?: string;
}

export function CinematicLogoCloud({
  clients,
  variant = "grid",
  className,
  eyebrow = "Trusted by teams building the future of AI.",
  description = "From prototype to production, autonomously.",
  gridClassName,
  innerClassName,
}: CinematicLogoCloudProps) {
  const reduced = useReducedMotion();

  const renderClient = (client: LogoCloudClient, size: "lg" | "sm" = "lg") => {
    if (client.text) {
      return (
        <span
          className={cn(
            size === "lg"
              ? "text-xl font-bold text-zinc-900 dark:text-white"
              : "text-sm font-semibold text-zinc-700 dark:text-zinc-300",
            client.className
          )}
        >
          {client.name}
        </span>
      );
    }

    if (client.src) {
      /* Sized outright: left to auto, each mark takes the size of whichever
         srcset file loaded and the row stretches them all to the tallest. */
      const w = client.width ?? 120;
      const h = client.height ?? 40;
      const scale = size === "lg" ? 1 : 0.7;
      return (
        <Image
          src={client.src}
          alt={client.name}
          width={w}
          height={h}
          style={{ width: Math.round(w * scale), height: Math.round(h * scale) }}
          className={cn(
            "max-w-none select-none object-contain",
            client.invertDark && "dark:brightness-0 dark:invert",
            client.className
          )}
        />
      );
    }

    return (
      <Image
        src={`https://cdn.simpleicons.org/${client.slug}`}
        alt={client.name}
        width={24}
        height={24}
        unoptimized
        className={cn(
          size === "lg" ? "h-6 w-auto" : "h-5 w-auto",
          client.invertDark && "dark:invert",
          client.className
        )}
      />
    );
  };

  const shell = (children: React.ReactNode) => (
    <div
      className={cn(
        "w-full bg-zinc-50/50 py-12 md:py-16 dark:bg-zinc-950",
        className
      )}
    >
      {children}
    </div>
  );

  if (variant === "marquee" || variant === "marquee-named") {
    const named = variant === "marquee-named";
    return shell(
      <>
        {eyebrow && (
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-zinc-400">
            {eyebrow}
          </p>
        )}
        <Marquee speed={named ? 40 : 35}>
          {clients.map((brand) => (
            <div
              key={brand.name}
              className={cn(
                "flex shrink-0 items-center justify-center rounded-xl border border-zinc-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900",
                named ? "gap-2.5 px-4 py-2.5" : "px-5 py-3"
              )}
            >
              {renderClient(brand, "sm")}
              {named && (
                <span
                  className={cn(
                    "text-sm text-zinc-800 dark:text-zinc-200",
                    brand.nameClassName
                  )}
                >
                  {brand.name}
                </span>
              )}
            </div>
          ))}
        </Marquee>
      </>
    );
  }

  return shell(
    <div
      className={cn(
        innerClassName ?? "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
        "text-center"
      )}
    >
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          {eyebrow}
        </p>
      )}
      {description && (
        <p className="mt-1 text-xs text-zinc-500">{description}</p>
      )}

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          visible: { transition: { staggerChildren: reduced ? 0 : 0.1 } },
          hidden: {},
        }}
        className={cn(
          gridClassName ?? "flex flex-wrap items-center justify-center gap-x-8 gap-y-6",
          (eyebrow || description) && "mt-8"
        )}
      >
        {clients.map((brand) => (
          <motion.div
            key={brand.name}
            variants={{
              hidden: reduced
                ? { opacity: 1 }
                : { opacity: 0, y: 20, filter: "blur(12px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: {
                  duration: reduced ? 0 : 1.2,
                  ease: [0.16, 1, 0.3, 1],
                },
              },
            }}
            className="flex items-center justify-center px-2"
          >
            {renderClient(brand)}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default CinematicLogoCloud;
