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
import { partners } from "@/lib/content/gamcs";

/**
 * Our partners as a macOS-style magnifying dock, sized for the founders column
 * of the homepage's Who We Are section: it sits under "Meet our founders", in
 * the space beside the mission line.
 *
 * It began as a full-width section with its own heading at the foot of
 * /who-we-are. Here the column is 440px, so the tiles are scaled to it: the
 * tray is 396px at rest and at most 432px wherever the pointer is — solved
 * for every pointer position (each tile's width depends on its distance from
 * the pointer, and the centres move as tiles grow), then measured in a
 * browser. The 8px left over absorbs the spring's travel between states.
 *
 * The list is `partners.logos` from lib/content/gamcs.ts — the same source as
 * the Our Partners section, so the two cannot drift. Only the optical
 * correction lives here; it is presentation, not content.
 *
 * Below 768px there is no hover to reveal colour, so the dock gives way to a
 * plain row of three tiles in full colour.
 */

/**
 * Optical size correction by logo file. The PNGs share a 400x168 canvas but
 * carry different amounts of transparent padding, so object-contain fits them
 * to different visual sizes. 1 = no correction.
 */
const SCALE: Record<string, number> = {
  "akshar.png": 1.35,
  "cfo-bridge.png": 1.15,
};

/* Tile geometry. PEAK sets the widest the tray gets (396 + PEAK.w - REST.w);
   at 158 it reached 438-442px and brushed the column edge, hence 154. */
const REST = { w: 118, h: 52 };
const PEAK = { w: 154, h: 68 };
/** distance from a tile's centre at which magnification falls to nothing (px) */
const FALLOFF = 130;

/* Every colour resolves to a token in app/globals.css. */
const TRAY_SHADOW =
  "0 1px 2px color-mix(in srgb, var(--ink-deep) 4%, transparent), 0 12px 32px -12px color-mix(in srgb, var(--ink-deep) 14%, transparent)";

type Logo = (typeof partners.logos)[number];
const logoSrc = (l: Logo) => `/logos/partners/${l.file}`;

export default function PartnersDock({ className = "" }: { className?: string }) {
  return (
    <div className={`partners-dock ${className}`}>
      <p
        id="who-partners-label"
        className="m-0 font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--ink-muted)]"
      >
        Our partners
      </p>
      <Dock />
      <StaticRow />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 768px and up: the magnifying dock                                   */
/* ------------------------------------------------------------------ */

function Dock() {
  const mouseX = useMotionValue(Infinity);

  return (
    <ul
      aria-labelledby="who-partners-label"
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="m-0 mt-3 hidden w-fit list-none items-end gap-[8px] rounded-[22px] border border-[color:var(--hair)] bg-soft px-[12px] pb-[12px] pt-[10px] md:flex"
      style={{ minHeight: PEAK.h + 22, boxShadow: TRAY_SHADOW }}
    >
      {partners.logos.map((logo) => (
        <DockTile key={logo.file} mouseX={mouseX} logo={logo} />
      ))}
    </ul>
  );
}

function DockTile({ mouseX, logo }: { mouseX: MotionValue<number>; logo: Logo }) {
  const ref = useRef<HTMLLIElement>(null);
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotion();

  const distance = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect();
    return b ? x - b.x - b.width / 2 : Infinity;
  });

  const widthTarget = useTransform(distance, [-FALLOFF, 0, FALLOFF], [REST.w, PEAK.w, REST.w], {
    clamp: true,
  });
  const heightTarget = useTransform(distance, [-FALLOFF, 0, FALLOFF], [REST.h, PEAK.h, REST.h], {
    clamp: true,
  });

  const spring = { mass: 0.1, stiffness: 150, damping: 12 };
  const width = useSpring(widthTarget, spring);
  const height = useSpring(heightTarget, spring);

  /* prefers-reduced-motion: no magnification, tiles stay at rest size. The
     resting size is what the server renders either way, so this never makes
     the first client render disagree with the HTML. */
  const style = reduceMotion ? { width: REST.w, height: REST.h } : { width, height };
  const k = SCALE[logo.file] ?? 1;

  return (
    <motion.li
      ref={ref}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex shrink-0 items-center justify-center rounded-[14px] border border-[color:var(--hair)] bg-white"
    >
      <div className="relative" style={{ height: `${62 * k}%`, width: `${74 * k}%` }}>
        <Image
          src={logoSrc(logo)}
          alt={logo.name}
          fill
          sizes="160px"
          className={`object-contain transition-[filter,opacity] duration-300 ease-out ${
            hovered ? "opacity-100 grayscale-0" : "opacity-[.55] grayscale"
          }`}
        />
      </div>
    </motion.li>
  );
}

/* ------------------------------------------------------------------ */
/* Below 768px: one static row, full colour (no hover to reveal it)     */
/* ------------------------------------------------------------------ */

function StaticRow() {
  return (
    <ul
      aria-labelledby="who-partners-label"
      className="m-0 mt-3 grid list-none grid-cols-3 gap-[8px] p-0 md:hidden"
    >
      {partners.logos.map((logo) => {
        const k = SCALE[logo.file] ?? 1;
        return (
          <li
            key={logo.file}
            className="flex h-14 items-center justify-center rounded-[14px] border border-[color:var(--hair)] bg-soft"
          >
            <div className="relative" style={{ height: `${58 * k}%`, width: `${74 * k}%` }}>
              <Image src={logoSrc(logo)} alt={logo.name} fill sizes="120px" className="object-contain" />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
