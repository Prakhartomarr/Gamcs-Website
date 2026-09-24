/**
 * SINGLE SOURCE OF TRUTH for site copy.
 *
 * Every string here is transcribed verbatim from https://www.gamcs.in/ .
 * Nothing in this file is invented, reworded or rounded. If a figure needs to
 * change, change it on the live site first, then mirror it here — components
 * must not hardcode copy.
 */

import type { Part } from "./fill";

export const site = {
  name: "GA Management Consultants",
  legalName: "GA Management Consultants LLP",
  short: "GAMCS",
  tagline: "Driving Change, Delivering Results",
  subheading: "We turn insights into impact.",
  url: "https://www.gamcs.in",
  email: "info@gamcs.in",
  linkedin: "https://in.linkedin.com/company/gamcs-in",
  copyright: "© 2026 All Rights Reserved",
  /** Brand mark. Overwrite public/brand/logo.png to change it everywhere. */
  logo: "/brand/logo.png",
  /**
   * TODO(business): gamcs.in publishes no phone number. Fill it in and the
   * contact page and the Organization JSON-LD render it automatically.
   * Leaving it null is deliberate — an invented number is worse than none.
   */
  phone: null as string | null,
  /**
   * `coords` and `map` are part of the address, not decoration: the map
   * links route to the coordinates rather than to the text (geocoding the
   * written address alone lands ~400m off), and `map` is a static basemap
   * rendered for exactly that centre. Move the office and all three change
   * together, or the pin quietly points at the old one.
   */
  address: {
    street:
      "2nd Floor, WonderWorks Mudit Square, B-3, Plot No. 24, Institutional Area, Sector 32",
    locality: "Gurugram",
    region: "Haryana",
    postalCode: "122001",
    country: "IN", // ISO 3166-1 alpha-2
    coords: "28.4443371,77.0436624",
    map: "/map/gurugram-sector32.webp",
  } as {
    street: string;
    locality: string;
    region: string;
    postalCode: string;
    country: string;
    coords: string;
    map: string;
  } | null,
  /**
   * TODO(business): real reply-time commitment, e.g. "within 1 business day".
   * Surfaced next to the contact CTAs only when set — never guessed.
   */
  responseTime: null as string | null,
} as const;

/** Hero headline and subhead, per the copy doc. Split across two lines the
 *  way the design sets them; the second line carries the blue accent. */
export const hero = {
  /* Doc page 1 H1, "From Reporting to Decision Intelligence", on two lines:
     the break falls after "to" so the blue accent line stays whole. */
  line1: "From Reporting to",
  line2: "Decision Intelligence",
  /* Two-tone lead-in above the subhead. Two strings, not one, because the
     colour break IS the point — the first sentence is the old way and
     recedes, the second is the new one and carries the brand blue. A single
     string could not be split without the component guessing where. */
  leadWas: "Stop Reporting What Happened.",
  leadNow: "Start Knowing What To Do Next.",
  subhead:
    "We connect finance, data and technology to transform reporting into decisions \u2014 and insights into impact by combining FP&A, BI, automation and finance expertise into one operating layer.",
  /* The hero's one button. The copy doc sends it to the "Case Study Section";
     that is the /case-study page — the homepage has no case study band. */
  cta: { label: "See Decision Intelligence in Action", href: "/case-study" },
} as const;

export const intro =
  "With more than combined 100+ years of industry experience, GA Management Consultants is a consultancy firm committed to creating impact & value for clients and communities.";


/**
 * Company story. `heading` and `lead` carry the homepage section; `body` and
 * `close` only ever render on /who-we-are, which is where the homepage's
 * "About our firm" hands off. Splitting it that way is the whole point: the
 * full story is ~1,400 characters, and a homepage section that ran it in one
 * column stood 1,090px tall beside a 440px portrait.
 */
export const story = {
  /*
   * NOT site.tagline. That one string is also the document title, the OG and
   * Twitter cards, the manifest name and the Organization slogan; a
   * 108-character sentence breaks all four, so the section heading is its own
   * field and "Driving Change, Delivering Results" stays the tagline.
   */
  heading:
    "We connect finance, data and technology to transform reporting into decisions \u2014 and insights into impact.",
  lead:
    "GA Management Consultants (GAMCS) is a high-impact management consulting firm serving clients across India and globally. Founded in 2023 by Gaurav Malik and Abhinav Aggarwal, GAMCS was built with a clear vision: to transform finance from a reporting function into a strategic engine for growth\u2014powered by data, technology, and insight.",
  body: [
    "We partner with growth-focused businesses, founders, CFOs, and investment teams to modernize, strengthen, and scale their finance functions. Our work brings together FP&A, business intelligence, financial analytics, automation, technology, and finance operations to help organizations move beyond simply understanding what happened to knowing why it happened, what happens next, and what they should do about it.",
    "GAMCS also works as a delivery and execution partner to consulting and advisory firms, extending their capabilities with hands-on expertise across FP&A, financial modelling, BI, reporting, automation, and transaction support. Our growing partner network includes firms such as Akshar Business Consulting, Three 6ixty Finance, and CFO Bridge, among others.",
  ],
  close:
    "Through this combination of strategic thinking and hands-on execution, GAMCS supports organizations ranging from startups and high-growth companies to established enterprises and investment portfolios\u2014helping them build finance functions that are more connected, intelligent, scalable, and decision-ready.",
  mission:
    "Our mission is simple: make finance a source of insight, not just information.",
} as const;

export const primaryCta = { label: "Schedule a Call", href: "/contact" } as const;

/** "Why Us" section */
/**
 * "How We Help" — doc page 1, section 4 (v3).
 *
 * Six points, each a lead and a body. The earlier six were one-line labels
 * transcribed from the live site; the doc's version carries the explanation
 * too, which the How We Help stack shows in its detail panel.
 */
export const whyUs = {
  heading: "Built Differently. Delivered End-to-End.",
  /* Same sentence, split so one phrase can take the accent tint and its drawn
     underline. `heading` stays whole for anywhere that needs the full line. */
  headingLead: "Built Differently.",
  headingAccent: "Delivered End-to-End.",
  /* Under the heading. Not on gamcs.in — supplied with the isometric-stack
     redesign of this section. */
  sub: "Every layer of the finance function we build is designed to hold up on its own \u2014 and to connect to the one above it.",
  /* `lead` doubles as the key into STEP_ICONS (components/ui/stroke-icons.tsx)
     and into the layer artwork in HowWeHelpStack — rename a lead and rename
     both. The artwork map is typed on these literals, so a missed rename there
     fails the build; STEP_ICONS is not, and would just render an empty glyph.
     The rail label is the lead's first sentence, and the "01" numbers come
     from position — neither is stored here. */
  points: [
    { lead: "One Team. One Integrated Finance Engine.", body: "We bring finance, data, revenue, and technology together under one roof\u2014so the numbers, systems, insights, and decisions actually connect." },
    { lead: "Independent by Design. Outcomes Above Platforms.", body: "We recommend and implement the right ERP, CRM, BI, or FP&A platform for your business\u2014not the one we're incentivized to sell. Every solution is built around your business model, KPIs, systems, and goals." },
    { lead: "Intelligence Built In. Not Bolted On.", body: "We don't stop at reporting. Our dashboards, models, and finance solutions are designed to surface anomalies, explain performance, improve forecasting, and turn data into actionable insight from day one." },
    { lead: "Boardroom Ready. Deal Room Proven.", body: "We build finance functions that stand up to management scrutiny, investor questions, due diligence, fundraising, refinancing, and M&A\u2014not just the monthly reporting cycle." },
    { lead: "Industry-Agnostic. Business-Specific.", body: "We don't rely on industry templates. We build around how your business makes money, what drives performance, and what decisions matter. Our experience spans SaaS, Hospitality, D2C / Consumer, VFX, Logistics, Professional Services, Non-Profits, Pharmaceuticals, and beyond." },
    { lead: "Scale Capability. Not Overhead.", body: "From a single specialist to a full Finance or Centre of Excellence, our delivery model scales with your needs\u2014giving you senior expertise and execution capacity without requiring you to build everything in-house." },
  ],
} as const;

/* Only app/not-found.tsx reads these, for its service count. */
export const services = {
  business: [
    "Budgeting & Forecasting",
    "Business Intelligence & Analytics",
    "Management Reporting",
    "Automation & Transformation",
    "Accounting & Bookkeeping Services",
    "Due Diligence Services",
    "Taxation, Audit & Compliance",
    "Data Warehousing",
  ],
  technology: [
    "ERP Tools Implementation & Optimization",
    "FP&A Tools Implementation",
    "Reporting & BI Tools",
    "AI Integration & Enablement",
    "Software Development (MERN Stack & Beyond)",
    "Data Warehousing & Cloud Infrastructure",
  ],
  training: [
    "FP&A Training",
    "Financial Modelling Training",
    "ESG Training",
    "Tool-Based Finance Training",
    "Data Analytics for Finance Professionals",
  ],
} as const;

