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
  /* Doc page 1 H1, broken across three lines for the hero's rhythm. The words
     are unchanged: "From Reporting to Real-Time Decision Intelligence". */
  line1: "From Reporting",
  line2: "to Real-Time",
  line3: "Decision Intelligence",
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
/**
 * "How We Help" — doc page 1, section 4 (v3).
 *
 * Seven points, each a lead and a body. The earlier six were one-line labels
 * transcribed from the live site; the doc's version carries the explanation
 * too, which is what the carousel cards need.
 */
export const whyUs = {
  heading: "Expert Solutions, Cost-Efficient Results",
  /* Same sentence, split so one phrase can take the accent tint and its drawn
     underline. `heading` stays whole for the carousel's aria-label. */
  headingLead: "Expert Solutions,",
  headingAccent: "Cost-Efficient",
  headingTail: "Results.",
  points: [
    { lead: "Tailored to Your Business", body: "Client-centric customization and industry-specific expertise, not off-the-shelf templates." },
    { lead: "One Integrated Team", body: "Finance, revenue, and technology under one roof instead of three vendors who don't talk to each other." },
    { lead: "Platform-Agnostic by Design", body: "We implement the right ERP, CRM, or FP&A tool for your business — not the one we're incentivized to sell." },
    { lead: "AI Built In, Not Bolted On", body: "Anomaly detection, predictive alerts, and automated commentary ship as standard in every dashboard and model we build — not an add-on module you buy later." },
    { lead: "Deal-Ready When It Counts", body: "Due diligence, fundraise, and refinancing support so your numbers hold up under real scrutiny, not just internal review." },
    { lead: "Proven Across Industries", body: "A track record spanning SaaS, D2C/consumer, hospitality, healthcare, pharma, non-profits, and professional services." },
    { lead: "Cost Structure That Scales With You", body: "Offshore delivery models that flex from a single analyst to a full Center of Excellence." },
  ],
} as const;

