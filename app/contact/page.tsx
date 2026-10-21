import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import ContactOffices from "@/components/ContactOffices";
import Rich from "@/components/Rich";
import { contact, site, team } from "@/lib/content/gamcs";
import { map } from "@/lib/content/ui";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";

const t = pages.contact;

export const metadata: Metadata = pageMetadata({
  title: t.title,
  description: t.description,
  path: "/contact",
});

/**
 * Contact page.
 *
 * REBUILT 2026-10-21 to the three-section shape the client sent as a
 * reference, then rebuilt again the same day against three screenshots of
 * it. The nav, the footer and every word are unchanged — the client asked
 * for the sections and nothing else, and explicitly declined the eyebrows,
 * section leads and field placeholders the reference carries, because none
 * of that copy exists here.
 *
 * NO PAGE HEAD. This is the only route without one. In the reference the H1
 * lives inside the dark card, with the lead under it and a white card of
 * detail below that, so the blue banner would have been the same two strings
 * printed twice on one screen. `contact.heading` and `pages.contact.lead`
 * are unmoved in the content module; only where they render changed.
 *
 * WHAT ELSE MOVED, and why each is layout rather than copy:
 *   - The details and the form were inside ONE dark `.contact-box`. They are
 *     two cards now: the details sit in the white card inside the dark one,
 *     the form on the page's own ground. Same elements, same order, same
 *     words.
 *   - `<Directions>` is gone from this page. It printed `site.address` —
 *     the registered office, one of three — so Noida and Bangalore were on
 *     the homepage and in the footer but not here. `<ContactOffices>` prints
 *     all three from the same `officeCards` the rest of the site reads.
 *   - A block of four questions was added here and taken off again the same
 *     day (client). /faq publishes them in full and the footer links to it,
 *     so this page is the form, the details and the offices — nothing else.
 *
 * Every detail is still real: the email, LinkedIn and website come from
 * `site`, and the legal name is the one in the published privacy policy.
 * gamcs.in publishes no phone number, so `t.phone` renders nothing until
 * `site.phone` is filled in.
 */
export default function ContactPage() {
  /* SIX ROWS DOWN TO THREE (client, 2026-10-21): "I don't want all this
     information." What is left is the three ways to reach a person. Each of
     the three that went is published elsewhere on this very page:

       LinkedIn         the footer's own tile, which links to site.linkedin
       Website          this is the website
       Registered name  the footer's bottom bar, in site.copyright

     The strings stay in lib/content/pages.ts. Nothing was deleted from the
     copy deck; three rows stopped rendering. */
  const details = [
    { label: t.generalInquiries, value: site.email, href: `mailto:${site.email}` },
    ...(site.phone
      ? [{ label: t.phone, value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` }]
      : []),
  ];

  return (
    <>
      {/* ── the form, and what to write to instead ──────────────────── */}
      <section className="cx-form" id="contact">
        <div className="container">
          <div className="cx-grid">
            {/* The H1 is in here, so this card clears the floating header on
                its own — see `.cx-form`'s padding-top in globals.css. */}
            <aside className="cx-card reveal">
              <h1 className="cx-h1">{contact.heading}</h1>
              <p className="cx-lead">{t.lead}</p>

              {/* The white card inside the dark one, where the reference puts
                  its "Partner with our vision" block — and kept as short as
                  that block is. Three rows, all of them an address a person
                  answers; see the note on `details` for the three that came
                  out and where each still appears. */}
              <div className="cx-inner">
                <div className="section-kicker">{t.detailsKicker}</div>
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
                  {/* Direct founder addresses, per the copy doc. Rendered
                      from team.leadership so the names and titles cannot
                      drift from the team page. */}
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
              </div>
            </aside>

            <div className="cx-formwrap reveal">
              <ContactForm />
              {/* Under the fields, where it describes what pressing Submit
                  does, rather than in the card on the other side of the row. */}
              <p className="contact-privacy">
                <Rich parts={t.privacy} />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── the three offices ───────────────────────────────────────── */}
      <section className="cx-offices" id="offices">
        <div className="container">
          {/* `map.visitUs` is stored in the client's caps, like
              `ourStory.glance.heading` is; nothing here uppercases it. */}
          <h2 className="cx-h cx-h--center">{map.visitUs}</h2>
          <ContactOffices />
        </div>
      </section>
    </>
  );
}