/** "Our Achievements — Our clients have experienced" */
export const achievements = {
  heading: "Our Achievements",
  lead: "Our clients have experienced",
  items: [
    { value: "90%", label: "reduction in TAT for deliverables" },
    { value: "5+", label: "data warehousing solutions implemented" },
    { value: "100%", label: "accuracy in financial records and compliance" },
    { value: "10,000+", label: "hours saved annually through automation" },
    { value: "30%", label: "reduction in operational costs" },
    { value: "50+", label: "high impact dashboards built" },
    { value: "$525Mn", label: "PE Acquisition Deal facilitation" },
    { value: "100+", label: "bespoke financial models built" },
  ],
} as const;

export const team = {
  headingLines: ["The people you call for", "Solutions you can trust"],
  /** Doc page 10. */
  h1: "Led by Operators Who've Sat in Your Seat",
  body:
    "GAMCS operates as part of a global FP&A consulting network, serving clients from early-stage startups through PE-backed enterprises. Our team isn't generalist consultants — it's specialists in the specific problems CFOs and investment teams actually face.",
  closingCta: "Want to work with this team directly?",
  /**
   * Names, titles, years of experience and locations are all from the copy
   * doc (page 10).
   *
   * `bio` is optional and currently unset for everyone: nobody has one written
   * yet. The roster's panel renders whatever a person does have, so a missing
   * bio costs a paragraph rather than leaving an empty dialog — fill one in and
   * it appears with no other change.
   *
   * `linkedinUrl` is a real personal profile, not the company page. Only the
   * two founders publish one; an earlier version of this page linked a
   * per-person icon at the company URL, which is why the field is a URL rather
   * than a boolean.
   *
   * Gaurav stays "Founder" rather than the doc's "Co-Founder & Partner":
   * that correction was an explicit client instruction in Phase 1.
   */
  /** Both founders, for the homepage Who-we-are block. Order matters:
      leadership[0] is on the left of the frame, [1] on the right, which is
      what the alt text describes. */
  foundersPhoto: "/team/founders-light.webp",
  leadership: [
    { name: "Gaurav Malik", title: "Founder | FP&A & Due Diligence Specialist", experience: "10+ years", location: "Delhi, India", linkedinUrl: "https://www.linkedin.com/in/gauravmalik93/", photo: "/team/gaurav-malik-bw.jpg", email: "gaurav.malik@gamcs.in" },
    { name: "Abhinav Aggarwal", title: "Co-Founder | FP&A, BI & Transformation Specialist", experience: "10+ years", location: "Delhi, India", linkedinUrl: "https://www.linkedin.com/in/abhinav-aggarwal-a29078172/", photo: "/team/abhinav-aggarwal-bw.jpg", email: "abhinav.aggarwal@gamcs.in" },
  ],
  /* Order is the client's: it is what the page prints, four to a row.
     Ramesh has his headshot but no title yet, and Geetika has neither, so
     "Advisor" stands in for both and her card carries an initials tile.
     A card with no `photo` renders the tile. */
  advisory: [
    { name: "Sumit Chatterjee", title: "Shared Services Operations", experience: "30+ years", photo: "/team/sumit-chatterjee.jpg" },
    { name: "Ramesh Yadav", title: "Advisor", photo: "/team/ramesh-yadav.jpg" },
    { name: "Amit Garg", title: "Audit & IPO Advisor", photo: "/team/amit-garg.jpg" },
    { name: "Dhawal Parvatikar", title: "Strategic Finance & CFO Advisory", experience: "15+ years", location: "Dubai, UAE", photo: "/team/dhawal-parvatikar.jpg" },
    { name: "Asif Masani", title: "BI & Analytics, FP&A Automation Specialist", experience: "15+ years", location: "Mumbai, India", photo: "/team/asif-masani.jpg" },
    { name: "Sanjay Rikhy", title: "Strategic Advisor | Former CFO | ESG & Performance Transformation", experience: "25+ years", photo: "/team/sanjay-rikhy.jpg" },
    { name: "Geetika Kamikar", title: "Advisor" },
    { name: "Saurabh Aggarwal", title: "Reporting, Due Diligence, Audit & Compliance Specialist", experience: "20+ years", photo: "/team/saurabh-aggarwal.jpg" },
  ],
  get members() {
    return [...this.leadership, ...this.advisory];
  },
};

/** `logo` is optional artwork beside the quote; a missing file or field falls
    back to the person's initials. */
export const testimonials = {
  heading: "What our clients say about us",
  items: [
    {
      name: "Amol Khedkar",
      title: "Deputy Manager",
      company: "Two Brothers India Farms",
      logo: { src: "/logos/clients/two-brothers-new.png", alt: "Two Brothers India Farms" },
      quote:
        "We had the pleasure of working with GA Managements and their expertise was instrumental in delivering actionable insights for us. Their meticulous approach to their work has consistently exceeded our expectations. The strategic approach and attention to detail made a significant impact in our day to day working. We highly recommend their services for anyone seeking top-tier FP&A consultancy.",
    },
    {
      name: "Arta Ramiraj",
      title: "Co-Founder",
      company: "Three Sixty Finance, UK",
      logo: { src: "/logos/partners/threesixty.png", alt: "Threesixty Finance" },
      quote:
        "I have had the pleasure of working with GA Management Consultants on several projects, and they have been fantastic every time. They are so quick and have great attention to detail. I know I can rely on them, no matter how complex or time-sensitive the task is. They have been a huge support to me, and I wouldn't hesitate to recommend them to anyone else!",
    },
  ],
} as const;

/** The only two clients named anywhere on the live site (both via testimonials). */
export const namedClients = [
  { name: "Two Brothers India Farms", region: "India" },
  { name: "Three Sixty Finance", region: "UK" },
] as const;

/**
 * Shape of a fully written-up case study. Every field past `blurb` is
 * optional because the live site publishes only the title and blurb.
 *
 * TODO(business): supply `problem` / `solution` / `outcome` per engagement.
 * `CaseStudyCard` renders the full structure the moment they exist and
 * degrades to title + blurb until then. Outcomes must be real measured
 * results — do not reuse the site-wide figures in `achievements` here.
 */
export type CaseStudy = {
  no: string;
  title: string;
  blurb: string;
  problem?: string;
  solution?: string;
  outcome?: string;
};

export const caseStudies = {
  heading: "Impact-driven finance and tech solutions.",
  intro:
    "Explore real-world examples of how we've helped clients overcome challenges, optimize financial operations, and drive growth through tailored FP&A, analytics, and technology solutions.",
  sectionTitle:
    "Case Studies: Solving Business Challenges with Smart Finance & Technology",
  items: [
    { no: "01", title: "End-to-end FP&A Support for SaaS Industry", blurb: "Complete planning and reporting solutions tailored for fast-growing SaaS businesses." },
    { no: "02", title: "End-to-end FP&A Support for Hospitality Industry", blurb: "Driving financial insights and forecasting excellence for hospitality businesses." },
    { no: "03", title: "FP&A Automated Reporting Solution for Healthcare Industry", blurb: "Automated dashboards and reporting tools for data-driven healthcare finance." },
    { no: "04", title: "Spend Analytics for Information Services Industry", blurb: "Enabling cost transparency and smarter decisions through spend analysis." },
    { no: "05", title: "FP&A Implementation for Pharma Industry", blurb: "Optimizing financial planning and consolidation processes for pharma leaders." },
    { no: "06", title: "Unit4 FP&A Implementation for Non Profits", blurb: "Helping mission-driven organizations manage budgets with Unit4 FP&A." },
    { no: "07", title: "Tool Development for Professional Services Firm", blurb: "Custom tool development to streamline financial ops and reporting." },
    { no: "08", title: "Template Creation for Professional Services Firm in UK", blurb: "Building reusable planning templates tailored to UK-based firms." },
    { no: "09", title: "Accounting Support for SaaS Industry", blurb: "Ongoing bookkeeping and financial accuracy for scaling SaaS companies." },
    { no: "10", title: "Audit & Month End Close Support for SaaS Industry", blurb: "Audit readiness and smooth monthly close processes for SaaS finance teams." },
  ] satisfies CaseStudy[],
};

export const contact = {
  heading: "Talk to us about your goals!!",
  /** Field labels exactly as they appear on the live form. */
  fields: [
    { name: "name", label: "Full Name", required: true },
    { name: "title", label: "Title", required: false },
    { name: "company", label: "Company", required: false },
    { name: "phone", label: "Phone Number", required: true },
    { name: "source", label: "How did you hear about us?", required: false },
    { name: "email", label: "Email Address", required: true },
    { name: "goal", label: "Your Goal", required: false },
  ],
  submit: "Submit",
  /** Inline validation; there is no server, so these run before the mail app opens. */
  errors: {
    name: "Please enter your name.",
    email: "Please enter a valid email address.",
    phone: "Please enter a phone number we can reach you on.",
  },
  sending: "Opening your email…",
  /** When the browser refuses the mailto: handover. */
  failed: [
    "We couldn’t open your email app. Please write to ",
    { text: "{email}", href: "mailto:{email}" },
    " instead.",
  ] as Part[],
} as const;

