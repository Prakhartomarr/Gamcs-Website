import Image from "next/image";
import { site, story, team } from "@/lib/content/gamcs";
import { fill } from "@/lib/content/fill";
import { roster, sections } from "@/lib/content/ui";
import CTA from "@/components/CTA";
import WhoFoundersReveal from "@/components/sections/WhoFoundersReveal";

/**
 * Who we are: the copy, the mission line and both links on the left, the
 * founders' portrait on the right.
 *
 * The portrait is the real founders rather than stock photography — the reason
 * an earlier version used `AbstractPanel` was that it would not depict people
 * who are not GAMCS, and the founders satisfy that while putting a face on the
 * firm. The box is a 530x620 portrait; the photograph is square, so `cover`
 * takes 7.3% off each side, which on this frame is backdrop either side of the
 * two of them and not shoulder.
 *
 * The link to the team page used to sit inside the card. It moved out beside
 * "About our firm" on 2026-10-21; what is still inside the card is the phone
 * reveal, which is a different control.
 */
export default function WhoWeAre() {
  /* Left of frame, then right — the order the alt text names them in. */
  const founders = team.leadership;

  /* Counted, never typed: the third figure is everyone the /team page lists,
     so an adviser joining moves it on its own. */
  const people = team.leadership.length + team.advisory.length;
  const stats = [
    { value: story.stats.yearsValue, label: story.stats.yearsLabel },
    { value: story.stats.foundedValue, label: story.stats.foundedLabel },
    { value: String(people), label: story.stats.peopleLabel },
  ];

  return (
    <section className="section who" id="who-we-are">
      <div className="container">
        <div className="who-row">
          <div className="who-copy reveal">
            {/* The "Who we are" eyebrow pill is gone (client, 2026-10-21).
                It named the section above a heading that already says what
                the section is, which is the pill-tag eyebrow the brief rules
                out. `sections.whoWeAre` went with it: this was its only
                reader. The links to this page carry their own labels: the
                nav's in ui.ts (header.items), the footer's in gamcs.ts
                (footer.links). */}
            <h2 className="who-heading">
              {story.headingLead}
              <span className="accent">{story.headingAccent}</span>
              {story.headingTail}
            </h2>
            <p className="who-lead">{story.lead}</p>

            {/* Phone only. `.who-stats` is display:none until 767px, so on
                desktop this generates no box and the column below it is
                unchanged; the order it renders in on mobile is set by
                `order` on the grid, not by its position here. */}
            <div className="who-stats">
              {stats.map((s) => (
                <div className="who-stat" key={s.label}>
                  <div className="who-stat-value">{s.value}</div>
                  <p className="who-stat-label">{s.label}</p>
                </div>
              ))}
            </div>

            {/* The mission now sits above the buttons rather than closing the
                column beneath them (client, 2026-10-21) — the two swapped
                places. It keeps its blue rule: directly under the lead
                paragraph, that rule is the only thing stopping it reading as
                a third paragraph of body copy. */}
            <p className="who-mission reveal">{story.mission}</p>

            {/* Both links, one row (client, 2026-10-21). "Meet our founders"
                used to sit on frosted glass inside the portrait; it is the
                same CTA with the same href, moved out and left to the plain
                outlined treatment it had underneath. Two outlined pills, not
                one filled: the page's one filled button is "Schedule a Call"
                in the header, and this section is not asking for a
                conversion.

                The wrapper carries no margin of its own. `.who-copy .btn`
                already spaces a button from what is above it — 30px here,
                28px on a phone — and leaving that on the buttons means the
                row needs no second set of numbers to keep in step. */}
            <div className="who-ctas">
              {/* The section opens the story and hands the rest to
                  /who-we-are. It used to point at /contact, which is not
                  what the label says. */}
              <CTA href="/who-we-are" tier="secondary" icon="diagonal">
                {sections.aboutFirm}
              </CTA>
              <CTA
                href="/team"
                tier="secondary"
                icon="arrow"
                data-cta="who-founders"
                className="who-founders-btn"
              >
                {sections.meetFounders}
              </CTA>
            </div>
          </div>

          <div className="who-figure reveal">
            <div className="who-portrait">
              <Image
                src={team.foundersPhoto}
                alt={fill(sections.foundersAlt, { first: founders[0].name, second: founders[1].name, siteName: site.name })}
                width={880}
                height={880}
                sizes="(max-width: 1279px) 92vw, 530px"
              />
              {/* Phone only, and still the replacement for the "Meet our
                  founders" link rather than an addition to it: `.who-reveal`
                  is display:none until 767px, where the same block hides
                  `.who-founders-btn` wherever it now sits. The link left this
                  card on 2026-10-21; the reveal did not, because on a phone
                  it is a different control — it opens a panel with the
                  founders' faces rather than navigating to /team. */}
              <WhoFoundersReveal
                founders={founders.map((f) => ({ name: f.name, title: f.title, photo: f.photo }))}
                openLabel={sections.meetFounders}
                teamLabel={sections.fullTeam}
                closeLabel={roster.close}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
