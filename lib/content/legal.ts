import type { Part } from "./fill";

/**
 * The two legal pages, as ordered blocks rendered by app/privacy-policy and
 * app/cookie-policy. A paragraph is a list of parts (see lib/content/fill.ts)
 * so text, links and emphasis all stay plain strings here. `{legalName}`,
 * `{email}`, `{url}` and `{formFields}` are filled from `site` and `contact`.
 *
 * The privacy policy is the client's draft (2026-10-23, "Draft pending legal
 * review"), corrected against this build the same day: the fonts are
 * self-hosted (no Google Fonts request), the careers form can post to
 * app/api/careers and on through Resend, office "Directions" links go to
 * Google Maps, and the careers route rate-limits by IP in memory. Business
 * facts the repository cannot know are `tbc` parts, rendered as visible "to be
 * confirmed" markers. The cookie policy is the approved copy (doc page 13) and
 * carries no markers.
 */
export type LegalBlock =
  | { h2: string }
  /** A sub-heading inside a numbered section. */
  | { h3: string }
  /** `when` renders the paragraph only on builds with / without a GA4 id. */
  | { p: Part[]; when?: "ga" | "no-ga" }
  | { ul: Part[][] };

export const legal = {
  /** Prefix of every "to be confirmed" marker on the privacy policy. */
  tbcPrefix: "To be confirmed: ",
} as const;

