import type { Part } from "./fill";

/**
 * The two legal pages, as ordered blocks rendered by app/privacy-policy and
 * app/cookie-policy. A paragraph is a list of parts (see lib/content/fill.ts)
 * so text, links and emphasis all stay plain strings here. `{legalName}`,
 * `{email}`, `{url}` and `{formFields}` are filled from `site` and `contact`.
 *
 * Both policies were rewritten on 2026-10-24 as publish-ready copy (no
 * draft banner, no "to be confirmed" markers), modelled on the structure of
 * abacum.ai and threesixtyfinance.com's legal pages and checked against this
 * build: self-hosted fonts, mailto contact form, careers via app/api/careers
 * and Resend, GA4 only after consent, AWS Amplify hosting. Gaps the code
 * cannot answer (retention periods, grievance contact) use conservative
 * defaults the client approved; they are not legal advice.
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
  intro: [{ text: "Last updated:", strong: true }, " 24 October 2026"] as Part[],
  blocks: [
    { p: ["This Privacy Policy explains how GA Management Consultants LLP (“GAMCS”, “we”, “us” or “our”) collects, uses, shares and protects personal data when you visit our website, contact us, work with us, or apply for a role with us. It is written to meet India’s Digital Personal Data Protection Act, 2023 (“DPDP Act”) and, for visitors in the UK and European Economic Area, the UK GDPR and EU GDPR."] },

    { h2: "1. Who we are" },
    { p: ["GA Management Consultants LLP is the data fiduciary (under the DPDP Act) and data controller (under the GDPR) for the personal data described in this policy."] },
    { p: [{ text: "Registered office:", strong: true }, " 2nd Floor, WonderWorks Mudit Square, B-3, Plot No. 24, Institutional Area, Sector 32, Gurugram, Haryana 122001, India."] },
    { p: [{ text: "Grievance Officer:", strong: true }, " Grievance Officer, GA Management Consultants LLP, ", { text: "{email}", href: "mailto:{email}" }, ". Write to this address for any question, request or complaint about your personal data."] },

    { h2: "2. Personal data we collect" },
    { h3: "Information you give us" },
    {
      ul: [
        [{ text: "Enquiries:", strong: true }, " your name, job title, company, phone number, email address, how you heard about us and what you would like help with. Our contact form opens a pre-filled email in your own email app; we receive these details only if you send that email."],
        [{ text: "Correspondence:", strong: true }, " anything you choose to share when you email us, message us on LinkedIn, or speak to us."],
        [{ text: "Job applications:", strong: true }, " your name, email, phone number, the role and location you are interested in, a LinkedIn or portfolio link, a short note, and your CV. Please do not include sensitive information (such as health, religion or financial account details) in your application."],
        [{ text: "Client engagements:", strong: true }, " business contact details of the people we work with at our clients, and any personal data contained in information a client shares with us to deliver our services."],
      ],
    },
    { h3: "Information collected automatically" },
    {
      ul: [
        [{ text: "Technical data:", strong: true }, " when you visit the website, our hosting provider records standard request information such as your IP address, browser type, the page requested and the time of the request."],
        [{ text: "Analytics (only with your consent):", strong: true }, " if you accept analytics cookies, we use Google Analytics 4 to understand how visitors use the site, for example which pages are viewed and which buttons are clicked. See our ", { text: "Cookie Policy", href: "/cookie-policy" }, "."],
        [{ text: "Your cookie choice:", strong: true }, " stored in your own browser so we remember it; it is not sent to us."],
      ],
    },

    { h2: "3. How and why we use your data" },
    {
      ul: [
        [{ text: "To respond to enquiries and arrange meetings", strong: true }, " — on the basis of your consent and the steps you ask us to take."],
        [{ text: "To deliver and manage client engagements", strong: true }, " — to perform our contract with the client and our legitimate interest in running the engagement."],
        [{ text: "To assess job applications", strong: true }, " — on the basis of the consent you give when you apply."],
        [{ text: "To run, secure and improve the website", strong: true }, " — our legitimate interest in a safe, working site; analytics only with your consent."],
        [{ text: "To meet legal obligations", strong: true }, " — for example tax, accounting and regulatory record-keeping, and responding to lawful requests."],
      ],
    },
    { p: ["We do not sell personal data, use it for third-party advertising, or make decisions about you based solely on automated processing."] },

    { h2: "4. Who we share it with" },
    { p: ["We share personal data only where needed, with:"] },
    {
      ul: [
        [{ text: "Service providers", strong: true }, " who act on our instructions: Amazon Web Services (website hosting), Microsoft 365 (email), Resend (delivery of online job applications to our careers inbox), and Google Analytics (only if you consent)."],
        [{ text: "Professional advisers", strong: true }, " such as auditors and legal advisers, under confidentiality."],
        [{ text: "Authorities", strong: true }, " where required by law or to protect our rights."],
        [{ text: "A buyer or successor", strong: true }, " if our business is reorganised or sold, under equivalent protection."],
      ],
    },
    { p: ["Links on the site to LinkedIn and Google Maps take you to those services, whose own privacy policies then apply."] },

    { h2: "5. International transfers" },
    { p: ["Our main operations are in India. Some of our service providers store or process data in other countries. Where data leaves India we rely on providers bound by appropriate contractual and security commitments, and we transfer data only to countries the Government of India has not restricted under the DPDP Act. For UK and EEA visitors, transfers are protected by safeguards such as the European Commission’s Standard Contractual Clauses."] },

    { h2: "6. How long we keep it" },
    {
      ul: [
        [{ text: "Enquiries and correspondence:", strong: true }, " up to 24 months after our last contact, unless they lead to an engagement."],
        [{ text: "Client engagement records:", strong: true }, " for the duration of the engagement and up to 8 years afterwards, in line with Indian tax and accounting requirements."],
        [{ text: "Job applications:", strong: true }, " up to 12 months after the role is filled, or longer if you agree to be considered for future roles. If you join us, your application becomes part of your employee record."],
        [{ text: "Website logs:", strong: true }, " up to 90 days, unless needed to investigate a security incident."],
        [{ text: "Analytics data:", strong: true }, " up to 14 months (Google Analytics’ retention setting)."],
      ],
    },
    { p: ["When data is no longer needed we delete or anonymise it."] },

    { h2: "7. Your rights" },
    { p: ["Subject to the law that applies to you, you can:"] },
    {
      ul: [
        ["ask for a summary of the personal data we hold about you and how we use it;"],
        ["ask us to correct, complete, update or erase it;"],
        ["withdraw your consent at any time, without affecting processing already done;"],
        ["nominate another person to exercise your rights if you die or become incapacitated (DPDP Act);"],
        ["object to or restrict certain processing, and receive your data in a portable format (UK/EEA visitors);"],
        ["raise a grievance with us, and if unresolved, complain to the Data Protection Board of India, or to your local supervisory authority if you are in the UK or EEA."],
      ],
    },
    { p: ["Email the Grievance Officer at ", { text: "{email}", href: "mailto:{email}" }, ". We will acknowledge your request within 7 days and respond within 30 days. We may ask you to verify your identity first."] },

    { h2: "8. Cookies" },
    { p: ["We use one item of browser storage to remember your cookie choice, and analytics cookies only if you accept them. You can change your mind at any time through ", { text: "Cookie Preferences", action: "cookie-prefs" }, ". Full details are in our ", { text: "Cookie Policy", href: "/cookie-policy" }, "."] },

    { h2: "9. Security" },
    { p: ["The website is served only over encrypted HTTPS and sends security headers that limit framing, content sniffing and access to device features. Online job applications are checked for file type and size and forwarded by email without being stored on the website. Access to enquiries and applications is limited to the people who need it. No system is completely secure, but we take reasonable measures to protect your data and will notify you and the authorities of a personal data breach where the law requires."] },

    { h2: "10. Children" },
    { p: ["Our website and services are intended for businesses and adults. We do not knowingly collect personal data from anyone under 18. If you believe a child has sent us personal data, contact us and we will delete it."] },

    { h2: "11. Changes to this policy" },
    { p: ["We may update this policy from time to time. The latest version, with its “last updated” date, will always be on this page. Where a change significantly affects how we use your data, we will take reasonable steps to tell you."] },

    { h2: "12. Contact us" },
    { p: [{ text: "GA Management Consultants LLP", strong: true }, " — Grievance Officer"] },
    { p: [{ text: "Email:", strong: true }, " ", { text: "{email}", href: "mailto:{email}" }] },
    { p: [{ text: "Post:", strong: true }, " 2nd Floor, WonderWorks Mudit Square, B-3, Plot No. 24, Institutional Area, Sector 32, Gurugram, Haryana 122001, India."] },
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
  intro: [{ text: "Last updated:", strong: true }, " 24 October 2026"] as Part[],
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

/* Terms of Use (2026-10-24): website terms for gamcs.in, modelled on
   threesixtyfinance.com's legal page, governed by Indian law. */
