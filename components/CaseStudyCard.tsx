import type { CaseStudy } from "@/lib/content/gamcs";

/**
 * One case study.
 *
 * The live site publishes a title and a one-line blurb per engagement and
 * nothing else, so that is all this renders today. The problem → solution →
 * outcome structure is wired and will appear per card as soon as those
 * fields are filled in on `caseStudies.items`; results are never inferred
 * from the site-wide achievement figures, which belong to no single client.
 */
export default function CaseStudyCard({ item }: { item: CaseStudy }) {
  const steps = [
    { label: "Problem", value: item.problem },
    { label: "Solution", value: item.solution },
    { label: "Outcome", value: item.outcome },
  ].filter((s) => s.value);

  return (
    <article className="case-item reveal" data-lift>
      <div className="case-no">Case Study {item.no}</div>
      <h3>{item.title}</h3>
      <p>{item.blurb}</p>

      {steps.length > 0 && (
        <dl className="case-steps">
          {steps.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}
