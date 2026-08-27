import Link from "next/link";
import type { Metadata } from "next";
import { primaryCta, services, site } from "@/lib/content/gamcs";
import CTA from "@/components/CTA";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "That page does not exist. Head back to the homepage or get in touch with GA Management Consultants.",
  robots: { index: false, follow: true },
};

/**
 * 404. Rendered inside the root layout, so the header, footer and brand come
 * along automatically — a visitor who lands here is never stranded.
 *
 * The onward links are the four routes that actually exist, not a sitemap
 * dump, so every one of them resolves.
 */
export default function NotFound() {
  const elsewhere = [
    { label: "Case studies", href: "/case-study" },
    { label: "Founders & advisors", href: "/team" },
    { label: "How we help", href: "/#how-we-help" },
    { label: "Our services", href: "/#solutions" },
  ];

  return (
    <section className="section notfound">
      <div className="container">
        <p className="notfound-code" aria-hidden="true">
          404
        </p>
        <div className="section-kicker">PAGE NOT FOUND</div>
        <h1 className="notfound-title">
          This page has moved on. <em>We haven&rsquo;t.</em>
        </h1>
        <p className="notfound-body">
          The link you followed doesn&rsquo;t lead anywhere on {site.short}. It may
          have been renamed, or the address may have a typo in it.
        </p>

        <div className="ctas notfound-ctas">
          <CTA href="/" data-cta="404-home" icon="arrow">
            Back to home
          </CTA>
          <CTA href={primaryCta.href}
            data-cta="404-contact" tier="secondary" icon="diagonal">
            {primaryCta.label}
          </CTA>
        </div>

        <div className="notfound-links">
          <h2>Or pick up from here</h2>
          <ul>
            {elsewhere.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
          <p className="notfound-hint">
            {services.business.length + services.technology.length + services.training.length}{" "}
            services across finance, technology and training.
          </p>
        </div>
      </div>
    </section>
  );
}
