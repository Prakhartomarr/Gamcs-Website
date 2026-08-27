import { ScrollReelTestimonials } from "@/components/ui/scroll-reel-testimonials";
import SectionEyebrow from "@/components/SectionEyebrow";
import { testimonials } from "@/lib/content/gamcs";

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

/**
 * Both testimonials, quoted in full, in the scroll-reel carousel.
 *
 * No `image` is passed: the live site publishes no portrait of either
 * client, and putting a stock face on a real named person's quote would
 * misrepresent them. The tiles fall back to the monogram treatment used
 * for the team. Supply real portraits and this becomes a one-line change.
 */
export default function Testimonials() {
  const items = testimonials.items.map((t) => ({
    quote: t.quote,
    author: `${t.name} — ${t.title}, ${t.company}`,
    monogram: initials(t.name),
  }));

  return (
    <section className="quote-section" id="testimonials">
      <div className="container">
        <div className="section-head reveal">
          <div>
            <SectionEyebrow n={7} label="Testimonials" />
            <h2>{testimonials.heading}</h2>
          </div>
        </div>
        {/* bg-muted is all but identical to the section's --soft, so the
            card is lifted to white to read against it. */}
        <ScrollReelTestimonials
          testimonials={items}
          charStaggerMs={2}
          className="mx-auto bg-white"
        />
      </div>
    </section>
  );
}
