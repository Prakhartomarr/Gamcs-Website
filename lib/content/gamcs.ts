/**
 * SINGLE SOURCE OF TRUTH for site copy.
 *
 * Every string here is transcribed verbatim from https://www.gamcs.in/ .
 * Nothing in this file is invented, reworded or rounded. If a figure needs to
 * change, change it on the live site first, then mirror it here — components
 * must not hardcode copy.
 */

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
   * TODO(business): gamcs.in publishes no phone number or postal address.
   * Fill these in and the contact page, the directions map and the
   * Organization JSON-LD all start rendering them automatically. Leaving
   * them null is deliberate — an invented address is worse than none.
   */
  phone: null as string | null,
  address: null as {
    street: string;
    locality: string;
    region: string;
    postalCode: string;
    country: string; // ISO 3166-1 alpha-2
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
  line1: "From Reporting to Real-Time",
  line2: "Decision Intelligence",
  subhead:
    "GA Management Consultants embeds forward-looking FP&A, live BI dashboards, and scalable offshore finance teams into growth companies and investment portfolios \u2014 so every number you see is ready before you need to ask for it.",
} as const;

export const intro =
  "With more than combined 100+ years of industry experience, GA Management Consultants is a consultancy firm committed to creating impact & value for clients and communities.";


/** Company story, transcribed from https://www.gamcs.in/who-we-are */
export const story = {
  lead:
    "GAMCS is a high-impact management consulting firm that partners with growth-focused businesses to modernize and scale their finance functions.",
  network:
    "The firm operates as part of a global FP&A consulting network, serving startups through enterprises.",
  mission:
    "Our mission: shift finance from a reporting function to a strategic engine\u2014built on data, technology, and insight.",
} as const;

export const nav = [
  { label: "Who We Are", href: "/#who-we-are" },
  { label: "How We Help", href: "/#how-we-help" },
  { label: "Solutions", href: "/#solutions" },
  { label: "Case Study", href: "/case-study" },
  { label: "Team", href: "/team" },
  { label: "Contact Us", href: "/contact" },
] as const;

export const primaryCta = { label: "Schedule a Call", href: "/contact" } as const;

/** "Why Us" section */
export const whyUs = {
  points: [
    "Expert solutions, Cost-efficient results",
    "Tailored Solutions for Your Unique Needs",
    "End-to-End Integration of Finance, Human Resource, Analytics & Technology",
    "Proven Track Record Across Diverse Clients",
    "Full-Cycle Support, From Planning to Execution",
    "Real-Time Operational Insights",
  ],
} as const;

export const services = {
  intro: "We offer a variety of services tailored to client needs.",
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
  /**
   * Names and titles are verbatim from the live site, which groups them as
   * Leadership and Advisory. The site shows photographs but publishes no
   * biographies, so none are invented here \u2014 add `photo` and `bio` when the
   * real assets and copy are supplied.
   */
  leadership: [
    // Founder first, then Co-Founder. gamcs.in currently labels both
    // "Co-Founder"; corrected here on the client's instruction.
    { name: "Gaurav Malik", title: "Founder | FP&A & Due Diligence Specialist", linkedin: true, photo: "/team/gaurav-malik.jpg", email: "gaurav.malik@gamcs.in" },
    { name: "Abhinav Aggarwal", title: "Co-Founder | FP&A, BI & Transformation Specialist", linkedin: true, photo: "/team/abhinav-aggarwal.jpg", email: "abhinav.aggarwal@gamcs.in" },
  ],
  advisory: [
    { name: "Sanjay Rikhy", title: "Strategic Advisor | Former CFO | ESG & Performance Transformation" },
    { name: "Amit Garg", title: "Audit & IPO Advisor" },
    { name: "Saurabh Aggarwal", title: "Audit & Compliance Specialist" },
    { name: "Dhawal Parvatikar", title: "Strategic Finance & CFO Advisory" },
    { name: "Asif Masani", title: "FP&A Automation & BI Specialist" },
    { name: "Prashant Sharma", title: "Risk & Regulatory Advisor" },
    { name: "Sumit Chatterjee", title: "Shared Services Operations" },
  ],
  get members() {
    return [...this.leadership, ...this.advisory];
  },
} as const;

export const testimonials = {
  heading: "What our clients say about us",
  items: [
    {
      name: "Amol Khedkar",
      title: "Deputy Manager",
      company: "TBOF, India",
      quote:
        "We had the pleasure of working with GA Managements and their expertise was instrumental in delivering actionable insights for us. Their meticulous approach to their work has consistently exceeded our expectations. The strategic approach and attention to detail made a significant impact in our day to day working. We highly recommend their services for anyone seeking top-tier FP&A consultancy.",
    },
    {
      name: "Arta Ramiraj",
      title: "Co-Founder",
      company: "Three Sixty Finance, UK",
      quote:
        "I have had the pleasure of working with GA Management Consultants on several projects, and they have been fantastic every time. They are so quick and have great attention to detail. I know I can rely on them, no matter how complex or time-sensitive the task is. They have been a huge support to me, and I wouldn't hesitate to recommend them to anyone else!",
    },
  ],
} as const;

