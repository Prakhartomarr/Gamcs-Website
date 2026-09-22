import PageHeadArt from "@/components/PageHeadArt";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactForm from "@/components/ContactForm";
import Directions from "@/components/Directions";
import Rich from "@/components/Rich";
import { contact, site, team } from "@/lib/content/gamcs";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";

const t = pages.contact;

export const metadata: Metadata = pageMetadata({
  title: t.title,
  description: t.description,
  path: "/contact",
});

/**
 * Contact details page.
 *
 * Every detail here is real: the email, LinkedIn and website come from
 * `site`, and the legal name is the one used in the published privacy
 * policy. gamcs.in publishes no phone number or postal address, so neither
 * is shown and `<Directions>` renders nothing — fill in `site.phone` /
 * `site.address` and both appear here automatically.
 */
export default function ContactPage() {
  const details = [
    { label: t.generalInquiries, value: site.email, href: `mailto:${site.email}` },
    /* The handle as displayed: the company URL without scheme or the
       country subdomain. */
    { label: t.linkedin, value: site.linkedin.replace(/^https?:\/\/(\w{2,3}\.)?/, ""), href: site.linkedin },
    { label: t.website, value: site.url.replace(/^https?:\/\//, ""), href: site.url },
    ...(site.phone
      ? [{ label: t.phone, value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` }]
      : []),
  ];

  return (
    <>
      <section className="page-head page-head--art">
        <div className="container">
          <Breadcrumbs trail={[{ label: t.crumb, href: "/contact" }]} />
          <div className="section-kicker">{t.kicker}</div>
          <h1>{contact.heading}</h1>
          <p>{t.lead}</p>
        </div>
              <PageHeadArt src="/page-art/contact.webp" />
      </section>

      <section className="contact" id="contact">
        <div className="container">
          <div className="contact-box">
            <div>
              <div className="section-kicker" style={{ color: "var(--yellow)" }}>
                {t.detailsKicker}
              </div>
              <ul className="contact-details">
                {details.map((d) => (
                  <li key={d.label}>
                    <span className="contact-details-label">{d.label}</span>
                    <a
                      className="contact-details-value"
                      href={d.href}
                      {...(d.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener" }
                        : {})}
                    >
                      {d.value} ↗
                    </a>
                  </li>
                ))}
                <li>
                  <span className="contact-details-label">{t.registeredName}</span>
                  <span className="contact-details-value as-text">{site.legalName}</span>
                </li>
                {/* Direct founder addresses, per the copy doc. Rendered from
                    team.leadership so the names and titles cannot drift from
                    the team page. */}
                {team.leadership
                  .filter((m) => "email" in m && m.email)
                  .map((m) => (
                    <li key={m.name}>
                      <span className="contact-details-label">{m.name}</span>
                      <a className="contact-details-value" href={`mailto:${m.email}`}>
                        {m.email} ↗
                      </a>
                    </li>
                  ))}

                {/* Rendered only when a real commitment exists — see
                    site.responseTime in lib/content/gamcs.ts. */}
                {site.responseTime ? (
                  <li>
                    <span className="contact-details-label">{t.typicalReply}</span>
                    <span className="contact-details-value as-text">
                      {site.responseTime}
                    </span>
                  </li>
                ) : null}
              </ul>

              {/* Renders nothing until site.address is supplied. */}
              <Directions />

              <p className="contact-privacy">
                <Rich parts={t.privacy} />
              </p>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
