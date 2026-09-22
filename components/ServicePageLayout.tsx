import Link from "next/link";
import AbstractPanel from "@/components/AbstractPanel";
import Breadcrumbs from "@/components/Breadcrumbs";
import SectionEyebrow from "@/components/SectionEyebrow";
import { primaryCta, type ListItem, type Solution } from "@/lib/content/gamcs";
import { servicePage } from "@/lib/content/ui";
import CTA from "@/components/CTA";

/**
 * The shared rhythm for the five pillar pages:
 *   hero → problem → at a glance → what we do (typed blocks) → outcomes → CTA
 *
 * The five pages are not identically shaped — Finance Team Extension carries a
 * build sequence and a numbers strip, Digital Transformation splits into two
 * arms, and only two pages state a problem up front — so the middle is driven
 * by each page's `blocks` array rather than fixed slots. Everything visual is
 * borrowed: .page-head, .section, .container, the eyebrow, the case-study card
 * treatment and the existing CTA band. No new visual language.
 */
export default function ServicePageLayout({ solution }: { solution: Solution }) {
  const s = solution;

  return (
    <>
      <section className="page-head">
        <div className="container">
          <Breadcrumbs
            trail={[
              { label: servicePage.crumb, href: "/solutions" },
              { label: s.title, href: `/solutions/${s.slug}` },
            ]}
          />
          <div className="section-kicker">{servicePage.kicker}</div>
          <h1>{s.h1}</h1>
          <p>{s.intro}</p>
        </div>
      </section>

      <section className="section service-body">
        <div className="container">
          {/* The problem, where a page states one, comes before the scan layer */}
          {s.problem && (
            <div className="service-problem reveal">
              <h2 className="glance-label">{s.problem.label}</h2>
              <p className="service-prose">{s.problem.body}</p>
            </div>
          )}

          {/* At a glance — the scan layer, before any prose */}
          <div className="glance reveal">
            <span className="glance-label">{servicePage.atAGlance}</span>
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
                    {block.items.map((stat) => (
                      <li key={stat.value}>
                        <strong>{stat.value}</strong>
                        {stat.label}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }

            /* Each arm's heading carries its id: /solutions/digital-transformation#tools
               and #analytics, which the retired pillar URLs redirect to. */
            if (block.kind === "arms") {
              return (
                <div className="service-arms reveal" key={i}>
                  {block.items.map((arm) => (
                    <div className="service-arm" key={arm.id}>
                      <h2 className="eyebrow-pill" id={arm.id}>
                        {arm.badge}
                      </h2>
                      <p className="service-prose">{arm.intro}</p>
                      <ServiceList items={arm.bullets} />
                      {arm.callout && <p className="service-callout">{arm.callout}</p>}
                    </div>
                  ))}
                </div>
              );
            }

            return (
              <div className="service-block reveal" key={i}>
                <h2>{block.heading}</h2>
                <ServiceList items={block.items} numbered={block.kind === "steps"} />
              </div>
            );
          })}

          {s.seeItInAction && (
            <div className="service-proof reveal">
              <div>
                <SectionEyebrow label={s.seeItInAction.heading} />
                {s.seeItInAction.paragraphs.map((para) => (
                  <p key={para}>{para}</p>
                ))}
                <Link className="service-proof-link" href="/case-study">
                  {servicePage.readCaseStudies} <span aria-hidden="true">→</span>
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

/** bullets, steps and each arm share one card list, numbered only for steps */
function ServiceList({ items, numbered = false }: { items: ListItem[]; numbered?: boolean }) {
  return (
    <ul className={numbered ? "service-list is-steps" : "service-list"}>
      {items.map((item, n) => (
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
  );
}