export const services = {
  intro: "We offer a variety of services tailored to client needs.",
  /* Same sentence, split so one word can take the accent tint, as the
     reference does. `intro` stays whole for anywhere that needs the full line. */
  introLead: "We offer a variety of",
  introAccent: "services",
  introTail: "tailored to client needs.",
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
   * doc (page 10). `experience` and `location` are shown on the card, so no
   * real information sits behind a hover.
   *
   * Nobody has a biography — not the founders either — so there is no detail
   * page. Everything known about a person fits on their card. Add a `bio` and
   * a /team/[slug] route becomes worth building.
   *
   * Gaurav stays "Founder" rather than the doc's "Co-Founder & Partner":
   * that correction was an explicit client instruction in Phase 1.
   */
  leadership: [
    { name: "Gaurav Malik", title: "Founder | FP&A & Due Diligence Specialist", experience: "10+ years", location: "Delhi, India", linkedin: true, photo: "/team/gaurav-malik.jpg", email: "gaurav.malik@gamcs.in" },
    { name: "Abhinav Aggarwal", title: "Co-Founder | FP&A, BI & Transformation Specialist", experience: "10+ years", location: "Delhi, India", linkedin: true, photo: "/team/abhinav-aggarwal.jpg", email: "abhinav.aggarwal@gamcs.in" },
  ],
  advisory: [
    { name: "Sanjay Rikhy", title: "Strategic Advisor | Former CFO | ESG & Performance Transformation", experience: "25+ years" },
    { name: "Sumit Chatterjee", title: "Shared Services Operations", experience: "30+ years" },
    { name: "Dhawal Parvatikar", title: "Strategic Finance & CFO Advisory", experience: "15+ years", location: "Dubai, UAE" },
    { name: "Saurabh Aggarwal", title: "Reporting, Due Diligence, Audit & Compliance Specialist", experience: "20+ years" },
    { name: "Asif Masani", title: "BI & Analytics, FP&A Automation Specialist", experience: "15+ years", location: "Mumbai, India" },
    { name: "Amit Garg", title: "Audit & IPO Advisor" },
    { name: "Prashant Sharma", title: "Risk & Regulatory Advisor" },
  ],
  get members() {
    return [...this.leadership, ...this.advisory];
  },
};

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
    { label: "Solutions", href: "/solutions" },
    { label: "How we help", href: "/#how-we-help" },
    { label: "Case Study", href: "/case-study" },
    { label: "Founders & advisors", href: "/team" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact Us", href: "/contact" },
  ],
  /**
   * The six pillar pages. Left as a literal rather than derived from
   * `solutions[]` because that array is declared after `footer` in this file;
   * the route list is asserted against it in the build check.
   */
  solutions: [
    { label: "FP&A & Strategic Finance", href: "/solutions/fpa-strategic-finance" },
    { label: "BI & Decision Intelligence", href: "/solutions/bi-decision-intelligence" },
    { label: "Offshoring & Centers of Excellence", href: "/solutions/offshoring-centers-of-excellence" },
    { label: "Technology & Systems Implementation", href: "/solutions/technology-systems-implementation" },
    { label: "Transaction Advisory & Due Diligence", href: "/solutions/transaction-advisory-due-diligence" },
    { label: "Finance Capability Building", href: "/solutions/finance-capability-building" },
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
  /* Doc page 11 meta description. Feeds both the <meta> tag and the /faq
     intro line, so the two cannot drift apart. */
  intro:
    "Answers to common questions about GAMCS's FP&A, BI & analytics, offshoring, systems implementation, transaction advisory, and training services.",
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


/* ===================================================================
 * SOLUTIONS — hub + six pillar pages
 *
 * Copy is verbatim from GAMCS_Website_Copy_FINAL_3.docx, pages 2-8.
 * The six pages do not share one rigid shape (Offshoring carries a build
 * sequence and a numbers strip that the others do not), so each page is a
 * list of typed blocks rather than a fixed set of fields. ServicePageLayout
 * renders whatever blocks a page declares, in order.
 * =================================================================== */

export type SolutionBlock =
  | { kind: "bullets"; heading: string; items: { lead: string; body: string }[] }
  | { kind: "steps"; heading: string; items: { lead: string; body: string }[] }
  | { kind: "prose"; heading: string; body: string }
  | { kind: "callout"; body: string }
  | { kind: "stats"; heading: string; items: string[] };

export type Solution = {
  slug: string;
  /** Short form, for nav and footer. */
  navLabel: string;
  title: string;
  titleTag: string;
  metaDescription: string;
  h1: string;
  intro: string;
  /** Scannable sub-service list shown above the detail blocks. */
  atAGlance: string[];
  blocks: SolutionBlock[];
  seeItInAction?: { heading: string; paragraphs: string[] };
  closingLine: string;
};

export const solutions: Solution[] = [
  {
    slug: "fpa-strategic-finance",
    navLabel: "FP&A & Strategic Finance",
    title: "FP&A & Strategic Finance",
    titleTag: "FP&A Advisory Services for CFOs & CXOs | GAMCS",
    metaDescription:
      "Outsourced FP&A advisory — budgeting, forecasting, rolling cash flow models, revenue/RevOps forecasting, and board-ready reporting for growth-stage companies and PE portfolios.",
    h1: "FP&A That Moves at the Speed of Your Business — Not Your Month-End Close",
    intro:
      "If your finance team is still built for controllership and statutory reporting, you already have a strategic FP&A gap. Financial statements tell you what happened. FP&A tells you what to do about it.",
    atAGlance: [
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
        kind: "prose",
        heading: "The problem we solve",
        body: "Month-end close eating 10–15 days. Board packs stitched together the night before. Cash visibility that's stale within a week. Forecasts that don't survive the first bad month.",
      },
      {
        kind: "bullets",
        heading: "What you get",
        items: [
          { lead: "Budgeting, forecasting & rolling models", body: "annual, medium-term, and long-term plans, plus dynamic re-forecasting and 13-week rolling cash flow." },
          { lead: "Revenue forecasting tied to RevOps", body: "pipeline-driven revenue models built on the same CAC, ROAS, and channel data your BI dashboards already track, so sales and finance forecast off one number, not two." },
          { lead: "Accelerated month-end close & real-time visibility", body: "faster close cycles and management reporting that's current, not three weeks stale. Day-to-day bookkeeping and close execution runs through our Offshoring & CoE team; this is where it becomes forward-looking analysis." },
          { lead: "Scenario & sensitivity analysis", body: "best/base/worst-case modeling for the decisions that matter." },
          { lead: "Variance analysis with real commentary", body: "line-item packs that explain why, built for boards and lenders." },
          { lead: "A delivery model matched to your stage", body: "Excel-based FP&A live in 2–3 weeks for early-stage teams; Power BI/Tableau-driven planning for growth-stage; full enterprise FP&A for mature and PE-backed platforms." },
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
    slug: "bi-decision-intelligence",
    navLabel: "BI & Decision Intelligence",
    title: "BI & Decision Intelligence",
    titleTag: "BI, Analytics & RevOps Consulting for CFOs | GAMCS",
    metaDescription:
      "Real-time Power BI and Tableau dashboards, RevOps and revenue analytics, board reporting, and AI-assisted commentary — decision intelligence for finance and investment teams.",
    h1: "Real-Time Dashboards That Replace the Manual Board Deck",
    intro:
      "Financial statements are backward-looking by definition. By the time a problem shows up in the P&L, the window to act on it has already closed. BI & Decision Intelligence closes that gap.",
    atAGlance: [
      "Real-Time Dashboards",
      "RevOps & Revenue Analytics",
      "Operational & Profitability Analytics",
      "Board & Investor Reporting",
      "KPI Tracking & Benchmarking",
      "Predictive & AI-Assisted Analytics",
    ],
    blocks: [
      {
        kind: "bullets",
        heading: "What you get",
        items: [
          { lead: "Real-time interactive dashboards", body: "Power BI and Tableau, connected directly to your ERP, CRM, and HR systems, refreshing automatically." },
          { lead: "RevOps & revenue analytics", body: "CAC, ROAS, pipeline velocity, and channel-level revenue attribution that give sales, marketing, and finance one shared view of revenue performance instead of three disconnected spreadsheets." },
          { lead: "Operational analytics tied to the P&L", body: "project/customer profitability, utilization and cohort analysis, retention and LTV." },
          { lead: "Stakeholder & board reporting", body: "board decks, investor updates, and lender/covenant tracking generated automatically instead of assembled by hand every cycle." },
          { lead: "KPI tracking & benchmarking", body: "balanced scorecards, OKRs, and industry benchmarking." },
          { lead: "Practical AI", body: "anomaly detection, predictive cash-stress modeling (4–8 week liquidity forecasts), and automated commentary that cuts manual analysis time by roughly 70%." },
        ],
      },
      {
        kind: "callout",
        body: "The data warehouse, cloud infrastructure, and underlying CRM/ERP feeding these dashboards is scoped and built under Technology & Systems Implementation — the two pillars work together.",
      },
    ],
    seeItInAction: {
      heading: "See it in action",
      paragraphs: [
        "Our multi-channel sales command center for Two Brothers Organic Farms tracks nine sales channels — from D2C and quick commerce to international marketplaces — in one real-time view, replacing manual monthly reconciliation across every channel.",
        "For a listed VFX/media group post-acquisition, we went further — automated daily alerts across finance, HR, and IT (overdue vendor payments, receivables aging, attrition spikes, SLA breaches) turned dashboards into a system that flags problems before anyone has to go looking.",
      ],
    },
    closingLine:
      "You stop finding out about a problem in the monthly close — and start finding out about it in real time, while there's still a window to act.",
  },
  {
    slug: "offshoring-centers-of-excellence",
    navLabel: "Offshoring & Centers of Excellence",
    title: "Offshoring & Centers of Excellence",
    titleTag: "Finance Offshoring & Centers of Excellence for PE/VC | GAMCS",
    metaDescription:
      "Embedded offshore Finance & Analytics Centers of Excellence — accounting, bookkeeping, and reporting — for PE/VC portfolios and advisory firms. 30–50% cost optimization.",
    h1: "One Team, Every Portfolio Company, One View",
    intro:
      "Most PE and VC portfolios have reporting. Very few have strategic FP&A depth. Each portfolio company runs a different ERP, a different chart of accounts, and different KPI definitions — so comparing performance across the fund becomes a manual reconciliation exercise every quarter.",
    atAGlance: [
      "Accounting, Bookkeeping & Close",
      "FP&A & Management Reporting",
      "Data Warehousing & BI",
      "RPA & Workflow Automation",
      "Multi-Entity, Multi-GAAP Delivery",
      "Standardized Portfolio-Wide KPI Framework",
    ],
    blocks: [
      {
        kind: "prose",
        heading: "Our answer",
        body: "We build and run dedicated Finance, Analytics, and Automation Centers of Excellence — offshore teams embedded in your portfolio companies' finance operations, standardized around one methodology so your investment committee finally gets an apples-to-apples view across the fund.",
      },
      {
        kind: "bullets",
        heading: "What our CoE teams run day to day",
        items: [
          { lead: "Accounting, bookkeeping & month-end close", body: "Global GAAP-compliant financials (Ind AS, US GAAP, IFRS), reconciliations, AP/AR support, and financial consolidation, so the FP&A work upstream has clean, current books to run on." },
          { lead: "FP&A & management reporting", body: "delivered in partnership with our FP&A & Strategic Finance pillar." },
          { lead: "Data warehousing & BI dashboards", body: "in partnership with BI & Decision Intelligence." },
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
          "30–50% cost optimization through offshoring",
          "90% reduction in turnaround time for critical reports",
          "100% accuracy in financial and compliance reporting",
          "10,000+ hours saved annually through automation",
        ],
      },
      {
        kind: "prose",
        heading: "Beyond corporates and portfolios — our delivery partners",
        body: "We also run this exact model for other advisory firms. We're the embedded finance and analytics team behind Three Sixty Finance (UK) and Akshar Business Consulting (UK) — delivering their client work from behind the scenes, so they get delivery capacity without adding onshore headcount. If you're an advisory firm evaluating a similar arrangement, this is precisely the model we run.",
      },
    ],
    closingLine:
      "One standardized view across every company in your portfolio — and a finance cost structure that scales with the portfolio, not with headcount.",
  },
  {
    slug: "technology-systems-implementation",
    navLabel: "Technology & Systems Implementation",
    title: "Technology & Systems Implementation",
    titleTag: "Platform-Agnostic ERP, CRM & FP&A Implementation | GAMCS",
    metaDescription:
      "ERP, CRM, and FP&A platform implementation — NetSuite, Salesforce, Aimplan, Vena, Anaplan, Unit4, and more — configured by a team with no vendor allegiance.",
    h1: "The Right Platform, Implemented by People Who Actually Use It — Not Just Sell It",
    intro:
      "Buying enterprise software solves nothing on its own. Half the value of an ERP, CRM, or FP&A platform gets lost in a bad implementation — a chart of accounts that doesn't match how you actually run the business, a CRM nobody trained the sales team to use, or a forecasting tool configured for data entry instead of real planning. We're platform-agnostic on purpose: we implement whatever's right for your business, not the tool we happen to have a reseller relationship with.",
    atAGlance: [
      "ERP Implementation",
      "CRM Implementation",
      "FP&A Platform Implementation",
      "Custom Software Development",
      "Data Warehousing & Cloud Infrastructure",
      "Post-Go-Live Support",
    ],
    blocks: [
      {
        kind: "bullets",
        heading: "What you get",
        items: [
          { lead: "ERP Implementation & Optimization", body: "NetSuite, SAP, QuickBooks, and others, configured around your actual chart of accounts and reporting needs." },
          { lead: "CRM Implementation", body: "Salesforce and other CRM platforms, configured so your revenue and pipeline data actually connects to your financial reporting — the foundation for RevOps and revenue analytics, not just a system of record for sales." },
          { lead: "FP&A Platform Implementation", body: "Aimplan, Vena, Anaplan, Unit4, PivotXL, and beyond. If your team already has a preferred platform, we work in it — we're not wedded to a shortlist." },
          { lead: "Custom Software Development", body: "When no off-the-shelf tool fits the gap, we build bespoke tools (MERN stack and beyond) instead of forcing a workaround." },
          { lead: "Data Warehousing & Cloud Infrastructure", body: "Azure, AWS, and Google Cloud/Microsoft Fabric foundations, so the BI and analytics layer on top has clean, reliable data to work from." },
          { lead: "Post-Go-Live Support", body: "We don't disappear after go-live. Ongoing optimization and troubleshooting as your usage — and your business — matures." },
        ],
      },
      {
        kind: "callout",
        body: "Platform-agnostic, on purpose. We don't have a reseller margin riding on which system you choose — our incentive is that it works for you, not that you buy a specific license.",
      },
    ],
    seeItInAction: {
      heading: "See it in action",
      paragraphs: [
        "For a fast-scaling, NSE-listed VFX/media group, we built a full Azure SQL data warehouse and Power BI reporting layer — with Power Automate handling refreshes and alerts and Azure Active Directory enforcing role-level security — from scratch, live in 16 weeks across 5 entities and 3 currencies.",
      ],
    },
    closingLine:
      "The best system is the one your team actually uses correctly, every month, without a consultant standing over their shoulder.",
  },
  {
    slug: "transaction-advisory-due-diligence",
    navLabel: "Transaction Advisory & Due Diligence",
    title: "Transaction Advisory & Due Diligence",
    titleTag: "M&A, IPO Advisory, Due Diligence & Debt Refinancing | GAMCS",
    metaDescription:
      "Buy-side and sell-side due diligence, M&A advisory, IPO readiness, debt refinancing, and investor/pitch deck preparation for CFOs, PE, and VC-backed companies.",
    h1: "Deal-Ready Finance — Before the Term Sheet, Not After",
    intro:
      "The worst time to discover a gap in your financials is during due diligence, when a buyer, investor, or lead underwriter is already asking the hard questions. Most companies find out their numbers aren't deal-ready exactly when it matters most — mid-transaction, under time pressure, with leverage already shifting away from them.",
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
          { lead: "Investor & Pitch Deck Preparation", body: "the actual decks — fundraise pitch decks, investor updates, and board presentation materials — built on numbers your own diligence-ready models can defend, not just polished slides." },
          { lead: "Debt Refinancing Advisory", body: "preparing the financial package and providing negotiation support for a refinancing, so lenders see the same clean, defensible numbers a PE buyer or IPO underwriter would." },
          { lead: "IPO Advisory", body: "readiness assessments and reporting infrastructure built to the standard public-market investors and regulators expect." },
        ],
      },
    ],
    seeItInAction: {
      heading: "Proof points",
      paragraphs: [
        "We've helped a client secure a $525M PE acquisition deal — hands-on support through the numbers that mattered most in the room. And for a fast-scaling, NSE-listed VFX/media group, our platform enabled a ₹85 Cr QIP by cutting five-year financial data retrieval for merchant banker requests from weeks to hours.",
      ],
    },
    closingLine:
      "Due diligence doesn't wait for you to be ready. We make sure you already are — the numbers and the story.",
  },
  {
    slug: "finance-capability-building",
    navLabel: "Finance Capability Building",
    title: "Finance Capability Building",
    titleTag: "Finance Training Programs | FP&A, Modelling, ESG, Analytics | GAMCS",
    metaDescription:
      "FP&A, financial modelling, ESG, and data analytics training built specifically for finance teams — hands-on, practical, and tool-agnostic.",
    h1: "Build the Capability In-House, Not Just the Deliverable",
    intro:
      "Not every engagement should end with a dependency on us. Sometimes the highest-value thing we can do is train your existing finance team to run the models, dashboards, and frameworks themselves.",
    atAGlance: [
      "FP&A Training",
      "Financial Modelling Training",
      "ESG Training",
      "Tool-Based Finance Training",
      "Data Analytics for Finance Teams",
    ],
    blocks: [
      {
        kind: "bullets",
        heading: "What you get",
        items: [
          { lead: "FP&A Training", body: "practical, hands-on training in budgeting, forecasting, and variance analysis frameworks your team can run independently." },
          { lead: "Financial Modelling Training", body: "building bespoke, audit-ready models from scratch, not just filling in templates." },
          { lead: "ESG Training", body: "reporting frameworks and metrics for teams building out ESG capability for the first time." },
          { lead: "Tool-Based Finance Training", body: "hands-on enablement in whichever platform you're actually running (often paired with a Technology & Systems Implementation engagement, so your team is trained the moment a new system goes live)." },
          { lead: "Data Analytics for Finance Professionals", body: "SQL and Python fundamentals aimed specifically at finance teams, not generic data science courses." },
        ],
      },
    ],
    closingLine:
      "The best outcome of a GAMCS engagement is a finance team that needs us less over time — not more.",
  },
];

