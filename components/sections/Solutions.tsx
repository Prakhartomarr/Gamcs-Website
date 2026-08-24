import SectionEyebrow from "@/components/SectionEyebrow";
import { services } from "@/lib/content/gamcs";

const groups = [
  { id: "business-solutions", kicker: "BUSINESS SOLUTIONS", items: services.business, tone: "blue" },
  { id: "technology-solutions", kicker: "TECHNOLOGY SOLUTIONS", items: services.technology, tone: "dark" },
  { id: "training-programs", kicker: "TRAINING PROGRAMS", items: services.training, tone: "" },
];

/**
 * All three service lists, verbatim and complete, as they appear on the live site.
 *
 * The count beside each kicker is derived from the list itself, so it can never
 * drift from the content. Panels keep the existing blue / near-black / white
 * trio; only the header, corner light and hover are new.
 */
export default function Solutions() {
  return (
    <section className="services" id="solutions">
      <div className="container">
        <div className="section-head reveal">
          <div>
            <SectionEyebrow n={3} label="Our services" />
            <h2>{services.intro}</h2>
          </div>
        </div>
        <div className="solution-grid">
          {groups.map((g) => (
            <article className={`solution-card ${g.tone} reveal`} key={g.id} id={g.id} data-lift>
              <div className="solution-head">
                <div className="bento-num">{g.kicker}</div>
                <span className="solution-count" aria-hidden="true">
                  {g.items.length}
                </span>
              </div>
              <ul className="solution-list">
                {g.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
