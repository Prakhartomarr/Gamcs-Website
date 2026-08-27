import { ARROW, STROKE_ICONS } from "@/components/ui/stroke-icons";
import type { SolutionBlock } from "@/lib/content/gamcs";
import { solutions, solutionsHub } from "@/lib/content/gamcs";
import CTA from "@/components/CTA";

/**
 * The six pillars as full-width blocks: a gradient card stating the pillar's
 * argument, beside an expandable list of what it actually delivers.
 *
 * Blocks alternate sides down the page so the eye zig-zags rather than running
 * down one rail, and the card is sticky on desktop so it stays with its list
 * while that list scrolls.
 *
 * Every string here already existed. The card headline is the pillar's own
 * `h1` — the same sentence its detail page leads with — and the rows are the
 * pillar's `bullets` block, whose items were already written as a short label
 * plus an explanation. Nothing is authored here, so the page cannot drift from
 * /solutions/[slug].
 *
 * Rows are native <details>/<summary>: keyboard operable, findable by the
 * browser's in-page search even when collapsed, and correct before hydration.
 */
export default function PillarBlocks() {
  const blurbFor = new Map(solutionsHub.previews.map((p) => [p.slug, p]));

  return (
    <div className="pillars">
      {solutions.map((s, i) => {
        /* Every pillar has exactly one `bullets` block; offshoring also has a
           `steps` block, which is a process and not a service list. */
        const bullets = s.blocks.find(
          (b): b is Extract<SolutionBlock, { kind: "bullets" }> =>
            b.kind === "bullets"
        );
        const rows = bullets?.items ?? [];
        const preview = blurbFor.get(s.slug);

        return (
          <section
            className="pillar"
            id={s.slug}
            key={s.slug}
            /* odd blocks put the card on the right */
            data-flip={i % 2 === 1 ? "" : undefined}
            aria-labelledby={`${s.slug}-h`}
          >
            <div className="pillar-card reveal">
              <span className="pillar-label">{s.navLabel}</span>
              <h2 id={`${s.slug}-h`}>{s.h1}</h2>
              <p>{preview?.blurb ?? s.intro}</p>
              <CTA
                tier="secondary"
                href={`/solutions/${s.slug}`}
                data-cta={`pillar-${s.slug}`}
                className="pillar-cta"
              >
                {preview?.linkLabel ?? `Explore ${s.navLabel}`}
                {ARROW}
              </CTA>
              <span className="pillar-glyph" aria-hidden="true">
                <svg viewBox="0 0 24 24">{STROKE_ICONS[s.slug]}</svg>
              </span>
            </div>

            <ul className="pillar-list reveal">
              {rows.map((r) => (
                <li key={r.lead}>
                  <details>
                    <summary>
                      <span>{r.lead}</span>
                      <svg viewBox="0 0 16 16" aria-hidden="true">
                        <path
                          d="M4 6.5L8 10.5 12 6.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </summary>
                    <p>{r.body}</p>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