export const terms = {
  title: "Terms of Use",
  intro: [{ text: "Last updated:", strong: true }, " 24 October 2026"] as Part[],
  blocks: [
    { p: ["These Terms of Use govern your use of {url} (the “website”), operated by GA Management Consultants LLP (“GAMCS”, “we”, “us”). By using the website you agree to these terms. If you do not agree, please do not use it."] },

    { h2: "1. About the website" },
    { p: ["The website describes our finance advisory, FP&A, digital transformation, transaction and training services. It is for general information only. Any engagement with GAMCS is governed by a separate written agreement, which takes precedence over these terms."] },

    { h2: "2. Not professional advice" },
    { p: ["Content on the website — including articles, case studies, dashboards, figures and the finance maturity assessment — is general information, not financial, accounting, tax, legal or investment advice. It does not create a client relationship. Case studies and demonstration dashboards are illustrative, may use sample data, and do not guarantee similar results. Please take professional advice for your own circumstances before acting on anything you read here."] },

    { h2: "3. Intellectual property" },
    { p: ["The website and its content — text, design, logos, the GA mark, graphics, videos, dashboards and code — belong to GAMCS or its licensors and are protected by intellectual property laws. You may view and print pages for your own non-commercial reference. You may not copy, reproduce, modify, republish or commercially exploit any content without our prior written permission. Third-party names and logos shown (for example the platforms we work with) belong to their owners and do not imply endorsement."] },

    { h2: "4. Acceptable use" },
    { p: ["You agree not to:"] },
    {
      ul: [
        ["use the website unlawfully, or in a way that harms GAMCS or anyone else;"],
        ["attempt to gain unauthorised access to the website, its servers or any connected system;"],
        ["introduce viruses or other harmful code, or overload or disrupt the website;"],
        ["scrape, copy or harvest content or data by automated means without permission;"],
        ["submit false information, or another person’s details, through our forms."],
      ],
    },

    { h2: "5. Information you send us" },
    { p: ["When you contact us or apply for a role, you confirm the information you provide is accurate and that you are entitled to share it. We handle it as described in our ", { text: "Privacy Policy", href: "/privacy-policy" }, ". Please do not send confidential information through the website until an engagement and any confidentiality agreement are in place."] },

    { h2: "6. Links to other websites" },
    { p: ["The website links to third-party sites such as LinkedIn, Google Maps and published research. We do not control those sites and are not responsible for their content, availability or privacy practices."] },

    { h2: "7. Availability and accuracy" },
    { p: ["We work to keep the website accurate and available, but it is provided “as is”. We do not warrant that it will be uninterrupted, error-free or free of harmful components, or that its content is complete or current. We may change, suspend or remove any part of it at any time."] },

    { h2: "8. Limitation of liability" },
    { p: ["To the fullest extent permitted by law, GAMCS is not liable for any indirect, incidental or consequential loss, or for any loss of profit, revenue, data or goodwill, arising from your use of, or inability to use, the website or reliance on its content. Nothing in these terms limits liability that cannot be limited by law."] },

    { h2: "9. Indemnity" },
    { p: ["You agree to compensate GAMCS for any loss or claim arising from your breach of these terms or misuse of the website."] },

    { h2: "10. Governing law" },
    { p: ["These terms are governed by the laws of India. The courts at Gurugram, Haryana have exclusive jurisdiction over any dispute arising from them or from your use of the website."] },

    { h2: "11. Changes to these terms" },
    { p: ["We may update these terms from time to time. The version on this page, with its “last updated” date, applies from the date it is posted. Continuing to use the website means you accept the updated terms."] },

    { h2: "12. Contact" },
    { p: ["Questions about these terms: ", { text: "{email}", href: "mailto:{email}" }, " — GA Management Consultants LLP, 2nd Floor, WonderWorks Mudit Square, B-3, Plot No. 24, Institutional Area, Sector 32, Gurugram, Haryana 122001, India."] },
  ] as LegalBlock[],
};

