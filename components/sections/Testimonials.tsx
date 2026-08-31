import { existsSync } from "node:fs";
import path from "node:path";
import { ScrollReelTestimonials } from "@/components/ui/scroll-reel-testimonials";
import SectionEyebrow from "@/components/SectionEyebrow";
import { testimonials } from "@/lib/content/gamcs";
import { initials } from "@/lib/utils";


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
  /* Keyed off the company string in `testimonials`, so this moves with it. */
  "Two Brothers India Farms": {
    src: "/logos/clients/two-brothers-new.png",
    alt: "Two Brothers India Farms",
  },
  "Three Sixty Finance": {
    src: "/logos/partners/threesixty.png",
    alt: "Threesixty Finance",
  },
};

/** "Three Sixty Finance, UK" -> "Three Sixty Finance" */
const companyKey = (company: string) => company.split(",")[0].trim();

export default function Testimonials() {
  const items = testimonials.items.map((t) => {
    const logo = COMPANY_LOGOS[companyKey(t.company)];
    /* Falls back to the person's initials if the artwork is not on disk, so a
       missing file degrades the way an unmatched company already does. */
    const hasArt =
      logo && existsSync(path.join(process.cwd(), "public", logo.src));
    return {
      quote: t.quote,
      author: `${t.name} — ${t.title}, ${t.company}`,
      monogram: initials(t.name),
      image: hasArt ? logo.src : undefined,
      alt: hasArt ? logo.alt : undefined,
    };
  });

  return (
    <section className="quote-section" id="testimonials">
      <div className="container">
        <div className="section-head reveal">
          <div>
            <SectionEyebrow label="Testimonials" />
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
