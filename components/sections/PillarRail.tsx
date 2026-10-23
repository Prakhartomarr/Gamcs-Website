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
 * IT SITS INSIDE THE PAGE HEAD, between the headline and the subhead
 * (client, 2026-10-22), so it renders no `.container` of its own: the head
 * already provides one, and on phones `.container` insets with margins, so a
 * second one boxed the pills in twice (254px wide against the head's 290 at
 * 390px). Move it out of a page head and it needs a container again.
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
      <ul>
        {solutions.map((s) => (
          <li key={s.slug}>
            <a href={`#${s.slug}`} className="sol-rail-pill">
              {s.navLabel}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