export const footer = {
  logoLabel: "GA Management Consultants home",
  logoAlt: "GA Management Consultants — the GA monogram in blue",
  headings: { explore: "Explore", solutions: "Solutions", legal: "Legal" },
  /** The accent link under the address, beside the email. */
  contactLabel: "Contact Us",
  /** Now the accessible name of the LinkedIn tile rather than a text link. */
  linkedinLabel: "LinkedIn",
  cookiePreferences: "Cookie Preferences",
  links: [
    { label: "Who we are", href: "/#who-we-are" },
    { label: "Solutions", href: "/solutions" },
    { label: "How we help", href: "/#how-we-help" },
    { label: "Case Study", href: "/case-study" },
    { label: "Founders & advisors", href: "/team" },
    { label: "Careers", href: "/careers" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact Us", href: "/contact" },
  ],
  /**
   * The five pillar pages. Left as a literal rather than derived from
   * `solutions[]` because that array is declared after `footer` in this file.
   * Nothing checks that the two agree, so rename a pillar or a slug here too.
   */
  solutions: [
    { label: "FP&A & CFO Advisory", href: "/solutions/fpa-cfo-advisory" },
    { label: "Finance Team Extension", href: "/solutions/finance-team-extension" },
    { label: "Digital Transformation", href: "/solutions/digital-transformation" },
    { label: "Deal Advisory", href: "/solutions/deal-advisory" },
    { label: "Training & Enablement", href: "/solutions/training-enablement" },
  ],
  /**
   * Privacy Policy is an internal page describing what this build actually
   * does with data (see app/privacy-policy/page.tsx).
   *
   * TODO(business/legal): Terms of Use still points at the live gamcs.in page
   * because its text could not be transcribed verbatim, and paraphrased legal
   * copy must not be presented as the company's terms. Supply the exact text
   * and this becomes an internal route like the privacy policy.
   */
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Use", href: "https://www.gamcs.in/terms-of-use", external: true },
    { label: "Cookie Policy", href: "/cookie-policy" },
  ],
} as const;

export type FaqItem = {
  q: string;
  a: string;
};

/**
 * Frequently asked questions, verbatim from GAMCS_Web_View_1.html
 * (2026-09-15), which replaced the copy document (Page 11) as the source of
 * truth for this copy. `intro` is the site's own search text: the file has none.
 */
export const faq = {
  heading: "Frequently Asked Questions",
  kicker: "FAQ",
  cta: "Still have questions?",
  /* The copy doc's page 11 meta description, reworded for the five pillars.
     Feeds both the <meta> tag and the /faq intro line, so the two cannot
     drift apart. */
  intro:
    "Answers to common questions about GAMCS's FP&A and CFO advisory, finance team extension, digital transformation, deal advisory, and training services.",
  items: [
    {
      q: "What is FP&A advisory, and how is it different from accounting or bookkeeping?",
      a: "FP&A is forward-looking: budgeting, forecasting, scenario modeling, and variance analysis that guide decisions. Accounting and bookkeeping — which we deliver through Finance Team Extension — are backward-looking: recording what already happened and staying compliant. Both matter; they're just different disciplines.",
    },
    {
      q: "How quickly can GAMCS stand up FP&A for a growing company?",
      a: "Our Excel-based FP&A model — standardized financial models, 13-week rolling cash flow, and variance frameworks — typically goes live in 2–3 weeks with minimal dependency on your existing tech stack, and scales into BI dashboards or enterprise FP&A tools as you grow.",
    },
    {
      q: "What BI, analytics, and RevOps tools does GAMCS use?",
      a: "Primarily Power BI and Tableau, connected directly to your ERP, CRM, and HR systems for automated, real-time refresh — including RevOps analytics like CAC, ROAS, and pipeline velocity. Underlying infrastructure runs on Azure, AWS, and Google Cloud/Microsoft Fabric. This is the Analytics & Warehousing arm of our Digital Transformation pillar.",
    },
    {
      q: "How does Finance Team Extension work for a PE or VC portfolio?",
      a: "We build a dedicated, standardized Finance & Analytics Center of Excellence (part of our Finance Team Extension pillar) that embeds offshore teams into each portfolio company, using one consistent KPI framework and chart-of-accounts methodology across the fund. The same pillar also covers lighter-touch staff augmentation and Employer of Record (EoR) arrangements when a full CoE isn't what's needed.",
    },
    {
      q: "Do you provide due diligence support for M&A, fundraising, or refinancing?",
      a: "Yes. We provide financial due diligence, quality of earnings and quality of assets analysis, fundraise/exit-readiness support, and debt refinancing advisory for both buy-side and sell-side transactions — including hands-on support that helped a client secure a $525M PE acquisition.",
    },
    {
      q: "Do you help prepare investor decks or board presentations?",
      a: "Yes. We build investor updates, fundraise pitch decks, and board presentation materials directly — grounded in the same diligence-ready models and real-time dashboards we build for ongoing FP&A and BI work.",
    },
    {
      q: "Are you tied to specific software vendors?",
      a: "No — we're platform-agnostic by design. We implement ERP systems (Oracle NetSuite, Oracle Fusion, Odoo, Zoho, SAP, QuickBooks), CRM platforms (primarily Salesforce), and FP&A tools (Anaplan, Aimplan, Jedox, Prophix, Pigment, Vena, Unit4, PivotXL, among others). Where none of those fits, we also bring our own in-house software, Finsensor AI.",
    },
    {
      q: "How does GAMCS ensure accuracy and compliance across GAAP standards?",
      a: "Our accounting and reporting work is built to Ind AS, US GAAP, and IFRS standards, supported by proprietary tools — including our Consolidation Tool, SIII Reporting Tool (IGAAP & Ind AS), and IFRS 16 / Ind AS 116 lease calculation accelerators — built on our in-house Finsensor AI software. Clients report 100% accuracy in financial records and compliance reporting.",
    },
    {
      q: "Do you only work with direct clients, or also with other advisory firms?",
      a: "Both. Beyond direct corporate and PE/VC clients, we operate as the embedded finance and analytics delivery team behind other advisory firms — including Three Sixty Finance (UK) and Akshar Business Consulting (UK).",
    },
    {
      q: "Do you offer training, or only client engagements?",
      a: "Both. Alongside corporate training and enablement work, our founders teach two public courses through Thinking Bridge — the FP&A Strategy MasterClass and the Tableau MasterClass — and we're associated with the FP&A Professional Institute (FPI).",
    },
    {
      q: "Who is GA Management Consultants built for?",
      a: "CFOs and CXOs at growth-stage and mid-market companies, private equity or venture capital investment teams needing standardized visibility across a portfolio, and advisory firms needing embedded delivery capacity.",
    },
  ] satisfies FaqItem[],
};


/* ===================================================================
 * SOLUTIONS — hub + five pillar pages
 *
 * Copy is verbatim from GAMCS_Web_View_1.html (2026-09-15): its PILLARS data,
 * in the order its renderPillar lays a page out. The exception is search text
 * the file lacks — `metaDescription` here, and the hub's blurbs, title tag
 * and meta description — which is the site's own, reworded for five pillars.
 *
 * The five pages do not share one rigid shape (Finance Team Extension carries
 * a build sequence and a numbers strip, Digital Transformation two arms), so
 * each page is a list of typed blocks rather than a fixed set of fields.
 * ServicePageLayout renders whatever blocks a page declares, in order.
 * =================================================================== */

export type ListItem = { lead: string; body: string };

export type SolutionBlock =
  | { kind: "bullets"; heading: string; items: ListItem[] }
  | { kind: "steps"; heading: string; items: ListItem[] }
  | { kind: "prose"; heading: string; body: string }
  | { kind: "callout"; body: string }
  | { kind: "stats"; heading: string; items: { value: string; label: string }[] }
  | { kind: "arms"; items: { id: string; badge: string; intro: string; bullets: ListItem[]; callout?: string }[] };

export type Solution = {
  slug: string;
  /** Short form, for nav and footer. */
  navLabel: string;
  title: string;
  titleTag: string;
  metaDescription: string;
  h1: string;
  intro: string;
  /** One line under the pillar's name in the homepage services accordion. */
  tagline: string;
  /** Rendered as a card above At a glance. */
  problem?: { label: string; body: string };
  /** Scannable sub-service list shown above the detail blocks. */
  atAGlance: string[];
  blocks: SolutionBlock[];
  seeItInAction?: { heading: string; paragraphs: string[] };
  closingLine: string;
};

