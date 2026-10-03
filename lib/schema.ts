import { faq, site, team } from "@/lib/content/gamcs";
import { SITE_URL, absolute } from "@/lib/seo";
import { intro } from "@/lib/content/gamcs";

/**
 * Structured data, built only from facts the site already publishes.
 *
 * Deliberately absent: address, telephone, opening hours, aggregateRating,
 * priceRange. GAMCS publishes none of them, and inventing any one of them is
 * both a lie and a Google penalty. `postalAddress` / `telephone` appear
 * automatically the moment `site.address` / `site.phone` are filled in, at
 * which point the type can be upgraded from Organization to ProfessionalService.
 */
const ORG_ID = `${SITE_URL}/#organization`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    legalName: site.legalName,
    alternateName: site.short,
    url: SITE_URL,
    logo: absolute(site.logo),
    image: absolute("/opengraph-image"),
    email: site.email,
    description: intro,
    slogan: site.tagline,
    sameAs: [site.linkedin],
    founder: team.leadership.map((m) => ({
      "@type": "Person",
      name: m.name,
      jobTitle: m.title,
    })),
    ...(site.phone ? { telephone: site.phone } : {}),
    ...(site.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: site.address.street,
            addressLocality: site.address.locality,
            addressRegion: site.address.region,
            postalCode: site.address.postalCode,
            addressCountry: site.address.country,
          },
        }
      : {}),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: site.name,
    description: intro,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  };
}

/**
 * Both founders, as Person nodes, for /who-we-are.
 *
 * Every field here is one the repo can point at: the name, the title the
 * client wrote, the real personal LinkedIn profile, and the firm they work
 * for (by reference, so there is one Organization node on the page, not two).
 *
 * Deliberately absent, because none of it is established anywhere in this
 * codebase: `alumniOf` (no college is named), `hasCredential` (the repo says
 * "Chartered Accountant" and nothing about the institute, the year or the
 * grade), `award`, `knowsAbout`, and any years-of-experience figure. A lie in
 * JSON-LD is still a lie, and it is the version Google quotes back.
 *
 * `jobTitle` is `team.leadership[n].title` untouched — the client's own
 * wording, including the "Specialist" that /who-we-are drops from its own
 * role line so the two founders read in one format.
 *
 * Render it with the same component as the other two:
 *   <JsonLd data={foundersSchema()} />
 */
export function foundersSchema() {
  const id = (name: string) =>
    `${absolute("/who-we-are")}#${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return {
    "@context": "https://schema.org",
    "@graph": team.leadership.map((m) => ({
      "@type": "Person",
      "@id": id(m.name),
      name: m.name,
      jobTitle: m.title,
      sameAs: [m.linkedinUrl],
      worksFor: { "@id": ORG_ID },
    })),
  };
}

export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