/** The only two clients named anywhere on the live site (both via testimonials). */
export const namedClients = [
  { name: "TBOF", region: "India" },
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
} as const;

export const footer = {
  links: [
    { label: "Who we are", href: "/#who-we-are" },
    { label: "How we help", href: "/#how-we-help" },
    { label: "Case Study", href: "/case-study" },
    { label: "Founders & advisors", href: "/team" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact Us", href: "/contact" },
  ],
  /** The three service groups, anchored to their cards on the homepage. */
  solutions: [
    { label: "Business Solutions", href: "/#business-solutions" },
    { label: "Technology Solutions", href: "/#technology-solutions" },
    { label: "Training Programs", href: "/#training-programs" },
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
 * Frequently asked questions, transcribed verbatim from the approved copy
 * document (Page 11). These replace the earlier set, which was assembled from
 * the service arrays; the doc is now the source of truth for this copy.
 */
export const faq = {
  heading: "Frequently Asked Questions",
  kicker: "FAQ",
  cta: "Still have questions?",
  items: [
    {
      q: "What is FP&A advisory, and how is it different from accounting or bookkeeping?",
      a: "FP&A is forward-looking: budgeting, forecasting, scenario modeling, and variance analysis that guide decisions. Accounting and bookkeeping — which we deliver through our Offshoring & Centers of Excellence teams — are backward-looking: recording what already happened and staying compliant. Both matter; they're just different disciplines.",
    },
    {
      q: "How quickly can GAMCS stand up FP&A for a growing company?",
      a: "Our Excel-based FP&A model — standardized financial models, 13-week rolling cash flow, and variance frameworks — typically goes live in 2–3 weeks with minimal dependency on your existing tech stack, and scales into BI dashboards or enterprise FP&A tools as you grow.",
    },
    {
      q: "What BI, analytics, and RevOps tools does GAMCS use?",
      a: "Primarily Power BI and Tableau, connected directly to your ERP, CRM, and HR systems for automated, real-time refresh — including RevOps analytics like CAC, ROAS, and pipeline velocity. Underlying infrastructure runs on Azure, AWS, and Google Cloud/Microsoft Fabric, with Python and SQL powering advanced analytics and applied AI for commentary and anomaly detection.",
    },
    {
      q: "How does finance offshoring work for a PE or VC portfolio?",
      a: "We build a dedicated, standardized Finance & Analytics Center of Excellence that embeds offshore teams into each portfolio company, using one consistent KPI framework and chart-of-accounts methodology across the fund — replacing fragmented, company-by-company reporting with one comparable view.",
    },
    {
      q: "Do you provide due diligence support for M&A, fundraising, or refinancing?",
      a: "Yes. We provide financial due diligence, quality of earnings and quality of assets analysis, fundraise/exit-readiness support, and debt refinancing advisory for both buy-side and sell-side transactions — including hands-on support that helped a client secure a $525M PE acquisition.",
    },
    {
      q: "Do you help prepare investor decks or board presentations?",
      a: "Yes. We build investor updates, fundraise pitch decks, and board presentation materials directly — grounded in the same diligence-ready models and real-time dashboards we build for ongoing FP&A and BI work, not assembled separately by a design team with no visibility into your numbers.",
    },
    {
      q: "Are you tied to specific software vendors?",
      a: "No — we're platform-agnostic by design. We implement ERP systems (NetSuite, SAP, QuickBooks), CRM platforms (Salesforce and others), and FP&A tools (Aimplan, Vena, Anaplan, Unit4, PivotXL, among others) based on what fits your business, not a reseller relationship or a fixed shortlist.",
    },
    {
      q: "How does GAMCS ensure accuracy and compliance across GAAP standards?",
      a: "Our accounting and reporting work is built to Ind AS, US GAAP, and IFRS standards, supported by proprietary tools including our Consolidation Tool, SIII Reporting Tool (IGAAP & Ind AS), and IFRS 16 / Ind AS 116 lease calculation accelerators. Clients report 100% accuracy in financial records and compliance reporting.",
    },
    {
      q: "Do you only work with direct clients, or also with other advisory firms?",
      a: "Both. Beyond direct corporate and PE/VC clients, we operate as the embedded finance and analytics delivery team behind other advisory firms — including Three Sixty Finance (UK) and Akshar Business Consulting (UK) — who need delivery capacity without adding onshore headcount.",
    },
    {
      q: "Who is GA Management Consultants built for?",
      a: "CFOs and CXOs at growth-stage and mid-market companies, private equity or venture capital investment teams needing standardized visibility across a portfolio, and advisory firms needing embedded delivery capacity.",
    },
  ] satisfies FaqItem[],
};
