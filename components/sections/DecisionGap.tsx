import { decisionGap as c } from "@/lib/content/gamcs";

/**
 * The decision gap: a centred, static problem statement — left-aligned, and a
 * numbered rail rather than a grid, below 768px. The phone layout is entirely
 * stylesheet: the pains' 01-04 index, their dots and connectors, and the
 * bridge's chevron are all pseudo-elements, so the markup here is the desktop
 * markup plus one hidden label.
 *
 * A server component with no client bundle at all. Nothing here fades, waits
 * for a scroll position or reacts to a pointer — the section is complete on
 * first paint, which is why it carries no `reveal` class and no "use client".
 * The diagram, the particle canvas and the GSAP timeline that used to live
 * here are deleted rather than hidden; GSAP itself stays a dependency because
 * the hero, the preloader, CountUp and MotionLayer still use it.
 *
 * Structure is the argument: a pill, the claim, the consequence, four ways it
 * is felt, three figures that say it is not just this company, and a bridge
 * into the Maturity Curve section below.
 *
 * The four pains are a <ul> and the figures a <dl>, so the section reads in
 * order with no stylesheet. The "+" between the pains is drawn with borders on
 * the cells themselves (right on the left column, bottom on the top row), not
 * with a background or a pseudo-element: two cells in the same grid column
 * share an edge exactly, so the cross always meets.
 *
 * Every figure is attributed. Two carry links, which open in a new tab; the
 * third is cited in plain text because APQC publishes no stable public page
 * for it. Those links carry `noopener noreferrer`.
 */
export default function DecisionGap() {
  return (
    <section className="section dg" id="decision-gap" aria-labelledby="dg-heading">
      <div className="container dg-inner">
        <p className="eyebrow-pill dg-eyebrow">{c.eyebrow}</p>

        <h2 id="dg-heading" className="fin-h2 dg-h2">
          <span className="dg-line">{c.headingLead}</span>{" "}
          {/* Phones only: the rule between the fact lines and the accent
              line. `hidden` is what keeps it off desktop — the mobile
              stylesheet overrides the UA's display:none, so no rule outside
              `@media (max-width:767px)` is needed and wider viewports render
              exactly as before. Its hairline and chevron are pseudo-elements;
              only the label is markup. aria-hidden because the section's
              accessible name comes from this heading via aria-labelledby, and
              a decorative label must not change it. */}
          <span className="dg-distance" hidden aria-hidden="true">
            <span className="dg-distance-label">{c.distanceLabel}</span>
          </span>
          <span className="dg-line dg-accent">{c.headingAccent}</span>
        </h2>

        <p className="dg-sub">
          {c.subheadLead} <strong>{c.resultLabel}</strong> {c.resultBody}
        </p>

        <ul className="dg-pains">
          {c.pains.map((p) => (
            <li className="dg-pain" key={p.title}>
              <h3 className="dg-pain-title">{p.title}</h3>
              <p className="dg-pain-body">{p.body}</p>
            </li>
          ))}
        </ul>

        <dl className="dg-stats">
          {c.stats.map((s) => (
            <div className="dg-stat" key={s.value}>
              <dt className="dg-stat-value">{s.value}</dt>
              <dd className="dg-stat-label">{s.label}</dd>
              <dd className="dg-stat-source">
                {"href" in s && s.href ? (
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.source}
                  </a>
                ) : (
                  s.source
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="dg-bridge">
          <p className="dg-bridge-lead">{c.bridge.lead}</p>
          <p className="dg-bridge-sub">{c.bridge.sub}</p>
        </div>
      </div>
    </section>
  );
}
