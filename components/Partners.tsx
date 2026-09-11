"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

/**
 * Our Partners — macOS-style magnifying dock.
 *
 * Rendered after the "Meet our founders" block on /who-we-are.
 * Logos are the existing files in /public/logos/partners/.
 */

type Partner = {
  name: string;
  src: string;
  /**
   * Optical size correction, multiplied into the logo's box inside the tile.
   * The source PNGs share a canvas but carry different amounts of transparent
   * padding, so object-contain fits them to different visual sizes. Nudge this
   * until all three read at the same weight. 1 = no correction.
   */
  scale?: number;
};

const PARTNERS: Partner[] = [
  {
    name: "Akshar Business Consulting",
    src: "/logos/partners/akshar.png",
    scale: 1.35,
  },
  {
    name: "threesixty. Finance",
    src: "/logos/partners/threesixty.png",
  },
  {
    name: "CFO Bridge",
    src: "/logos/partners/cfo-bridge.png",
    scale: 1.15,
  },
];

/* Tile geometry — tweak these two pairs to change how much the dock magnifies. */
const REST = { w: 176, h: 78 };
const PEAK = { w: 246, h: 108 };
/* How far from a tile's centre the magnification falls off to nothing (px). */
const FALLOFF = 230;

type PartnersProps = {
  partners?: Partner[];
  className?: string;
};

export default function Partners({
  partners = PARTNERS,
  className = "",
}: PartnersProps) {
  return (
    <section
      aria-labelledby="partners-heading"
      className={`w-full bg-white py-20 sm:py-24 ${className}`}
    >
      <div className="mx-auto max-w-6xl px-6">
        <h2
          id="partners-heading"
          className="text-center text-3xl font-bold tracking-tight text-[#0F2744] sm:text-4xl"
        >
          Our Partners
        </h2>

        <div className="mt-12">
          <Dock partners={partners} />
          <StaticRow partners={partners} />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop: the magnifying dock                                        */
/* ------------------------------------------------------------------ */

function Dock({ partners }: { partners: Partner[] }) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="mx-auto hidden w-fit items-end gap-4 rounded-[32px] border border-black/[0.06] bg-[#F4F5F7] px-5 pb-5 pt-4 shadow-[0_1px_2px_rgba(15,39,68,0.04),0_12px_32px_-12px_rgba(15,39,68,0.14)] md:flex"
      style={{ minHeight: PEAK.h + 24 }}
    >
      {partners.map((partner) => (
        <DockTile key={partner.name} mouseX={mouseX} {...partner} />
      ))}
    </div>
  );
}

type DockTileProps = Partner & {
  mouseX: MotionValue<number>;
};

function DockTile({ mouseX, name, src, scale = 1 }: DockTileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotion();

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return Infinity;
    return val - bounds.x - bounds.width / 2;
  });

  const widthTarget = useTransform(
    distance,
    [-FALLOFF, 0, FALLOFF],
    [REST.w, PEAK.w, REST.w],
    { clamp: true }
  );
  const heightTarget = useTransform(
    distance,
    [-FALLOFF, 0, FALLOFF],
    [REST.h, PEAK.h, REST.h],
    { clamp: true }
  );

  const spring = { mass: 0.1, stiffness: 150, damping: 12 };
  const width = useSpring(widthTarget, spring);
  const height = useSpring(heightTarget, spring);

  /* Respect prefers-reduced-motion: no magnification, tiles stay at rest size. */
  const style = reduceMotion
    ? { width: REST.w, height: REST.h }
    : { width, height };

  return (
    <motion.div
      ref={ref}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex shrink-0 items-center justify-center rounded-2xl border border-black/[0.05] bg-white shadow-[0_1px_2px_rgba(15,39,68,0.05)]"
    >
      <div
        className="relative"
        style={{ height: `${62 * scale}%`, width: `${74 * scale}%` }}
      >
        <Image
          src={src}
          alt={`${name} logo`}
          fill
          sizes="248px"
          className={`object-contain transition-[filter,opacity] duration-300 ease-out ${
            hovered ? "opacity-100 grayscale-0" : "opacity-55 grayscale"
          }`}
        />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile / tablet: static row, full colour (no hover to reveal it)     */
/* ------------------------------------------------------------------ */

function StaticRow({ partners }: { partners: Partner[] }) {
  return (
    <ul className="mx-auto flex w-full max-w-sm flex-col gap-3 md:hidden">
      {partners.map((partner) => (
        <li
          key={partner.name}
          className="flex h-[84px] items-center justify-center rounded-2xl border border-black/[0.06] bg-[#F4F5F7]"
        >
          <div
            className="relative"
            style={{
              height: `${58 * (partner.scale ?? 1)}%`,
              width: `${70 * (partner.scale ?? 1)}%`,
            }}
          >
            <Image
              src={partner.src}
              alt={`${partner.name} logo`}
              fill
              sizes="280px"
              className="object-contain"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
