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
 * STATIC, NOT STICKY (client).
 *
 * ALL FIVE PILLS LOOK THE SAME (client, 2026-10-22). An earlier version
 * marked the pillar in view with aria-current and painted that pill blue,
 * which is why this was a client component. The observer is gone, so this is
 * a server component again — no hooks, no browser API, nothing to hydrate.
 * Keep it that way: re-adding the mark means re-adding "use client".
 */
export default function PillarRail() {
  if (!solutions.length) return null;

  return (
    <nav className="sol-rail" aria-label="Solution pillars">
      <div className="container">
        <ul>
          {solutions.map((s) => (
            <li key={s.slug}>
              <a href={`#${s.slug}`} className="sol-rail-pill">
                {s.navLabel}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