export const solutions: Solution[] = [
  {
    slug: "fpa-cfo-advisory",
    navLabel: "FP&A & CFO Advisory",
    title: "FP&A & CFO Advisory",
    titleTag: "FP&A & CFO Advisory Services for CFOs & CXOs | GAMCS",
    metaDescription:
      "FP&A and CFO advisory — budgeting, forecasting, rolling cash flow models, RevOps forecasting, and board-ready reporting for growth companies and PE portfolios.",
    h1: "FP&A That Moves at the Speed of Your Business\u00a0— Not Your Month-End Close", // \u00a0 keeps the dash off the start of a balanced line
    intro:
      "Call it FP&A advisory, call it CFO advisory — it's the same seat at the table. If your finance team is still built for controllership and statutory reporting, you already have a strategic gap. Financial statements tell you what happened. This is where you get told what to do about it.",
    tagline: "CFO-level budgeting, forecasting, and rolling models.",
    problem: {
      label: "The problem we solve",
      body:
        "Month-end close eating 10–15 days. Board packs stitched together the night before. Cash visibility that's stale within a week. Forecasts that don't survive the first bad month.",
    },
    atAGlance: [
      "FP&A & CFO Advisory",
      "Budgeting & Forecasting",
      "Rolling Cash Flow Models",
      "Revenue/RevOps Forecasting",
      "Accelerated Month-End Close",
      "Scenario & Sensitivity Analysis",
      "Variance Analysis & Commentary",
      "Tiered Delivery (Excel → BI → Enterprise FP&A)",
    ],
    blocks: [
      {
        kind: "bullets",
        heading: "What you get",
        items: [
          { lead: "CFO-level strategic advisory", body: "a senior finance point of view on what the numbers mean, not just the numbers themselves: what the forecast implies for hiring, runway, pricing, and the next raise." },
          { lead: "Budgeting, forecasting & rolling models", body: "annual, medium-term, and long-term plans, plus dynamic re-forecasting and 13-week rolling cash flow." },
          { lead: "Revenue forecasting tied to RevOps", body: "pipeline-driven revenue models built on the same CAC, ROAS, and channel data your dashboards already track, so sales and finance forecast off one number, not two (see Digital Transformation's Analytics & Warehousing arm)." },
          { lead: "Accelerated month-end close & real-time visibility", body: "faster close cycles and management reporting that's current, not three weeks stale. (Day-to-day bookkeeping and close execution runs through Finance Team Extension; this is where it becomes forward-looking analysis.)" },
          { lead: "Scenario & sensitivity analysis", body: "best/base/worst-case modeling for the decisions that matter." },
          { lead: "Variance analysis with real commentary", body: "line-item packs that explain why, built for boards and lenders." },
          { lead: "A delivery model matched to your stage", body: "Excel-based FP&A live in 2–3 weeks for early-stage teams; Power BI/Tableau-driven planning for growth-stage; full enterprise FP&A for mature and PE-backed platforms (see Digital Transformation if you need the platform stood up first)." },
        ],
      },
    ],
    seeItInAction: {
      heading: "See it in action",
      paragraphs: [
        "After a transformative acquisition tripled its revenue in a year, a fast-scaling, NSE-listed VFX/media group needed consolidated, forecast-ready financials across 5 entities, 3 currencies, and 2 time zones — in time for statutory audit and a planned capital raise. We built the forecasting and scenario-modeling engine that got them there.",
      ],
    },
    closingLine:
      "Every deliverable answers the question a CFO actually asks — not \"what were our numbers,\" but \"what should we do next.\"",
  },
  {
    slug: "finance-team-extension",
    navLabel: "Finance Team Extension",
    title: "Finance Team Extension",
    titleTag: "Finance Staffing, Offshoring & Centers of Excellence for PE/VC | GAMCS",
    metaDescription:
      "Finance team extension: staffing, Employer of Record, offshoring, and CoE or GCC builds — embedded finance teams for PE/VC portfolios and advisory firms.",
    h1: "One Team, Every Portfolio Company, One View",
    intro:
      "Most PE and VC portfolios have reporting. Very few have strategic FP&A depth, or a consistent way to add finance capacity as they grow. Each portfolio company runs a different ERP, a different chart of accounts, and different KPI definitions — so comparing performance across the fund becomes a manual reconciliation exercise every quarter, and every headcount decision starts from scratch.",
    tagline: "Staffing, EoR, offshoring, CoE, and GCC builds.",
    problem: {
      label: "Our answer",
      body:
        "We extend your finance team however that's actually needed — staff augmentation, Employer of Record (EoR), full offshoring or outsourcing of a function, or a dedicated, standardized Center of Excellence / Global Capability Center (GCC) — embedded in your (or your portfolio companies') finance operations and standardized around one methodology, so your investment committee finally gets an apples-to-apples view across the fund.",
    },
    atAGlance: [
      "Staffing & Staff Augmentation",
      "Employer of Record (EoR)",
      "Offshoring & Outsourcing",
      "Centers of Excellence (CoE)",
      "GCC Builds",
      "Accounting, Bookkeeping & Close",
      "Multi-Entity, Multi-GAAP Delivery",
      "Standardized Portfolio-Wide KPI Framework",
    ],
    blocks: [
      {
        kind: "bullets",
        heading: "What Finance Team Extension looks like",
        items: [
          { lead: "Staffing & staff augmentation", body: "dedicated finance and analytics professionals who plug directly into your existing team and reporting lines, scaled up or down as the engagement needs." },
          { lead: "Employer of Record (EoR)", body: "hire the person you want, wherever they are, without standing up a local entity yourself." },
          { lead: "Offshoring & outsourcing of functions", body: "hand off an entire function (accounting, bookkeeping, close, reporting) to a dedicated offshore team, not just individual seats." },
          { lead: "Centers of Excellence (CoE) & GCC builds", body: "a full, standardized finance, analytics, and automation capability center, run to one methodology across every entity or portfolio company it serves." },
        ],
      },
      {
        kind: "bullets",
        heading: "What our CoE / GCC teams run day to day",
        items: [
          { lead: "Accounting, bookkeeping & month-end close", body: "Global GAAP-compliant financials (Ind AS, US GAAP, IFRS), reconciliations, AP/AR support, and financial consolidation, so the FP&A work upstream has clean, current books to run on." },
          { lead: "FP&A & management reporting", body: "delivered in partnership with our FP&A & CFO Advisory pillar." },
          { lead: "Data warehousing & BI dashboards", body: "in partnership with Digital Transformation." },
          { lead: "RPA, workflow & AI-driven automation", body: "process automation across the finance stack." },
        ],
      },
      {
        kind: "steps",
        heading: "How we build it",
        items: [
          { lead: "Assessment & Blueprint Design", body: "scope, operating model, and transition roadmap." },
          { lead: "Transition & Stabilization", body: "knowledge transfer, documentation, SLA setup." },
          { lead: "Scale & Optimize", body: "process automation and data-driven governance." },
          { lead: "Transform & Innovate", body: "predictive analytics and AI deployed to sharpen decisions." },
        ],
      },
      {
        kind: "stats",
        heading: "The numbers",
        items: [
          { value: "30–50%", label: "Cost optimization through offshoring" },
          { value: "90%", label: "Reduction in turnaround time for critical reports" },
          { value: "100%", label: "Accuracy in financial and compliance reporting" },
          { value: "10,000+", label: "Hours saved annually through automation" },
        ],
      },
      {
        kind: "prose",
        heading: "Beyond corporates and portfolios — our delivery partners",
        body:
          "We also run this exact model for other advisory firms. We're the embedded finance and analytics team behind Three Sixty Finance (UK) and Akshar Business Consulting (UK) — delivering their client work from behind the scenes, so they get delivery capacity without adding onshore headcount. If you're an advisory firm evaluating a similar arrangement, this is precisely the model we run.",
      },
    ],
    closingLine:
      "Whatever shape the team needs to take — a single augmented seat or a full standardized CoE — it's one consistent view across every company in your portfolio, and a finance cost structure that scales with the portfolio, not with headcount.",
  },
  {
    slug: "digital-transformation",
    navLabel: "Digital Transformation",
    title: "Digital Transformation",
    titleTag: "Digital Transformation for Finance | ERP, CRM, FP&A Tools & Analytics | GAMCS",
    metaDescription:
      "Digital transformation for finance: ERP, CRM, and FP&A platform implementation, in-house Finsensor AI software, data warehousing, and real-time BI dashboards.",
    h1: "Two Arms, One Pillar: The Tools You Run On, and the Insight You Get Out of Them",
    intro:
      "Buying enterprise software solves nothing on its own, and a dashboard is only as good as the data feeding it. Digital Transformation covers both halves of that problem: Tools — implementing the ERP, CRM, and FP&A platforms your business actually runs on — and Analytics & Warehousing — turning the data those platforms produce into real-time dashboards and decision intelligence. We're platform-agnostic on the third-party side, and we also build our own, in-house, through our Finsensor AI software.",
    tagline: "Tools plus real-time analytics, implemented and built in-house.",
    atAGlance: [
      "ERP Implementation",
      "CRM Implementation",
      "FP&A Platform Implementation",
      "In-House Software (Finsensor AI)",
      "Custom Software Development",
      "Data Warehousing & Cloud Infrastructure",
      "Real-Time Dashboards",
      "RevOps & Revenue Analytics",
      "Predictive & AI-Assisted Analytics",
    ],
    blocks: [
      {
        kind: "arms",
        items: [
          {
            id: "tools",
            badge: "Arm 1 — Tools",
            intro:
              "Third-party platforms, implemented by people who actually use them — not just sell them. Half the value of an ERP, CRM, or FP&A platform gets lost in a bad implementation — a chart of accounts that doesn't match how you actually run the business, a CRM nobody trained the sales team to use, or a forecasting tool configured for data entry instead of real planning. We're platform-agnostic on purpose: we implement whatever's right for your business, not the tool we happen to have a reseller relationship with.",
            bullets: [
              { lead: "ERP Implementation & Optimization", body: "Oracle NetSuite, Oracle Fusion, Odoo, Zoho, SAP, QuickBooks, and others, configured around your actual chart of accounts and reporting needs." },
              { lead: "CRM Implementation", body: "primarily Salesforce, configured so your revenue and pipeline data actually connects to your financial reporting — the foundation for RevOps and revenue analytics, not just a system of record for sales." },
              { lead: "FP&A Platform Implementation", body: "Anaplan, Aimplan, Jedox, Prophix, Pigment, Vena, Unit4, PivotXL, and beyond. If your team already has a preferred platform, we work in it." },
              { lead: "Our own in-house software — Finsensor AI", body: "where a third-party platform doesn't fit, we bring our own purpose-built finance software, developed in-house rather than licensed off the shelf." },
              { lead: "Custom Software Development", body: "when no off-the-shelf tool fits the gap, we build bespoke tools instead of forcing a workaround." },
              { lead: "Post-Go-Live Support", body: "we don't disappear after go-live; ongoing optimization and troubleshooting as your usage — and your business — matures." },
            ],
            callout:
              "Platform-agnostic, on purpose. We don't have a reseller margin riding on which system you choose — our incentive is that it works for you, not that you buy a specific license.",
          },
          {
            id: "analytics",
            badge: "Arm 2 — Analytics & Warehousing",
            intro:
              "Real-time dashboards that replace the manual board deck. Financial statements are backward-looking by definition. By the time a problem shows up in the P&L, the window to act on it has already closed. This is where that gap closes.",
            bullets: [
              { lead: "Data Warehousing & Cloud Infrastructure", body: "Azure, AWS, and Google Cloud/Microsoft Fabric foundations, so the analytics layer on top has clean, reliable data to work from." },
              { lead: "Real-time interactive dashboards", body: "Power BI and Tableau, connected directly to your ERP, CRM, and HR systems, refreshing automatically." },
              { lead: "RevOps & revenue analytics", body: "CAC, ROAS, pipeline velocity, and channel-level revenue attribution that give sales, marketing, and finance one shared view of revenue performance." },
              { lead: "Operational analytics tied to the P&L", body: "project/customer profitability, utilization and cohort analysis, retention and LTV." },
              { lead: "Stakeholder & board reporting", body: "board decks, investor updates, and lender/covenant tracking generated automatically instead of assembled by hand every cycle." },
              { lead: "KPI tracking & benchmarking", body: "balanced scorecards, OKRs, and industry benchmarking." },
              { lead: "AI built in, not bolted on", body: "anomaly detection, predictive cash-stress modeling (4–8 week liquidity forecasts), and automated commentary baked into every dashboard from day one, cutting manual analysis time by roughly 70%." },
            ],
          },
        ],
      },
    ],
    seeItInAction: {
      heading: "See it in action",
      paragraphs: [
        "For a fast-scaling, NSE-listed VFX/media group, we built a full Azure SQL data warehouse and Power BI reporting layer — with Power Automate handling refreshes and alerts and Azure Active Directory enforcing role-level security — from scratch, live in 16 weeks across 5 entities and 3 currencies.",
        "Our multi-channel sales command center for Two Brothers Organic Farms tracks nine sales channels — from D2C and quick commerce to international marketplaces — in one real-time view, replacing manual monthly reconciliation across every channel.",
      ],
    },
    closingLine:
      "The best system is the one your team actually uses correctly, every month — and the best dashboard is the one that tells you about a problem while there's still a window to act on it.",
  },
  {
    slug: "deal-advisory",
    navLabel: "Deal Advisory",
    title: "Deal Advisory",
    titleTag: "Deal Advisory | M&A, IPO Advisory, Due Diligence & Debt Refinancing | GAMCS",
    metaDescription:
      "Deal advisory for CFOs, PE, and VC-backed companies — M&A, buy-side and sell-side due diligence, IPO readiness, debt refinancing, and investor/pitch decks.",
    h1: "Deal-Ready Finance\u00a0— Before the Term Sheet, Not After",
    intro:
      "The worst time to discover a gap in your financials is during due diligence, when a buyer, investor, or lead underwriter is already asking the hard questions. Most companies find out their numbers aren't deal-ready exactly when it matters most — mid-transaction, under time pressure, with leverage already shifting away from them.",
    tagline: "M&A, IPO readiness, due diligence, and debt refinancing.",
    atAGlance: [
      "M&A Advisory",
      "Financial Due Diligence",
      "Quality of Earnings & Quality of Assets",
      "Fundraise & Exit Readiness",
      "Investor & Pitch Deck Preparation",
      "Debt Refinancing Advisory",
      "IPO Advisory",
    ],
    blocks: [
      {
        kind: "bullets",
        heading: "What you get",
        items: [
          { lead: "M&A Advisory", body: "buy-side and sell-side support through diligence, negotiation, and close, from a team that's actually built the models, not just reviewed them." },
          { lead: "Due Diligence & DD Support", body: "financial due diligence, quality of earnings (QoE) and quality of assets (QoA) analysis, risk assessment, and legal/compliance reviews." },
          { lead: "Fundraise & Exit Readiness", body: "getting your financial house in order before you're in a data room: clean historicals, defensible forecasts, and a management pack that survives real scrutiny." },
          { lead: "Investor & Pitch Deck Preparation", body: "the actual decks — fundraise pitch decks, investor updates, and board presentation materials — built on numbers your own diligence-ready models can defend." },
          { lead: "Debt Refinancing Advisory", body: "preparing the financial package and providing negotiation support for a refinancing, so lenders see the same clean, defensible numbers a PE buyer or IPO underwriter would." },
          { lead: "IPO Advisory", body: "readiness assessments and reporting infrastructure built to the standard public-market investors and regulators expect." },
        ],
      },
    ],
    seeItInAction: {
      heading: "See it in action",
      paragraphs: [
        "We've helped a client secure a $525M PE acquisition deal — hands-on support through the numbers that mattered most in the room. And for a fast-scaling, NSE-listed VFX/media group, our platform enabled a ₹85 Cr QIP by cutting five-year financial data retrieval for merchant banker requests from weeks to hours.",
      ],
    },
    closingLine:
      "Due diligence doesn't wait for you to be ready. We make sure you already are — the numbers and the story.",
  },
  {
    slug: "training-enablement",
    navLabel: "Training & Enablement",
    title: "Training & Enablement",
    titleTag: "Finance Training & Corporate Enablement | FP&A, Tableau & More | GAMCS",
    metaDescription:
      "Training and enablement: corporate FP&A, modelling, Tableau, ESG, and analytics training, public MasterClasses via Thinking Bridge, and an FPI affiliation.",
    h1: "Build the Capability In-House, Not Just the Deliverable",
    intro:
      "Not every engagement should end with a dependency on us. Sometimes the highest-value thing we can do is train your existing finance team to run the models, dashboards, and frameworks themselves — and beyond client engagements, we teach this publicly too.",
    tagline: "Corporate training, public MasterClasses, and an FPI affiliation.",
    atAGlance: [
      "Corporate Finance Training",
      "FP&A Training",
      "Financial Modelling Training",
      "Tableau & BI Training",
      "ESG Training",
      "Data Analytics for Finance Teams",
      "Public MasterClasses (Thinking Bridge)",
      "FPI Affiliation",
    ],
    blocks: [
      {
        kind: "bullets",
        heading: "Corporate training & enablement",
        items: [
          { lead: "FP&A Training", body: "practical, hands-on training in budgeting, forecasting, and variance analysis frameworks your team can run independently." },
          { lead: "Financial Modelling Training", body: "building bespoke, audit-ready models from scratch, not just filling in templates." },
          { lead: "ESG Training", body: "reporting frameworks and metrics for teams building out ESG capability for the first time." },
          { lead: "Tool-Based Finance Training", body: "hands-on enablement in whichever platform you're actually running (often paired with a Digital Transformation engagement)." },
          { lead: "Data Analytics for Finance Professionals", body: "SQL and Python fundamentals aimed specifically at finance teams, not generic data science courses." },
        ],
      },
      {
        kind: "prose",
        heading: "Beyond corporate engagements — our public courses",
        body:
          "Our founders teach two public courses through Thinking Bridge: the FP&A Strategy MasterClass (taught by Abhinav Aggarwal and Gaurav Malik) and the Tableau MasterClass (taught by Abhinav Aggarwal). We're also associated with the FP&A Professional Institute (FPI), a Sharjah, UAE-based body serving 12,000+ FP&A professionals across 100+ countries.",
      },
    ],
    closingLine:
      "The best outcome of a GAMCS engagement is a finance team that needs us less over time — not more.",
  },
];

