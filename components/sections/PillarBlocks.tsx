import { ARROW, STROKE_ICONS } from "@/components/ui/stroke-icons";
import type { SolutionBlock } from "@/lib/content/gamcs";
import { previewBySlug, solutions } from "@/lib/content/gamcs";
import CTA from "@/components/CTA";
import Velaris from "@/components/ui/velaris";

/**
 * Each card's shader: a ground and four colours for the noise to blend, all
 * within the brand's blue and its one teal neighbour, rotated a little from
 * pillar to pillar so five cards on one page are a family rather than five
 * copies. Design values, which is why they live here and not in the content
 * module. The card's CSS gradient stays underneath as the floor: it is what
 * shows if WebGL is unavailable, and what a printer gets.
 */
const SHADER: Record<string, { bg: string; colors: string[] }> = {
  "fpa-cfo-advisory": { bg: "#0B4A76", colors: ["#2A86BE", "#0F5E97", "#12707A", "#08304F"] },
  "finance-team-extension": { bg: "#0A4169", colors: ["#1F7FB8", "#14688F", "#0E6B72", "#072B45"] },
  "digital-transformation": { bg: "#0C5387", colors: ["#3A8FC4", "#0F5E97", "#1A7C86", "#08334F"] },
  "deal-advisory": { bg: "#093C62", colors: ["#2478AE", "#0C5387", "#0E6B72", "#062A43"] },
  "training-enablement": { bg: "#0B4E7E", colors: ["#2E8BC0", "#116693", "#157A84", "#073048"] },
};
const SHADER_FALLBACK = SHADER["fpa-cfo-advisory"];

/**
 * The five pillars as full-width blocks: a gradient card stating the pillar's
 * argument, beside an expandable list of what it actually delivers.
 *
 * Blocks alternate sides down the page so the eye zig-zags rather than running
 * down one rail.
 *
 * Every string here already existed. The card headline is the pillar's own
 * `h1` — the same sentence its detail page leads with — and the rows are the
 * pillar's service list, whose items were already written as a short label
 * plus an explanation. Nothing is authored here, so the page cannot drift from
 * /solutions/[slug].
 *
 * Rows are native <details>/<summary>: keyboard operable, findable by the
 * browser's in-page search even when collapsed, and correct before hydration.
 */
export default function PillarBlocks() {
  return (
    <div className="pillars">
      {solutions.map((s, i) => {
        /* The rows are the pillar's first `bullets` block. Team Extension has a
           second one (what its CoE teams run day to day) and a `steps` process,
           both left to the detail page. Digital Transformation has no `bullets`
           block — its services sit in its two arms — so its rows are arm 1's
           list, then arm 2's. */
        const bullets = s.blocks.find(
          (b): b is Extract<SolutionBlock, { kind: "bullets" }> =>
            b.kind === "bullets"
        );
        const arms = s.blocks.find(
          (b): b is Extract<SolutionBlock, { kind: "arms" }> => b.kind === "arms"
        );
        const rows = bullets?.items ?? arms?.items.flatMap((a) => a.bullets) ?? [];
        const preview = previewBySlug.get(s.slug);

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
              {/* The gradient itself. aria-hidden and pointer-events-none: it
                  is the card's surface, not content. */}
              <span className="pillar-shader" aria-hidden="true">
                <Velaris
                  height="100%"
                  dpr={1.5}
                  speed={1.1}
                  grain={0.22}
                  bg={(SHADER[s.slug] ?? SHADER_FALLBACK).bg}
                  colors={(SHADER[s.slug] ?? SHADER_FALLBACK).colors}
                />
              </span>
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
