import TailwindImageAccordion from "@/components/ui/tailwind-image-accordion";
import SectionEyebrow from "@/components/SectionEyebrow";
import { team } from "@/lib/content/gamcs";

/**
 * Homepage founders section: the image accordion, two panels.
 *
 * Only `team.leadership` (Founder + Co-Founder) appears here; the seven
 * advisory members are still listed in full on /team.
 *
 * Portraits come from `leadership[].photo`, used exactly as supplied —
 * resized for the web, no tone or contrast edits. The two shots have
 * different backdrops (Gaurav's darker, Abhinav's lighter) and that
 * difference is intentional. Members without a photo show a monogram.
 */
export default function Team() {
  const items = team.leadership.map((m, i) => ({
    id: String(i + 1),
    title: m.name,
    description: m.title,
    url: m.photo,
  }));

  return (
    <section className="people" id="people">
      <div className="container">
        <div className="section-head reveal">
          <div>
            <SectionEyebrow n={5} label="Founders" />
            <h2>
              {team.headingLines[0]} <em>{team.headingLines[1]}</em>
            </h2>
          </div>
        </div>
        <TailwindImageAccordion items={items} />
      </div>
    </section>
  );
}
