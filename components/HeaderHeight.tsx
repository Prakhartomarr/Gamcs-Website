"use client";

import { useEffect } from "react";

/**
 * Publishes the sticky header's real height as `--header-h`.
 *
 * The hero is sized `calc(100dvh - var(--header-h))` so that header + hero is
 * exactly one viewport. A hardcoded token cannot do that: the bar measures
 * 87px at 390, 96px at 768 and 87px at 1440, because the mobile toggle and the
 * desktop CTA are different heights and the vertical padding steps at `sm`.
 * Anything off by N leaves an N-pixel sliver of the next section above the
 * fold, or crops the hero by N.
 *
 * A ResizeObserver also covers the cases a breakpoint table never would —
 * the webfont landing and changing the bar's height, or the browser's own
 * text-size setting.
 */
export default function HeaderHeight() {
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;

    const write = () =>
      document.documentElement.style.setProperty(
        "--header-h",
        `${Math.round(header.getBoundingClientRect().height)}px`
      );

    write();
    const ro = new ResizeObserver(write);
    ro.observe(header);
    /* the bar can change height when the webfont swaps in */
    document.fonts?.ready.then(write).catch(() => {});

    return () => ro.disconnect();
  }, []);

  return null;
}
