import type { Metadata } from "next";
import Image from "next/image";
import CTA from "@/components/CTA";
import SectionEyebrow from "@/components/SectionEyebrow";
import CareersSplit from "@/components/careers/CareersSplit";
import PeopleStrip from "@/components/careers/PeopleStrip";
import { careers, story, team, whyUs } from "@/lib/content/gamcs";
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
  const { why, work, hire, closing } = careers;
  return (
    <>
      {/* The split holds the tracks, Why GAMCS and How we work, then ends:
          everything after it runs full width. */}
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

      <section className="cr-wide cr-hire" id="process" aria-labelledby="cr-hire-h">
        <div className="container cr-hire-grid">
          <div className="reveal">
            <SectionEyebrow label={hire.eyebrow} />
            <h2 id="cr-hire-h">{hire.heading}</h2>
            <figure>
              <Image src={team.foundersPhoto} alt={hire.photoAlt} width={880} height={880} sizes="(max-width: 767px) 100vw, 50vw" />
              <figcaption>{hire.photoCaption}</figcaption>
            </figure>
          </div>
          <ol className="cr-steps reveal">
            {hire.steps.map((s, i) => (
              <li key={s.title}>
                <span className="cr-step-n" aria-hidden="true">{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <PeopleStrip />

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
