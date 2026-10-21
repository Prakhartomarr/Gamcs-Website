import { existsSync, readFileSync } from "node:fs";
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
 *
 * The COMPANY MARK sits at the far end of the byline row, opposite the name.
 * It is the wall's own artwork and the wall's own solved height, not a second
 * copy of either — see the two constants below.
 */

const LOGO_DIR = path.join(process.cwd(), "public", "logos", "clients");

/* The wall's per-mark heights are NOT reused here, and that is the decision
   worth recording. They were solved so that twenty-two marks seen side by
   side carry the same weight of ink, which makes a dense three-line mark like
   Akshar's deliberately SMALL — 24px against Basilic Fly's 56. Scaled to a
   byline that put Akshar at 14px, where its three lines of type are simply
   unreadable.
   The reel shows ONE mark at a time, seconds apart, so cross-mark evenness is
   not what is being bought; legibility is. Two plain ceilings instead, the
   browser honouring whichever binds first — the same two-ceiling idea the
   wall uses, with the pair chosen for a byline rather than for a row. */

/**
 * A PNG's real pixel size, straight out of its IHDR header: next/image wants
 * the intrinsic ratio, and each mark is trimmed to its own artwork so its true
 * ratio is what sizing needs. The same two offsets ClientLogos reads — four
 * lines, duplicated rather than hoisted into lib/logo-wall.ts, because that
 * module is imported for its TYPE by a client component and pulling node:fs
 * into it is a bundling hazard for a saving of four lines.
 */
function pngSize(file: string) {
  const b = readFileSync(path.join(LOGO_DIR, file));
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

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
    /* Skipped rather than rendered as a broken image if the artwork is not on
       disk, the same trade ClientLogos makes: a testimonial can be added
       before its client's mark lands. This is a server component, so the check
       is a build-time disk read and costs nothing at runtime. */
    const logoFile = "logo" in t ? t.logo : undefined;
    const logo =
      logoFile && existsSync(path.join(LOGO_DIR, logoFile))
        ? { src: `/logos/clients/${logoFile}`, ...pngSize(logoFile) }
        : undefined;
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
      logo,
    };
  });

  return (
    <section className="quote-section" id="testimonials">
      <div className="container">
        {/* HEADING REMOVED FROM THE PAGE (client, 2026-10-21), not from the
            document. `achievements.heading` above now covers the figures and
            this carousel as one band, so a second visible heading here would
            say the same thing twice.

            It stays as an <h2> the eye cannot see because the footer's "What
            clients say" link points at #testimonials: a reader who follows it
            lands here with no visible heading in reach, and `sr-only` leaves
            them a name for the place they have arrived at while taking no
            space from the layout. */}
        <h2 className="sr-only">{testimonials.heading}</h2>
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