/**
 * The hub. `h1` and `subhead` are GAMCS_Web_View_1.html's (2026-09-15), and
 * `linkLabel` is its per-pillar CTA. The file has no hub blurbs or search
 * text, so `blurb`, `titleTag` and `metaDescription` are the site's own,
 * reworded for the five pillars.
 */
export const solutionsHub = {
  titleTag: "Solutions | FP&A, Team Extension, Digital Transformation & Deal Advisory | GAMCS",
  metaDescription:
    "Explore GAMCS's five solution pillars: FP&A & CFO Advisory, Finance Team Extension, Digital Transformation, Deal Advisory, and Training & Enablement.",
  h1: "Solutions Built for Every Stage of the Finance Maturity Curve",
  /* Same sentence, split so the trailing phrase can carry the accent tint.
     Kept alongside `h1` because the metadata title still wants it whole. */
  h1Lead: "Solutions Built for Every Stage of the",
  h1Accent: "Finance Maturity Curve",
  subhead:
    "From your first forecast to a fully embedded offshore team to getting deal-ready for a raise, refinancing, or exit — start where you are, and scale as you grow.",
  previews: [
    { slug: "fpa-cfo-advisory", blurb: "CFO-level advisory, budgeting, forecasting, rolling cash flow models, accelerated close, and revenue forecasts tied to your RevOps data — a forward-looking view instead of a rear-view mirror.", linkLabel: "Explore FP&A & CFO Advisory" },
    { slug: "finance-team-extension", blurb: "Staff augmentation, Employer of Record, offshored functions, or a full CoE or GCC — accounting, bookkeeping, and reporting capacity for single companies, PE/VC portfolios, and advisory firms.", linkLabel: "Explore Finance Team Extension" },
    { slug: "digital-transformation", blurb: "ERP, CRM, and FP&A platforms implemented agnostically or built in-house with Finsensor AI — plus the data warehousing and real-time dashboards that flag problems before they hit the P&L.", linkLabel: "Explore Digital Transformation" },
    { slug: "deal-advisory", blurb: "M&A advisory, IPO readiness, due diligence, debt refinancing, and investor/pitch deck preparation — so your numbers hold up under real scrutiny.", linkLabel: "Explore Deal Advisory" },
    { slug: "training-enablement", blurb: "FP&A, financial modelling, Tableau, ESG, and data analytics training that builds lasting capability inside your own finance team — plus public MasterClasses through Thinking Bridge.", linkLabel: "Explore Training & Enablement" },
  ],
} as const;

