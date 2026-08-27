import { ARROW, STROKE_ICONS } from "@/components/ui/stroke-icons";
import { solutions, solutionsHub } from "@/lib/content/gamcs";
import CTA from "@/components/CTA";

/**
 * The six pillars as a card grid — the single source for this card, shared by
 * the homepage Services section and the /solutions hub.
 *
 * It used to be two separate treatments (`.svc-*` here with lucide icons,
 * `.fsvc-*` on the homepage with the repo's stroke icons) that were meant to
 * look the same and drifted. One component, one class set, one icon set.
 *
 * The glyph is drawn twice on purpose: a blue copy offset down-right for the
 * cast shadow, then a white copy on top blurred less so it keeps a bright
 * core. Both are heavily blurred by `.fsvc-glyph svg` — a hairline icon blurs
 * into nothing, which is why the stroke weight is set much heavier here than
 * the 1.5 the old small tile used.
 *
 * The link label is a uniform "Learn more". Six identical links are ambiguous
 * when a screen reader lists them out of context, so each carries a
 * visually-hidden suffix naming its pillar.
 */
export default function SolutionCards() {
  const previewFor = new Map<string, (typeof solutionsHub.previews)[number]>(
    solutionsHub.previews.map((p) => [p.slug, p])
  );

  return (
    <ul className="fsvc-grid">
      {solutions.map((s) => (
        <li className="fsvc-card reveal" key={s.slug}>
          <h3>{s.title}</h3>
          <p>{previewFor.get(s.slug)?.blurb ?? s.intro}</p>
          <span className="fsvc-glyph" aria-hidden="true">
            <svg className="fsvc-cast" viewBox="0 0 24 24">
              {STROKE_ICONS[s.slug]}
            </svg>
            <svg className="fsvc-light" viewBox="0 0 24 24">
              {STROKE_ICONS[s.slug]}
            </svg>
          </span>
          <CTA
            tier="tertiary"
            href={`/solutions/${s.slug}`}
            data-cta={`svc-${s.slug}`}
            srSuffix={`about ${s.title}`}
          >
            Learn more
            {ARROW}
          </CTA>
        </li>
      ))}
    </ul>
  );
}
