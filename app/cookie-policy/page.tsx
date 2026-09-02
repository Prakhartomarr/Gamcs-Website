import Link from "next/link";
import PageHeadArt from "@/components/PageHeadArt";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CookiePreferencesLink from "@/components/CookiePreferencesLink";
import { site } from "@/lib/content/gamcs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Cookie Policy",
  description:
    "How GA Management Consultants uses cookies and similar technologies on gamcs.in, and how you can manage your preferences.",
  path: "/cookie-policy",
});

/**
 * Cookie Policy.
 *
 * Cloned from app/privacy-policy/page.tsx — same page-head, same `.legal-page`
 * / `.legal-body` classes, same breadcrumb. Only the text differs.
 *
 * Unlike the privacy policy, this copy IS supplied and approved (copy doc,
 * Page 13), so it carries no draft banner and no "to be confirmed" markers.
 */
export default function CookiePolicyPage() {
  return (
    <>
      <section className="page-head page-head--art">
        <div className="container">
          <Breadcrumbs trail={[{ label: "Cookie Policy", href: "/cookie-policy" }]} />
          <div className="section-kicker">LEGAL</div>
          <h1>Cookie Policy</h1>
          <p>
            This Cookie Policy explains how we use cookies and similar
            technologies when you visit our website.
          </p>
        </div>
              <PageHeadArt src="/page-art/cookie-policy.webp" />
      </section>

      <section className="section legal-page">
        <div className="container">
          <div className="legal-body">
            <p>
              <strong>Effective Date:</strong> August 24, 2026
            </p>

            <h2>1. Introduction</h2>
            <p>
              {site.legalName} (&ldquo;GAMCS,&rdquo; &ldquo;we,&rdquo;
              &ldquo;us,&rdquo; or &ldquo;our&rdquo;) uses cookies and similar
              technologies on our website to improve your browsing experience,
              analyze how our website is used, and support the functionality of
              our services. This Cookie Policy should be read together with our{" "}
              <Link href="/privacy-policy">Privacy Policy</Link>. By continuing
              to use our website, you consent to the use of cookies as described
              in this policy, except where your consent is separately requested
              through a cookie banner.
            </p>

            <h2>2. What Are Cookies?</h2>
            <p>
              Cookies are small text files placed on your device when you visit
              a website. They are widely used to make websites work, work more
              efficiently, and provide information to the website owner. Similar
              technologies &mdash; such as pixels, tags, and local storage
              &mdash; perform comparable functions, and references to
              &ldquo;cookies&rdquo; in this policy include these technologies.
            </p>

            <h2>3. Types of Cookies We Use</h2>
            <ul>
              <li>
                <strong>Essential cookies</strong> &mdash; necessary for the
                website to function; these cannot be switched off. They are
                usually set in response to actions you take, such as submitting
                a form or setting your privacy preferences.
              </li>
              <li>
                <strong>Analytics and performance cookies</strong> &mdash; help
                us understand how visitors interact with our website by
                collecting information anonymously, so we can improve how it
                works.
              </li>
              <li>
                <strong>Functional cookies</strong> &mdash; enable enhanced
                functionality and personalization, such as remembering your
                preferences.
              </li>
              <li>
                <strong>Marketing cookies</strong> &mdash; where used, help
                deliver relevant communications across websites. We use these
                only where you have provided consent.
              </li>
            </ul>

            <h2>4. Third-Party Cookies</h2>
            <p>
              Some cookies may be placed by third-party services that appear on
              our pages. We do not control these cookies, so we recommend
              reviewing the relevant third parties&rsquo; own cookie and privacy
              policies. Third-party services we may use include web analytics
              providers and social media platforms.
            </p>

            <h2>5. How to Manage or Disable Cookies</h2>
            <p>
              You can control cookies through your browser settings &mdash; most
              browsers let you view, manage, delete, and block cookies under
              &ldquo;Settings,&rdquo; &ldquo;Preferences,&rdquo; or
              &ldquo;Privacy&rdquo; &mdash; and, where presented, through our
              cookie banner. Please note that blocking essential cookies may
              affect how the website functions.
            </p>
            <p>
              You can{" "}
              <CookiePreferencesLink
                className="legal-inline-button"
                label="change your cookie preferences now"
              />
              .
            </p>

            <h2>6. Consent</h2>
            <p>
              For non-essential cookies, we rely on your consent, which you may
              withdraw at any time by adjusting your browser settings or cookie
              preferences. Essential cookies do not require consent as they are
              necessary for the website to operate.
            </p>

            <h2>7. Changes to This Cookie Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. We will post
              any updates on this page and revise the effective date above.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              {site.legalName} &middot;{" "}
              <a href={`mailto:${site.email}`}>{site.email}</a> &middot;{" "}
              <a href={site.url} target="_blank" rel="noopener">
                {site.url.replace(/^https?:\/\//, "")}
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