/** Preview copy keyed by slug, built once.
 *
 *  Typed `Map<string, …>` deliberately: `solutionsHub` is `as const`, so an
 *  INFERRED map takes the literal slug union as its key and rejects
 *  `Solution.slug`, which is a plain `string`. That exact mismatch failed a
 *  production build — see PillarBlocks. Keeping one shared map means the
 *  annotation cannot be forgotten at a new call site. */
export const previewBySlug = new Map<string, (typeof solutionsHub.previews)[number]>(
  solutionsHub.previews.map((p) => [p.slug, p])
);

/**
 * Doc page 1, section 3 — homepage.
 *
 * Unlike the rest of this file, the maturity-curve copy is NOT transcribed
 * from gamcs.in: the live site's four-stage band was replaced by this
 * five-stage interactive curve, and the stage questions, quotes, capability
 * tags were supplied in the reference build. Treat it as
 * authored marketing copy, not a mirror of the live site.
 *
 * `metrics` on stages 03–05 and every figure inside `tiles` / `ladder` /
 * `signals` are ILLUSTRATIVE — the section labels them as such wherever they
 * render. They are not client figures and must not be presented as any.
 *
 * `visual` discriminates which figure the detail panel draws, and the extra
 * keys each variant carries (`tiles`, `ladder`, `signals` + `outputs`) are
 * narrowed off it — so a stage cannot carry a ladder and claim to be a
 * dashboard without TypeScript noticing.
 */
