"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { solutions, solutionsHub } from "@/lib/content/gamcs";

/**
 * The six pillars as pinned card + accordion sections.
 *
 * Pinning is CSS `position: sticky`, not a ScrollTrigger pin. There is no
 * ScrollSmoother here, and a ScrollTrigger pin rewrites the document flow with
 * spacer elements — which fights the sticky header and the one-viewport hero
 * this site already relies on. Sticky needs no JS, no cleanup, and cannot
 * desynchronise from the scroll position.
 *
 * The accordion is driven by each pillar's "what you get" bullets, which carry
 * both a label and a detail. The at-a-glance chips stay on the detail pages;
 * this is the same material opened up one level.
 */
function Accordion({ items }: { items: { lead: string; body: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <ul className="acc">
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${base}-b${i}`;
        const panelId = `${base}-p${i}`;
        return (
          <li className="acc-item" key={item.lead}>
            <h3 className="acc-h">
              <button
                type="button"
                id={btnId}
                className="acc-btn"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.lead}</span>
                <span className="acc-chev" aria-hidden="true" />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              className="acc-panel"
              data-open={isOpen ? "" : undefined}
              /* hidden from tab order and AT while collapsed */
              {...(isOpen ? {} : { hidden: true })}
            >
              <div className="acc-panel-inner">
                <p>{item.body}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function SolutionPillars() {
  /* `previews` is `as const`, so its slugs are literal types and the map key
     narrows to a union. Widen it — `solutions[].slug` is a plain string. */
  const blurbFor = new Map<string, (typeof solutionsHub.previews)[number]>(
    solutionsHub.previews.map((p) => [p.slug, p])
  );

  return (
    <div className="pillars">
      {solutions.map((s, i) => {
        const preview = blurbFor.get(s.slug);
        const bullets =
          s.blocks.find((b) => b.kind === "bullets") ??
          ({ kind: "bullets", heading: "", items: [] } as const);

        return (
          <section className="pillar-row reveal" id={s.slug} key={s.slug}>
            <div className="pillar-panel-col">
              <div className="pillar-panel">
                <span className="pillar-panel-eyebrow">
                  <span className="pillar-panel-n">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.navLabel}
                </span>
                <h2>{s.h1}</h2>
                <p>{preview?.blurb ?? s.intro}</p>
                <Link
                  className="pillar-panel-cta"
                  href={`/solutions/${s.slug}`}
                  data-cta={`pillar-${s.slug}`}
                >
                  {preview?.linkLabel ?? `Explore ${s.navLabel}`}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <div className="pillar-acc-col">
              {"items" in bullets && <Accordion items={[...bullets.items]} />}
            </div>
          </section>
        );
      })}
    </div>
  );
}
