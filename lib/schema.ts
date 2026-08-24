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

export function breadcrumbSchema(trail: { label: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: absolute(c.href),
    })),
  };
}