export const maturityCurve = {
  eyebrow: "The Finance Intelligence Maturity Curve",
  heading: "Where is your finance",
  headingAccent: "function today?",
  lead:
    "Every finance function sits somewhere on this curve. The question isn't how much more data you need — it's how quickly you can turn the data you already have into decisions.",
  hint: "Click the stage that sounds most like you",
  /** Repeated under every panel that shows a number. */
  illustrative: "Illustrative example — not a real client figure.",
  /** Under the panel: the curve is a model, not a diagnosis. */
  caveat:
    "Illustrative framework. Maturity can vary across functions, business units and organizations.",
  /** The two ends of the rising rail above the tabs. */
  axis: { start: "Reporting", end: "Decisioning" },
  /** Under the stage navigation: the five are one company, not five. */
  narrative: "One company, five levels of maturity.",
  /** Over the bridge to the next stage, which used to repeat the stage name. */
  nextHeading: "The next move",
  /** The section's one call to action, below the panel. */
  close: {
    heading: "Ready to move up the curve?",
    body:
      "We help finance functions move from reporting and consolidation to connected data, forward-looking insight and continuous decision support.",
    link: "See how GAMCS helps",
    /** The next section on the homepage. */
    href: "#how-we-help",
  },
  /** Column heads and row labels the visuals need, once for all five stages. */
  labels: {
    /** Over the right column, which carries only the worked example. */
    example: "What the CFO sees",
    actual: "Actual",
    budget: "Budget",
    variance: "Var.",
    /* Favourable and unfavourable, the management-pack convention. Colour says
       it too, but colour must not be the only thing that says it. */
    favourableShort: "F",
    unfavourableShort: "U",
    favourable: "favourable",
    unfavourable: "unfavourable",
    impact: "Impact",
    why: "Why",
    action: "Recommended",
    owner: "Owner",
    drillHint: "Click to drill down",
  },
  /**
   * Every stage carries the same three stats, in the same order, so the row
   * reads across the five as one scale. Stage figures are illustrative and the
   * panel says so wherever a number appears.
   */
  stages: [
    {
      n: "01",
      name: "Financial Reporting",
      short: "Reporting",
      question: "What happened?",
      quote:
        "I can tell you what happened last month — it just takes seven to ten days to produce.",
      tags: ["Excel", "ERP reports", "Month-end close", "Statutory reporting"],
      metrics: [
        { value: "7–10 days", label: "Typical turnaround" },
        { value: "Fragmented", label: "Data" },
        { value: "Low", label: "Decision support" },
      ],
      visual: "files",
      /** Three saves of the same month. `figure` marks the ones that disagree. */
      files: {
        cards: [
          { name: "P&L_v3_final.xlsx", figure: "EBITDA ₹4.2 Cr" },
          { name: "P&L_v4_FINAL_revised.xlsx", figure: "EBITDA ₹4.5 Cr" },
          { name: "P&L_v5_use_this.xlsx", figure: "EBITDA ₹4.3 Cr" },
        ],
        caption: "Multiple versions of the truth.",
      },
      next: "The move to Stage 02 is consolidation — one version of the numbers, produced once instead of rebuilt every month.",
    },
    {
      n: "02",
      name: "Management Information",
      short: "MIS",
      question: "How are we doing?",
      quote:
        "I finally have a monthly pack — but by the time it lands, the month is already over.",
      tags: ["MIS", "Monthly packs", "KPI reporting", "Variance analysis"],
      metrics: [
        { value: "5–7 days", label: "Typical turnaround" },
        { value: "Consolidated", label: "Data" },
        { value: "Limited", label: "Decision support" },
      ],
      visual: "pack",
      pack: {
        title: "Monthly Management Pack",
        /* Gross profit less operating expenses is EBITDA in both columns —
           7.1 − 2.9 = 4.2 actual, 7.0 − 2.4 = 4.6 budget. `good` is whether the
           variance is favourable, which is not the same as its sign: spending
           20.8% over budget is a plus sign and bad news. */
        rows: [
          { label: "Revenue", actual: "₹18.4 Cr", budget: "₹17.9 Cr", variance: "+2.8%", good: true },
          { label: "Gross profit", actual: "₹7.1 Cr", budget: "₹7.0 Cr", variance: "+1.4%", good: true },
          { label: "Operating expenses", actual: "₹2.9 Cr", budget: "₹2.4 Cr", variance: "+20.8%", good: false },
          { label: "EBITDA", actual: "₹4.2 Cr", budget: "₹4.6 Cr", variance: "−8.7%", good: false },
        ],
        /** `at` is the day the step lands on; the bar between 0 and the last is the lag. */
        timeline: [
          { label: "Month closes", at: "Day 0" },
          { label: "Pack prepared", at: "Day 6" },
          { label: "Management meeting", at: "Day 9" },
        ],
        caption: "The information arrives after the period it describes.",
      },
      next: "The move to Stage 03 is automation — the pack stops being assembled and starts being queried.",
    },
    {
      n: "03",
      name: "Business Intelligence",
      short: "BI",
      question: "Why did it happen?",
      quote: "I can see almost everything now. I still have to dig to find out why.",
      tags: ["Power BI", "Live dashboards", "Profitability analysis", "Drill-down analytics"],
      metrics: [
        { value: "1–2 days", label: "Typical turnaround" },
        { value: "Connected", label: "Data" },
        { value: "Moderate", label: "Decision support" },
      ],
      visual: "drill",
      drill: {
        tiles: [
          { label: "Revenue", value: "+8.2%", tone: "good" },
          { label: "Gross margin", value: "−280 bps", tone: "risk" },
        ],
        /** One click per level. `bars` is that level's breakdown, worst first. */
        path: [
          {
            crumb: "Gross margin",
            bars: [
              { label: "North", value: 86 },
              { label: "West", value: 47 },
              { label: "South", value: 32 },
            ],
          },
          {
            crumb: "Region: North",
            bars: [
              { label: "Segment B", value: 91 },
              { label: "Segment A", value: 38 },
              { label: "Segment C", value: 24 },
            ],
          },
          {
            crumb: "Product: Segment B",
            bars: [
              { label: "Freight", value: 88 },
              { label: "Input cost", value: 54 },
              { label: "Discounting", value: 29 },
            ],
          },
          {
            crumb: "Driver: Freight cost",
            /** Freight as a share of revenue, quarter by quarter. */
            bars: [
              { label: "Q3", value: 61, text: "6.1%" },
              { label: "Q4", value: 72, text: "6.6%" },
              { label: "Q1", value: 93, text: "7.2%", note: "+18%" },
            ],
          },
        ],
        finding:
          "Segment B margin fell because freight costs rose 18% — found after 4 manual drill-downs.",
        /** The one thing the driver chart is saying. */
        annotation: "+18% vs Q3",
      },
      next: "The move to Stage 04 is interpretation — the system explains the variance instead of you digging for it.",
    },
    {
      n: "04",
      name: "Decision Intelligence",
      /* The compact tab label below 1024px, where this tab leaves 65px for
         text at 360: "Decision intel." wrapped to two lines there, while
         "Continuous", the widest short label, is 55.8px and stays on one. */
      short: "Decision",
      question: "What happens next?",
      quote:
        "The system tells me what changed, why it changed, and what it’s likely to mean.",
      tags: ["Driver-based planning", "Forecasting", "Scenario analysis", "Anomaly detection"],
      metrics: [
        { value: "Hours", label: "Typical turnaround" },
        { value: "Integrated", label: "Data" },
        { value: "High", label: "Decision support" },
      ],
      visual: "explain",
      explain: {
        kpis: [
          { label: "Revenue", value: "+8.2%", tone: "good" },
          { label: "EBITDA", value: "−3.8%", tone: "risk" },
          { label: "Gross margin", value: "−280 bps", tone: "risk" },
        ],
        /** Three rows, ending on the forward-looking one, which is highlighted. */
        rows: [
          { q: "What happened?", a: "Revenue grew 8.2%, but EBITDA fell 3.8%." },
          {
            q: "Why?",
            a: "Pricing lifted revenue, but freight and input costs rose faster, and mix shifted toward lower-margin Segment B.",
          },
          {
            q: "What’s next?",
            a: "At current trends, gross margin falls a further 120 bps next quarter.",
          },
        ],
        /**
         * Gross margin, six quarters of actuals and two forecast. The numbers
         * are the ones the rows above quote: 38.4% falling 120 bps to 37.2%.
         * `band` is the forecast's confidence, in points, at its far end.
         */
        chart: {
          label: "Gross margin",
          legendActual: "Actual",
          legendForecast: "Forecast",
          forecastTag: "Forecast",
          /* One per point. The fiscal year is printed on the first quarter of
             each year and dropped on the rest where the column is narrow. */
          quarters: [
            "Q1 FY25",
            "Q2 FY25",
            "Q3 FY25",
            "Q4 FY25",
            "Q1 FY26",
            "Q2 FY26",
            "Q3 FY26",
            "Q4 FY26",
          ],
          actual: [41.6, 40.9, 40.4, 39.5, 39.1, 38.4],
          forecast: [37.8, 37.2],
          band: 0.9,
          lastActual: "38.4%",
          lastForecast: "37.2%",
          /** Direct labels, in place of a legend. */
          tagActual: "Actual",
          tagForecast: "Forecast",
          /** The one thing the chart is saying. */
          annotation: "−120 bps expected",
        },
      },
      next: "The move to Stage 05 is continuity — the answer arrives when the signal does, not when the cycle closes.",
    },
    {
      n: "05",
      name: "Continuous Decisioning",
      short: "Continuous",
      question: "What should we do now?",
      quote:
        "Finance stops reporting the business and starts sensing it — signals become recommendations, recommendations become actions.",
      tags: ["Real-time signals", "Automated commentary", "Alerts", "Accountability loops"],
      metrics: [
        { value: "Continuous", label: "Typical turnaround" },
        { value: "Real-time", label: "Data" },
        { value: "Prescriptive", label: "Decision support" },
      ],
      visual: "signals",
      board: {
        /** The loop, as a strip above the cards. */
        flow: ["Signal", "Interpretation", "Recommendation", "Owner", "Action"],
        /* `tone` maps onto the brand palette in the component — there is no
           red/amber/green semantic scale in this design system. */
        cards: [
          {
            tone: "risk",
            title: "Margin risk",
            impact: "₹1.2 Cr",
            why: "Freight + product mix",
            action: "Pricing review",
            owner: "Commercial",
            status: "Assigned",
          },
          {
            tone: "watch",
            title: "Cash pressure",
            impact: "₹75 L",
            why: "Receivables ageing",
            action: "Collections intervention",
            owner: "Finance",
            status: "In progress",
          },
          {
            tone: "good",
            title: "Revenue opportunity",
            impact: "₹1.5 Cr",
            why: "Under-penetrated customer segment",
            action: "Cross-sell campaign",
            owner: "Sales",
            status: "Assigned",
          },
        ],
      },
      next: "This is the end of the curve — the work here is holding the loop: keeping signals trusted and recommendations owned.",
    },
  ],
} as const;

/**
 * Client logo wall, in the band directly under the hero.
 *
 * These are real clients, unlike the platform trust bar this replaced — so the
 * "trusted by" framing is accurate here in a way it would not have been for
 * SAP or AWS.
 *
 * `file` points at a processed asset in /public/logos/clients. Each source file
 * was cropped to the mark alone, had its scraped background removed, and was
 * scaled so every logo carries roughly the same optical weight rather than the
 * same bounding box — a wide wordmark and a square emblem look equally sized
 * only if you normalise on ink area, not on width.
 *
 * `tile` marks a logo that keeps a solid brand panel behind it. Only GX Group
 * still does: its monogram is white and exists only against that orange.
 *
 * Basilic Fly, Two Brothers and Cumin Co. used to be panels too. Their artwork
 * was lifted off the tile by solving the blend for each pixel's coverage, then
 * anything that would have been invisible on white was repainted in the tile's
 * own colour — Two Brothers' cream type became its green, Basilic Fly's white
 * type became its navy. Artwork that already read on white kept its real
 * colour: Cumin Co.'s terracotta, and Basilic Fly's blue dragonfly.
 */
export const clients = {
  heading: "Trusted by growth-focused businesses across the world",
  logos: [
    { name: "WWF", file: "wwf.png" },
    { name: "Basilic Fly Studio", file: "basilic-fly.png" },
    { name: "SkyNet Worldwide Express", file: "skynet.png" },

    { name: "HungerRush", file: "hungerrush.png" },
    { name: "CoreStack", file: "corestack.png" },
    { name: "NewRocket", file: "newrocket.png" },
    { name: "GX Group", file: "gx-group.png", tile: true },
    { name: "ProcDNA", file: "procdna.png" },

    { name: "Edulog", file: "edulog.png" },
    { name: "Two Brothers India Farms", file: "two-brothers-new.png" },
    { name: "Jupiter Group", file: "jupiter-group.png" },

    { name: "Cumin Co.", file: "cumin-co.png" },
    { name: "Passionfruit", file: "passionfruit.png" },
    { name: "CBC Group", file: "cbc-group.png" },

    { name: "Caribbean CAGE", file: "caribbean-cage.png" },
    { name: "Rakhi Motion Pictures", file: "rakhi-motion-pictures.png" },

    { name: "The Park Hotels", file: "the-park-hotels.png" },
    { name: "BetterCloud", file: "bettercloud.png" },

    /* The advisory firms GAMCS delivers behind, last in the wall since 2026-09-22. */
    { name: "Akshar Business Consulting", file: "akshar.png" },
    { name: "Threesixty Finance", file: "threesixty.png" },
    { name: "CFO Bridge", file: "cfo-bridge.png" },
  ] as { name: string; file: string; tile?: boolean }[],
} as const;

/**
 * "The gap" — the race to the decision. Two lanes run side by side: the
 * typical path from data to a decision (six source systems into one manual
 * path through four stations) and the same distance with GAMCS (three feeds
 * through one hub, four stations on a straight line). Copy, chips, stations
 * and rail labels as written on the gap design artboards; it is not on
 * gamcs.in. `decisionLine`, `run` and `replay` are the three labels the race
 * needs that the panels did not: the finish line and the button's two states.
 */
