import type { Part } from "./fill";

/**
 * The two legal pages, as ordered blocks rendered by app/privacy-policy and
 * app/cookie-policy. A paragraph is a list of parts (see lib/content/fill.ts)
 * so text, links and emphasis all stay plain strings here. `{legalName}`,
 * `{email}`, `{url}` and `{formFields}` are filled from `site` and `contact`.
 *
 * The privacy policy is NOT transcribed from gamcs.in — it describes what this
 * build actually does with data, and anything that depends on a business or
 * legal fact the repository cannot know is a `tbc` part, rendered as a visible
 * "to be confirmed" marker. The cookie policy is the approved copy (doc page
 * 13) and carries no markers.
 */
export type LegalBlock =
  | { h2: string }
  /** `when` renders the paragraph only on builds with / without a GA4 id. */
  | { p: Part[]; when?: "ga" | "no-ga" }
  | { ul: Part[][] };

export const legal = {
  kicker: "LEGAL",
  /** Prefix of every "to be confirmed" marker on the privacy policy. */
  tbcPrefix: "To be confirmed: ",
} as const;

export const privacy = {
  title: "Privacy Policy",
  intro: [
    "This policy explains what happens to information you share with {legalName} through {url}.",
  ] as Part[],
  /** The draft banner, until the policy has been reviewed and the markers filled in. */
  draft: [
    { text: "Draft pending legal review.", strong: true },
    " The practices described below match how this website is actually built. Items marked “to be confirmed” need input from GA Management Consultants before publication.",
  ] as Part[],
  blocks: [
    { h2: "1. Who is responsible" },
    {
      p: [
        "{legalName} (“GAMCS”, “we”) is responsible for the information described here. You can reach us at ",
        { text: "{email}", href: "mailto:{email}" },
        ".",
      ],
    },
    {
      p: [
        { text: "registered office address", tbc: true },
        " ",
        { text: "name and contact details of the Data Protection / Grievance Officer, if one is required", tbc: true },
      ],
    },
    { h2: "2. Information you give us" },
    {
      p: [
        "The contact form on this site asks for: {formFields}. It does not send anything to a server of ours. Submitting it opens a pre-filled message in your own email application, addressed to {email}; we receive your details only if you choose to send that email. Until you do, the information stays on your device.",
      ],
    },
    {
      p: [
        "If you email us or connect on LinkedIn, we hold that correspondence and whatever you include in it.",
      ],
    },
    { h2: "3. Information collected automatically" },
    {
      when: "ga",
      p: [
        { text: "Analytics.", strong: true },
        " If — and only if — you accept analytics cookies, this site uses Google Analytics 4 to understand how visitors use it: pages viewed, approximate location derived from your IP address, device and browser type, and interactions such as clicking a call to action or submitting the contact form. Google processes this data on our behalf. If you decline, the Google Analytics script is never loaded and none of this is collected.",
      ],
    },
    {
      when: "no-ga",
      p: [
        { text: "Analytics.", strong: true },
        " Google Analytics is integrated but is not enabled on this build — no measurement ID is configured, so no analytics script loads and no analytics data is collected. If it is switched on, it will run only for visitors who accept analytics cookies, and will record pages viewed, approximate location derived from your IP address, device and browser type, and interactions such as clicking a call to action or submitting the contact form.",
      ],
    },
    {
      p: [
        { text: "Hosting logs.", strong: true },
        " Our hosting provider records standard technical information, such as IP address, request time and user agent, in order to serve and secure the site. ",
        { text: "hosting provider, its location, and log retention period", tbc: true },
      ],
    },
    { h2: "4. Cookies" },
    { p: ["This site uses:"] },
    {
      ul: [
        [
          { text: "Essential cookies", strong: true },
          " — required for basic site function (e.g. remembering your cookie preference itself). These cannot be disabled.",
        ],
        [
          { text: "Analytics cookies (optional)", strong: true },
          " — Google Analytics 4, used only if you accept analytics cookies via our cookie banner. This helps us understand aggregate visitor behaviour (e.g. which pages are most visited). We do not use this data for advertising, and we do not sell it.",
        ],
      ],
    },
    {
      p: [
        "You can change your cookie preferences at any time via the “Cookie Preferences” link in our footer, or ",
        { text: "open the preferences panel now", action: "cookie-prefs" },
        ".",
      ],
    },
    { h2: "5. Third-party services" },
    {
      p: [
        "We use the following third-party services, each with their own privacy practices:",
      ],
    },
    {
      ul: [
        [
          { text: "Google Analytics", strong: true },
          " (if you have accepted analytics cookies) — ",
          { text: "Google’s privacy policy", href: "https://policies.google.com/privacy", external: true },
        ],
        [
          { text: "Google Fonts", strong: true },
          " — loads fonts from Google’s servers, which may log your IP address per Google’s practices — ",
          { text: "Google’s privacy policy", href: "https://policies.google.com/privacy", external: true },
        ],
        [
          { text: "LinkedIn", strong: true },
          " — only if you follow the link to our company page; LinkedIn’s own policy applies there.",
        ],
        [
          { text: "Your email provider", strong: true },
          " — the contact form composes a message in the application you already use.",
        ],
        [
          { text: "Hosting provider", strong: true },
          " — processes server logs. ",
          { text: "hosting provider name and log retention period", tbc: true },
        ],
      ],
    },
    {
      p: [
        "We do not sell your information, and we do not use it for advertising or profiling.",
      ],
    },
    { h2: "6. Our legal basis for processing your data" },
    {
      ul: [
        [
          { text: "Contact form submissions:", strong: true },
          " processed under ",
          { text: "legitimate interest", em: true },
          " — responding to enquiries you have initiated is necessary for us to operate as a consultancy.",
        ],
        [
          { text: "Analytics cookies:", strong: true },
          " processed under ",
          { text: "consent", em: true },
          " — collected only if you opt in via our cookie banner, and you may withdraw consent at any time.",
        ],
        [
          { text: "with counsel, whether any additional lawful basis applies (e.g. contract, once an engagement begins)", tbc: true },
        ],
      ],
    },
    { h2: "7. How long we keep your data" },
    {
      ul: [
        [
          "Contact form enquiries sent via email are retained in our mailbox per our ",
          { text: "business email retention practice — e.g. a stated standard retention period, or a specific duration if you have an internal policy", tbc: true },
        ],
        [
          "Analytics data is retained per Google’s GA4 retention settings unless changed by us. ",
          { text: "the configured retention window in GA4 admin — the default is 2 or 14 months depending on setup", tbc: true },
        ],
      ],
    },
    { h2: "8. Your rights" },
    { p: ["Depending on your location, you may have the right to:"] },
    {
      ul: [
        ["Access the personal data we hold about you"],
        ["Request correction of inaccurate data"],
        ["Request deletion of your data"],
        ["Withdraw consent for analytics cookies at any time"],
        ["Object to processing based on legitimate interest"],
        ["Lodge a complaint with your local data protection authority"],
      ],
    },
    {
      p: [
        "To exercise any of these rights, contact us at ",
        { text: "{email}", href: "mailto:{email}" },
        ". ",
        { text: "dedicated privacy / DPO contact email — this can be a general inbox if no DPO exists, but it should be clearly labelled", tbc: true },
      ],
    },
    {
      p: [
        { text: "which data protection regimes apply and which supervisory authority to name", tbc: true },
      ],
    },
    { h2: "9. Children" },
    {
      p: [
        "This site is aimed at businesses and is not directed at children. We do not knowingly collect information from anyone under 18.",
      ],
    },
    { h2: "10. Changes to this policy" },
    {
      p: [
        "We will post any changes on this page. ",
        { text: "effective date of this version", tbc: true },
      ],
    },
    { h2: "11. Contact" },
    {
      p: [
        "Questions about this policy: ",
        { text: "{email}", href: "mailto:{email}" },
        ", or use the ",
        { text: "contact page", href: "/contact" },
        ".",
      ],
    },
  ] as LegalBlock[],
};