/** Doc page 2 — the hub. `blurb` and `linkLabel` are per-pillar, verbatim. */
export const solutionsHub = {
  titleTag: "Solutions | FP&A, BI, Offshoring, Systems & Transaction Advisory | GAMCS",
  metaDescription:
    "Explore GAMCS's six solution pillars: FP&A & Strategic Finance, BI & Decision Intelligence, Offshoring & CoE, Technology & Systems Implementation, Transaction Advisory & Due Diligence, and Finance Capability Building.",
  h1: "Solutions Built for Every Stage of the Finance Maturity Curve",
  /* Same sentence, split so the trailing phrase can carry the accent tint.
     Kept alongside `h1` because the metadata title still wants it whole. */
  h1Lead: "Solutions Built for Every Stage of the",
  h1Accent: "Finance Maturity Curve",
  subhead:
    "From your first forecast to a fully embedded offshore Center of Excellence to getting deal-ready for a raise, refinancing, or exit — start where you are, and scale as you grow.",
  previews: [
    { slug: "fpa-strategic-finance", blurb: "Budgeting, forecasting, rolling cash flow models, accelerated close, and revenue forecasts tied to your RevOps data — a forward-looking view instead of a rear-view mirror.", linkLabel: "Explore FP&A" },
    { slug: "bi-decision-intelligence", blurb: "Real-time Power BI and Tableau dashboards, revenue/RevOps analytics, and board-ready stakeholder reporting that flag problems before they hit the P&L.", linkLabel: "Explore BI & Decision Intelligence" },
    { slug: "offshoring-centers-of-excellence", blurb: "A dedicated, standardized Finance & Analytics CoE — accounting, bookkeeping, and reporting — built for single companies, PE/VC portfolios, and advisory firms who need embedded delivery capacity.", linkLabel: "Explore Offshoring" },
    { slug: "technology-systems-implementation", blurb: "ERP, CRM, and FP&A platforms — implemented agnostically. NetSuite or SAP, Salesforce, Aimplan, Vena, or Anaplan — we implement what's right for you.", linkLabel: "Explore Systems Implementation" },
    { slug: "transaction-advisory-due-diligence", blurb: "M&A advisory, IPO readiness, due diligence, debt refinancing, and investor/pitch deck preparation — so your numbers hold up under real scrutiny.", linkLabel: "Explore Transaction Advisory" },
    { slug: "finance-capability-building", blurb: "FP&A, financial modelling, ESG, and data analytics training that builds lasting capability inside your own finance team.", linkLabel: "Explore Capability Building" },
  ],
} as const;

