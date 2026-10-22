import type { SolutionBlock } from "@/lib/content/gamcs";
import { platforms, previewBySlug, primaryCta, solutions } from "@/lib/content/gamcs";
import Velaris, { VELARIS_MOTION } from "@/components/ui/velaris";
import LinkedText from "@/components/LinkedText";

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
 * the pillar's own page stays one click away in the footer.
 *
 * Rows are always open: an <h3> over its list, no disclosures.
 *
 * Each card's shader: one brand blue held, and the rest a deeper register of
 * the same hue. The pale tints these palettes started with (mint, sky, lilac)
 * had to be paid for in scrim — white cannot sit on them — and the bill was
 * the gradient itself, flattened to a slab. Capped at a luminance white can
 * sit on, the colours survive the scrim and the gradient reads. Design values,
 * which is why they live here and not in the content module. The card's own
 * linear gradient stays underneath as the floor: it is what shows if WebGL is
 * missing, under print, and before the first frame.
 */
const SHADER: Record<string, { bg: string; colors: string[] }> = {
  /* blue → emerald */
  "fpa-cfo-advisory": { bg: "#083D5E", colors: ["#0E5C86", "#0E8F6F", "#14B8A6", "#0A4169"] },
  /* blue → violet */
  "finance-team-extension": { bg: "#241F73", colors: ["#0F5E97", "#5B3FC4", "#7C5CE0", "#2145B8"] },
  /* blue → cyan */
  "digital-transformation": { bg: "#0A5A75", colors: ["#0F5E97", "#1197B5", "#1FB3CE", "#1B7FB8"] },
  /* blue → teal */
  "deal-advisory": { bg: "#0A5F5C", colors: ["#0F5E97", "#0F9E90", "#14B8A6", "#127D8E"] },
  /* blue → indigo */
  "training-enablement": { bg: "#2A2585", colors: ["#116693", "#4F46E5", "#6366F1", "#1D4ED8"] },
};
const SHADER_FALLBACK = SHADER["fpa-cfo-advisory"];

/* Transform's platform rows, left off the hub (client, 2026-10-22): they
   are the platforms band on /how-we-help now, and stay on the detail page. */
const HUB_HIDDEN = new Set(platforms.groups);
/* Rows the hub moves to the end of their pillar's list (client, 2026-10-22:
   Finance Technology & Systems after AI & Decision Intelligence). The
   detail page keeps it inside its own group. */
const HUB_LAST = new Set(["Finance Technology & Systems"]);

export default function PillarBlocks() {
  return (
    <div className="sol-pillars">
      {solutions.map((s, i) => {
        /* The rows are the pillar's first `bullets` block: its capability
           groups. All five pillars declare one, so there is no fallback — the
           `arms` one this used to need went with Transform's two-arm layout.
           Team Extension's second list (what its CoE teams run day to day) and
           its `steps` process are left to the detail page. */
        const bullets = s.blocks.find(
          (b): b is Extract<SolutionBlock, { kind: "bullets" }> => b.kind === "bullets",
        );
        /* Transform's two group titles are dropped here and its eight
           sub-headings become rows of their own, open like every other
           pillar's (client, 2026-10-22). The detail page keeps the groups. */
        const rows = (bullets?.items ?? [])
          .flatMap((r) => ("subheads" in r ? r.subheads : [r]))
          .filter((r) => !HUB_HIDDEN.has(r.lead))
          .sort((a, b) => Number(HUB_LAST.has(a.lead)) - Number(HUB_LAST.has(b.lead)));
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
                  /* The shared pace, so these cards and the flute panels
                     cannot drift apart again. Only the colours are local. */
                  {...VELARIS_MOTION}
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
              {rows.map((r) => {
                const body = (
                  <div className="sol-list-body">
                    {/* Two shapes, one panel: a list of capabilities, or a
                        `steps` or prose row carrying a sentence. */}
                    {"items" in r ? (
                      <ul className="cap-list">
                        {r.items.map((sub) => (
                          <li key={sub}><LinkedText text={sub} /></li>
                        ))}
                      </ul>
                    ) : (
                      <p>{r.body}</p>
                    )}
                  </div>
                );

                return (
                  <li key={r.lead}>
                    {/* OPEN, AND NOT A DISCLOSURE AT ALL (client,
                        2026-10-22). An <h3>: with nothing to operate, the
                        lead is a heading over its list, and it joins the page
                        outline under the pillar's own h2. */}
                    <h3 className="sol-list-head">{r.lead}</h3>
                    {body}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
