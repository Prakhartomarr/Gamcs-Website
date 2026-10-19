import { existsSync } from "node:fs";
import path from "node:path";
import { ScrollReelTestimonials } from "@/components/ui/scroll-reel-testimonials";
import { testimonials } from "@/lib/content/gamcs";
import { fill } from "@/lib/content/fill";
import { sections } from "@/lib/content/ui";
import { initials } from "@/lib/utils";


/**
 * All six testimonials, quoted in full, in the scroll-reel carousel.
 *
 * The featured tile shows the author's PORTRAIT. It used to show the company
 * logo, and the reasoning then was sound — the site published no photograph of
 * either person and a stock face on a real person's quote would misrepresent
 * them. The client has since supplied the real six, so the tile shows the
 * person who said the words. The company has not gone anywhere: it is in the
 * byline under every quote and on the logo wall above this section.
 *
 * `imageFit="cover"` is not a detail. The reel desaturates a tile only when
 * it is filling it — which is right for a face and wrong for a logo — and it
 * is what makes six headshots shot in six different places, against beige,
 * white, grey and a red disc, read as one set. (It used to apply a violet
 * gradient sheen as well; that is gone at the client's request.)
 *
 * A portrait missing from disk falls back to the person's initials rather than
 * to a hole.
 */
export default function Testimonials() {
  const items = testimonials.items.map((t) => {
    const photo = "photo" in t ? t.photo : undefined;
    /* Falls back to the person's initials if the portrait is not on disk. */
    const hasArt =
      photo && existsSync(path.join(process.cwd(), "public", photo.src));
    /* All six carry a role today. The template is still picked on its presence
       rather than the role being defaulted, because `fill` leaves an unknown
       slot as written and an empty one as nothing — either way a title-less
       author would ship the comma that belonged to the missing title. */
    const title = "title" in t ? t.title : undefined;
    return {
      quote: t.quote,
      author: t.name,
      /* Second line of the byline. Still chosen on the role's presence rather
         than defaulted: `fill` leaves an unknown slot as written and an empty
         one as nothing, so a title-less person would otherwise ship the comma
         that belonged to the missing title. */
      authorRole: title
        ? fill(sections.byline, { title, company: t.company })
        : fill(sections.bylineNoTitle, { company: t.company }),
      monogram: initials(t.name),
      image: hasArt ? photo.src : undefined,
      alt: hasArt ? photo.alt : undefined,
    };
  });

  return (
    <section className="quote-section" id="testimonials">
      <div className="container">
        <div className="section-head reveal">
          <div>
            <h2>{testimonials.heading}</h2>
          </div>
        </div>
        {/* bg-muted is all but identical to the section's --soft, so the
            card is lifted to white to read against it. */}
        <ScrollReelTestimonials
          testimonials={items}
          charStaggerMs={2}
          className="mx-auto bg-white"
          imageFit="cover"
          autoAdvanceMs={4000}
        />
      </div>
    </section>
  );
}