/** Doc page 1, section 3 — homepage. */
export const maturityCurve = {
  heading: "Every Finance Function Sits Somewhere on This Curve. Where Are You?",
  stages: [
    { n: "Stage 1", name: "Financial Reporting", body: "Statutory compliance, monthly close, historical statements. Necessary, but backward-looking by design." },
    { n: "Stage 2", name: "Basic MIS", body: "Manual Excel-based management packs. Better visibility, still slow, still fragmented." },
    { n: "Stage 3", name: "BI & Dashboards", body: "Real-time, automated dashboards replacing manual reporting." },
    { n: "Stage 4", name: "Decision Intelligence", body: "Predictive and prescriptive analytics, AI-assisted commentary, anomaly detection — finance stops reporting the past and starts shaping the next decision." },
  ],
  footnote:
    "Most companies — and most PE portfolios — are stuck between Stage 1 and Stage 2. We build the bridge to Stage 4.",
  /* Shown when a visitor taps a stage to place themselves. Copy supplied in
     the reference build; `b` marks the phrase that takes the accent colour. */
  stageNotes: [
    "You're at Stage 1 — compliant, but reading the past. The climb to Stage 4 starts with visibility.",
    "You're at Stage 2 — where most companies stall. This is exactly the gap we bridge to Stage 4.",
    "You're at Stage 3 — real-time and automated. One step from finance that shapes the decision.",
    "Stage 4 — Decision Intelligence. This is where we get you: finance stops reporting the past and starts shaping the next decision.",
  ],
  cta: { label: "See How We Get You There", href: "/solutions" },
} as const;

/**
 * Doc page 1, section 6 — homepage.
 *
 * TODO(business): the doc names Three Sixty Finance (UK) and Akshar Business
 * Consulting (UK) as delivery partners. Naming a partner publicly needs their
 * permission, so `partners` is left empty and the section renders a neutral
 * placeholder until that is granted. Add the names here and the row fills in.
 */
export const partners = {
  heading: "Trusted by Advisory Firms, Not Just Their Clients",
  body:
    "We don't only build Centers of Excellence for direct corporate and PE clients — we're also the embedded finance and analytics delivery team behind respected advisory firms who need capacity without adding onshore headcount.",
  names: [] as string[],
  cta: { label: "Considering a similar back-office arrangement? Schedule a Call", href: "/contact" },
} as const;

/** Preloader. Copy lives here rather than in the component, like everything else. */
export const preloader = {
  /** Mirrored on both edges, in the reference's monospace treatment. */
  label: "LOADING",
  /** Static, announced once. The counter itself is aria-hidden. */
  srLabel: "Loading GA Management Consultants",
} as const;