export const dataToDecision = {
  eyebrow: "The gap",
  headingLead: "Your Numbers Aren't the Problem.",
  headingAccent: "The Distance to the Decision Is.",
  body:
    "Data lives in your ERP, your CRM, Excel, HRIS, and a handful of operational systems that don't talk to each other. It gets consolidated into a report. Management reads the report and asks “why?” Finance goes back and investigates manually — pulling the same data apart a second time, days after the decision actually needed to be made.",
  /** The dashed finish line both lanes run to. */
  decisionLine: "The decision",
  /** The button before the first run, and after it. */
  run: "Run the comparison",
  replay: "Replay",
  today: {
    title: "The typical reality",
    subtitle: "Disconnected data. Longer paths. Delayed decisions.",
    /** The systems the data is scattered across — six feeders into one path. */
    chips: [
      { label: "ERP" },
      { label: "CRM" },
      { label: "Excel" },
      { label: "HRIS" },
      { label: "Operations" },
      { label: "Other tools" },
    ],
    /** The stations along the path. The last one carries the lane's accent. */
    steps: [
      { label: "Reporting", caption: "What happened?" },
      { label: "Questions", caption: "Why did it happen?" },
      {
        label: "Manual investigation",
        caption: "Spreadsheets, multiple systems, email threads",
      },
      { label: "Decision delayed", caption: "Opportunities lost" },
    ],
    /** How long that path takes, on the lane's progress rail. */
    rail: "Days / weeks",
  },
  gamcs: {
    title: "A better way with GAMCS",
    subtitle: "Connected data. Clear insight. Faster decisions.",
    chips: [
      { label: "Data integration" },
      { label: "Automation" },
      { label: "AI & analytics" },
    ],
    /** The one place the three feeds meet, between the chips and the path. */
    hub: { name: "GAMCS", caption: "Finance · Data · Technology" },
    steps: [
      { label: "Data", caption: "Integrated and reliable" },
      { label: "Insight", caption: "What's happening and why" },
      { label: "Decision", caption: "What should we do?" },
      { label: "Action", caption: "Measurable impact" },
    ],
    rail: "Hours / days",
  },
  closeLead: "More reporting doesn't close that gap.",
  closeAccent: "A shorter distance between the number and the decision does.",
} as const;

/** Preloader. Copy lives here rather than in the component, like everything else. */
export const preloader = {
  /** Mirrored on both edges, in the reference's monospace treatment. */
  label: "LOADING",
  /** Static, announced once. The animation itself is aria-hidden. */
  srLabel: "Loading GA Management Consultants",
  /** Sits under the mark on the loading screen, tracked out. */
  wordmark: "Management Consultants",
} as const;

/**
 * A named opening. None exist yet, so `careers.roles` is empty; add an entry
 * and it renders in the same list, above the open-application tracks.
 */
export type CareerRole = {
  id: string;
  title: string;
  /** A `careers.tracks` id. */
  track: string;
  /** `careers.locations` ids. */
  locations: string[];
  summary: string;
};

/** /careers. Applications are mailed to `email` by app/api/careers/route.ts,
    which validates track and location against the ids declared here. */
export const careers = {
  email: "careers@gamcs.in",
  kicker: "CAREERS",
  h1: "Help finance teams decide faster.",
  h1Accent: "Build your career doing it.",
  intro:
    "GAMCS operates as part of a global FP&A consulting network, serving clients from early-stage startups through PE-backed enterprises. We hire people who want to own outcomes, not just deliverables.",
  applyLabel: "Apply now",
  meta: "Gurugram · Remote across India",
  locations: [
    { id: "ggn", label: "Gurugram" },
    { id: "remote", label: "Remote, India" },
  ],
  /** Extra answers the application form accepts beyond the ids above. */
  trackUnsure: { id: "unsure", label: "Not sure yet" },
  locationEither: { id: "either", label: "Either" },
  open: {
    eyebrow: "Open applications",
    heading: "Pick the track you want to grow in.",
    sub: "We don't have named openings right now. We do read every application, and we hire ahead of demand in all five practice areas.",
    areaLabel: "Practice area",
    locationLabel: "Location",
    all: "All",
    chip: "Open application",
    workOn: "You'd work on:",
    other: "Don't see your track?",
    otherLead: "Write to",
    /** `{shown}` of `{total}` after the filters. */
    showingTracks: "Showing {shown} of {total} tracks",
    showingOpenings: "Showing {shown} of {total} openings",
    apply: "Apply",
  },
  roles: [] as CareerRole[],
  /* Every track is open in both locations today, so the location filter
     relabels the cards and never empties the list. */
  tracks: [
    { id: "fpa", title: "FP&A & CFO Advisory", workOn: "Budgeting, forecasting, rolling cash flow models, accelerated close, and revenue forecasts tied to RevOps data." },
    { id: "fte", title: "Finance Team Extension", workOn: "Accounting, bookkeeping and reporting capacity for single companies, PE/VC portfolios and advisory firms." },
    { id: "dt", title: "Digital Transformation", workOn: "ERP, CRM and FP&A platforms, data warehousing and real-time dashboards." },
    { id: "deal", title: "Deal Advisory", workOn: "M&A advisory, IPO readiness, due diligence, debt refinancing and investor decks." },
    { id: "train", title: "Training & Enablement", workOn: "FP&A, financial modelling, Tableau, ESG and data analytics training." },
  ],
  why: {
    eyebrow: "Why GAMCS",
    heading: "Work that reaches the decision.",
    items: [
      { title: "Global clients, many industries", body: "SaaS, Hospitality, D2C / Consumer, VFX, Logistics, Professional Services, Non-Profits and Pharmaceuticals. You will not spend years on one ledger." },
      { title: "Mentorship from the founders", body: "You work directly with Gaurav Malik and Abhinav Aggarwal, not three layers below them." },
      { title: "Learning and certification support", body: "We back the courses and certifications that make you better at the work." },
      { title: "Hybrid and flexible working", body: "Based in Gurugram, with remote roles across India." },
    ],
  },
  /* The principles and the closing line are not copied here: the page reads
     the first four `whyUs.points` leads and `story.mission`. */
  work: {
    eyebrow: "How we work",
    headingLead: "Built differently.",
    headingAccent: "That includes the team.",
  },
  closing: {
    heading: "Not ready to apply?",
    links: [
      { label: "Meet the team", href: "/team" },
      { label: "See our work", href: "/case-study" },
    ],
  },
  form: {
    brand: "Careers",
    close: "Close",
    /** The overlay's step counter. */
    stepOf: "Step {n} of 3",
    done: "Done",
    almostDone: "Almost done",
    applyingTo: "Applying to",
    title: "Apply to GAMCS",
    steps: [
      { title: "About you", fields: "Full name, email, phone" },
      { title: "Track and CV", fields: "Track, location preference, link, CV" },
      { title: "Note and send", fields: "A short note, consent" },
    ],
    labels: {
      name: "Full name",
      email: "Email",
      phone: "Phone",
      track: "Track",
      location: "Location preference",
      url: "LinkedIn or portfolio URL",
      cv: "CV",
      note: "A short note",
    },
    trackPlaceholder: "Choose a track",
    urlPlaceholder: "https://",
    notePlaceholder: "What do you want to work on?",
    cvHint: "PDF or Word, up to 4 MB",
    dropLead: "Drag and drop or ",
    dropBrowse: "browse",
    remove: "remove",
    removeLabel: "Remove the attached CV",
    consent: "I agree to GAMCS storing my details to assess this application.",
    consentNote: ["See our ", { text: "Privacy Policy", href: "/privacy-policy", external: true }, "."] as Part[],
    back: "Back",
    continue: "Continue",
    sending: "Sending…",
    submit: "Send application",
    helper: "Applications go to careers@gamcs.in.",
    errors: {
      name: "Enter your full name",
      email: "Enter a valid email address",
      track: "Choose a track",
      url: "Enter a full link, starting with https://",
      cv: "Attach your CV to continue",
      cvType: "Your CV needs to be a PDF or Word file",
      cvSize: "Your CV needs to be 4 MB or smaller",
      consent: "Tick the box so we can review your application",
      /* Checked on the server only (app/api/careers/route.ts). */
      phone: "Enter a phone number using digits only",
      location: "Choose a location preference",
      note: "Keep the note under 2,000 characters",
      rateLimited: "Too many applications from this connection. Please try again later.",
      generic: "Check this field",
    },
    /* Shown when the mail route is not configured yet and the form hands the
       application to the applicant's own mail app instead. */
    mailto: {
      heading: "One more step: attach your CV.",
      body: "We've opened your email app with your details filled in, addressed to careers@gamcs.in. Attach your CV there and press send — a browser can't attach it for you.",
      retry: "Nothing opened? Write to",
    },
    sendError: "We couldn't send your application. Please try again, or write to",
    success: {
      heading: "Application received.",
      body: "Thanks — we read every application and reply to everyone we can take further.",
      back: "Back to careers",
    },
  },
};
