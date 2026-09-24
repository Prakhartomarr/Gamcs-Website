import type { SolutionBlock } from "@/lib/content/gamcs";
import { previewBySlug, primaryCta, solutions } from "@/lib/content/gamcs";
import Velaris from "@/components/ui/velaris";

/**
 * The five pillars, built to docs/unity-spec.md: two equal columns inside a
 * 21px page margin with a 20px gutter, a gradient card of 689×794 at 1440 on
 * one side and that pillar's services on the other, alternating sides.
 *
 * Every string here already existed. The card headline is the pillar's own
 * `h1` — the same sentence its detail page leads with — and the rows are the
 * pillar's service list, whose items were already written as a short label
 * plus an explanation. Nothing is authored here, so the page cannot drift from
 * /solutions/[slug]. The one exception is the button's label, which is the
 * preview's own `talkLabel`: the card sends a visitor to a conversation, and
 * the pillar's own page stays one click away in the header's Solutions menu.
 *
 * Rows are native <details>/<summary>: keyboard operable, findable by the
 * browser's in-page search even when collapsed, and correct before hydration.
 * The open and close is a grid row going 0fr → 1fr, which animates in every
 * browser; `height: auto` does not.
 *
 * Each card's shader: one brand blue held, and the rest vivid — the reference's
 * energy without leaving the palette. Design values, which is why they live
 * here and not in the content module. The card's own linear gradient stays
 * underneath as the floor: it is what shows if WebGL is missing, under print,
 * and before the first frame.
 */
const SHADER: Record<string, { bg: string; colors: string[] }> = {
  /* blue → emerald */
  "fpa-cfo-advisory": { bg: "#0D6A8E", colors: ["#1B7FB8", "#10B981", "#5EEAD4", "#0F5E97"] },
  /* blue → violet */
  "finance-team-extension": { bg: "#3A35A8", colors: ["#0F5E97", "#7C3AED", "#A78BFA", "#2563EB"] },
  /* blue → cyan */
  "digital-transformation": { bg: "#0E7490", colors: ["#0F5E97", "#22D3EE", "#7DD3FC", "#1B7FB8"] },
  /* blue → teal */
  "deal-advisory": { bg: "#0D7A72", colors: ["#0F5E97", "#14B8A6", "#6EE7B7", "#127D8E"] },
  /* blue → indigo */
  "training-enablement": { bg: "#3730A3", colors: ["#116693", "#6366F1", "#A5B4FC", "#1D4ED8"] },
};
const SHADER_FALLBACK = SHADER["fpa-cfo-advisory"];

const CHEVRON = (
  <svg viewBox="0 0 13 24" aria-hidden="true">
    <path
      d="M2.5 9.5L6.5 13.5 10.5 9.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function PillarBlocks() {
  return (
    <div className="sol-pillars">
      {solutions.map((s, i) => {
        /* The rows are the pillar's first `bullets` block. Team Extension has a
           second one (what its CoE teams run day to day) and a `steps` process,
           both left to the detail page. Digital Transformation has no `bullets`
           block — its services sit in its two arms — so its rows are arm 1's
           list, then arm 2's. */
        const bullets = s.blocks.find(
          (b): b is Extract<SolutionBlock, { kind: "bullets" }> => b.kind === "bullets",
        );
        const arms = s.blocks.find(
          (b): b is Extract<SolutionBlock, { kind: "arms" }> => b.kind === "arms",
        );
        const rows = bullets?.items ?? arms?.items.flatMap((a) => a.bullets) ?? [];
        const preview = previewBySlug.get(s.slug);
        const paint = SHADER[s.slug] ?? SHADER_FALLBACK;

        return (
          <section
            className="sol-pillar"
            id={s.slug}
            key={s.slug}
            /* even blocks put the card on the right */
            data-flip={i % 2 === 1 ? "" : undefined}
            aria-labelledby={`${s.slug}-h`}
          >
            <div className="sol-card reveal">
              {/* The gradient itself. aria-hidden and pointer-events-none: it
                  is the card's surface, not content. */}
              <span className="sol-card-paint" aria-hidden="true">
                <Velaris
                  height="100%"
                  dpr={1.5}
                  speed={1.1}
                  grain={0.22}
                  bg={paint.bg}
                  colors={paint.colors}
                />
              </span>

              <div className="sol-card-body">
                <span className="sol-eyebrow">{s.navLabel}</span>
                <h2 id={`${s.slug}-h`}>{s.h1}</h2>
                <p>{preview?.blurb ?? s.intro}</p>
                <a
                  className="sol-talk"
                  href={primaryCta.href}
                  data-cta={`pillar-${s.slug}`}
                >
                  {preview?.talkLabel ?? primaryCta.label}
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M5 12h13M12.5 6l6 6-6 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <ul className="sol-list reveal">
              {rows.map((r) => (
                <li key={r.lead}>
                  <details>
                    <summary>
                      <span>{r.lead}</span>
                      {CHEVRON}
                    </summary>
                    <div className="sol-list-body">
                      <p>{r.body}</p>
                    </div>
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