export const privacy = {
  title: "Privacy Policy",
  intro: [
    "This Privacy Policy explains how GA Management Consultants LLP (“GAMCS”, “we”, “us” or “our”) handles personal information when you visit our website, contact us, or apply for a position with us.",
  ] as Part[],
  /** The draft banner, until the policy has been reviewed. */
  draft: [
    { text: "Status: Draft pending legal review.", strong: true },
    " Items marked “to be confirmed” need input from GA Management Consultants before publication.",
  ] as Part[],
  blocks: [
    { h2: "1. Who We Are" },
    { p: ["GA Management Consultants LLP is responsible for the personal information described in this Privacy Policy, subject to the applicable data protection laws."] },
    { p: [{ text: "Registered office:", strong: true }, " 2nd Floor, WonderWorks Mudit Square, B-3, Plot No. 24, Institutional Area, Sector 32, Gurugram, Haryana 122001, India."] },
    { p: [{ text: "General contact:", strong: true }, " ", { text: "{email}", href: "mailto:{email}" }] },
    { p: ["For privacy-related questions or requests concerning your personal information, please contact us at the email address above."] },

    { h2: "2. Information You Provide to Us" },
    { h3: "Contact enquiries" },
    { p: ["Our website's contact form asks for your full name, title, company, phone number, how you heard about us, email address, and the goal or assistance you are seeking."] },
    { p: ["The form is designed to open a pre-filled email in your own email application, addressed to ", { text: "{email}", href: "mailto:{email}" }, ". It does not submit the form information to a GAMCS server. We receive the information when you choose to send the prepared email."] },
    { p: ["If you do not send the email, the form information is not transmitted to GAMCS through the form's submission process."] },
    { h3: "Email and other correspondence" },
    { p: ["If you email us or contact us through LinkedIn or another communication channel, we may retain your correspondence and the information you choose to share so that we can respond and maintain the relevant business communication."] },
    { h3: "Careers and recruitment" },
    { p: ["If you apply for a position with GAMCS, we may receive information such as your name, contact details, CV or résumé, employment history, qualifications, and other information you choose to provide."] },
    { p: ["Our careers application form asks for your full name, email address, phone number (optional), the track you are applying for, your location preference, a LinkedIn or portfolio URL (optional), a short note (optional), and your CV (PDF or Word, up to 4 MB). It also asks you to agree to GAMCS storing your details to assess your application."] },
    { p: ["Where online applications are enabled, the form sends your application over HTTPS to our website's server, which checks it and forwards it by email, with your CV attached, to our careers mailbox (careers@gamcs.in) using Resend, an email delivery service. The website server does not keep a copy of your application after forwarding it."] },
    { p: ["Where online applications are not enabled, the form instead opens a pre-filled email in your own email application, addressed to careers@gamcs.in, and you attach your CV yourself. We receive your application only if you choose to send that email."] },
    { p: ["We use this information to assess your application, communicate with you about recruitment, and administer the recruitment process. Access to recruitment correspondence is handled by our HR team."] },
    { p: ["Please avoid including unnecessary sensitive personal information in your application."] },

    { h2: "3. Information Collected Automatically" },
    { h3: "Website hosting and technical logs" },
    { p: ["Our website is hosted using AWS Amplify. The hosting service may process and record technical information associated with requests to the website, such as IP address, request time, requested resource, and browser or user-agent information."] },
    { p: ["We use this information, where available, to deliver the website, maintain its security, troubleshoot errors, and investigate potentially harmful activity."] },
    { p: [{ text: "hosting region, and any additional log-retention or deletion arrangements", tbc: true }] },
    { h3: "Preventing abuse of the careers form" },
    { p: ["Where online applications are enabled, the website's server briefly uses the IP address of a submission to limit repeated submissions (no more than five from one address in ten minutes). This counter is held in the server's memory only, is not written to storage, and is cleared after it expires or when the server restarts."] },
    { h3: "Analytics" },
    { p: ["Google Analytics 4 is integrated into the website's implementation, but analytics is not currently enabled on this build because no measurement ID is configured. Accordingly, the website does not currently load the Google Analytics measurement script or collect Google Analytics measurement data through that integration."] },
    { p: ["If analytics is enabled in the future, it will be configured to operate only after a visitor has consented to optional analytics cookies. Subject to the final configuration, analytics may record information such as pages viewed, approximate location, browser and device information, and interactions with website elements."] },
    { p: ["This description of future analytics functionality does not mean that such measurement is currently taking place."] },

    { h2: "4. How We Use Personal Information" },
    { p: ["We may use personal information for the following purposes:"] },
    {
      ul: [
        ["To respond to enquiries and maintain communications you initiate."],
        ["To assess and manage job applications and communicate with candidates."],
        ["To operate, maintain, troubleshoot, and secure our website."],
        ["To understand aggregate website usage and improve our services, if analytics is enabled and you have consented to it."],
        ["To comply with applicable legal obligations and establish, exercise, or defend legal claims where appropriate."],
      ],
    },
    { p: ["We do not sell personal information. We do not use website analytics information for advertising or cross-site advertising profiles as described in this policy."] },

    { h2: "5. Cookies and Similar Technologies" },
    { h3: "Essential cookies and storage" },
    { p: ["Essential cookies or similar browser storage may be used where necessary for the website to function, including to remember your cookie preferences."] },
    { h3: "Optional analytics cookies" },
    { p: ["Google Analytics 4 is intended to be used for optional website analytics only after you consent through the website's cookie preferences mechanism. Analytics is not currently active on this build."] },
    { p: ["You can decline optional analytics cookies without losing access to the website's essential functionality. You can also withdraw your analytics consent or change your preferences through the ", { text: "“Cookie Preferences”", action: "cookie-prefs" }, " link in the website footer."] },
    { p: ["When you withdraw consent, the website should stop future analytics collection and update the relevant consent state. Withdrawal does not retrospectively invalidate processing that took place lawfully before withdrawal."] },

    { h2: "6. Third-Party Services" },
    { p: ["Our website and communications may involve the following third-party services:"] },
    {
      ul: [
        [{ text: "Amazon Web Services (AWS Amplify):", strong: true }, " Hosts the website and may process technical request information and access logs."],
        [{ text: "Resend:", strong: true }, " Where online applications are enabled, delivers careers applications, including the attached CV, from our website to our careers mailbox."],
        [{ text: "Google Analytics 4:", strong: true }, " Intended for optional website analytics, but not currently active on this build."],
        [{ text: "LinkedIn:", strong: true }, " If you follow a LinkedIn link, LinkedIn's own privacy practices apply to your subsequent activity on its platform."],
        [{ text: "Google Maps:", strong: true }, " Our office locations include “Directions” links. Nothing is loaded from Google Maps unless you follow one; if you do, Google's own privacy practices apply."],
        [{ text: "Your email provider:", strong: true }, " The contact form opens a message in your own email application. Your email provider processes the message when you send it."],
      ],
    },
    { p: ["Our typefaces are served from our own website, so viewing the site does not send requests to a font provider."] },
    { p: ["These providers may process information under their own terms and privacy policies and, where applicable, under arrangements with GAMCS."] },
    { p: ["Third-party services may process information in locations outside your own country. ", { text: "processing locations of each provider, and any required contractual or transfer safeguards", tbc: true }] },

    { h2: "7. Legal Basis for Processing" },
    { p: ["We process personal information only where an applicable legal basis permits us to do so."] },
    { p: ["Depending on the circumstances and the laws that apply, this may include:"] },
    {
      ul: [
        ["Responding to enquiries and taking steps requested by you."],
        ["Processing recruitment information for recruitment-related purposes."],
        ["Meeting legal obligations and protecting or pursuing legitimate legal interests where permitted by applicable law."],
        ["Obtaining consent where consent is required, including for optional analytics cookies."],
      ],
    },
    { p: ["The precise lawful basis for each processing activity, and the requirements for notice, consent, withdrawal, and individual rights, will be determined in accordance with the data protection laws applicable to GAMCS and the relevant individual."] },

    { h2: "8. Security" },
    { p: ["We use technical measures intended to protect the website and information handled through it."] },
    { p: ["The website is served over HTTPS, which encrypts information transmitted between your browser and the website. The current implementation also sends protective HTTP security headers intended to reduce certain browser-based risks, including content-type guessing, unauthorised framing, unnecessary referrer disclosure, and access to browser features such as the camera, microphone, and location."] },
    { p: ["These measures help protect the website but cannot guarantee absolute security."] },
    { p: ["The contact form does not send information to a GAMCS server. Where online applications are enabled, the careers form sends your application to our website's server over HTTPS; the server checks the CV's file type and size and forwards the application by email without keeping a copy. Information sent to GAMCS by email is subsequently subject to the security and access controls of our business email environment. Access to recruitment correspondence is handled by our HR team."] },
    { p: ["Our internal access controls, mailbox security arrangements, incident-response procedures, and retention practices should be reviewed periodically."] },

    { h2: "9. Data Retention" },
    { p: ["We retain personal information only for as long as necessary for the purposes for which it was collected, subject to applicable legal requirements and the need to establish, exercise, or defend legal claims."] },
    {
      ul: [
        [{ text: "Enquiries and business correspondence:", strong: true }, " Retained according to our business email retention policy. ", { text: "retention period", tbc: true }],
        [{ text: "Recruitment information:", strong: true }, " Retained according to our recruitment retention policy. ", { text: "retention period", tbc: true }],
        [{ text: "Hosting logs:", strong: true }, " AWS Amplify provides access logs for hosted applications. ", { text: "retention and deletion arrangements under GAMCS's AWS configuration", tbc: true }],
        [{ text: "Applications delivered through Resend:", strong: true }, " Resend may keep a record of the messages it delivers under its own settings and policies. ", { text: "Resend retention settings for the GAMCS account", tbc: true }],
        [{ text: "Analytics information:", strong: true }, " If Google Analytics is enabled, the retention of user-level and event-level data will depend on the settings configured for the relevant Analytics property and Google's applicable policies."],
      ],
    },
    { p: ["We will update this section once the relevant retention periods and deletion arrangements have been confirmed."] },

    { h2: "10. Your Privacy Rights" },
    { p: ["Depending on the data protection laws that apply to you and the circumstances of the processing, you may have rights concerning your personal information. These may include the right to:"] },
    {
      ul: [
        ["Request access to personal information held about you."],
        ["Request correction of inaccurate or incomplete information."],
        ["Request deletion of personal information where the applicable law provides that right."],
        ["Withdraw consent where processing is based on consent."],
        ["Object to or restrict certain processing where applicable law provides those rights."],
        ["Raise a complaint with the relevant competent authority."],
      ],
    },
    { p: ["To submit a privacy request, contact ", { text: "{email}", href: "mailto:{email}" }, ". We may need to verify your identity and request further information to process your request. We will respond in accordance with the applicable legal requirements."] },
    { p: ["The precise rights, response periods, exemptions, and competent supervisory or regulatory authority depend on the laws applicable to the request."] },

    { h2: "11. Children" },
    { p: ["Our website is intended for businesses and professional audiences and is not directed at children."] },
    { p: ["We do not knowingly seek to collect personal information from children through this website. If you believe that a child has provided personal information to us, please contact ", { text: "{email}", href: "mailto:{email}" }, " so that we can assess the matter and take any action required by applicable law."] },

    { h2: "12. International Processing" },
    { p: ["Our website may be accessible to visitors in countries other than India. Some third-party service providers may process technical information outside India."] },
    { p: ["Where applicable law requires additional safeguards for international transfers or access to personal information, GAMCS will assess and implement the necessary measures."] },

    { h2: "13. Changes to This Privacy Policy" },
    { p: ["We may update this Privacy Policy to reflect changes in our website, services, data-handling practices, or legal obligations."] },
    { p: ["The latest version will be published on this page, together with its effective date. We encourage you to review the policy periodically."] },
    { p: [{ text: "Effective date:", strong: true }, " ", { text: "effective date of this version", tbc: true }] },

    { h2: "14. Contact Us" },
    { p: ["For questions about this Privacy Policy, requests relating to personal information, or concerns about how your information is handled, contact:"] },
    { p: [{ text: "GA Management Consultants LLP", strong: true }] },
    { p: [{ text: "Email:", strong: true }, " ", { text: "{email}", href: "mailto:{email}" }] },
    { p: [{ text: "Registered office:", strong: true }, " 2nd Floor, WonderWorks Mudit Square, B-3, Plot No. 24, Institutional Area, Sector 32, Gurugram, Haryana 122001, India."] },
  ] as LegalBlock[],
};

