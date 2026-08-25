import Link from "next/link";
import SectionEyebrow from "@/components/SectionEyebrow";
import { maturityCurve } from "@/lib/content/gamcs";

/**
 * The finance maturity curve — four stages, left to right.
 *
 * The progression is carried by weight rather than by a drawn chart: the rail
 * fills toward stage 4 and the last card takes the blue panel treatment
 * already used by the achievements bento, so "where you are" reads at a
 * glance without another illustration to maintain.
 */
export default function MaturityCurve() {
  return (
    <section className="section maturity" id="maturity-curve">
      <div className="container">
        <div className="reveal">
          <SectionEyebrow n={3} label="The maturity curve" />
          <h2 className="maturity-heading">{maturityCurve.heading}</h2>
        </div>

        <ol className="maturity-grid">
          {maturityCurve.stages.map((stage, i) => (
            <li
              className={`maturity-stage reveal${i === maturityCurve.stages.length - 1 ? " is-goal" : ""}`}
              key={stage.n}
              data-lift
            >
              <span className="maturity-rail" aria-hidden="true">
                <span style={{ width: `${((i + 1) / maturityCurve.stages.length) * 100}%` }} />
              </span>
              <span className="maturity-n">{stage.n}</span>
              <h3>{stage.name}</h3>
              <p>{stage.body}</p>
            </li>
          ))}
        </ol>

        <div className="maturity-foot reveal">
          <p>{maturityCurve.footnote}</p>
          <Link
            className="btn btn-light"
            href={maturityCurve.cta.href}
            data-cta="maturity-curve"
            data-press
          >
            <span className="btn-label">
              {maturityCurve.cta.label} <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
