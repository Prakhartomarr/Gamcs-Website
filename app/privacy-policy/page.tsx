import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CookiePreferencesLink from "@/components/CookiePreferencesLink";
import { contact, site } from "@/lib/content/gamcs";
import { GA_ID } from "@/lib/analytics";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How GA Management Consultants handles the information you share through this website — the contact form, cookies, analytics and third-party services.",
  path: "/privacy-policy",
});

/**
 * Privacy policy.
 *
 * NOT transcribed from gamcs.in — the published text could not be obtained
 * verbatim. What follows describes what THIS build actually does with data,
 * which is verifiable from the source:
 *
 *   - components/ContactForm.tsx  — mailto only, no network request
 *   - components/CookieConsent.tsx — the consent gate, stored in localStorage
 *   - components/Analytics.tsx    — GA4, only with NEXT_PUBLIC_GA_ID *and* opt-in
 *   - app/globals.css line 1      — Google Fonts, so Google sees visitor IPs
 *
 * Anything that depends on business or legal facts this repository cannot
 * know is rendered as a visible "to be confirmed" marker rather than guessed.
 * Each one carries a TODO(legal) or TODO(business) beside it.
 */

/** Visible placeholder — deliberately impossible to miss in a review. */
function TBC({ children }: { children: React.ReactNode }) {
  return <mark className="tbc">To be confirmed: {children}</mark>;
}

const GOOGLE_PRIVACY = "https://policies.google.com/privacy";

