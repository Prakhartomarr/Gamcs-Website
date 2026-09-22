import type { Part } from "./fill";

/**
 * Per-route copy that is not part of a section's own content: the browser tab
 * title and search description of every route, breadcrumb labels, kickers and
 * the small CTAs and lines each page adds around the shared content.
 *
 * `title` is the page's own name — the "| GA Management Consultants" suffix
 * comes from the template in the root layout, so it is never typed twice.
 */
export const pages = {
  home: {
    title: "From Reporting to Decision Intelligence",
    description:
      "GAMCS helps CFOs and PE/VC portfolios move from reporting to real-time decision intelligence — FP&A, team extension, digital transformation, and deal advisory.",
  },
  whoWeAre: {
    title: "Who We Are | Our Story",
    /* The lead's own opening sentence — a meta description has ~160 characters
       to work with and the full lead runs 331. */
    description:
      "GA Management Consultants (GAMCS) is a high-impact management consulting firm serving clients across India and globally.",
    crumb: "Who We Are",
    kicker: "WHO WE ARE",
    meetFounders: "Meet our founders",
  },
  solutions: {
    /** og/twitter title; the tab title is solutionsHub.titleTag. */
    title: "Solutions",
    crumb: "Solutions",
    pill: "Solutions",
    closing: "Not sure which pillar you need? Start with a conversation.",
  },
  caseStudy: {
    title: "Case Studies | Finance, FP&A, BI & Deal Engagements",
    description:
      "Real GAMCS engagements across D2C, SaaS, healthcare, hospitality, pharma, and non-profits — FP&A, BI dashboards, digital transformation, and a $525M PE deal.",
    crumb: "Case Studies",
    kicker: "CASE STUDY",
    seeServices: "See our services",
    /** `{count}` is the number of case studies. */
    count: "{count} engagements. Every one of them started with a conversation.",
    closing: "Recognise your own numbers in any of these?",
  },
  team: {
    title: "Our Team | Founders & Advisors",
    description:
      "Meet the founders and advisory board behind GA Management Consultants — 100+ combined years of FP&A, BI, audit, and CFO advisory experience.",
    crumb: "Team",
    kicker: "TEAM",
    theirWork: "Their work",
  },
  careers: {
    title: "Careers",
    crumb: "Careers",
  },
  contact: {
    title: "Contact Us",
    description:
      "Schedule a call with GA Management Consultants to discuss FP&A and CFO advisory, finance team extension, digital transformation, deal advisory, or training.",
    crumb: "Contact",
    kicker: "CONTACT",
    lead: "Tell us where your finance function is today and what you need it to do. One of the founders reads every enquiry.",
    detailsKicker: "CONTACT DETAILS",
    generalInquiries: "General inquiries",
    linkedin: "LinkedIn",
    website: "Website",
    /** Shown once site.phone is set. */
    phone: "Phone",
    registeredName: "Registered name",
    /** Shown once site.responseTime is set. */
    typicalReply: "Typical reply",
    privacy: [
      "Your details go straight to us by email and are used only to answer your enquiry. See our ",
      { text: "Privacy Policy", href: "/privacy-policy" },
      ".",
    ] as Part[],
  },
  faq: {
    title: "Frequently Asked Questions",
    crumb: "FAQ",
  },
  thankYou: {
    title: "Thanks for getting in touch",
    description:
      "Your enquiry is on its way to GA Management Consultants. Here is what happens next.",
    crumb: "Thank you",
    kicker: "MESSAGE READY",
    h1: "Thanks — your details are on their way.",
    lead: "Submitting the form opens your own email app with everything you entered, addressed to {email}. Press send there and it reaches us directly.",
    steps: [
      {
        heading: "Check your email app",
        body: [
          "A draft to {email} should be open, pre-filled with your answers. Nothing is sent until you send it.",
        ] as Part[],
      },
      {
        heading: "Didn’t open?",
        body: [
          "Some browsers block mail links. Write to ",
          { text: "{email}", href: "mailto:{email}" },
          " directly, or message us on ",
          { text: "LinkedIn", href: "{linkedin}", external: true },
          ".",
        ] as Part[],
      },
      {
        heading: "We’ll be in touch",
        /** Shown once site.responseTime is set… */
        reply: "We reply {responseTime}.",
        /** …and until then. */
        body: ["One of the founders reads every enquiry and will reply by email."] as Part[],
      },
    ],
    backHome: "Back to home",
    readCaseStudies: "Read case studies",
  },
  notFound: {
    title: "Page not found",
    description:
      "That page does not exist. Head back to the homepage or get in touch with GA Management Consultants.",
    kicker: "PAGE NOT FOUND",
    h1: "This page has moved on.",
    h1Accent: "We haven’t.",
    body: "The link you followed doesn’t lead anywhere on {short}. It may have been renamed, or the address may have a typo in it.",
    backHome: "Back to home",
    elsewhereHeading: "Or pick up from here",
    /* The onward links are the four routes that actually exist, not a sitemap
       dump, so every one of them resolves. */
    elsewhere: [
      { label: "Case studies", href: "/case-study" },
      { label: "Founders & advisors", href: "/team" },
      { label: "How we help", href: "/#how-we-help" },
      { label: "Our services", href: "/#solutions" },
    ],
    /** `{count}` is the number of services listed in `services`. */
    hint: "{count} services across finance, technology and training.",
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "How GA Management Consultants handles the information you share through this website — the contact form, cookies, analytics and third-party services.",
    crumb: "Privacy Policy",
  },
  cookiePolicy: {
    title: "Cookie Policy",
    description:
      "How GA Management Consultants uses cookies and similar technologies on gamcs.in, and how you can manage your preferences.",
    crumb: "Cookie Policy",
  },
} as const;
