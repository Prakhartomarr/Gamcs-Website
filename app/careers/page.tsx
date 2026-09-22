import type { Metadata } from "next";
import CTA from "@/components/CTA";
import CareersSplit from "@/components/careers/CareersSplit";
import { careers, story, whyUs } from "@/lib/content/gamcs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Careers",
  description: careers.intro,
  path: "/careers",
});

/* "One Team. One Integrated Finance Engine." -> the claim and its follow-on. */
const principles = whyUs.points.slice(0, 4).map((p) => {
  const cut = p.lead.indexOf(". ") + 1;
  return [p.lead.slice(0, cut), p.lead.slice(cut + 1)];
});

export default function CareersPage() {
  const { why, work, closing } = careers;
  return (
    <>
      {/* The split holds the tracks, Why GAMCS and How we work, then ends;
          the closing band runs full width under it. */}
      <CareersSplit>
        <section className="cr-block reveal" aria-labelledby="cr-why-h">
          <div className="cr-caps">{why.eyebrow}</div>
          <h2 id="cr-why-h">{why.heading}</h2>
          <div className="cr-why">
            {why.items.map((item, i) => (
              <div className="cr-why-row" key={item.title}>
                <div className="cr-num" aria-hidden="true">{i + 1}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cr-block cr-work cr-dark reveal" aria-labelledby="cr-work-h">
          <div className="cr-caps">{work.eyebrow}</div>
          <h2 id="cr-work-h">
            {work.headingLead} <span>{work.headingAccent}</span>
          </h2>
          <ul>
            {principles.map(([lead, rest]) => (
              <li key={lead}>
                <span>{lead}</span> <span>{rest}</span>
              </li>
            ))}
          </ul>
          <p>{story.mission}</p>
        </section>
      </CareersSplit>

      <section className="cr-wide cr-close cr-dark">
        <div className="container">
          <div className="case-cta reveal">
            <h2>{closing.heading}</h2>
            <div className="ctas">
              {closing.links.map((l) => (
                <CTA key={l.href} href={l.href} tier="secondary" icon="arrow">{l.label}</CTA>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
