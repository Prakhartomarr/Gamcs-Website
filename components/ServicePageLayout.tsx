import Link from "next/link";
import AbstractPanel from "@/components/AbstractPanel";
import Breadcrumbs from "@/components/Breadcrumbs";
import SectionEyebrow from "@/components/SectionEyebrow";
import { primaryCta, type Solution } from "@/lib/content/gamcs";
import CTA from "@/components/CTA";

/**
 * The shared rhythm for the six pillar pages:
 *   hero → at a glance → what we do (typed blocks) → outcomes → CTA
 *
 * The six pages are not identically shaped — Offshoring carries a build
 * sequence and a numbers strip the others do not — so the middle is driven by
 * each page's `blocks` array rather than fixed slots. Everything visual is
 * borrowed: .page-head, .section, .container, the eyebrow, the case-study
 * card treatment and the existing CTA band. No new visual language.
 */
export default function ServicePageLayout({ solution }: { solution: Solution }) {
  const s = solution;

  return (
    <>
      <section className="page-head">
        <div className="container">
          <Breadcrumbs
            trail={[
              { label: "Solutions", href: "/solutions" },
              { label: s.title, href: `/solutions/${s.slug}` },
            ]}
          />
          <div className="section-kicker">SOLUTIONS</div>
          <h1>{s.h1}</h1>
          <p>{s.intro}</p>
        </div>
      </section>

      <section className="section service-body">
        <div className="container">
          {/* At a glance — the scan layer, before any prose */}
          <div className="glance reveal">
            <span className="glance-label">At a glance</span>
            <ul className="glance-list">
              {s.atAGlance.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {s.blocks.map((block, i) => {
            if (block.kind === "callout") {
              return (
                <p className="service-callout reveal" key={i}>
                  {block.body}
                </p>
              );
            }

            if (block.kind === "prose") {
              return (
                <div className="service-block reveal" key={i}>
                  <h2>{block.heading}</h2>
                  <p className="service-prose">{block.body}</p>
                </div>
              );
            }

            if (block.kind === "stats") {
              return (
                <div className="service-block reveal" key={i}>
                  <h2>{block.heading}</h2>
                  <ul className="service-stats">
                    {block.items.map((v) => (
                      <li key={v}>{v}</li>
                    ))}
                  </ul>
                </div>
              );
            }

            /* bullets and steps share a card, numbered only for steps */
            const numbered = block.kind === "steps";
            return (
              <div className="service-block reveal" key={i}>
                <h2>{block.heading}</h2>
                <ul className={numbered ? "service-list is-steps" : "service-list"}>
                  {block.items.map((item, n) => (
                    <li key={item.lead} data-lift>
                      <span className="service-list-mark" aria-hidden="true">
                        {numbered ? String(n + 1).padStart(2, "0") : "✦"}
                      </span>
                      <span>
                        <strong>{item.lead}</strong> — {item.body}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {s.seeItInAction && (
            <div className="service-proof reveal">
              <div>
                <SectionEyebrow n={s.blocks.length + 1} label={s.seeItInAction.heading} />
                {s.seeItInAction.paragraphs.map((para) => (
                  <p key={para}>{para}</p>
                ))}
                <Link className="service-proof-link" href="/case-study">
                  Read the case studies <span aria-hidden="true">→</span>
                </Link>
              </div>
              <AbstractPanel variant="ribbons" ratio="3 / 2" />
            </div>
          )}

          <div className="case-cta reveal">
            <h2>{s.closingLine}</h2>
            <CTA href={primaryCta.href}
              data-cta={`solution-${s.slug}`} icon="diagonal">
              {primaryCta.label}
            </CTA>
          </div>
        </div>
      </section>
    </>
  );
}
