/**
 * Copy carried by the shared chrome and by components that used to hold it as
 * JSX literals: the header, cookie consent, the map card, the testimonial
 * reel, the team roster and the small labels inside sections.
 * Page-level copy is in ./pages.ts, the legal pages in ./legal.ts.
 *
 * Strings with `{slots}` are filled at render time with lib/content/fill.ts.
 */

/* One shape only. Every nav item is a plain link: the three mega-menus came
   out at the client's request (2026-10-19), so a `panel` variant would let a
   dropdown be described again in content and silently dropped by the header. */
export type HeaderItem = { label: string; href: string };

export const header = {
  skipLink: "Skip to content",
  /** Accessible name of the logo link; the wordmark words come from site.name. */
  logoLabel: "GA Management Consultants — home",
  /* TITLE CASE, every word (client, 2026-10-20). These three were sentence
     case as the client first wrote them on 2026-10-19 while "Case Studies"
     and "Careers" were already capped, so the bar read in two conventions;
     it is one now and matches the rest of the site's chrome.

     This list is ALSO the footer's Explore column — it reads `header.items`
     directly (components/ui/flickering-footer.tsx) — so the casing changes
     in both places at once, which is the point of their sharing it.

     "Who We Are" goes straight to Our Story, and FAQ is reachable from the
     footer alone. */
  items: [
    { label: "Who We Are", href: "/who-we-are" },
    { label: "How We Help", href: "/how-we-help" },
    { label: "What We Do", href: "/solutions" },
    { label: "Team", href: "/team" },
    { label: "Case Studies", href: "/case-study" },
    { label: "Careers", href: "/careers" },
  ] as HeaderItem[],
  /** The phone menu. */
  openNav: "Open navigation",
  closeNav: "Close navigation",
} as const;

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
  /* Accessible name for that same link. Three cards render three of them, so
     the visible "Get directions" alone cannot tell a links list which city it
     routes to. Opens with the visible text so speech input still matches. */
  directionsTo: "Get directions to {location}",
  hint: "Click to expand",
  showAddress: "Show the {location} address",
  hideAddress: "Hide the {location} address",
  /* RETIRED 2026-10-20, kept because retired copy is kept here. These were
     the disclosure that fanned the office cards out into a row; the cards are
     a stepped deck with arrows now, so there is nothing to show or hide.
     Restoring the disclosure means restoring these two, not rewriting them. */
  showOffices: "See all {count} offices",
  hideOffices: "Hide the other offices",
  /* The deck's two arrows. Not reel.previous/reel.next, which name a
     testimonial — same control, different thing being stepped through. */
  previousOffice: "Previous office",
  nextOffice: "Next office",
  /* Announced politely when the deck turns, and never shown: the card below
     already names the city, so a visible copy would be the same words twice.
     It carries the position because the deck's own depth cue — two card
     edges behind the front one — is the thing a screen reader cannot see. */
  officePosition: "{location}, office {index} of {count}",
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
  aboutFirm: "About our firm",
  /* The homepage's link to /team, beside "About our firm" (client,
     2026-10-21). It said "Meet our founders" and shared `meetFounders` with
     the phone control below, which was wrong in both directions: this one
     goes to /team, which is the whole roster and not just the two of them.
     Split rather than renamed, because the phone control still means the
     founders. */
  meetTeam: "Meet our team",
  /* NOT the link above. This labels the button that opens the phone's
     reveal, and what the reveal shows is the two founders' faces. */
  meetFounders: "Meet our founders",
  /* The link to /team inside that reveal, once it is open. It cannot reuse
     either of the two above: `meetFounders` labels the control that opened
     the panel the reader is already looking at, and `meetTeam` is the
     homepage's own button, which does not render at this width. */
  fullTeam: "Meet the full team",
  /** The founders' portrait; the names come from team.leadership. */
  foundersAlt: "{first} and {second}, founders of {siteName}",
  /* The LinkedIn tile on each founder card (client, 2026-10-22). NAMED PER
     PERSON, not "LinkedIn" twice: two links with the same accessible name
     going to different profiles is exactly what WCAG 2.4.4 is about — in a
     screen reader's link list they are indistinguishable, and so is tabbing
     between them. The tile shows a glyph and no words, so this is the whole
     of its name rather than an addition to one. */
  linkedinOf: "{name} on LinkedIn",
  /* Accessible name for a figure's source link in the decision gap. All three
     read "Source" on the page, and three links with the same name fail WCAG
     2.4.4 — in a screen reader's link list they are indistinguishable, and so
     is tabbing through them. {label} is the visible word and comes first, so
     the name still contains the label as shown (2.5.3); {publication} is what
     tells them apart. The new-tab note is here rather than in an icon because
     the arrow beside the word is decoration. */
  sourceLink: "{label}: {publication} (opens in a new tab)",
  /* The byline is two lines: the person on the first, what they do on the
     second, as the client's reference sets it. The name is not in these
     templates because it needs no assembling — only the role line does. */
  byline: "{title}, {company}",
  /* And for one who does not. Four of the six testimonials were supplied with
     a company and no role; filling the template above would have left
     "Patrick Hughes — , HungerRush" with the comma hanging off an empty slot. */
  bylineNoTitle: "{company}",
} as const;

export const servicePage = {
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

/* Each roster block on /team is the site's standard eyebrow + heading pair:
   the short label goes in the pill, the sentence under it is the block's one
   <h2>, and the note is the paragraph below. `founders` and `advisory` name
   the section, so they are the pill; they were the <h2> until the client sent
   headings of their own (2026-10-19). */
export const roster = {
  founders: "Founders",
  foundersHeading: "The People Behind the Work",
  /* The note between the two founder cards. Client copy, received 2026-10-19;
     it replaces the placeholder that stood in until they sent their own. The
     em dash in "client work\u2014combining" is unspaced as they wrote it. */
  foundersNote:
    "GAMCS was founded by Gaurav Malik and Abhinav Aggarwal in 2023 to bring together strategic finance, FP&A and technology-led transformation. With complementary experience across finance, consulting and systems, they remain directly involved in client work\u2014combining senior-level perspective with hands-on execution.",
  advisory: "Advisory Team",
  advisoryHeading: "Experience That Strengthens Every Perspective",
  /* "advisors", not the "advisers" the comments in this repo use: the client's
     spelling is the one that gets rendered. Same copy drop. */
  advisoryNote:
    "Our advisors bring experience across finance leadership, business performance, financial reporting, transactions, risk and technology. Their diverse perspectives complement our hands-on delivery capabilities and help us address complex business and finance challenges.",
  portraitAlt: "Portrait of {name}, {title}",
  close: "Close",
  /** Heads the middot list under a bio. */
  expertiseLabel: "Core Expertise",
  linkedin: "LinkedIn",
  email: "Email",
} as const;
