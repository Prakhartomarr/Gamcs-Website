import Link from "next/link";
import type { Metadata } from "next";
import { primaryCta, services, site } from "@/lib/content/gamcs";
import { fill } from "@/lib/content/fill";
import { pages } from "@/lib/content/pages";
import CTA from "@/components/CTA";

const t = pages.notFound;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  robots: { index: false, follow: true },
  /* Without these the 404 inherits the root canonical and og:url, so a
     mistyped link shared in chat unfurled as the homepage. Replacing the
     openGraph and twitter objects drops the inherited url with them. */
  alternates: { canonical: null },
  openGraph: { title: t.title },
  twitter: { title: t.title },
};

/**
 * 404. Rendered inside the root layout, so the header, footer and brand come
 * along automatically — a visitor who lands here is never stranded.
 *
 * The onward links are the four routes that actually exist, not a sitemap
 * dump, so every one of them resolves.
 */
export default function NotFound() {
  return (
    <section className="section notfound">
      <div className="container">
        <p className="notfound-code" aria-hidden="true">
          404
        </p>
        <div className="section-kicker">{t.kicker}</div>
        <h1 className="notfound-title">
          {t.h1} <em>{t.h1Accent}</em>
        </h1>
        <p className="notfound-body">{fill(t.body, { short: site.short })}</p>

        <div className="ctas notfound-ctas">
          <CTA href="/" data-cta="404-home" icon="arrow">
            {t.backHome}
          </CTA>
          <CTA href={primaryCta.href}
            data-cta="404-contact" tier="secondary" icon="diagonal">
            {primaryCta.label}
          </CTA>
        </div>

        <div className="notfound-links">
          <h2>{t.elsewhereHeading}</h2>
          <ul>
            {t.elsewhere.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
          <p className="notfound-hint">
            {fill(t.hint, {
              count: services.business.length + services.technology.length + services.training.length,
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