/* The client's draft (2026-10-23), corrected against this build. The draft
   hedged every technical point as "not yet verified on production"; each was
   checked in the code and is now stated plainly: one localStorage item
   (lib/consent.ts), GA4 as the only external script and only with an ID and
   consent (components/Analytics.tsx), self-hosted fonts, static office maps,
   a self-hosted video, no <iframe>. Paragraphs marked `when` follow the
   build's GA ID, so the page stays true whether or not analytics is on. */
export const cookiePolicy = {
  title: "Cookie Policy",
  intro: [{ text: "Effective date:", strong: true }, " October 23, 2026"] as Part[],
  blocks: [
    { h2: "1. Introduction" },
    { p: ["GA Management Consultants LLP (“GAMCS,” “we,” “us,” or “our”) uses a small number of technologies on our website to support essential functionality, remember your privacy preferences and, only where optional analytics is enabled and you have agreed to it, understand how visitors use the website."] },
    { p: ["This Cookie Policy should be read together with our ", { text: "Privacy Policy", href: "/privacy-policy" }, "."] },
    { p: ["We ask for your consent before using any non-essential cookies or similar technologies. Simply visiting or continuing to use our website does not, by itself, constitute consent to optional analytics or any other non-essential tracking."] },

    { h2: "2. What Are Cookies?" },
    { p: ["Cookies are small text files that websites may store on your device when you visit them. They can support essential website functionality, remember preferences, and provide information about website usage."] },
    { p: ["Similar technologies, including browser local storage, pixels, and tags, may perform related functions. This policy refers to cookies and similar technologies collectively where appropriate, while distinguishing between them when necessary."] },

    { h2: "3. Categories of Cookies and Similar Technologies" },
    { h3: "Essential storage" },
    { p: ["We use one item of browser local storage to remember your cookie preferences (see section 7). It is necessary for the website to respect your choice, so it operates without consent for optional analytics. We do not set any essential cookies."] },
    { h3: "Analytics" },
    { when: "no-ga", p: ["Google Analytics 4 is built into the website but is not currently active, because no measurement ID is configured. The Google Analytics script does not load and no analytics cookies are set."] },
    { when: "ga", p: ["We use Google Analytics 4 to understand how visitors use the website. It loads only after you agree to analytics cookies, and it does not load at all if you decline or make no choice."] },
    { when: "ga", p: ["When active, Google Analytics records pages viewed, approximate location, browser and device information, clicks on buttons and calls to action (the button's text and destination), and when a contact or careers form is used (the form and, for careers, the track chosen, not the details you enter). We do not use it for advertising."] },
    { when: "ga", p: ["It sets two cookies: ", { text: "_ga", strong: true }, ", which distinguishes visitors and lasts up to 2 years, and ", { text: "_ga_", strong: true }, " followed by our property's ID, which keeps the state of your visit and lasts up to 2 years."] },
    { h3: "Functional technologies" },
    { p: ["We do not use functional cookies or storage beyond the preference described in section 7."] },
    { h3: "Marketing technologies" },
    { p: ["We do not use advertising, retargeting or other marketing cookies, pixels or tags."] },
    { p: ["We will update this policy if our practices change, and we will obtain any consent required before introducing non-essential tracking technologies."] },

    { h2: "4. Other Tracking Technologies" },
    { p: ["We do not use tracking pixels, device fingerprinting or data brokers."] },
    { p: ["The website contains no third-party embeds: there are no embedded maps, videos or social media widgets. Our office maps are static images, our explainer video is served from our own website, and our typefaces are served from our own website, so viewing the site does not send requests to a map, video or font provider."] },

    { h2: "5. Third-Party Services" },
    { p: ["Our website is hosted on AWS Amplify. The hosting service may process technical information and logs to deliver, maintain, and secure the website; it does not set cookies on our behalf."] },
    {
      ul: [
        [{ text: "Google Analytics 4:", strong: true }, " Used only for optional analytics, only where it is active, and only after you consent, as described in section 3."],
        [{ text: "LinkedIn:", strong: true }, " If you follow a link to our LinkedIn page, LinkedIn's own privacy and cookie practices apply to your activity on its platform."],
        [{ text: "Google Maps:", strong: true }, " Our office “Directions” links open Google Maps. Nothing is loaded from Google Maps unless you follow one; if you do, Google's own practices apply."],
      ],
    },
    { p: ["Third-party providers may process information under their own privacy policies and applicable terms. Please consult their respective policies for further information."] },

    { h2: "6. How to Manage Your Preferences" },
    { p: ["You can change or withdraw your choice at any time using ", { text: "Cookie Preferences", action: "cookie-prefs" }, ", also linked in the website footer."] },
    { p: ["You can also manage cookies and stored site data through your browser's privacy settings, which generally allow you to view, delete, or block them. Clearing this website's stored data removes your saved preference, and the website will ask for your choice again."] },

    { h2: "7. Consent and Preference Storage" },
    { p: ["Your choice is stored in your browser's local storage under the key ", { text: "gamcs_cookie_consent", strong: true }, ". This is browser local storage, not a cookie. It records whether you agreed to analytics and when you made the choice."] },
    { p: ["The preference stays in your browser and is not sent to GAMCS. It has no expiry date: it remains until you change it or clear this website's stored data."] },
    { p: ["Until you agree to analytics, no analytics technology runs. Making no choice counts as not agreeing."] },
    { p: ["If you withdraw consent, further analytics collection stops straight away, without reloading the page."] },
    { when: "ga", p: ["Analytics cookies already set on your device are not deleted automatically when you withdraw; they remain until they expire or you delete them through your browser settings."] },

    { h2: "8. Changes to This Cookie Policy" },
    { p: ["We may update this Cookie Policy to reflect changes to our website, technologies, data-handling practices, or legal obligations."] },
    { p: ["The latest version will be published on this page with an updated effective date. We encourage you to review this policy periodically."] },

    { h2: "9. Contact Us" },
    { p: ["If you have questions about this Cookie Policy or our use of cookies and similar technologies, please contact:"] },
    { p: [{ text: "GA Management Consultants LLP (GAMCS)", strong: true }] },
    { p: [{ text: "Email:", strong: true }, " ", { text: "{email}", href: "mailto:{email}" }] },
    { p: [{ text: "Website:", strong: true }, " ", { text: "{url}", href: "/" }] },
    { p: ["For further information about our handling of personal information, please read our ", { text: "Privacy Policy", href: "/privacy-policy" }, "."] },
  ] as LegalBlock[],
};