export const cookiePolicy = {
  title: "Cookie Policy",
  intro: [
    "This Cookie Policy explains how we use cookies and similar technologies when you visit our website.",
  ] as Part[],
  blocks: [
    {
      p: [{ text: "Effective Date:", strong: true }, " August 24, 2026"],
    },
    { h2: "1. Introduction" },
    {
      p: [
        "{legalName} (“GAMCS,” “we,” “us,” or “our”) uses cookies and similar technologies on our website to improve your browsing experience, analyze how our website is used, and support the functionality of our services. This Cookie Policy should be read together with our ",
        { text: "Privacy Policy", href: "/privacy-policy" },
        ". By continuing to use our website, you consent to the use of cookies as described in this policy, except where your consent is separately requested through a cookie banner.",
      ],
    },
    { h2: "2. What Are Cookies?" },
    {
      p: [
        "Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work, work more efficiently, and provide information to the website owner. Similar technologies — such as pixels, tags, and local storage — perform comparable functions, and references to “cookies” in this policy include these technologies.",
      ],
    },
    { h2: "3. Types of Cookies We Use" },
    {
      ul: [
        [
          { text: "Essential cookies", strong: true },
          " — necessary for the website to function; these cannot be switched off. They are usually set in response to actions you take, such as submitting a form or setting your privacy preferences.",
        ],
        [
          { text: "Analytics and performance cookies", strong: true },
          " — help us understand how visitors interact with our website by collecting information anonymously, so we can improve how it works.",
        ],
        [
          { text: "Functional cookies", strong: true },
          " — enable enhanced functionality and personalization, such as remembering your preferences.",
        ],
        [
          { text: "Marketing cookies", strong: true },
          " — where used, help deliver relevant communications across websites. We use these only where you have provided consent.",
        ],
      ],
    },
    { h2: "4. Third-Party Cookies" },
    {
      p: [
        "Some cookies may be placed by third-party services that appear on our pages. We do not control these cookies, so we recommend reviewing the relevant third parties’ own cookie and privacy policies. Third-party services we may use include web analytics providers and social media platforms.",
      ],
    },
    { h2: "5. How to Manage or Disable Cookies" },
    {
      p: [
        "You can control cookies through your browser settings — most browsers let you view, manage, delete, and block cookies under “Settings,” “Preferences,” or “Privacy” — and, where presented, through our cookie banner. Please note that blocking essential cookies may affect how the website functions.",
      ],
    },
    {
      p: [
        "You can ",
        { text: "change your cookie preferences now", action: "cookie-prefs" },
        ".",
      ],
    },
    { h2: "6. Consent" },
    {
      p: [
        "For non-essential cookies, we rely on your consent, which you may withdraw at any time by adjusting your browser settings or cookie preferences. Essential cookies do not require consent as they are necessary for the website to operate.",
      ],
    },
    { h2: "7. Changes to This Cookie Policy" },
    {
      p: [
        "We may update this Cookie Policy from time to time. We will post any updates on this page and revise the effective date above.",
      ],
    },
    { h2: "8. Contact Us" },
    {
      p: [
        "{legalName} · ",
        { text: "{email}", href: "mailto:{email}" },
        " · ",
        { text: "{url}", href: "{siteUrl}", external: true },
      ],
    },
  ] as LegalBlock[],
};
