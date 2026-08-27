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
 * The featured tile shows the client's COMPANY logo, not a portrait. The
 * original reasoning still holds — the live site publishes no photograph of
 * either person, and a stock face on a real named person's quote would
 * misrepresent them — but a company mark carries no such risk, and it
 * identifies the client better than their initials did.
 *
 * Logos are keyed off the company string rather than array position, so
 * reordering or adding a testimonial cannot silently mis-attribute a mark.
 * Anything unmatched falls back to the person's initials, as before.
 */
const COMPANY_LOGOS: Record<string, { src: string; alt: string }> = {
  /* "TBOF" is Two Brothers Organic Farms. */
  TBOF: {
    src: "/logos/clients/two-brothers.png",
    alt: "Two Brothers Organic Farms",
  },
  "Three Sixty Finance": {
    src: "/logos/partners/threesixty.png",
    alt: "Threesixty Finance",
  },
};

/** "TBOF, India" -> "TBOF" */
const companyKey = (company: string) => company.split(",")[0].trim();

export default function Testimonials() {
  const items = testimonials.items.map((t) => {
    const logo = COMPANY_LOGOS[companyKey(t.company)];
    return {
      quote: t.quote,
      author: `${t.name} — ${t.title}, ${t.company}`,
      monogram: initials(t.name),
      image: logo?.src,
      alt: logo?.alt,
    };
  });

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
          imageFit="contain"
          autoAdvanceMs={4000}
        />
      </div>
    </section>
  );
}