export default function PrivacyPolicyPage() {
  const formFields = contact.fields.map((f) => f.label.toLowerCase()).join(", ");

  return (
    <>
      <section className="page-head">
        <div className="container">
          <Breadcrumbs trail={[{ label: "Privacy Policy", href: "/privacy-policy" }]} />
          <div className="section-kicker">LEGAL</div>
          <h1>Privacy Policy</h1>
          <p>
            This policy explains what happens to information you share with{" "}
            {site.legalName} through {site.url.replace(/^https?:\/\//, "")}.
          </p>
        </div>
      </section>

      <section className="section legal-page">
        <div className="container">
          {/* TODO(legal): delete this banner once the policy has been reviewed
              and the placeholders below have been filled in. */}
          <p className="legal-draft" role="note">
            <strong>Draft pending legal review.</strong> The practices described
            below match how this website is actually built. Items marked
            &ldquo;to be confirmed&rdquo; need input from GA Management
            Consultants before publication.
          </p>

          <div className="legal-body">
            <h2>1. Who is responsible</h2>
            <p>
              {site.legalName} (&ldquo;GAMCS&rdquo;, &ldquo;we&rdquo;) is
              responsible for the information described here. You can reach us
              at <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
            <p>
              {/* TODO(business): registered office address — set site.address. */}
              <TBC>registered office address</TBC>{" "}
              {/* TODO(legal): India&apos;s DPDP Act requires a named Data
                  Protection Officer / Grievance Officer for certain entities. */}
              <TBC>
                name and contact details of the Data Protection / Grievance
                Officer, if one is required
              </TBC>
            </p>

            <h2>2. Information you give us</h2>
            <p>
              The contact form on this site asks for: {formFields}. It does not
              send anything to a server of ours. Submitting it opens a
              pre-filled message in your own email application, addressed to{" "}
              {site.email}; we receive your details only if you choose to send
              that email. Until you do, the information stays on your device.
            </p>
            <p>
              If you email us or connect on LinkedIn, we hold that
              correspondence and whatever you include in it.
            </p>

            <h2>3. Information collected automatically</h2>
            <p>
              <strong>Analytics.</strong>{" "}
              {GA_ID
                ? "If — and only if — you accept analytics cookies, this site uses Google Analytics 4 to understand how visitors use it: pages viewed, approximate location derived from your IP address, device and browser type, and interactions such as clicking a call to action or submitting the contact form. Google processes this data on our behalf. If you decline, the Google Analytics script is never loaded and none of this is collected."
                : "Google Analytics is integrated but is not enabled on this build — no measurement ID is configured, so no analytics script loads and no analytics data is collected. If it is switched on, it will run only for visitors who accept analytics cookies, and will record pages viewed, approximate location derived from your IP address, device and browser type, and interactions such as clicking a call to action or submitting the contact form."}
            </p>
            <p>
              <strong>Hosting logs.</strong> Our hosting provider records
              standard technical information, such as IP address, request time
              and user agent, in order to serve and secure the site.{" "}
              {/* TODO(business): name the hosting provider and its region. */}
              <TBC>hosting provider, its location, and log retention period</TBC>
            </p>

            <h2>4. Cookies</h2>
            <p>This site uses:</p>
            <ul>
              <li>
                <strong>Essential cookies</strong> — required for basic site
                function (e.g. remembering your cookie preference itself). These
                cannot be disabled.
              </li>
              <li>
                <strong>Analytics cookies (optional)</strong> — Google Analytics
                4, used only if you accept analytics cookies via our cookie
                banner. This helps us understand aggregate visitor behaviour
                (e.g. which pages are most visited). We do not use this data for
                advertising, and we do not sell it.
              </li>
            </ul>
            <p>
              You can change your cookie preferences at any time via the{" "}
              &ldquo;Cookie Preferences&rdquo; link in our footer, or{" "}
              <CookiePreferencesLink
                className="legal-inline-button"
                label="open the preferences panel now"
              />
              .
            </p>

            <h2>5. Third-party services</h2>
            <p>
              We use the following third-party services, each with their own
              privacy practices:
            </p>
            <ul>
              <li>
                <strong>Google Analytics</strong> (if you have accepted analytics
                cookies) —{" "}
                <a href={GOOGLE_PRIVACY} target="_blank" rel="noopener">
                  Google&rsquo;s privacy policy
                </a>
              </li>
              <li>
                <strong>Google Fonts</strong> — loads fonts from Google&rsquo;s
                servers, which may log your IP address per Google&rsquo;s
                practices —{" "}
                <a href={GOOGLE_PRIVACY} target="_blank" rel="noopener">
                  Google&rsquo;s privacy policy
                </a>
              </li>
              <li>
                <strong>LinkedIn</strong> — only if you follow the link to our
                company page; LinkedIn&rsquo;s own policy applies there.
              </li>
              <li>
                <strong>Your email provider</strong> — the contact form composes
                a message in the application you already use.
              </li>
              <li>
                {/* TODO(business): name the hosting provider and its log retention. */}
                <strong>Hosting provider</strong> — processes server logs.{" "}
                <TBC>hosting provider name and log retention period</TBC>
              </li>
            </ul>
            <p>
              We do not sell your information, and we do not use it for
              advertising or profiling.
            </p>

            <h2>6. Our legal basis for processing your data</h2>
            <ul>
              <li>
                <strong>Contact form submissions:</strong> processed under{" "}
                <em>legitimate interest</em> — responding to enquiries you have
                initiated is necessary for us to operate as a consultancy.
              </li>
              <li>
                <strong>Analytics cookies:</strong> processed under{" "}
                <em>consent</em> — collected only if you opt in via our cookie
                banner, and you may withdraw consent at any time.
              </li>
              <li>
                {/* TODO(legal): confirm lawful bases under UK/EU GDPR Art. 6. */}
                <TBC>
                  with counsel, whether any additional lawful basis applies
                  (e.g. contract, once an engagement begins)
                </TBC>
              </li>
            </ul>

            <h2>7. How long we keep your data</h2>
            <ul>
              <li>
                {/* TODO(business): state the email retention practice. */}
                Contact form enquiries sent via email are retained in our
                mailbox per our{" "}
                <TBC>
                  business email retention practice — e.g. a stated standard
                  retention period, or a specific duration if you have an
                  internal policy
                </TBC>
              </li>
              <li>
                {/* TODO(business): confirm the GA4 admin retention window. */}
                Analytics data is retained per Google&rsquo;s GA4 retention
                settings unless changed by us.{" "}
                <TBC>
                  the configured retention window in GA4 admin — the default is
                  2 or 14 months depending on setup
                </TBC>
              </li>
            </ul>

            <h2>8. Your rights</h2>
            <p>
              Depending on your location, you may have the right to:
            </p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for analytics cookies at any time</li>
              <li>Object to processing based on legitimate interest</li>
              <li>Lodge a complaint with your local data protection authority</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href={`mailto:${site.email}`}>{site.email}</a>.{" "}
              {/* TODO(business): a dedicated, clearly labelled privacy inbox. */}
              <TBC>
                dedicated privacy / DPO contact email — this can be a general
                inbox if no DPO exists, but it should be clearly labelled
              </TBC>
            </p>
            <p>
              {/* TODO(legal): confirm applicable regimes and the correct
                  supervisory authority to name (ICO for the UK, the Data
                  Protection Board of India, or both). */}
              <TBC>
                which data protection regimes apply and which supervisory
                authority to name
              </TBC>
            </p>

            <h2>9. Children</h2>
            <p>
              This site is aimed at businesses and is not directed at children.
              We do not knowingly collect information from anyone under 18.
            </p>

            <h2>10. Changes to this policy</h2>
            <p>
              We will post any changes on this page.{" "}
              {/* TODO(business): set and maintain the effective date. */}
              <TBC>effective date of this version</TBC>
            </p>

            <h2>11. Contact</h2>
            <p>
              Questions about this policy:{" "}
              <a href={`mailto:${site.email}`}>{site.email}</a>, or use the{" "}
              <Link href="/contact">contact page</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
