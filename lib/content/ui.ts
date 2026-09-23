/**
 * Copy carried by the shared chrome and by components that used to hold it as
 * JSX literals: the header, breadcrumbs, cookie consent, the map card, the
 * testimonial reel, the team roster and the small labels inside sections.
 * Page-level copy is in ./pages.ts, the legal pages in ./legal.ts.
 *
 * Strings with `{slots}` are filled at render time with lib/content/fill.ts.
 */

export type HeaderPanel = "solutions" | "case" | "who";
export type HeaderItem =
  | { label: string; href: string }
  /* `href` alongside `panel` makes the label a link AND keeps its menu:
     the label navigates, a separate caret button discloses the panel. */
  | { label: string; panel: HeaderPanel; href?: string };

export const header = {
  skipLink: "Skip to content",
  /** Accessible name of the logo link; the wordmark words come from site.name. */
  logoLabel: "GA Management Consultants — home",
  /* Restored to the pre-Phase-2 set at the client's request. This deliberately
     differs from the copy doc's GLOBAL ELEMENTS nav (Home / Solutions / Case
     Studies / Team / FAQ) — the original was asked for back. FAQ stays
     reachable from the Who We Are panel, pointing at the standalone /faq page. */
  items: [
    { label: "Who We Are", panel: "who" },
    { label: "How We Help", href: "/#how-we-help" },
    { label: "Solutions", panel: "solutions", href: "/solutions" },
    { label: "Case Study", panel: "case" },
    { label: "Team", href: "/team" },
    { label: "Careers", href: "/careers" },
  ] as HeaderItem[],
  /** The caret button beside a nav item that is also a link. */
  menuLabel: "{label} menu",
  whoTitle: "Who We Are",
  whoLinks: [
    { title: "Our Story", href: "/who-we-are" },
    { title: "How We Help", href: "/#how-we-help" },
    { title: "Our Team", href: "/team" },
    { title: "What clients say", href: "/#testimonials" },
    /* the standalone page now, not the homepage section it used to hit */
    { title: "FAQ", href: "/faq" },
  ],
  allCaseStudies: "All case studies",
  more: "More",
  allSolutions: "All solutions",
  /** The phone menu. */
  openNav: "Open navigation",
  closeNav: "Close navigation",
  goBack: "Go back",
} as const;

export const crumbs = { home: "Home" } as const;

export const cookie = {
  banner: {
    title: "We use cookies",
    body: "We use essential cookies to run this site, and — only if you agree — analytics cookies to understand how visitors use it. You can change your mind anytime from the link in our footer.",
    accept: "Accept all",
    reject: "Reject non-essential",
    manage: "Manage preferences",
  },
  panel: {
    title: "Manage preferences",
    essential: "Essential",
    alwaysOn: "Always on",
    essentialBody: "Required for the site to function. Cannot be turned off.",
    analytics: "Analytics (GA4)",
    analyticsBody: "Helps us understand which pages are useful, using Google Analytics. No data is sold or used for advertising.",
    save: "Save preferences",
    cancel: "Cancel",
    noteLead: "Full detail in our",
    noteLink: "Privacy Policy",
  },
} as const;

/** The office map: the homepage card (expand-map) and /contact's Directions. */
export const map = {
  /** Credit line for the basemap. Required by ODbL for OSM tiles. */
  attribution: "© OpenStreetMap",
  directions: "Get directions",
  hint: "Click to expand",
  showAddress: "Show the {location} address",
  hideAddress: "Hide the {location} address",
  visitUs: "VISIT US",
  alt: "Map showing the {short} office at {address}",
} as const;

export const reel = {
  pause: "Pause testimonials",
  play: "Play testimonials",
  previous: "Previous testimonial",
  next: "Next testimonial",
} as const;

export const sections = {
  /** Section eyebrows on the homepage. */
  howWeHelp: "How we help",
  services: "Services",
  servicesHeadingLead: "Everything You Need to Build a",
  servicesHeadingAccent: "Decision-Ready Finance Function",
  servicesLead: "From forward-looking planning to deal-ready diligence — engaged individually, or as one embedded team.",
  learnMore: "Learn more",
  atAGlance: "At a glance",
  testimonials: "Testimonials",
  whoWeAre: "Who we are",
  aboutFirm: "About our firm",
  meetFounders: "Meet our founders",
  /** The founders' portrait; the names come from team.leadership. */
  foundersAlt: "{first} and {second}, founders of {siteName}",
  /** The maturity curve's stage panels. */
  stage: "Stage {n}",
  stageNext: "If you’re at Stage {n} — {name}",
  /** Testimonial byline. */
  byline: "{name} — {title}, {company}",
} as const;

export const servicePage = {
  kicker: "SOLUTIONS",
  crumb: "Solutions",
  atAGlance: "At a glance",
  readCaseStudies: "Read the case studies",
} as const;

export const caseCard = {
  number: "Case Study {no}",
  /** Shown once a case study carries these fields; none does today. */
  problem: "Problem",
  solution: "Solution",
  outcome: "Outcome",
} as const;

export const roster = {
  founders: "Founders",
  /* The note between the two founder cards on /team. Placeholder wording until
     the client sends their own: it says only what the roster already states. */
  foundersNote:
    "Gaurav and Abhinav founded GAMCS after a decade each inside finance teams \u2014 FP&A, due diligence, business intelligence and transformation. They lead the work, not only the firm.",
  advisory: "Advisory Team",
  portraitAlt: "Portrait of {name}, {title}",
  close: "Close",
  linkedin: "LinkedIn",
  email: "Email",
} as const;
