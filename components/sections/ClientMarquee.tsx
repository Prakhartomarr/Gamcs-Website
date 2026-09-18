"use client";

import Image from "next/image";
import { useState } from "react";
import type { LogoCloudClient } from "@/components/ui/cinematic-logo-cloud";

/**
 * The phone client wall (768px and under): two edge-to-edge rows of grey
 * tiles drifting in opposite directions, every mark once, in grayscale.
 *
 * The rows split the roster alternately, so each holds half. A row is one
 * track holding its tiles twice — the copy aria-hidden — and a CSS keyframe
 * moves the track from 0 to -50%, which is exactly one copy, so the loop is
 * seamless (each list carries the 8px gap as padding-right, so half the track
 * IS one list plus one gap). Row two runs the keyframe in reverse.
 *
 * The marks load eagerly: lazy ones only fetched once their tile drifted into
 * the clip, so tiles arrived as empty grey squares (the copies share URLs,
 * and the desktop grid fetches the same files, so nothing extra is downloaded).
 *
 * Pausing is `animation-play-state`, toggled by a class while a pointer is
 * down anywhere on the wall (and on hover, in CSS, only where hover exists). Under
 * prefers-reduced-motion the CSS drops the animation, hides the copies and
 * lets each row scroll sideways instead. Above 768px the whole thing is
 * display:none; the grid (CinematicLogoCloud) is what renders there. Styles:
 * the .clm-* block in app/globals.css.
 */
export default function ClientMarquee({ logos }: { logos: LogoCloudClient[] }) {
  const [paused, setPaused] = useState(false);
  const rows = [logos.filter((_, i) => i % 2 === 0), logos.filter((_, i) => i % 2 === 1)];

  const tiles = (row: LogoCloudClient[], hidden = false) => (
    <ul className="clm-list" aria-hidden={hidden || undefined}>
      {row.map((l) => (
        <li key={l.name}>
          <Image src={l.src!} alt={hidden ? "" : l.name} width={l.width} height={l.height} loading="eager" />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={`clm-wall${paused ? " is-paused" : ""}`}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerCancel={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
    >
      {rows.map((row, i) => (
        <div className="clm-row" data-dir={i ? "rtl" : "ltr"} key={i}>
          <div className="clm-track">
            {tiles(row)}
            {tiles(row, true)}
          </div>
        </div>
      ))}
    </div>
  );
}
