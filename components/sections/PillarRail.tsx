"use client";

import { useEffect, useState } from "react";
import { solutions } from "@/lib/content/gamcs";

/**
 * The five pillars as a row of jump buttons under the /solutions page head
 * (client, 2026-10-22, against unity-advisory.com/what-we-do).
 *
 * LINKS, NOT <button>s, though they are buttons to look at. The reference
 * uses <button> for the same row; an in-page jump is navigation, so an <a
 * href="#slug"> is what a screen reader should be told it is, it works with
 * scripting off, and the browser handles focus and history for free. The
 * pill is the styling.
 *
 * STATIC, NOT STICKY (client). There is an orphaned `.pillar-rail` rule in
 * globals.css from an earlier sticky version — this does not use it; see
 * `.sol-rail` there instead.
 *
 * The active mark is the only reason this is a client component. Note what
 * it can and cannot do while the row is static: it tracks the pillar in view
 * correctly, but the row scrolls away with the page head, so the mark is
 * visible mainly on arrival and when scrolling back up. Sticky is what would
 * make it a position indicator the whole way down.
 */
export default function PillarRail() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = solutions
      .map((s) => document.getElementById(s.slug))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    /* A band across the upper third: a pillar counts as "the one being read"
       once its top passes into it, which is how a reader perceives it —
       rather than whichever happens to cover the most pixels, which on a
       tall section flips late and on a short one never wins at all. */
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting);
        if (!seen.length) return;
        /* Last in document order, so scrolling down hands over at the
           boundary instead of sticking on the earlier section. */
        const next = seen.sort(
          (a, b) =>
            sections.indexOf(a.target as HTMLElement) -
            sections.indexOf(b.target as HTMLElement)
        )[seen.length - 1];
        setActive(next.target.id);
      },
      { rootMargin: "-18% 0px -72% 0px", threshold: 0 }
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  if (!solutions.length) return null;

  return (
    <nav className="sol-rail" aria-label="Solution pillars">
      <div className="container">
        <ul>
          {solutions.map((s) => (
            <li key={s.slug}>
              <a
                href={`#${s.slug}`}
                className="sol-rail-pill"
                /* `page` rather than `true`: these point within the current
                   document, which is exactly what aria-current="page" is
                   for in an in-page nav. */
                aria-current={active === s.slug ? "page" : undefined}
              >
                {s.navLabel}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
