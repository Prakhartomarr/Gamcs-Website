/**
 * SINGLE SOURCE OF TRUTH for site copy.
 *
 * Every string here is transcribed verbatim from https://www.gamcs.in/ .
 * Nothing in this file is invented, reworded or rounded. If a figure needs to
 * change, change it on the live site first, then mirror it here — components
 * must not hardcode copy.
 */

import type { Part } from "./fill";

/**
 * The offices a visitor can actually walk into. One card per entry in the
 * homepage map row (components/ui/office-maps.tsx).
 *
 * Written out as plain literals, above `site`, because scripts/copy/source.mjs
 * edits this file as TEXT: it walks the AST by dotted path, so a conditional
 * spread or a `site.address.street` reference at `offices[0].street` is not
 * something a copy editor can be handed, and one unreadable locator takes
 * export, import and check down together (export.mjs `loadManifest` calls
 * `read` without a net). So the registered address is typed here once and
 * `site.address` is read back off it, not the other way round — the homepage
 * card and the PostalAddress in the Organization JSON-LD cannot drift apart.
 *
 * `site.address` still answers "what is the registered address of this firm" —
 * one place, one answer — and that is what lib/schema.ts puts in the JSON-LD
 * and what /contact, components/Directions.tsx and the footer print.
 * `offices` answers "where can I find you", which has three answers.
 * The other two are not registered addresses and carry their own firm names.
 */
export type Office = {
  /** The firm trading at that address. Not always site.name. */
  name: string;
  street: string;
  locality: string;
  region: string;
  postalCode: string;
  /** "lat,lng". The map links route to the point rather than to the written
      address, which geocodes ~400m off, so this and `map` move with the
      street or the pin quietly keeps the old office. */
  coords: string;
  /** Static basemap rendered for exactly that centre, 960x720. */
  map: string;
  /** Landmark line, shown under the address when the card opens. */
  note?: string;
  /**
   * The one that is also site.address. Exactly one entry has it, and every
   * consumer selects it by this flag: by position, the day the list is
   * reordered or the registered entry is dropped, whatever lands at index 0
   * is published as this firm's own address.
   */
  registered?: boolean;
};

const offices: readonly Office[] = [
  {
    name: "GA Management Consultants",
    street:
      "2nd Floor, WonderWorks Mudit Square, B-3, Plot No. 24, Institutional Area, Sector 32",
    locality: "Gurugram",
    region: "Haryana",
    postalCode: "122001",
    coords: "28.4443371,77.0436624",
    map: "/map/gurugram-sector32.webp",
    registered: true,
  },
  {
    name: "RNBP & CO",
    street: "Second Floor, G-22, Block G, Sector 3",
    locality: "Noida",
    region: "Uttar Pradesh",
    postalCode: "201301",
    note: "Near Noida Sector 16 Metro Station, Gate No. 3",
    coords: "28.5803285,77.3201677",
    map: "/map/noida-sector3.webp",
  },
  {
    name: "New Leaf Family Office",
    street: "14th Floor, UB City, Concorde Block, No. 24 Vittal Mallya Road",
    locality: "Bangalore",
    region: "Karnataka",
    postalCode: "560001",
    coords: "12.9718591,77.5956698",
    map: "/map/bangalore-ubcity.webp",
  },
];

const registeredOffice = offices.find((o) => o.registered) ?? null;

/**
 * The cards the homepage contact panel renders (components/sections/Contact.tsx).
 *
 * All or nothing. Drop the registered office and what is left is two other
 * firms' addresses standing under this firm's heading, so an unknown
 * registered address takes the whole row off the page rather than promoting
 * whichever entry happens to be first.
 */
export const officeCards: readonly Office[] = registeredOffice ? offices : [];

/**
 * The office's name in a URL: /contact?office=gurugram#offices.
 *
 * DERIVED FROM `locality`, not stored on the Office. A stored slug is a
 * second place the city's name lives and a second place to forget to edit;
 * derived, the link the footer writes and the tab /contact looks up can never
 * disagree, because both call this. It is exported so they do.
 *
 * Not the index, which would make a shared link point at a different office
 * the day the order changes, and not `coords`, which is unreadable in an
 * address bar and moves when a pin is corrected.
 */
export const officeSlug = (o: Office) =>
  o.locality.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const site = {
  name: "GA Management Consultants",
  legalName: "GA Management Consultants LLP",
  short: "GAMCS",
  /*
   * The two lines the footer sets in type beside the mark, which draws the
   * "GA" (client, 2026-10-20). The lockup reads "GA MANAGEMENT CONSULTANTS"
   * rather than "GAMCS": the mark is the monogram and the words spell it out,
   * so the footer now prints the firm's full name instead of its contraction.
   *
   * Two entries, not one string with a <br>: the stack is the lockup's shape,
   * and a line break inside a string is a line break a stylesheet cannot see.
   */
  logoLines: ["MANAGEMENT", "CONSULTANTS"] as const,
  /** RETIRED 2026-10-20: the half-wordmark the "GAMCS" lockup set in type. */
  logoWord: "MCS",
  tagline: "Driving Change, Delivering Results",
  subheading: "We turn insights into impact.",
  url: "https://www.gamcs.in",
  email: "info@gamcs.in",
  linkedin: "https://in.linkedin.com/company/gamcs-in",
  /* TWO CELLS AGAIN (client, 2026-10-20): the notice on the left of the
     bottom bar, the reservation hard against its right edge.

     It was one string. The client's footer document writes the whole notice
     as one sentence, legal name included, which is why the separate cell that
     used to repeat `site.legalName` was removed — but that was about the NAME
     being said twice, not about the rights line. Split at the full stop, so
     the two together still read exactly as the document writes them. */
  copyright: "© 2026 GA Management Consultants LLP.",
  rights: "All rights reserved.",
  /** Brand mark. Overwrite public/brand/logo.png to change it everywhere. */
  logo: "/brand/logo.png",
  /**
   * TODO(business): gamcs.in publishes no phone number. Fill it in and the
   * contact page and the Organization JSON-LD render it automatically.
   * Leaving it null is deliberate — an invented number is worse than none.
   */
  phone: null as string | null,
  /**
   * The registered office, read off the flagged entry in `offices` so this,
   * the homepage card and the JSON-LD are one string each. null when no entry
   * is flagged: everything that prints an address — the PostalAddress in
   * lib/schema.ts, /contact, components/Directions.tsx, the footer, the
   * homepage map row — then renders nothing rather than guessing.
   */
  address: registeredOffice && {
    ...registeredOffice,
    country: "IN", // ISO 3166-1 alpha-2
    /* The same country for a reader rather than for schema.org. The footer
       prints "Gurugram, Haryana, India" because that is the contact line the
       client's document gives; /contact and the map cards still print the
       postal code, which is what a visitor navigating there needs. */
    countryName: "India",
  },
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
    "We connect finance, data and technology to transform reporting into decisions \u2014 and insights into impact.",
  /* The hero's one button. The copy doc sends it to the "Case Study Section";
     that is the /case-study page — the homepage has no case study band. */
  cta: { label: "See Decision Intelligence in Action", href: "/case-study" },
} as const;

export const intro =
  "With more than combined 150+ years of industry experience, GA Management Consultants is a consultancy firm committed to creating impact & value for clients and communities.";


/* THE MISSION IN TWO HALVES (client, 2026-10-22), so the homepage can set the
   second one in brand blue the way `headingAccent` is set in the heading
   above it.

   `mission` is BUILT from them rather than written a third time: /team and
   /careers both print the whole sentence as one string, and a split that left
   three copies of the same words in the file would drift the first time one
   of them was edited. Change either half and all three pages follow. */
/* The lead in two halves as well (client, 2026-10-22), for the same reason
   and on the same pattern: the clause after "a clear vision:" is set in brand
   blue, and `lead` is assembled from the two so the words exist once.

   The reach line is the client's new copy — "serving clients globally across
   India, US, UK, Middle East and APAC" replaces "across India and globally".
   "Middle East" is capitalised here; the brief wrote "Middle east", which is
   the only one of the five regions not capitalised, so this is read as a slip
   rather than a style. One word to put back if it was deliberate. */
const LEAD_BODY =
  "GA Management Consultants (GAMCS) is a high-impact management consulting firm serving clients globally across India, US, UK, Middle East and APAC. Founded in 2023 by Gaurav Malik and Abhinav Aggarwal, GAMCS was built with a clear vision: ";
const LEAD_ACCENT =
  "to transform finance from a reporting function into a strategic engine for growth\u2014powered by data, technology, and insight.";

const MISSION_LEAD = "Our mission is simple: ";
const MISSION_ACCENT = "make finance a source of insight, not just information.";

/**
 * Company story. `heading` and `lead` carry the homepage section; `mission` is
 * quoted again on /team and /careers. The long `body`/`close` prose that used
 * to run on /who-we-are is gone: that page now tells the firm's story in seven
 * chapters, and its copy lives in `ourStory` below.
 */
export const story = {
  /*
   * NOT site.tagline. That one string is also the document title, the OG and
   * Twitter cards, the manifest name and the Organization slogan; a
   * 108-character sentence breaks all four, so the section heading is its own
   * field and "Driving Change, Delivering Results" stays the tagline.
   */
  /* One sentence, split so the middle clause can take the accent tint
     (client, 2026-10-21). The three concatenate back to the original
     character for character, including the spaces that sit on `headingLead`
     and `headingTail` rather than between the spans: a gap introduced by the
     markup would show up as a double space when the accent is removed. */
  headingLead: "We connect ",
  headingAccent: "finance, data and technology to transform reporting into decisions",
  headingTail: " \u2014 and insights into impact.",
  leadAccent: LEAD_ACCENT,
  /* The whole paragraph. One consumer renders it split, but `story.lead` is a
     row in scripts/copy/manifest.json and the audit reads it as a string. */
  lead: LEAD_BODY + LEAD_ACCENT,
  missionLead: MISSION_LEAD,
  missionAccent: MISSION_ACCENT,
  /* The whole sentence, for /team and /careers, which print it unsplit. */
  mission: MISSION_LEAD + MISSION_ACCENT,
  /*
   * The three figures the phone layout sets between the lead and the
   * portrait. There is no third value here on purpose: it is
   * team.leadership.length + team.advisory.length, counted at render, so an
   * adviser joining moves the number without anyone remembering to come back
   * and edit it. The other two are facts that nothing else in the code can
   * derive - the founding year is not stored anywhere, and the 150+ years is
   * the same figure `intro` states in a sentence.
   */
  stats: {
    yearsValue: "150+",
    yearsLabel: "combined years of industry experience",
    foundedValue: "2023",
    foundedLabel: "founded, in Gurugram",
    peopleLabel: "founders & senior advisers",
  },
} as const;

/**
 * /who-we-are — the firm's story, as the client rewrote it on 2026-10-19.
 *
 * A REPLACEMENT, not an edit. The new document is organised as a hero, a
 * figures band, five numbered sections and a closing band, and it does not map
 * onto the seven chapters that were here. Every string is transcribed
 * character for character: the unspaced em dashes ("necessary—but it is not")
 * are the client's and are deliberate, and nothing is tightened, re-punctuated
 * or Americanised on the way in.
 *
 * Each section's list is nested INSIDE the chapter it belongs to. The previous
 * version hoisted all five lists to the top of this object, which left a row
 * of sibling arrays whose only clue to where they rendered was their order.
 *
 * Old key                     -> new key
 *   markers[]                 -> chapters.start.journey.entries[]  (+year, +body)
 *   stats[]                   -> glance.items[]                    (two -> six)
 *   shift.from/toLine         -> chapters.saw.from/to              (+question, +body)
 *   pillars[]                 -> chapters.build.items[]            (+body)
 *   secondaryCta              -> heroCtas / closing.cta
 *
 * The client's document drops the "shared passion", "what we believe" and "the
 * name" chapters outright. Per the standing instruction that retired copy is
 * kept in this module, they are still below, under UNRENDERED — nothing on the
 * page reads them.
 */
export const ourStory = {
  /* The client's caps, kept. `.section-kicker` sets no text-transform, so
     whatever is stored here is what the eyebrow reads on screen. */
  eyebrow: "OUR STORY",
  heroLines: [
    "Built on a shared vision.",
    "Driven by financial insight.",
    "Focused on the future.",
  ],
  heroBody:
    "GA Management Consultants LLP was founded in 2023 by Gaurav Malik and Abhinav Aggarwal. Having known each other since college, qualified as Chartered Accountants, and later worked in corporate roles, they shared a conviction: finance should do more than explain what happened. It should help businesses decide what happens next.",
  /*
   * Both hero buttons stay on this page, so both hold a fragment rather than a
   * route: the primary lands on the timeline the label names ("Our journey"),
   * the secondary on the founders section. The page gives both targets
   * tabindex="-1" so the browser moves focus there as well as the viewport —
   * a fragment link that only scrolls leaves a keyboard user at the top.
   */
  heroCtas: {
    primary: { label: "Explore Our Journey", href: "#our-journey" },
    secondary: { label: "Meet the Founders", href: "#the-founders" },
  },
  /*
   * The band under the hero. `count` is per figure, not derived: CountUp
   * splits a string on its digits and counts them, which is right for "150+
   * years" and "30+" and wrong for "2023" — a year ticking up from zero reads
   * as a number, not a date. The one `count: false` is that year.
   *
   * "150+ years" is the client's figure. The same claim is published in
   * three other places — `intro`, `story.stats.yearsValue` and
   * `pages.team.description` — and all three moved to 150+ with it
   * (client decision, 2026-10-19). The 100+ in `achievements` is a
   * different metric, financial models delivered, and stays as it is.
   */
  glance: {
    /* The client's caps, kept — `.os-h--band` sets no text-transform, so this
       is also what renders. The chapter labels below are stored sentence case
       ("Where it started") because `.os-label` uppercases every one of them as
       part of its tracked micro-label treatment; the caps on screen there are
       CSS, the caps here are the copy. */
    heading: "GAMCS AT A GLANCE",
    items: [
      { value: "2023", label: "Founded", count: false },
      { value: "50+", label: "Team & delivery professionals", count: true },
      /* Shortened 2026-10-21 so the strip reads as one row. "150+ years" with
         a label running "Combined experience across our leadership and
         advisory team" set three lines deep while every other label set one,
         which left this cell hanging below the other five. The unit moves
         into the label, so the figure is still years and not an unlabelled
         150. What the client accepted losing: "across our leadership and
         advisory team", which said whose years they are. */
      { value: "150+", label: "Years of combined experience", count: true },
      { value: "3", label: "Office locations", count: true },
      { value: "30+", label: "Businesses supported", count: true },
      { value: "10+", label: "Countries served", count: true },
    ],
  },
  chapters: {
    start: {
      label: "Where it started",
      heading: "The same college. The same qualification. A shared ambition.",
      body: [
        "Gaurav and Abhinav's journey began in college and continued through their Chartered Accountancy qualification and corporate experience. Along the way, they developed complementary perspectives on finance, business performance and the role technology can play in making finance more effective.",
        "In 2023, they brought those perspectives together to establish GA Management Consultants LLP, with a vision to help businesses connect financial expertise, data and technology to make better decisions.",
      ],
      /*
       * The four years are the values the client verified. Their document
       * carried a bracketed note to themselves above each one ("[COLLEGE YEARS
       * — insert verified year or year range]"); those notes are an editing
       * instruction, not copy, and are transcribed nowhere.
       */
      journey: {
        heading: "Our journey",
        entries: [
          {
            year: "2011",
            label: "College",
            body: "Where the founders first got to know each other and began their shared journey.",
          },
          {
            year: "2014",
            label: "Chartered Accountancy",
            body: "A shared foundation in finance, analysis, discipline and problem-solving.",
          },
          {
            year: "2017-2023",
            label: "Corporate experience",
            body: "Seeing how finance, business operations and decision-making intersect—and where they often disconnect.",
          },
          {
            year: "2023",
            label: "GAMCS is founded",
            body: "Bringing finance, data and technology together to help businesses see beyond the numbers.",
          },
        ],
      },
    },
    saw: {
      label: "What we saw",
      heading:
        "Reporting tells you what happened. Finance should help you decide what happens next.",
      body:
        "Financial information is essential, but producing reports is only part of the job. The real value lies in understanding what drives performance, identifying what needs attention, and helping leadership teams decide what to do next.",
      /*
       * Two states of one thing, drawn side by side. Every word here is now the
       * client's — the previous version's two one-line summaries were ours,
       * written because the copy had no second line to set.
       */
      from: {
        label: "Conventional reporting",
        question: "What happened? What changed?",
        body: "Historical visibility is necessary—but it is not the finish line.",
      },
      to: {
        label: "Decision-led finance",
        question: "Why did it happen? What should we do next?",
        body: "Insight connects financial performance to choices, actions and outcomes.",
      },
    },
    build: {
      label: "What we set out to build",
      heading: "Finance, data and technology—working together.",
      body:
        "We built GAMCS around the belief that better decisions begin with reliable financial foundations, connected information and meaningful analysis.",
      items: [
        {
          heading: "Financial expertise",
          body: "Build strong foundations in planning, reporting, modelling and business performance—so the numbers can be relied on and understood.",
        },
        {
          heading: "Data & technology",
          body: "Connect systems, improve reporting processes and make information more accessible, consistent and useful.",
        },
        {
          heading: "Insight & action",
          body: "Turn financial and operational information into clear explanations, forward-looking perspectives and better-informed decisions.",
        },
      ],
      /* What is left of the old "the name" chapter: one sentence, under the
         three items, rather than a section of its own. */
      note:
        "The name GA brings together the initials of Gaurav and Abhinav—a simple reflection of the partnership and shared ambition behind the firm.",
    },
    founders: {
      label: "The founders",
      heading: "Two perspectives. One shared purpose.",
      body:
        "GAMCS brings strategic finance and technology-led transformation together, led by founders with complementary expertise and a shared commitment to execution.",
      /* Both cards read the same line, so it is one string, not two. It is NOT
         team.leadership[].title — that is each founder's full specialism line
         and is what /team prints. This page prints the short role. */
      role: "Co-Founder & Partner",
      /*
       * Keyed by `team.leadership[].name`, and that is the whole sync
       * mechanism: the cards render the name, photo and alt text out of
       * `team.leadership`, and look the bio up by the name they just rendered.
       * Because both objects are `as const`, `bios[person.name]` only compiles
       * while the two sets of names agree — rename a founder on the roster and
       * `npx tsc` fails here instead of the page silently losing a paragraph.
       */
      bios: {
        "Gaurav Malik":
          "Gaurav focuses on strategic finance, FP&A, financial modelling, profitability analysis and transaction support. He works with leadership teams to improve performance visibility and turn financial analysis into practical business decisions.",
        "Abhinav Aggarwal":
          "Abhinav focuses on FP&A systems, BI and analytics, automation, and finance transformation. He works at the intersection of finance and technology, helping businesses streamline reporting and build more effective finance capabilities.",
      },
      /* Title case, and deliberately not `sections.fullTeam` ("Meet the full
         team"): this is the client's wording for this page. */
      cta: "Meet the Full Team",
    },
    future: {
      label: "Where we're going",
      heading: "See beyond the numbers.",
      body: [
        "Our journey continues with a clear purpose: helping businesses build stronger finance functions, understand performance more deeply, and turn insight into decisions and measurable impact.",
        "Whether the need is to strengthen finance foundations, improve reporting, connect data or support strategic decisions, we believe the right next step begins with understanding the business.",
      ],
      principles: [
        {
          heading: "Practical by design",
          body: "Advice should lead to action, and solutions should fit the realities of the business.",
        },
        {
          heading: "Connected thinking",
          body: "Finance, data and technology work best when they are designed together.",
        },
        {
          heading: "Built around the business",
          body: "No cookie-cutter templates; focus on the operating model and decisions that matter.",
        },
        {
          heading: "Impact over activity",
          body: "Measure success by better decisions and outcomes, not simply reports delivered.",
        },
      ],
    },

    /* ---- UNRENDERED from here down -------------------------------------
       Retired with the 2026-10-19 rewrite. Kept because retired copy stays in
       this module; NOTHING on /who-we-are (or anywhere else) reads these three
       — grep `chapters.passion`, `chapters.believe`, `chapters.name` before
       assuming otherwise. ------------------------------------------------ */
    /** UNRENDERED. Old chapter 02. */
    passion: {
      label: "A shared passion",
      heading: "Studied, qualified, and worked alongside each other.",
      body:
        "Having studied, qualified, and worked alongside each other, they developed a shared passion for Financial Planning & Analysis (FP&A), business intelligence, financial modelling, dashboards, and data-driven decision-making.",
    },
    /** UNRENDERED. Old chapter 05. */
    believe: {
      label: "What we believe",
      heading:
        "Finance is not just about understanding numbers, but about uncovering the insights behind them.",
      body:
        "By combining financial expertise, analytical thinking, technology, and a forward-looking perspective, we aim to empower businesses to transform complex financial information into actionable insights, informed decisions, and measurable business impact.",
    },
    /** UNRENDERED. Old chapter 04; `chapters.build.note` replaced it. */
    name: {
      label: "The name",
      heading: "The initials, and the vision.",
      body: [
        "With a clear vision to transform finance from a reporting function into a strategic engine for growth, powered by data, technology, and insights, they set out to build a consultancy that bridges the gap between financial information and meaningful business decisions.",
        "This shared ambition led to the establishment of GA Management Consultants LLP, with GA representing the initials of its founders and the vision that brought them together.",
      ],
    },
  },
  /* The closing band. Its second button is `primaryCta` itself — the client's
     secondary CTA here is "Schedule a Call", which is that button word for
     word, and one conversion label beats two copies of it. */
  closing: {
    heading: "Better decisions begin with a clearer view.",
    body:
      "Tell us where your finance function needs to go. We'll help you identify the right next step—from stronger foundations to insight-led decisions.",
    cta: { label: "Explore Our Solutions", href: "/solutions" },
  },

  /** UNRENDERED. The five the retired "shared passion" chapter listed. */
  disciplines: [
    "Financial Planning & Analysis (FP&A)",
    "Business intelligence",
    "Financial modelling",
    "Dashboards",
    "Data-driven decision-making",
  ],
  /** UNRENDERED. The four the retired "what we believe" chapter combined;
      `chapters.build.items` is the new copy's three, not these. */
  pillars: [
    "Financial expertise",
    "Analytical thinking",
    "Technology",
    "A forward-looking perspective",
  ],
} as const;

export const primaryCta = { label: "Schedule a Call", href: "/contact" } as const;

/**
 * "How GAMCS Helps" — doc page 1, section 4 (v4), the header and the phases.
 *
 * v3 ran the six `whyUs.points` through the isometric stack, which asked the
 * reader to take six parallel claims as a sequence. They never were one: the
 * four `phases` here are the sequence, and the six points are principles that
 * hold across all four. So the stack carries these phases, and the points
 * move to the card grid beneath it.
 *
 * `eyebrow` is stored in sentence case and uppercased by the stylesheet, as
 * every other eyebrow in this module is — this file holds words, CSS holds
 * their casing.
 *
 * `n` is a string because the leading zero is part of the copy, not padding
 * the layout adds back. `phaseTotal` is stored whole: "/ 04" never varies
 * with the selection, so there is nothing in it to fill.
 *
 * `phaseLabel` and `buildsOn` take their `{n}` / `{name}` at render
 * (lib/content/fill.ts). `firstPhaseNote` stands in for `buildsOn` on phase
 * 01, which has nothing beneath it.
 */
export const howWeHelp = {
  /** UNRENDERED since 2026-10-20: the client had the eyebrow taken off
      this band. Kept because they ask for retired copy to be retained. */
  eyebrow: "How GAMCS helps",
  /* One sentence, split so the second clause can take the accent tint. */
  headingLead: "From knowing where you are",
  headingAccent: "to building what comes next.",
  sub: "We bring the right combination of finance expertise, processes, data and technology to address today's gaps and build the capabilities your business will need next.",
  phases: [
    {
      n: "01",
      name: "Stabilise",
      goal: "Build the foundation",
      detail: "Clear processes, ownership, controls and a predictable close.",
    },
    {
      n: "02",
      name: "Connect & Automate",
      goal: "Make reporting repeatable",
      detail: "Connect systems, standardise reporting and reduce manual preparation.",
    },
    {
      n: "03",
      name: "Explain & Anticipate",
      goal: "Understand performance",
      detail: "Link financial results to drivers, forecasts and scenarios.",
    },
    {
      n: "04",
      name: "Decide & Improve",
      goal: "Turn insight into action",
      detail: "Embed insight in decisions, assign owners and track impact.",
    },
  ],
  /* Under the stack: what the stacking itself is saying. "Before", not
     "beneath" — the slabs descend 01 at the top to 04 at the bottom, so the
     layer physically beneath 01 is 02, the phase that comes AFTER it.
     "Beneath" read backwards against the picture the moment the stack order
     was flipped to match the client's reference. */
  stackCaption: "Each phase builds on the one before it.",
  /** Over the panel headline. `{n}` is the phase number. */
  phaseLabel: "Phase {n}",
  phaseTotal: "/ 04",
  /** `{name}` is the phase below the selected one. */
  buildsOn: "Builds on: {name}",
  firstPhaseNote: "Where most engagements begin.",
  /* The arrow buttons show only a chevron, so their name lives here. */
  prevLabel: "Previous phase",
  nextLabel: "Next phase",
  principles: {
    heading: "What makes our approach different",
    sub: "Six principles that hold across every phase of the work.",
  },
  /* THE EXPLAINER FILM, on the homepage band (components/sections/HowWeHelpFilm.tsx).
     The band reuses `headingLead`, `headingAccent` and `sub` above rather than
     carrying its own copies: it is the short version of /how-we-help, not a
     second message, and two copies of one sentence drift apart the first time
     the client edits one of them.

     `alt` is the film's TEXT ALTERNATIVE and it is not decoration. The film
     has no audio track at all and states its whole case in on-screen type, so
     without this a visitor who cannot see it gets nothing from it (WCAG 2.1.1,
     video-only prerecorded). Every sentence in it is quoted from the frames,
     and the labels inside the diagram are grouped under the stage they appear
     with rather than repeated each time the diagram grows — nothing is added,
     because this is client copy about the client's own business.

     The five figures below are the film's own, read off the frame where the
     counters settle (t=39s), and the wording of the labels is the film's,
     which differs from the cards' in two places — so they are transcribed
     here rather than borrowed from `achievements.items`.

     Four of the five still agree with `achievements.items`. Dashboards does
     not: the grid now publishes 150+ at the client's word, and the frame this
     line transcribes still counts to 50+. Do NOT reconcile it by editing the
     number here. This is a text alternative to a video (WCAG 2.1.1) and its
     only job is to say what the frame says; writing 150+ into it would make
     it describe a frame that does not exist, and would leave the sighted
     visitor who watches the film the only one seeing the discrepancy. It
     closes when the film is re-rendered, which is the client's call, not an
     edit to this file. */
  video: {
    /** The <video>'s accessible name, and since the transcript was removed it
        is the ONLY text this element carries.
        Rewritten 2026-10-20 with the re-cut film, which changed all three
        things the old name said: it ran 47 seconds, then 100, and runs 117
        since the 2026-10-22 cut; it had no audio track at all and now
        carries one (162 kbps across the full length, measured \u2014 not an
        empty track); and the text version it
        pointed at is gone.

        NO LONGER SAYS "starts muted" (client, 2026-10-22). The film does not
        start on its own any more \u2014 it waits for the play button and starts
        with its sound on \u2014 so the old warning described something that can
        no longer happen. */
    label: "GAMCS explainer film, 1 minute 57 seconds, with sound.",
    /* The play button over the cover image (client, 2026-10-22). The button
       has no visible text \u2014 it is a triangle on the film \u2014 so this IS its
       accessible name rather than an addition to one. */
    play: "Play the film",
    /* RETIRED 2026-10-22 with the sound toggle the autoplay needed. Nothing
       renders them: the film starts audible on a click, and the player's own
       controls carry mute from there. */
    soundOn: "Turn on sound",
    soundOff: "Mute the film",
    altSummary: "Read what the film shows",
    altNote: "The film has no sound. Everything it says is on-screen text, and this is that text, in the order it appears \u2014 with the labels inside the diagram grouped under the stage they appear with.",
    alt: [
      "\u201cFP&A teams spend nearly 50% of their time collecting and validating data, leaving only about a third for generating insights and driving action.\u201d A bar divides the time: \u201cCollecting & validating data \u00b7 ~50%\u201d, \u201cInsights & action \u00b7 ~33%\u201d, \u201cOther\u201d.",
      "\u201cThis leaves less time to diagnose performance drivers.\u201d The day-to-day of it surfaces around the bar: \u201cChasing inputs from 9 teams\u201d, \u201cClose slips to day 12\u201d, \u201cCRM \u2260 ledger\u201d, \u201cManual reconciliations\u201d, \u201cForecast rebuilt by hand\u201d, \u201cmgmt_pack_FINAL_v7.xlsx\u201d, \u201cBoard pack due Friday\u201d, \u201cWhy did margin drop 3 pts?\u201d, \u201cWho owns this action?\u201d",
      "Four numbered stages then build one diagram in sequence \u2014 1 Stabilise, 2 Connect & automate, 3 Explain & anticipate, 4 Decide & improve \u2014 starting from six sources: ERP & ledger, CRM & pipeline, billing & invoicing, payroll & HR, bank feeds and spreadsheets.",
      "\u201cStabilise: a close you can predict, every month.\u201d The six sources feed a \u201cClose & controls\u201d step \u2014 \u201cProcess, owners, checks\u201d \u2014 and the close day falls from day 12 to day 5.",
      "\u201cConnect & automate: every system, one source of truth.\u201d A \u201cFinance warehouse\u201d on \u201cone chart of accounts\u201d joins the chain, with a counter of rows synced.",
      "\u201cExplain & anticipate: know why, and what\u2019s next.\u201d A \u201cDriver model\u201d \u2014 \u201cWhy it moved, what\u2019s next\u201d \u2014 opens a variance bridge of EBITDA, budget versus actual, for Q3.",
      "\u201cDecide & improve: insight that becomes owned action.\u201d A rolling forecast of revenue \u2014 base, upside, downside, 18 months \u2014 and a \u201cDecisions & owners\u201d list appear: reprice tier-B contracts (CFO), cut DSO from 62 to 48 days (AR lead), pause low-ROI campaign (CMO). Each moves from open to done, for an impact of +2.4 pts margin.",
      "Beside the diagram, a \u201cfinance engine checks\u201d panel ticks green one line at a time as the stages build: \u201cClose checklist with owners & deadlines\u201d, \u201cReconciliations & controls in place\u201d, \u201cAll sources mapped to one chart of accounts\u201d, \u201cManagement pack refreshes itself\u201d, \u201cEvery variance explained by its driver\u201d, \u201cEvery insight has an owner and a deadline\u201d.",
      "\u201cTrusted by CFOs, founders and PE/VC portfolios.\u201d Five figures count up: $2Bn+ transaction value supported, 30+ businesses supported, 100+ financial models, budgets & plans, 50+ dashboards delivered, 10+ data warehouses built. Two rows of client logos pass beneath them, over the line \u201cFinance \u00b7 Data \u00b7 Technology \u2014 one integrated finance engine\u201d.",
      "The film closes on the GA mark with the name GA Management Consultants, the line \u201cStop reporting what happened. Start knowing what to do next.\u201d, a \u201cSchedule a call\u201d button and the address gamcs.in.",
    ],
  },
} as const;

/** "Why Us" section */
/**
 * The six principles under "How GAMCS Helps" — doc page 1, section 4.
 *
 * Six points, each a lead and a body. The earlier six were one-line labels
 * transcribed from the live site; the doc's version carries the explanation
 * too.
 *
 * WHAT THE SECTION RENDERS: `points`, as the card grid below the phase stack.
 * Each `body` is one line now. The paragraphs they replace were written for
 * the detail panel of the v3 stack, which these points no longer drive, and
 * at card width they ran to eight lines apiece.
 *
 * WHAT IS RETAINED BUT UNRENDERED: `heading`, `headingLead`, `headingAccent`
 * and `sub`. They are the v3 section header; `howWeHelp` supplies the header
 * now and nothing reads these four. They stay because this module mirrors the
 * copy document, and dropping rows from it is the client's decision rather
 * than a cleanup.
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
  /* `lead` doubles as the key into STEP_ICONS (components/ui/stroke-icons.tsx),
     and app/careers/page.tsx splits it on ". " for its own principle list —
     rename a lead and fix both. Neither is typed on these literals, so a
     missed rename renders an empty glyph and a mangled careers line instead
     of failing the build. The v3 layer artwork, which was typed on them and
     would have caught it, is gone with the stack. */
  points: [
    { lead: "One Team. One Integrated Finance Engine.", body: "Finance, data and technology work together around connected outcomes." },
    { lead: "Independent by Design. Outcomes Above Platforms.", body: "We recommend tools around business needs, not vendor preference." },
    { lead: "Intelligence Built In. Not Bolted On.", body: "Reporting, models and dashboards are designed to support decisions." },
    { lead: "Boardroom Ready. Deal Room Proven.", body: "Build finance processes and analysis that stand up to scrutiny." },
    { lead: "Industry-Agnostic. Business-Specific.", body: "Solutions are shaped around how each business operates and creates value." },
    { lead: "Scale Capability. Not Overhead.", body: "Extend or build the finance capability you need, at the right scale." },
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
/**
 * The figures the section publishes, client-supplied and verbatim.
 *
 * `note` qualifies the claim and is not decoration: "$2Bn+" on its own reads
 * as a firm-wide total, and "Across selected transaction engagements" is what
 * makes it true. Every figure renders all three lines.
 *
 * All five are shown. The previous set carried eight, of which the section
 * only ever rendered four — the other four were rows in the copy document for
 * text that appeared nowhere.
 */
export const achievements = {
  /* RENDERED AGAIN 2026-10-21, rewritten by the client, and set in parts
     the same day so "Numbers" and "Our Clients" can take the blue.

     Parts rather than four named fields (`headingLead`/`headingMark`/… is
     what story and maturityCurve do) because two separate phrases are
     tinted here, and a second set of lead/mark/tail names for one heading
     reads worse than a list. `em` is the existing mark: components/Rich.tsx
     renders it as <em>, and `.section-head h2 em` has been "blue, not
     italic" since long before this.

     It heads the figures AND the testimonials below them — the two are one
     band now, and the heading names both halves of it, which is why the
     testimonial carousel no longer carries a visible heading of its own. */
  /* Three marked phrases, not two (client, 2026-10-22): "Impact" joins
     "Numbers" and "Our Clients" in brand blue, and "Told" loses its capital.
     The band's h2 is sentence case now apart from the proper noun pairing at
     the end, and the three blue phrases are the claim's three nouns — what
     was achieved, and the two things that evidence it. */
  headingParts: [
    "Our ",
    { text: "Impact", em: true },
    ", told by the ",
    { text: "Numbers", em: true },
    " and ",
    { text: "Our Clients", em: true },
  ],
  /* RETIRED 2026-10-20, then overtaken: "Results so far" replaced the
     fragment below as this band's H2 and was itself unrendered the same day.
     `heading` above is what the band prints now. */
  lead: "Results so far",
  /* RETIRED with it. "Our clients have experienced" has no object:
     experienced what? The figures finish the sentence visually and not
     grammatically, which is how it read as a fragment. */
  leadFragment: "Our clients have experienced",
  items: [
    /* The card. CountUp splits the string on its digits and keeps the prefix
       and suffix on every frame, so "$" and "Bn+" ride the count. */
    {
      value: "$2Bn+",
      label: "Transaction value supported",
      note: "Across selected transaction engagements.",
    },
    {
      value: "30+",
      label: "Businesses supported",
      note: "Across finance advisory, managed services and transformation.",
    },
    {
      value: "100+",
      label: "Financial models, budgets & plans delivered",
      note: "Across planning, forecasting and business modelling.",
    },
    {
      value: "150+",
      label: "Dashboards built",
      note: "For reporting, performance monitoring and decision support.",
    },
    /* 15+, up from the 10+ this entry carried while it was unrendered
       (client, 2026-10-21), with the client's own qualifier. */
    {
      value: "15+",
      label: "Data warehouses built",
      note: "Across data integration, reporting and analytics engagements.",
    },
    /* The one outcome figure in the set: everything above counts what was
       built, this counts what it did (client, 2026-10-21). "Up to" is the
       client's hedge and stays in the value, where CountUp reads it as the
       prefix and animates only the 90. The qualifier came with a leading
       asterisk and is set without one — it sits in the cell where every
       other note sits, so there is no footnote for it to point at. */
    {
      value: "Up to 90%",
      label: "Reporting time reduced",
      note: "Achieved on selected reporting workflows following process and automation improvements.",
    },
  ],
} as const;

export const team = {
  headingLines: ["The people you call for", "Solutions you can trust"],
  /** Doc page 10. */
  h1: "Led by Operators Who've Sat in Your Seat",
  /* Two paragraphs in the page head under the H1, as the client sent them
     (2026-10-19): what the firm is made of, then what it does with that. One
     column of 330 characters was the version before, and it read as a block. */
  body: [
    "We bring together finance practitioners, experienced finance leaders and specialists in FP&A, business intelligence, finance transformation and transaction advisory.",
    "We combine strategic perspective with hands-on execution to help businesses build stronger finance functions, understand performance and make better decisions.",
  ],
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
   * Both founders read "Co-Founder", which reverses a Phase 1 instruction to
   * call Gaurav "Founder". The specialism after the bar is each one's own and
   * they are not interchangeable: Gaurav is Strategic Finance, FP&A &
   * Transaction Advisory, Abhinav is Digital Transformation. Gaurav's alone
   * carries no "Specialist" — that is the client's wording, not an omission.
   */
  /** The founders' portrait on the homepage Who-we-are block. */
  foundersPhoto: "/team/founders-light.webp",
  /** Both founders, for the homepage Who-we-are block. Order matters:
      leadership[0] is on the left of the frame, [1] on the right, which is
      what the alt text describes.

      `as const` on this array alone (the enclosing object cannot take it — it
      has a getter): it narrows `name` to the two literals, which is what lets
      /who-we-are look a founder's bio up by the name it just rendered and have
      the compiler check the two sets of names still agree. */
  leadership: [
    {
      name: "Gaurav Malik",
      title: "Co-Founder | Strategic Finance, FP&A & Transaction Advisory",
      experience: "13+ years",
      location: "Delhi, India",
      linkedinUrl: "https://www.linkedin.com/in/gauravmalik93/",
      photo: "/team/gaurav-malik-bw.jpg",
      email: "gaurav.malik@gamcs.in",
      /* As written by the client, opening line included: it repeats the name,
         the role and the years the panel prints directly above it, and that
         was a deliberate choice \u2014 a bio should read on its own. */
      bio: [
        "Gaurav Malik is the Co-Founder of GAMCS, working at the intersection of Strategic Finance, FP&A, Financial Modelling, Business Performance and Transaction Advisory.",
        "A Chartered Accountant with 13+ years of experience, Gaurav has worked across organizations including EY, Vedanta Limited and Kotak Mahindra Bank, with experience spanning budgeting and forecasting, margin and profitability analysis, financial modelling, credit analysis, due diligence, management reporting and investor-facing financial communication.",
        "At GAMCS, Gaurav works with founders, CFOs and leadership teams to translate financial and operating data into clearer performance narratives, stronger planning models and better business decisions. His focus is not simply on producing the numbers, but on understanding the commercial drivers behind them and using finance as a tool for decision-making.",
        "He also brings experience in building and communicating financial insights through investor presentations, annual reports, press releases and other management and external reporting requirements.",
      ],
    },
    {
      name: "Abhinav Aggarwal",
      title: "Co-Founder | Digital Transformation Specialist",
      experience: "13+ years",
      location: "Delhi, India",
      linkedinUrl: "https://www.linkedin.com/in/abhinav-aggarwal-a29078172/",
      photo: "/team/abhinav-aggarwal-bw.jpg",
      email: "abhinav.aggarwal@gamcs.in",
      bio: [
        "Abhinav Aggarwal is the Co-Founder of GAMCS, specialising in FP&A, Finance transformation, Business Analytics and Technology-enabled Finance.",
        "A Chartered Accountant with 13+ years of experience, Abhinav has worked with organisations including Infosys Limited and Sumitomo, with experience across finance transformation, ERP and FP&A tool implementations, process improvement and business analytics.",
        "At GAMCS, Abhinav focuses on helping finance teams move beyond spreadsheet-driven reporting toward more connected, scalable and technology-enabled finance functions. His work spans planning and forecasting, management reporting, business intelligence, finance automation and the implementation of systems that connect financial data with operational decision-making.",
        "His broader focus is on using technology not as an end in itself, but as an enabler of better finance processes, stronger analytical capability and faster decision-making. He is widely recognised for his ability to translate complex analysis into actionable insights and operate effectively with senior finance stakeholders.",
      ],
    },
  ] as const,
  /* Order is the client's: it is what the page prints, four to a row, and it
     is deliberately NOT the order of the 2026-09-28 write-up — that document
     reordered the six it showed, and the running order was kept as it was.
     Ramesh and Geeta finally have real titles from it; both used to read
     "Advisor". Amit, Asif, Sanjay and Saurabh carry the years their own bios
     state, not the figures that write-up gave — the bio wins where the two
     disagree, which is why Asif reads 15+ again after a spell at 10+. Every adviser now carries years and a location, which only
     four of them did. A card with no `photo` would render an initials tile
     instead; none does. */
  advisory: [
    {
      name: "Sumit Chatterjee",
      title: "Strategic Finance & Board Advisory",
      experience: "30+ years",
      location: "Delhi, India",
      photo: "/team/sumit-chatterjee.jpg",
      bio: [
        "With 30+ years of experience, Sumit Chatterjee has worked across FMCG, financial services, IT services, real estate and professional services, with a career spanning F100 multinational corporations, institutional organisations, family-owned businesses and high-growth companies.",
        "Sumit works with Founders, Boards and Management Teams at critical stages of growth and transformation, including capital raises, M&A and financial restructuring. His experience also extends into building the financial systems, governance frameworks and leadership capabilities needed to make growth sustainable.",
        "A qualified ACA and CMA, Sumit has also completed Executive Education at Harvard Business School. He brings together deep corporate-finance expertise, board-level perspective and hands-on execution to help leadership teams connect strategy with financial performance.",
      ],
      expertise: "Corporate Finance · Fundraising & IPO Management · M&A · Financial Restructuring · P&L Management · Board Advisory",
    },
    {
      name: "Ramesh Yadav",
      title: "Financial Reporting",
      experience: "13+ years",
      location: "Bangalore, India",
      photo: "/team/ramesh-yadav.jpg",
      bio: [
        "Ramesh Yadav is a Bangalore-based management consultant with experience spanning financial reporting, assurance, transaction advisory and management consulting. He began his career with Ernst & Young in the Audit & Assurance practice, where he worked with clients across industries, analysing financial data, identifying unusual items and evaluating matters impacting financial statements.",
        "He subsequently worked with Transaction Advisory and Management Consulting teams, advising businesses on growth, expansion, go-to-market and digital strategies aimed at improving performance, profitability and competitiveness across both digital and traditional operating environments.",
        "At GAMCS, Ramesh brings together his financial reporting foundation and broader consulting experience to help businesses strengthen their finance functions, interpret financial information more effectively and support better business decisions.",
      ],
      expertise: "Financial Reporting · Audit & Assurance · Financial Analysis · Transaction Advisory · Management Consulting · Growth Strategy · Go-to-Market Strategy · Digital Strategy",
    },
    {
      name: "Amit Garg",
      title: "IPO Advisory & Due Diligence",
      experience: "18+ years",
      location: "Delhi, India",
      photo: "/team/amit-garg.jpg",
      bio: [
        "Amit Garg is a Fellow Chartered Accountant with 18+ years of experience across assurance, consulting, financial reporting and transaction advisory. He spent more than 12 years with S.R. Batliboi & Co. LLP, an EY member firm, in audit and assurance.",
        "His experience spans Ind AS and IFRS implementation, statutory and internal audit, process reviews, financial due diligence, internal controls, capital-market transactions and financial reporting. He has also led large, multidisciplinary engagements involving complex reporting and tight execution timelines.",
        "Amit combines deep technical accounting expertise with practical business understanding and transaction experience. He is also a faculty member for IFRS and Ind AS programmes and has delivered training through ICAI, Delhi University and professional organisations. Current professional materials also document his experience in financial reporting technology and Ind AS reporting automation.",
      ],
      expertise: "Ind AS / IFRS · Audit & Assurance · Financial Reporting · Due Diligence · Capital Markets · Internal Controls · Process Reviews · IPO Advisory",
    },
    {
      name: "Dhawal Parvatikar",
      title: "CFO Advisory",
      experience: "15+ years",
      location: "Dubai, UAE",
      photo: "/team/dhawal-parvatikar.jpg",
      bio: [
        "Dhawal Parvatikar is a Chartered Accountant and experienced finance leader with 15+ years of leadership experience across Indian and multinational organisations, including Bharat Petroleum, Trafigura, Publicis, Omnicom and WPP. His career spans both India and the Middle East and includes CFO and senior finance-leadership responsibilities.",
        "Dhawal works at the intersection of finance and business, advising leadership teams on commercial decision-making, financial performance, planning, finance business partnering and transformation. His experience spans manufacturing and services environments and includes working with cross-functional teams across geographies.",
        "He is also deeply involved in finance education and professional development. As Co-Founder of FP&A Professionals Institute, he has helped train and mentor thousands of finance professionals across FP&A, finance leadership and business partnering.",
      ],
      expertise: "CFO Advisory · Strategic Finance · FP&A · Business Partnering · Financial Leadership · Finance Transformation · Commercial Finance · Working Capital",
    },
    {
      name: "Asif Masani",
      title: "BI & Analytics",
      experience: "15+ years",
      location: "Mumbai, India",
      photo: "/team/asif-masani.jpg",
      bio: [
        "Asif Masani is a Chartered Accountant and FP&A professional with 15+ years of experience across financial planning, budgeting, forecasting, audit and tax. His career includes experience with organisations such as Citi, Pfizer and Coursera, where he has partnered with finance and business leaders across different operating environments.",
        "At GAMCS, Asif focuses on the intersection of FP&A, data analytics, automation and modern finance technology. His work helps finance teams move beyond reporting toward more connected planning, analytical insight and decision support.",
        "He is also a co-founder and programme leader at FP&A Professionals Institute and has authored finance books including All About FP&A and From Accounting to FP&A. His current professional work also explores how AI can automate the mechanical elements of FP&A while leaving finance professionals focused on judgement, interpretation and decision-making.",
      ],
      expertise: "FP&A Automation · BI & Analytics · AI for Finance · Budgeting & Forecasting · Data Analytics · Reporting Automation · Finance Transformation",
    },
    {
      name: "Sanjay Rikhy",
      title: "ESG & Risk Advisory",
      experience: "30+ years",
      location: "Delhi, India",
      photo: "/team/sanjay-rikhy.jpg",
      bio: [
        "Sanjay Rikhy is a senior finance leader and strategic advisor with more than three decades of corporate experience across manufacturing and services. His leadership career includes organisations such as Hero Group, Philips India, the RPG/Goenka Group and Aditya Birla Group, and includes experience as CFO of Rajshree Cement Works, part of UltraTech Cement.",
        "He advises business leaders on financial planning, business performance, working capital, governance, risk management and internal controls. His experience combines CFO-level financial leadership with a practical understanding of how finance, operations and risk need to work together to support sustainable business performance.",
        "Sanjay also brings a strong perspective on ESG and sustainable business transformation and serves as a Mentor of Change under NITI Aayog's Atal Innovation Mission.",
      ],
      expertise: "CFO Advisory · Financial Planning · Performance Transformation · Working Capital · Governance & Risk · Internal Controls · ESG · Business Analytics",
    },
    {
      name: "Geeta Karnik",
      title: "Strategic Finance & CFO Advisory",
      experience: "30+ years",
      location: "Mumbai, India",
      photo: "/team/geeta-karnik.jpg",
      bio: [
        "Geeta Karnik is a senior finance leader and strategic advisor with extensive experience in corporate finance, cash management, performance management and finance transformation.",
        "She has served as Chief Financial Officer of Servier India, where her responsibilities and leadership perspective have included finance and broader business performance. Publicly documented experience also reflects her focus on cash management, financial excellence and the evolving role of finance in digitally enabled organisations.",
        "At GAMCS, Geeta brings a senior CFO perspective to questions around financial performance, governance, cash, transformation and long-term value creation. Her experience helps leadership teams connect financial discipline with strategic and operational priorities.",
      ],
      expertise: "CFO Advisory · Strategic Finance · Cash Management · Performance Management · Finance Transformation · Governance · Financial Leadership",
    },
    {
      name: "Saurabh Aggarwal",
      title: "Accounting & Audit",
      experience: "10+ years",
      location: "Delhi, India",
      photo: "/team/saurabh-aggarwal.jpg",
      bio: [
        "Saurabh Aggarwal is a finance and assurance professional with 10+ years of experience across assurance and advisory services. He has worked with S.R. Batliboi & Co. LLP, an EY member firm, and BSR & Co. LLP, a KPMG member firm, serving public companies and multinational organisations.",
        "His experience spans IFRS, Ind AS, IGAAP, IFRS transition, internal controls, SOX testing, business-process re-engineering, special audits, tax audits, capital-market transactions and financial due diligence. These areas are also reflected in the professional credentials currently associated with the GAMCS/FinSensor team.",
        "Saurabh brings strong technical accounting and assurance expertise combined with practical experience in complex reporting, controls and transaction environments. His role supports organisations in strengthening financial reporting quality, control frameworks and the processes behind them.",
      ],
      expertise: "Ind AS / IFRS · Assurance · Internal Controls · SOX · Financial Reporting · Process Transformation · Due Diligence · Capital Markets",
    },
  ],
  get members() {
    return [...this.leadership, ...this.advisory];
  },
};

/**
 * Client testimonials, in the order the client supplied them.
 *
 * Every quote is reproduced verbatim — not retyped, not trimmed, not
 * repunctuated. Four of the six end without a full stop because that is how
 * they were given to us; adding one would be editing a named person's words.
 *
 * `photo` is the author's own portrait. Each one is mapped to its person from
 * the client's own captions, never inferred from appearance: the section puts
 * a real face against a real name beside the words they said, and getting that
 * pairing wrong is the worst thing this file could do. The section renders
 * them desaturated under a sheen, which is what makes six headshots taken in
 * six different places read as one set. A missing file falls back to the
 * person's initials rather than to nothing.
 *
 * `title` is every author's own, as the client gave it.
 */
export const testimonials = {
  /* NO LONGER VISIBLE (client, 2026-10-21). `achievements.heading` now heads
     this carousel and the figures above it as one band. The string stays and
     is still rendered, screen-reader only, so the carousel keeps a heading in
     the document outline rather than none at all.

     "Testimonials" since 2026-10-22, matching the footer link's new label:
     that link lands on #impact now, at the top of the band, so a reader who
     follows it and then moves by heading reaches this one under the name they
     clicked. The sentence it replaces read better aloud but named the same
     destination with different words. */
  heading: "Testimonials",
  items: [
    {
      name: "Patrick Hughes",
      title: "CFO",
      company: "HungerRush",
      /* The company's mark, named by its FILE in /public/logos/clients — the
         same artwork, already trimmed and weight-solved, that the wall under
         the hero uses. Keyed on the file rather than on `company` because the
         two spellings differ for half of these ("Corestack"/"CoreStack",
         "Basilic Fly Studios"/"Basilic Fly Studio", "Three 6ixty Finance"/
         "Threesixty Finance"), and a match that silently misses would drop a
         logo rather than fail. */
      logo: "hungerrush.png",
      photo: { src: "/testimonials/patrick-hughes.webp", alt: "Portrait of Patrick Hughes" },
      quote:
        "GAMCS supported HungerRush\u2019s FP&A and accounting through a critical phase of our ownership transition. The team established our ARR/MRR reporting logic and cohort models, helped professionalise our monthly close, and supported a smooth handover to our in-house team. Gaurav and Rishi were responsive, thorough, and genuinely invested in getting things right. Their work gave us a strong foundation as we scaled our finance function",
    },
    {
      name: "Tejas Parikh",
      title: "Founder",
      company: "Akshar Business Consulting",
      logo: "akshar.png",
      photo: { src: "/testimonials/tejas-parikh.webp", alt: "Portrait of Tejas Parikh" },
      quote:
        "Working with GAMCS has been an absolute pleasure. The team brings a solutions-first mindset, strong financial acumen, and a clear understanding of what CFOs and senior leaders need. Its ability to build and lead technology-led FP&A teams, navigate constraints, and find practical solutions makes GAMCS a valuable partner for finance leaders focused on automation",
    },
    {
      name: "Gaurav Mehra",
      title: "CFO",
      company: "Basilic Fly Studios",
      logo: "basilic-fly.png",
      photo: { src: "/testimonials/gaurav-mehra.webp", alt: "Portrait of Gaurav Mehra" },
      quote:
        "GAMCS was a trusted FP&A advisor throughout our engagement. The team helped us build robust budgeting and forecasting models and streamline monthly reporting. They brought a proactive, collaborative approach and a strong understanding of our evolving business needs",
    },
    {
      name: "Amol Khedkar",
      title: "Deputy Manager",
      company: "Two Brothers India Farms",
      logo: "two-brothers-new.png",
      photo: { src: "/testimonials/amol-khedkar.webp", alt: "Portrait of Amol Khedkar" },
      quote:
        "GAMCS helped enhance our financial transparency through intuitive dashboards and KPIs. The team has a remarkable ability to distil complex financial data into clear, actionable insights, empowering our teams to make informed, strategic decisions with confidence.",
    },
    {
      name: "Venkata S Santhanaraman",
      title: "CFO",
      company: "Corestack",
      logo: "corestack.png",
      photo: { src: "/testimonials/venkata-santhanaraman.webp", alt: "Portrait of Venkata S Santhanaraman" },
      quote:
        "I had the pleasure of working with GAMCS to develop our FP&A capabilities. The team quickly understood our forecasting models, cost structures, and reporting requirements, translating them into intuitive, scalable tools that streamlined budgeting and reduced manual effort. They anticipated challenges, proposed practical solutions, and remained responsive and open to feedback throughout.",
    },
    {
      name: "Arta Ramaj",
      title: "Founder",
      company: "Three 6ixty Finance",
      logo: "threesixty.png",
      photo: { src: "/testimonials/arta-ramaj.webp", alt: "Portrait of Arta Ramaj" },
      quote:
        "I\u2019ve worked with the GAMCS team for three years and have found them highly capable and dependable. Their financial modelling and technical skills are first-class, and they explain complex work clearly to different audiences. They are collaborative, quick to grasp new challenges, and committed to high-quality delivery. I\u2019d recommend them without hesitation",
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
  /*
   * The paragraph under the lockup. It used to be `intro`, which opens on the
   * combined-years figure and so put a headline number in the footer of every
   * page; the client sent this line for the footer on 2026-10-19. `intro` is
   * unchanged and still carries the <meta> description, the manifest, the
   * Organization schema and the homepage contact lead.
   */
  blurb:
    "We connect finance, data and technology to help businesses understand performance, make better decisions and turn insight into impact.",
  logoAlt: "GA Management Consultants — the GA monogram in blue",
  /* "Resources", not "Company" (client, 2026-10-20): the column under it is
     What clients say, FAQ and Contact Us, while the company pages — Who we
     are, Team, Careers — are in Explore. `solutions` is retired with the
     column it headed. */
  headings: {
    /* `connect` heads the brand column's social and email row. The other
       four head a list of links; this one heads two controls, which is why
       it reads as an invitation rather than as a category (client,
       2026-10-21). */
    connect: "Let's connect",
    /* The column heads three city names, not three postal addresses, so it
       invites rather than labels — the same move "Let's connect" makes above
       it (client, 2026-10-21). The key still says `offices`: it names the
       column's content, which has not changed. */
    offices: "Find us",
    explore: "Explore",
    resources: "Resources",
    legal: "Legal",
  },
  /** RETIRED 2026-10-20 with their columns. */
  retiredHeadings: { company: "Company", solutions: "Solutions" },
  /** The accent link under the address, beside the email. */
  contactLabel: "Contact Us",
  /** Now the accessible name of the LinkedIn tile rather than a text link. */
  linkedinLabel: "LinkedIn",
  cookiePreferences: "Cookie Preferences",
  /*
   * ONE COLUMN of links the footer owns (client, 2026-10-20).
   *
   * The footer used to carry its own nine-link "Explore" list. The Explore
   * column now MIRRORS THE NAVBAR instead, and it does it by reading
   * `header.items` in components/ui/flickering-footer.tsx rather than by
   * repeating the six labels here — a link added to the nav appears in the
   * footer, with the nav's own wording, and the two can never disagree.
   *
   * What is left for this module is the three the navbar does not carry.
   * "What clients say" and "FAQ" were in the old Explore list; "Contact Us"
   * was too, and also sat beside it as a blue accent link.
   *
   * "What clients say" is "Testimonials" since 2026-10-22 and points at
   * /#impact, not /#testimonials: the figures and the quotes are one band
   * under one heading now, and that heading — "Our Impact, Told by the
   * Numbers and Our Clients" — sits on #impact. #testimonials has no visible
   * heading of its own any more, so landing there put a visitor among faces
   * and a quote with nothing naming the section.
   */
  resources: [
    { label: "Testimonials", href: "/#impact" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact Us", href: "/contact" },
  ],
  /** The WHOLE accessible name of the mail tile beside the LinkedIn one.
      It used to label a blue pill whose visible text was the address, so the
      aria-label only had to add the verb; since 2026-10-21 the control is an
      icon tile with no visible text at all, and this string is the only name
      a screen reader gets for it. Keep the address in it. */
  emailCtaLabel: "Email {email}",
  /**
   * RETIRED 2026-10-20, all three. `company` and `explore` were the two
   * columns the nine-link list had been split into the same day; `links` is
   * the undivided list they came from. Nothing renders any of them.
   */
  company: [
    { label: "Who we are", href: "/who-we-are" },
    { label: "Founders & advisors", href: "/team" },
    { label: "Careers", href: "/careers" },
    { label: "Contact Us", href: "/contact" },
  ],
  explore: [
    { label: "Solutions", href: "/solutions" },
    { label: "How we help", href: "/how-we-help" },
    { label: "Case Study", href: "/case-study" },
    { label: "Testimonials", href: "/#impact" },
    { label: "FAQ", href: "/faq" },
  ],
  links: [
    { label: "Who we are", href: "/who-we-are" },
    { label: "Solutions", href: "/solutions" },
    { label: "How we help", href: "/how-we-help" },
    { label: "Case Study", href: "/case-study" },
    { label: "Founders & advisors", href: "/team" },
    { label: "Careers", href: "/careers" },
    { label: "Testimonials", href: "/#impact" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact Us", href: "/contact" },
  ],
  /**
   * RETIRED 2026-10-20: the client had the Solutions column taken out of the
   * footer entirely. KNOWN CONSEQUENCE, accepted: these five pages now have
   * no site-wide link. They stay published and are reached from the /solutions
   * index (in Explore, as the navbar's "What we do") and from the homepage
   * accordion. Putting the column back is this array plus one entry in
   * `groups` in components/ui/flickering-footer.tsx.
   *
   * The five pillar pages, labelled with each pillar's short client name
   * (`solutions[].navLabel`) at the client's request.
   */
  solutions: [
    { label: "Advise", href: "/solutions/fpa-cfo-advisory" },
    { label: "Build", href: "/solutions/finance-team-extension" },
    { label: "Transform", href: "/solutions/digital-transformation" },
    { label: "Transact", href: "/solutions/deal-advisory" },
    { label: "Enable", href: "/solutions/training-enablement" },
  ],
  /**
   * Both are internal pages describing what this build actually does with
   * data (app/privacy-policy, app/cookie-policy).
   *
   * Terms of Use was here too, as the one external link in the footer — it
   * pointed at gamcs.in because its wording could not be transcribed and
   * paraphrased legal copy must not be presented as the company's terms. It
   * has been taken out rather than left pointing off-site.
   */
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
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
 * Every pillar's first block is now its capability groups, restructured from
 * the client's document of 2026-10-19. The pages still do not share one rigid
 * shape past that — Finance Team Extension carries a second list, a build
 * sequence and a numbers strip, Training & Enablement a closing paragraph — so
 * each page is a list of typed blocks rather than a fixed set of fields.
 * ServicePageLayout renders whatever blocks a page declares, in order.
 * =================================================================== */

/**
 * A row's detail, in exactly the three shapes the client's copy arrives in: a
 * sentence of prose (`body`), a flat list of capability names (`items`), or —
 * Transform alone — named sub-headings each carrying their own list
 * (`subheads`). The capability groups take the list forms because the client's
 * copy gives them sub-items, not prose, and inventing a sentence per group
 * would be writing copy nobody approved.
 *
 * A union, not one record of optional fields, because the shape the optional
 * version also permitted was `{ lead }` alone — a row that opens onto nothing.
 * No member here is satisfiable without content, and the non-empty tuples stop
 * `items: []` standing in for it. The one hole TypeScript cannot close is
 * `body: ""`: there is no non-empty-string type, and a template-literal
 * approximation would reject every real sentence or accept the empty one, so
 * emptiness survives only as a literal pair of quotes.
 *
 * Writing a two-level row is unchanged — `{ lead, items: [...] }`, as before.
 * Reading one is `"subheads" in item` / `"items" in item`: presence is the
 * discriminant, so the copy carries no `kind` tag that only the renderer reads.
 */
type Subheading = { lead: string; items: [string, ...string[]] };

export type ListItem =
  | { lead: string; body: string }
  | { lead: string; items: [string, ...string[]] }
  | { lead: string; subheads: [Subheading, ...Subheading[]] };

export type SolutionBlock =
  | { kind: "bullets"; heading: string; items: ListItem[] }
  | { kind: "steps"; heading: string; items: ListItem[] }
  | { kind: "prose"; heading: string; body: string }
  | { kind: "callout"; body: string }
  | { kind: "stats"; heading: string; items: { value: string; label: string }[] }
  /* ponytail: no pillar declares `arms` since Transform was restructured on
     2026-10-19 — this member, ServicePageLayout's branch for it and the
     .service-arms/.service-arm rules in app/globals.css are all unreachable.
     Kept because the retirement is a week old and the two-arm copy is still
     on file under that pillar; delete all three together once the client has
     signed off on the group layout. */
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
    /* The client's pillar name, 2026-10-19. Now the eyebrow above the pillar's
       card (components/sections/PillarBlocks.tsx) and the footer's label for
       it; it headed this pillar's column in the Solutions menu until the
       dropdowns were removed. */
    navLabel: "Advise",
    /* Client copy, 2026-10-20. This is the same sentence as `h1` below, which
       has read it since 2026-10-19 — the homepage accordion, the Solutions hub
       card and the og:title were the three surfaces still on the short form.
       `titleTag` is deliberately NOT changed: that one is the search result's
       own line and is written for it. */
    title: "Strategic Finance, FP&A & CFO Advisory",
    titleTag: "FP&A & CFO Advisory Services for CFOs & CXOs | GAMCS",
    metaDescription:
      "FP&A and CFO advisory — budgeting, forecasting, rolling cash flow models, RevOps forecasting, and board-ready reporting for growth companies and PE portfolios.",
    /* Client copy, 2026-10-19. Rendered as the card heading on /solutions
       and as the H1 of /solutions/fpa-cfo-advisory. */
    h1: "Strategic Finance, FP&A & CFO Advisory",
    intro:
      "Call it FP&A advisory, call it CFO advisory — it's the same seat at the table. If your finance team is still built for controllership and statutory reporting, you already have a strategic gap. Financial statements tell you what happened. This is where you get told what to do about it.",
    /* Client copy, 2026-10-20, and word-for-word the `blurb` this pillar
       already carries in the solutions nav — one sentence, now in both
       places. The full stop is added to match it and the other four
       taglines, all of which close. */
    tagline:
      "Build a finance function that drives the business—not just reports it.",
    problem: {
      label: "The problem we solve",
      body:
        "Month-end close eating 10–15 days. Board packs stitched together the night before. Cash visibility that's stale within a week. Forecasts that don't survive the first bad month.",
    },
    /* Exactly the three capability-group leads below, in order. Three surfaces
       read this array — the detail page's glance list, the homepage accordion
       chips and the Solutions nav column — so keeping it in step with the
       groups is what makes all three name the same three things. */
    atAGlance: [
      "CFO & Strategic Finance Advisory",
      "FP&A & Performance Management",
      "Financial Modelling & Business Planning",
    ],
    blocks: [
      {
        kind: "bullets",
        heading: "What you get",
        /* Client restructure, 2026-10-19 (verbatim). Three capability groups,
           each a plain list of sub-items, replacing the seven prose bullets
           this pillar used to carry. "Modelling" is British on purpose — it is
           the client's spelling. The A/B/C letters in the client's document
           are ordering only and must not render. */
        items: [
          {
            lead: "CFO & Strategic Finance Advisory",
            items: [
              "CFO Advisory & Strategic Decision Support",
              "Finance Strategy & Operating Model",
              "Strategic Planning & Business Performance",
              "Profitability Improvement & Unit Economics",
              "Cash Flow Forecasting & Visibility",
              "Working Capital Management",
              "Board & Investor Reporting",
            ],
          },
          {
            lead: "FP&A & Performance Management",
            items: [
              "Annual Budgeting & Annual Operating Plans (AOP)",
              "Financial Forecasting & Rolling Forecasts",
              "Driver-Based Planning & Scenario Analysis",
              "Budget vs. Actuals & Variance Analysis",
              "KPI Frameworks & Performance Management",
            ],
          },
          {
            lead: "Financial Modelling & Business Planning",
            items: [
              "Integrated Financial Modelling",
              "Business Plans & Long-Range Planning",
              "Revenue, Pricing & Unit Economics Modelling",
              "Sensitivity Analysis & What-If Scenarios",
              "Investment Appraisal & Business Case Modelling",
              "Strategic Decision Modelling",
            ],
          },
        ],
      },
    ],
    /* The seven prose bullets the groups above replaced, retained because the
       new structure silently drops two cross-references the rest of the site
       still assumes — Digital Transformation's Analytics & Warehousing arm, and
       the Excel → Power BI/Tableau → enterprise delivery tiering. Kept as a
       comment rather than as an unused field: a comment is the only form of
       "retained" that cannot accidentally render.
       - CFO-level strategic advisory: a senior finance point of view on what the numbers mean, not just the numbers themselves: what the forecast implies for hiring, runway, pricing, and the next raise.
       - Budgeting, forecasting & rolling models: annual, medium-term, and long-term plans, plus dynamic re-forecasting and 13-week rolling cash flow.
       - Revenue forecasting tied to RevOps: pipeline-driven revenue models built on the same CAC, ROAS, and channel data your dashboards already track, so sales and finance forecast off one number, not two (see Digital Transformation's Analytics & Warehousing arm).
       - Accelerated month-end close & real-time visibility: faster close cycles and management reporting that's current, not three weeks stale. (Day-to-day bookkeeping and close execution runs through Finance Team Extension; this is where it becomes forward-looking analysis.)
       - Scenario & sensitivity analysis: best/base/worst-case modeling for the decisions that matter.
       - Variance analysis with real commentary: line-item packs that explain why, built for boards and lenders.
       - A delivery model matched to your stage: Excel-based FP&A live in 2–3 weeks for early-stage teams; Power BI/Tableau-driven planning for growth-stage; full enterprise FP&A for mature and PE-backed platforms (see Digital Transformation if you need the platform stood up first). */
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
    /* Client pillar name, 2026-10-19 — the short form, as for Advise. The
       pillar's `title` is still "Finance Team Extension": that is what the
       homepage accordion and the title tag print, and the client restructured
       the pillar's contents, not its name. */
    navLabel: "Build",
    /* Client copy, 2026-10-20 — the pillar's own `h1` below, which has read
       this since 2026-10-19. Same move as the Advise pillar: the accordion,
       the Solutions hub card and the og:title were the surfaces still on the
       short form. `titleTag` stays as written for search. */
    title: "Finance Managed Services & Workforce Solutions",
    titleTag: "Finance Staffing, Offshoring & Centers of Excellence for PE/VC | GAMCS",
    metaDescription:
      "Finance team extension: staffing, Employer of Record, offshoring, and CoE or GCC builds — embedded finance teams for PE/VC portfolios and advisory firms.",
    /* Client copy, 2026-10-19. The card heading on /solutions and the H1 of
       /solutions/finance-team-extension. */
    h1: "Finance Managed Services & Workforce Solutions",
    intro:
      "Most PE and VC portfolios have reporting. Very few have strategic FP&A depth, or a consistent way to add finance capacity as they grow. Each portfolio company runs a different ERP, a different chart of accounts, and different KPI definitions — so comparing performance across the fund becomes a manual reconciliation exercise every quarter, and every headcount decision starts from scratch.",
    tagline:
      "Build, extend or operate the finance capability you need—without scaling overhead.",
    problem: {
      label: "Our answer",
      body:
        "We extend your finance team however that's actually needed — staff augmentation, Employer of Record (EoR), full offshoring or outsourcing of a function, or a dedicated, standardized Center of Excellence / Global Capability Center (GCC) — embedded in your (or your portfolio companies') finance operations and standardized around one methodology, so your investment committee finally gets an apples-to-apples view across the fund.",
    },
    /* The three capability-group leads below, in order — same contract as
       Advise: the glance list, the accordion chips and the nav column all read
       this array, so it is what makes the three surfaces name one set. */
    atAGlance: [
      "Finance Workforce Solutions",
      "Managed Finance Services",
      "Finance Operating Models",
    ],
    blocks: [
      {
        kind: "bullets",
        /* Not restructured: the client gave new contents for this block, not a
           new heading for it, and "Finance Team Extension" is still this
           pillar's `title`. */
        heading: "What Finance Team Extension looks like",
        /* Client restructure, 2026-10-19 (verbatim). Three capability groups
           replacing the four prose bullets retained below. British spellings
           (Optimisation, Standardisation) and every parenthetical — (EoR),
           (AP), (AR), (CoE), (GCC) — are the client's. The A/B/C letters in
           their document are ordering only and must not render. */
        items: [
          {
            lead: "Finance Workforce Solutions",
            items: [
              "Team Extension & Staff Augmentation",
              "Employer of Record (EoR) & Employment Solutions",
              "Specialist Finance Resource Deployment",
              "Offshore Finance Teams",
            ],
          },
          {
            lead: "Managed Finance Services",
            items: [
              "Finance & Accounting Outsourcing",
              "FP&A Managed Services",
              "Month-End Close & Financial Reporting Support",
              "Accounting & Bookkeeping",
              "Financial Consolidation",
              "Accounts Payable (AP) & Accounts Receivable (AR) Support",
            ],
          },
          {
            lead: "Finance Operating Models",
            items: [
              "Finance Centres of Excellence (CoE)",
              "Global Capability Centre (GCC) Setup & Support",
              "Offshore Finance Operating Models",
              "Finance Process Standardisation & Documentation",
              "Finance Operations Optimisation",
            ],
          },
        ],
      },
      /* Retained, rendered nowhere. The four prose bullets the groups above
         replaced, and the client's own "Our approach" sentence, which they
         asked to keep on file without publishing. A block comment is the only
         form of "retained" that cannot accidentally reach a page — an unused
         field is one `.map` away from rendering.
         - Staffing & staff augmentation: dedicated finance and analytics professionals who plug directly into your existing team and reporting lines, scaled up or down as the engagement needs.
         - Employer of Record (EoR): hire the person you want, wherever they are, without standing up a local entity yourself.
         - Offshoring & outsourcing of functions: hand off an entire function (accounting, bookkeeping, close, reporting) to a dedicated offshore team, not just individual seats.
         - Centers of Excellence (CoE) & GCC builds: a full, standardized finance, analytics, and automation capability center, run to one methodology across every entity or portfolio company it serves.
         Our approach: Provide flexible finance talent, managed execution and scalable operating models—from a single specialist to a dedicated finance team or Centre of Excellence. */
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
    navLabel: "Transform",
    title: "Digital Finance Transformation",
    titleTag: "Digital Transformation for Finance | ERP, CRM, FP&A Tools & Analytics | GAMCS",
    metaDescription:
      "Digital transformation for finance: ERP, CRM, and FP&A platform implementation, in-house Finsensor AI software, data warehousing, and real-time BI dashboards.",
    /* Client copy, 2026-10-19. The two-arm presentation this pillar led with
       is retired below, so the H1 no longer announces two arms. `intro` is
       unchanged by the client's instruction and still names the two halves
       "Tools" and "Analytics & Warehousing" — the groups below are the same
       two halves under the names the client now uses for them. */
    h1: "Digital Finance Transformation",
    intro:
      "Buying enterprise software solves nothing on its own, and a dashboard is only as good as the data feeding it. Digital Transformation covers both halves of that problem: Tools — implementing the ERP, CRM, and FP&A platforms your business actually runs on — and Analytics & Warehousing — turning the data those platforms produce into real-time dashboards and decision intelligence. We're platform-agnostic on the third-party side, and we also build our own, in-house, through our Finsensor AI software.",
    tagline:
      "Connect systems, data and technology to transform how finance works.",
    atAGlance: ["Technology & Platforms", "Data, Analytics & Intelligence"],
    blocks: [
      {
        kind: "bullets",
        /* "What you get" is Advise's and Transact's heading for the same block;
           the retired two-arm layout carried no heading of its own, so this
           reuses an approved string rather than inventing a sixth one. */
        heading: "What you get",
        /* Client restructure, 2026-10-19 (verbatim). The only pillar whose copy
           has three levels: two capability groups, each a set of sub-headings,
           each of those a list of platforms or capabilities. British spellings
           (Optimisation, Modelling, Visualisation) are the client's, as is
           "FinSensor AI" with a capital S — the older "Finsensor" spelling
           survives in this pillar's `intro` and `metaDescription`, which the
           client left unchanged. The A/B/C letters and 1./2./3. numbers in
           their document are ordering only and must not render. */
        items: [
          {
            lead: "Technology & Platforms",
            subheads: [
              {
                lead: "ERP Selection, Implementation & Optimisation",
                items: ["Oracle NetSuite", "Oracle Fusion", "SAP", "Odoo", "Zoho"],
              },
              {
                lead: "CRM Implementation & Integration",
                items: ["Salesforce"],
              },
              {
                lead: "FP&A / Enterprise Performance Management (EPM) Platforms",
                items: ["Anaplan", "Aimplan", "Jedox", "Prophix", "Pigment", "Vena"],
              },
              {
                lead: "Finance Technology & Systems",
                items: [
                  "Finance Systems Integration",
                  "ERP / CRM / FP&A Platform Integration",
                  "Finance Process Automation",
                  "Proprietary Finance Technology — FinSensor AI",
                ],
              },
            ],
          },
          {
            lead: "Data, Analytics & Intelligence",
            subheads: [
              {
                lead: "Data Foundation",
                items: [
                  "Data Engineering & Warehousing",
                  "Data Integration & Modelling",
                  "Data Pipeline Automation",
                  "Data Quality & Governance",
                ],
              },
              {
                lead: "Business Intelligence & Reporting",
                items: [
                  "Power BI & Tableau Dashboards",
                  "Executive & Management Dashboards",
                  "Management Reporting Automation",
                  "KPI Frameworks & Performance Visualisation",
                ],
              },
              {
                lead: "Advanced Analytics",
                items: [
                  "Revenue & Customer Analytics",
                  "Profitability & Cost Analytics",
                  "Operational & Spend Analytics",
                  "Working Capital Analytics",
                  "Scenario & Driver Analysis",
                ],
              },
              {
                lead: "AI & Decision Intelligence",
                items: [
                  "AI-Enabled Finance",
                  "Anomaly Detection & Intelligent Alerts",
                  "Predictive Analytics & Forecasting",
                  "Automated Commentary & Reporting Insights",
                  "Decision Support & Performance Intelligence",
                ],
              },
            ],
          },
        ],
      },
      /* Retained, rendered nowhere. The whole two-arm presentation this pillar
         led with — the "arms" block's badges, arm intros, its 13 bullets and
         its platform-agnostic callout — plus the client's own "Our approach"
         sentence, which they asked to keep on file without publishing. The
         groups above are the same two halves of the pillar under the names the
         client now uses. A block comment is the only form of "retained" that
         cannot accidentally reach a page.

         Arm 1 — Tools
         Third-party platforms, implemented by people who actually use them — not just sell them. Half the value of an ERP, CRM, or FP&A platform gets lost in a bad implementation — a chart of accounts that doesn't match how you actually run the business, a CRM nobody trained the sales team to use, or a forecasting tool configured for data entry instead of real planning. We're platform-agnostic on purpose: we implement whatever's right for your business, not the tool we happen to have a reseller relationship with.
         - ERP Implementation & Optimization: Oracle NetSuite, Oracle Fusion, Odoo, Zoho, SAP, QuickBooks, and others, configured around your actual chart of accounts and reporting needs.
         - CRM Implementation: primarily Salesforce, configured so your revenue and pipeline data actually connects to your financial reporting — the foundation for RevOps and revenue analytics, not just a system of record for sales.
         - FP&A Platform Implementation: Anaplan, Aimplan, Jedox, Prophix, Pigment, Vena, Unit4, PivotXL, and beyond. If your team already has a preferred platform, we work in it.
         - Our own in-house software — Finsensor AI: where a third-party platform doesn't fit, we bring our own purpose-built finance software, developed in-house rather than licensed off the shelf.
         - Custom Software Development: when no off-the-shelf tool fits the gap, we build bespoke tools instead of forcing a workaround.
         - Post-Go-Live Support: we don't disappear after go-live; ongoing optimization and troubleshooting as your usage — and your business — matures.
         Callout: Platform-agnostic, on purpose. We don't have a reseller margin riding on which system you choose — our incentive is that it works for you, not that you buy a specific license.

         Arm 2 — Analytics & Warehousing
         Real-time dashboards that replace the manual board deck. Financial statements are backward-looking by definition. By the time a problem shows up in the P&L, the window to act on it has already closed. This is where that gap closes.
         - Data Warehousing & Cloud Infrastructure: Azure, AWS, and Google Cloud/Microsoft Fabric foundations, so the analytics layer on top has clean, reliable data to work from.
         - Real-time interactive dashboards: Power BI and Tableau, connected directly to your ERP, CRM, and HR systems, refreshing automatically.
         - RevOps & revenue analytics: CAC, ROAS, pipeline velocity, and channel-level revenue attribution that give sales, marketing, and finance one shared view of revenue performance.
         - Operational analytics tied to the P&L: project/customer profitability, utilization and cohort analysis, retention and LTV.
         - Stakeholder & board reporting: board decks, investor updates, and lender/covenant tracking generated automatically instead of assembled by hand every cycle.
         - KPI tracking & benchmarking: balanced scorecards, OKRs, and industry benchmarking.
         - AI built in, not bolted on: anomaly detection, predictive cash-stress modeling (4–8 week liquidity forecasts), and automated commentary baked into every dashboard from day one, cutting manual analysis time by roughly 70%.

         Our approach: Connect systems, integrate data, automate reporting and apply analytics and AI to help finance move from collecting information to generating actionable intelligence.

         The two arm headings carried id="tools" and id="analytics", the fragment
         targets of two permanent redirects in next.config.mjs (lines 20–21).
         Nothing on the page has those ids now, so those two retired URLs land
         at the top of this page instead of at the matching half. */
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
    navLabel: "Transact",
    title: "Transactions & Capital Advisory",
    titleTag: "Deal Advisory | M&A, IPO Advisory, Due Diligence & Debt Refinancing | GAMCS",
    metaDescription:
      "Deal advisory for CFOs, PE, and VC-backed companies — M&A, buy-side and sell-side due diligence, IPO readiness, debt refinancing, and investor/pitch decks.",
    /* Client copy, 2026-10-19. Their document has a stray leading space
       before this line; it is not copy, so it is stripped. */
    h1: "Transactions & Capital Advisory",
    intro:
      "The worst time to discover a gap in your financials is during due diligence, when a buyer, investor, or lead underwriter is already asking the hard questions. Most companies find out their numbers aren't deal-ready exactly when it matters most — mid-transaction, under time pressure, with leverage already shifting away from them.",
    tagline: "Make your numbers ready for the moments that matter.",
    atAGlance: [
      "Transaction Advisory",
      "Capital Advisory",
      "Financial & Deal Readiness",
    ],
    blocks: [
      {
        kind: "bullets",
        heading: "What you get",
        /* Client restructure, 2026-10-19 (verbatim). Three capability groups
           replacing the six prose bullets retained below. British "Modelling"
           and every parenthetical — (FDD), (M&A) — are the client's. The A/B/C
           letters in their document are ordering only and must not render. */
        items: [
          {
            lead: "Transaction Advisory",
            items: [
              "Financial Due Diligence (FDD)",
              "Buy-Side & Sell-Side Transaction Support",
              "Quality of Earnings Analysis",
              "Mergers & Acquisitions (M&A) Support",
              "Transaction Financial Modelling",
              "Financial Performance & Deal Analysis",
              "Transaction Readiness Support",
            ],
          },
          {
            lead: "Capital Advisory",
            items: [
              "IPO Readiness & Advisory",
              "Fundraising Support",
              "Investor Presentations & Financial Materials",
              "Financial Modelling for Fundraising",
              "Refinancing Support",
              "Capital Structure & Financing Analysis",
            ],
          },
          {
            lead: "Financial & Deal Readiness",
            items: [
              "Financial Reporting Readiness",
              "Business Plan & Valuation Modelling",
              "Investor Reporting Support",
              "Financial Analysis for Strategic Transactions",
              "Post-Transaction Financial Integration Support",
            ],
          },
        ],
      },
      /* Retained, rendered nowhere. The six prose bullets the groups above
         replaced, and the client's own "Our approach" sentence, which they
         asked to keep on file without publishing.
         - M&A Advisory: buy-side and sell-side support through diligence, negotiation, and close, from a team that's actually built the models, not just reviewed them.
         - Due Diligence & DD Support: financial due diligence, quality of earnings (QoE) and quality of assets (QoA) analysis, risk assessment, and legal/compliance reviews.
         - Fundraise & Exit Readiness: getting your financial house in order before you're in a data room: clean historicals, defensible forecasts, and a management pack that survives real scrutiny.
         - Investor & Pitch Deck Preparation: the actual decks — fundraise pitch decks, investor updates, and board presentation materials — built on numbers your own diligence-ready models can defend.
         - Debt Refinancing Advisory: preparing the financial package and providing negotiation support for a refinancing, so lenders see the same clean, defensible numbers a PE buyer or IPO underwriter would.
         - IPO Advisory: readiness assessments and reporting infrastructure built to the standard public-market investors and regulators expect.
         Our approach: Strengthen financial analysis, reporting and transaction preparation so businesses and investors can approach critical capital and ownership events with greater confidence. */
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
    navLabel: "Enable",
    title: "Finance Capability Building & Enablement",
    titleTag: "Finance Training & Corporate Enablement | FP&A, Tableau & More | GAMCS",
    metaDescription:
      "Training and enablement: corporate FP&A, modelling, Tableau, ESG, and analytics training, public MasterClasses via Thinking Bridge, and an FPI affiliation.",
    h1: "Finance Capability Building & Enablement",
    intro:
      "Not every engagement should end with a dependency on us. Sometimes the highest-value thing we can do is train your existing finance team to run the models, dashboards, and frameworks themselves — and beyond client engagements, we teach this publicly too.",
    /* "Positioning:" led this line in the brief. That is the client's own
       label for the slot, not copy, so it is not published. */
    tagline: "Build the capability to sustain transformation.",
    atAGlance: ["Corporate Finance Training", "Finance Function Enablement"],
    blocks: [
      {
        kind: "bullets",
        heading: "Corporate training & enablement",
        /* Client restructure, 2026-10-19 (verbatim). Two capability groups
           replacing the five prose bullets retained below. British "Modelling"
           is the client's. The A/B/C letters in their document are ordering
           only and must not render. */
        items: [
          {
            lead: "Corporate Finance Training",
            items: [
              "FP&A & Financial Planning",
              "Financial Modelling & Business Valuation",
              "Budgeting, Forecasting & Scenario Planning",
              "Power BI & Tableau for Finance",
              "AI & Automation for Finance",
              "Finance Business Partnering",
              "Management Reporting & Performance Analysis",
            ],
          },
          {
            lead: "Finance Function Enablement",
            items: [
              "Finance Capability Assessment",
              "Finance Process Design & SOP Development",
              "Finance Team Upskilling",
              "FP&A Operating Model & Ways of Working",
              "Finance Systems & Tool Adoption",
              "Change Management & Transformation Enablement",
              "Finance Playbooks & Standard Operating Procedures",
            ],
          },
        ],
      },
      /* Retained, rendered nowhere. The five prose bullets the groups above
         replaced, and the client's own "Our approach" sentence, which they
         asked to keep on file without publishing.
         - FP&A Training: practical, hands-on training in budgeting, forecasting, and variance analysis frameworks your team can run independently.
         - Financial Modelling Training: building bespoke, audit-ready models from scratch, not just filling in templates.
         - ESG Training: reporting frameworks and metrics for teams building out ESG capability for the first time.
         - Tool-Based Finance Training: hands-on enablement in whichever platform you're actually running (often paired with a Digital Transformation engagement).
         - Data Analytics for Finance Professionals: SQL and Python fundamentals aimed specifically at finance teams, not generic data science courses.
         Our approach: Equip finance professionals and teams with the skills, processes and tools needed to strengthen finance capabilities, embed new ways of working and sustain long-term transformation. */
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
  h1: "Solutions Built for Every Stage of Finance.",
  /* `previews[].talkLabel` is each card's button on the hub: the card sends a
     visitor to a conversation, and the pillar's own page stays one click away
     in the footer. */
  /* Same sentence, split so the trailing phrase can carry the accent tint.
     Kept alongside `h1` because the metadata title still wants it whole.
     The hub page sets `h1` whole, at display size over three lines; the
     split is what the older head band used. */
  h1Lead: "Solutions Built for Every Stage of the",
  h1Accent: "Finance Maturity Curve",
  /* Each pillar's button on the hub. The hub's cards send a visitor to a
     conversation rather than to the pillar's own page, which the header's
     Solutions menu and the footer both still link. */
  talk: {
    "fpa-cfo-advisory": "Talk to an FP&A specialist",
    "finance-team-extension": "Talk to us about your team",
    "digital-transformation": "Talk to a transformation specialist",
    "deal-advisory": "Talk to a deal specialist",
    "training-enablement": "Talk to a training specialist",
  } as Record<string, string>,
  subhead:
    "From your first forecast to a fully embedded offshore team to getting deal-ready for a raise, refinancing, or exit — start where you are, and scale as you grow.",
  previews: [
    { slug: "fpa-cfo-advisory", blurb: "Build a finance function that drives the business\u2014not just reports it.", linkLabel: "Explore FP&A & CFO Advisory", talkLabel: "Talk to an FP&A specialist" },
    { slug: "finance-team-extension", blurb: "Build, extend or operate the finance capability you need\u2014without scaling overhead.", linkLabel: "Explore Finance Team Extension", talkLabel: "Talk to us about your team" },
    { slug: "digital-transformation", blurb: "Connect systems, data and technology to transform how finance works.", linkLabel: "Explore Digital Transformation", talkLabel: "Talk to a transformation specialist" },
    { slug: "deal-advisory", blurb: "Make your numbers ready for the moments that matter.", linkLabel: "Explore Deal Advisory", talkLabel: "Talk to a deal specialist" },
    { slug: "training-enablement", blurb: "Build the capability to sustain transformation.", linkLabel: "Explore Training & Enablement", talkLabel: "Talk to a training specialist" },
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
 * WHAT THE APPROVED DESIGN RENDERS: `eyebrow`, `heading` + `headingAccent`,
 * `lead`, `narrative` as the pill, `caveat` as the closing framework note,
 * `cta`, and per stage `n`, `name`, `cardQuestion` and `tag` on the card,
 * then `question`, `description` and the three `blocks` in the panel.
 *
 * WHAT IS RETAINED BUT UNRENDERED: the CFO-dashboard payload (`visual` and
 * the `files` / `pack` / `drill` / `explain` / `board` object it narrows,
 * plus `metrics`, `labels` and `illustrative`), the capability `tags`, the
 * compact tab label `short`, and `hint`, `axis`, `nextHeading`
 * and `close`. components/sections/MaturityVisuals.tsx, which draws them, is
 * retained with it. None of this is rot: the redesign dropped the visuals,
 * and the client asked that the copy and the code behind them survive it, so
 * whoever brings them back does not have to re-source or rebuild them.
 *
 * `tag` is stored in sentence case and uppercased by the stylesheet, as
 * `eyebrow` is — this module holds words, CSS holds their casing.
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
  /* No longer printed over the heading — the client had the eyebrow removed
     on 2026-10-20 — but still the accessible name of the stage tablist, which
     has no visible label of its own. Not retired copy: a screen reader reads
     this, so it keeps its manifest row. */
  eyebrow: "The Finance Intelligence Maturity Curve",
  /* Re-split 2026-10-21 so the blue falls on "finance function today" rather
     than on "function today?". Three pieces, because the mark sits in the
     MIDDLE of the sentence. The question mark was briefly left outside the
     tint and is now inside it at the client's word, so `headingTail` renders
     within the same span as `headingMark` — see MaturityCurve.tsx. It stays
     its own string because the copy deck has a row for it. No space between
     the two: they are one phrase. */
  headingLead: "Where is your",
  headingMark: "finance function today",
  headingTail: "?",
  /** RETIRED 2026-10-21: the two-piece split, whose accent was the tail. */
  heading: "Where is your finance",
  headingAccent: "function today?",
  lead:
    "Finance maturity isn't just about closing faster or using more technology. It is about how reliably you produce the numbers, how clearly you explain performance, and how effectively insight shapes decisions.",
  hint: "Select a stage to explore what it looks like, the outcome to aim for, and the next practical move.",
  /** Repeated under every panel that shows a number. */
  illustrative: "Illustrative example — not a real client figure.",
  /** UNRENDERED since 2026-10-20: the client had the framework note taken
      off the section. Kept because they ask for retired copy to be retained. */
  caveat:
    "Finance maturity can vary across processes and business units. This curve is an indicative framework, not an audit or an industry benchmark.",
  /** The two ends of the rising rail above the tabs. */
  axis: { start: "Financial control", end: "Decision-led finance" },
  /** UNRENDERED since 2026-10-20: the client had the pill taken off the
      section. Kept because they ask for retired copy to be retained. */
  narrative: "Five stages. One direction: from financial control to decision-led finance.",
  /** Over the bridge to the next stage, which used to repeat the stage name. */
  nextHeading: "The next move",
  /** Over the panel headline. {n} is the stage number. */
  stageLabel: "Stage {n}",
  /** The section's one call to action, below the panel. */
  close: {
    heading: "Ready to move up the curve?",
    body:
      "We help finance functions move from reporting and consolidation to connected data, forward-looking insight and continuous decision support.",
    link: "Assess Your Finance Maturity",
    /** The self-assessment's own route, not a section of this page. */
    href: "/finance-maturity",
  },
  /** The CTA band the redesign renders, below the panel. It supersedes
      `close` above, which is kept only because the client asked for retired
      copy to be retained. Same destination, different words. */
  cta: {
    heading: "Get a clearer view of your finance maturity.",
    body:
      "Answer eight practical questions to receive an indicative maturity stage, a breakdown of your strengths and gaps, and a suggested next step. No industry-specific metrics or systems required.",
    label: "Take the 2-minute assessment",
    href: "/finance-maturity",
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
      name: "Finance Foundation",
      short: "Foundation",
      tag: "Stabilise",
      question: "Can we close reliably?",
      /* Stage 01 is the one stage whose card question and panel question are
         the same sentence; the other four shorten. The repetition is the
         mockup's, not a slip. */
      cardQuestion: "Can we close reliably?",
      description:
        "Processes and responsibilities are undocumented or inconsistently followed. Reconciliations depend on manual follow-up, and close timelines are difficult to predict.",
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
      blocks: [
        {
          label: "What this stage looks like",
          body:
            "Ownership varies, close deadlines move, and recurring tasks depend heavily on individual knowledge.",
        },
        {
          label: "The outcome to aim for",
          body:
            "A controlled, repeatable close with clear owners, agreed deadlines, documented procedures and appropriate checks.",
        },
        {
          label: "The next move",
          body:
            "Document core processes, assign owners, establish a close calendar and build a consistent reconciliation routine.",
        },
      ],
    },
    {
      n: "02",
      name: "Management Reporting",
      short: "Reporting",
      tag: "Report",
      question: "Do we know how the business performed?",
      cardQuestion: "How did we perform?",
      description:
        "The books close on an agreed timetable, but producing the management information pack, comparing actuals with budget and explaining variances still takes time and effort.",
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
      blocks: [
        {
          label: "What this stage looks like",
          body:
            "A monthly pack exists, but data has to be collected, combined, checked and explained manually.",
        },
        {
          label: "The outcome to aim for",
          body:
            "A consistent management pack with clear KPIs, budget-versus-actual analysis and a regular performance review.",
        },
        {
          label: "The next move",
          body:
            "Standardise the reporting pack, KPI definitions, data sources and management review process.",
        },
      ],
    },
    {
      n: "03",
      name: "Automated Reporting",
      short: "Automated",
      tag: "Automate",
      question: "Can we produce reports without rebuilding them every month?",
      cardQuestion: "Can we stop rebuilding it?",
      description:
        "Recurring reports and dashboards refresh with minimal manual preparation. Finance spends less time collecting and assembling information—but automation alone does not explain why performance moved.",
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
      blocks: [
        {
          label: "What this stage looks like",
          body:
            "Reporting logic is repeatable, data refreshes are automated where practical, and the team spends less time copying and reconciling data.",
        },
        {
          label: "The outcome to aim for",
          body:
            "Timely, consistent reporting produced with minimal routine effort, providing a reliable base for deeper analysis.",
        },
        {
          label: "The next move",
          body:
            "Connect financial results to relevant operational and commercial information so the business drivers become clearer.",
        },
      ],
    },
    {
      n: "04",
      name: "Performance Insight",
      /* The compact tab label below 1024px, where this tab leaves 65px for
         text at 360: "Decision intel." wrapped to two lines there, while
         "Continuous", the widest short label, is 55.8px and stays on one. */
      short: "Insight",
      tag: "Explain",
      question: "Do we understand why performance changed?",
      cardQuestion: "Why did performance change?",
      description:
        "Financial results are connected to relevant operational and commercial context. The team can explain the drivers behind performance, evaluate scenarios and anticipate likely outcomes.",
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
      blocks: [
        {
          label: "What this stage looks like",
          body:
            "Revenue, margin, cost and cash movements can be traced to business drivers—not just described as variances.",
        },
        {
          label: "The outcome to aim for",
          body:
            "A finance function that can explain not just what changed, but why it changed and what may happen next.",
        },
        {
          label: "The next move",
          body:
            "Embed insights into management reviews, connect forecasts to business decisions, and assign clear ownership to actions.",
        },
      ],
    },
    {
      n: "05",
      name: "Decision-Led Finance",
      short: "Decision-led",
      tag: "Decide & improve",
      question: "Do insights translate into action and impact?",
      cardQuestion: "Did insight make a difference?",
      description:
        "Insights are embedded in management and board conversations. Decisions have owners and expected outcomes; progress is tracked, and lessons feed into future plans.",
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
      blocks: [
        {
          label: "What this stage looks like",
          body:
            "Conversations focus on choices, trade-offs, risks and opportunities. Action and impact are reviewed, not assumed.",
        },
        {
          label: "The outcome",
          body:
            "Finance becomes a strategic partner, connecting trusted numbers and meaningful insight with decisions, action and measurable impact.",
        },
        {
          label: "The ongoing priority",
          body:
            "Keep the loop moving: measure outcomes, learn from results and feed those lessons into the next forecast and plan.",
        },
      ],
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
 * Order is two rows of eleven, paired by width: the two marks in a column are
 * near enough the same width that the columns read as columns, which is the
 * only way two rows of a ragged roster line up. Wide and narrow columns then
 * alternate across the wall so no stretch of it reads heavy, and the two rows
 * come out within 4px of each other on total ink width. The three advisory
 * firms keep the last three slots, as they have since 2026-09-22.
 *
 * `tile` marks a logo that keeps a solid brand panel behind it. Only GX Group
 * still does: its monogram is white and exists only against that orange.
 *
 * `h` and `mw` are the mark's two ceilings in px, solved rather than guessed.
 *
 * Equal ink area alone was the wrong rule. It balances weight, but it works
 * against legibility: a mark carrying three lines of type, like Akshar, has
 * high ink density, so equalising ink made it SMALL — when density is exactly
 * what needs more room to be read. Equal bounding-box area has the opposite
 * fault, blowing up sparse marks.
 *
 * Each height is the geometric mean of the two, capped at 56px. The result is
 * even to within 0.88-1.11x of the median mark's ink, and these numbers are
 * fixed: the wall was re-laid from three rows to two without touching a single
 * one of them, because the columns size themselves to the marks rather than
 * the marks to the columns.
 *
 * Basilic Fly, Two Brothers and Cumin Co. used to be panels too. Their artwork
 * was lifted off the tile by solving the blend for each pixel's coverage, then
 * anything that would have been invisible on white was repainted in the tile's
 * own colour — Two Brothers' cream type became its green, Basilic Fly's white
 * type became its navy. Artwork that already read on white kept its real
 * colour: Cumin Co.'s terracotta, and Basilic Fly's blue dragonfly.
 *
 * One of Us is the same problem in reverse. The only clean file the studio
 * publishes is white-on-transparent, for their own black site; on this white
 * band it is invisible. Their header PNG, the obvious alternative, is cropped
 * into the letterforms — its leading "o" loses a fifth of its bowl — so the
 * white artwork is the one that was taken, and its alpha repainted #1A1A1A.
 * Nothing was redrawn: both bowls measure 97 and 96px square in the source.
 * It was then padded to the family's convention — every other file here sits
 * its mark on 91% of the box's width and 83% of its height — because a raw
 * tight crop reads as 2.2x the density of its neighbours and the solve answers
 * that by shrinking it. Padded, the same rule puts it at 1.01x the median.
 */
export const clients = {
  /* Three pieces so the middle one can take the accent tint (client,
     2026-10-21), the same shape `howWeHelp` and `maturityCurve` use for
     their headings. Words unchanged; only the split is new. */
  headingLead: "Trusted by",
  headingAccent: "growth-focused businesses",
  headingTail: "across the world.",
  /** RETIRED 2026-10-21: the undivided line the three above replace. */
  heading: "Trusted by growth-focused businesses across the world.",
  sub: "From high growth startups to established businesses, we partner with organisations across sectors and geographies.",
  logos: [
    /* row 1 */
    { name: "Edulog", file: "edulog.png", h: 27, mw: 114 },
    { name: "Two Brothers India Farms", file: "two-brothers-new.png", h: 31, mw: 62 },
    { name: "NewRocket", file: "newrocket.png", h: 24, mw: 104 },
    { name: "Jupiter Group", file: "jupiter-group.png", h: 47, mw: 54 },
    { name: "HungerRush", file: "hungerrush.png", h: 39, mw: 91 },
    { name: "Caribbean CAGE", file: "caribbean-cage.png", h: 34, mw: 36 },
    { name: "ProcDNA", file: "procdna.png", h: 42, mw: 70 },
    { name: "WWF", file: "wwf.png", h: 38, mw: 29 },
    { name: "SkyNet Worldwide Express", file: "skynet.png", h: 23, mw: 71 },
    { name: "BetterCloud", file: "bettercloud.png", h: 29, mw: 85 },
    { name: "Cumin Co.", file: "cumin-co.png", h: 43, mw: 82 },
    /* row 2 */
    { name: "CoreStack", file: "corestack.png", h: 22, mw: 105 },
    { name: "Basilic Fly Studio", file: "basilic-fly.png", h: 56, mw: 64 },
    { name: "Passionfruit", file: "passionfruit.png", h: 27, mw: 100 },
    { name: "Rakhi Motion Pictures", file: "rakhi-motion-pictures.png", h: 35, mw: 61 },
    { name: "One of Us", file: "one-of-us.png", h: 16, mw: 88 },
    { name: "The Park Hotels", file: "the-park-hotels.png", h: 32, mw: 42 },
    { name: "CBC Group", file: "cbc-group.png", h: 34, mw: 70 },
    { name: "GX Group", file: "gx-group.png", tile: true, h: 28, mw: 30 },
    { name: "Akshar Business Consulting", file: "akshar.png", h: 24, mw: 78 },
    { name: "Threesixty Finance", file: "threesixty.png", h: 26, mw: 88 },
    { name: "CFO Bridge", file: "cfo-bridge.png", h: 26, mw: 77 },
  ] as { name: string; file: string; tile?: boolean; h: number; mw: number }[],
} as const;

/**
 * The decision gap — a static problem statement. It names the problem and
 * does not answer it: the closing question hands the distance to the Maturity
 * Curve section below.
 *
 * There is no diagram and no motion here by design; the weight comes from the
 * typography, the four symptoms and the sourced figures.
 *
 * Every `stats` figure was checked against its cited page before shipping.
 * `sample` is the respondent count the source itself states, and it is not
 * decoration: "47%" with no sample behind it is a number, not evidence. The
 * 57% line carries "in the last six months" because Intuit's own wording is
 * bounded that way — without it the claim is broader than the survey.
 */
export const decisionGap = {
  headingLead: "Between the numbers and the decision,",
  /** Flows inline after the lead, mid-sentence, in --blue. */
  headingAccent: "too much gets lost.",
  /* Client's rewrite, 2026-10-21. Two changes: the second and third
     sentences are joined with a semicolon, and the two em dashes around
     "or the actions they call for" are spaced hyphens, as the client
     typed them. */
  lead: "Finance functions get stuck at different points. For some, the close is unpredictable; for others, preparing reports takes days. Even when the numbers are ready, the reasons behind them - or the actions they call for - may not be clear.",
  /*
   * The same sentence, split so four phrases can take the red mark the
   * client asked for (2026-10-21). `lead` above is the plain string and is
   * kept as the one source of the WORDS: concatenating `t` across this array
   * reproduces it character for character, and scripts/copy/check.mjs reads
   * `lead`. If the sentence is reworded, change `lead` and re-split.
   *
   * `mark` is emphasis, not information: every phrase still reads in order
   * with the colour off, so nothing here depends on seeing red (WCAG 1.4.1).
   */
  leadParts: [
    { t: "Finance functions get stuck at different points. For some, the " },
    { t: "close is unpredictable", mark: true },
    { t: "; for others, " },
    { t: "preparing reports takes days", mark: true },
    { t: ". Even when the numbers are ready, " },
    { t: "the reasons behind them", mark: true },
    { t: " - or the actions they call for - " },
    { t: "may not be clear", mark: true },
    { t: "." },
  ] as { t: string; mark?: boolean }[],
  /** Four symptoms, numbered 01-04 by CSS counter rather than by markup. */
  pains: [
    {
      title: "The close is unpredictable",
      body: "Processes, responsibilities and timelines are unclear. Teams chase inputs, resolve discrepancies and rely on individual effort to get the books closed.",
    },
    {
      title: "Reporting takes too long",
      body: "The books are closed, but the management information pack still needs to be assembled, reconciled and reviewed manually before management can use it.",
    },
    {
      title: "The numbers lack context",
      body: "Reports show what changed, but not necessarily why. Without operational and commercial context, important performance drivers stay hidden.",
    },
    {
      title: "Insight doesn't lead to action",
      body: "Analysis may be available, but decisions, ownership and follow-through are not always clear. Lessons can be lost before the next planning cycle.",
    },
  ],
  /** The dark band between the symptoms and the evidence. It is the bridge
      into the Maturity Curve: the question it asks is what that curve answers. */
  turn: {
    lead: "Different symptoms. One underlying question:",
    question:
      "how far has your finance function progressed from producing numbers to improving decisions?",
  },
  /* Each figure: `label` is the claim, `source` the publication, `sample` what
     it was measured on, `href` the page that states it. All three verified
     2026-10-18; the utm parameters they arrived with are stripped. */
  stats: [
    {
      value: "47%",
      label: "of FP&A time is spent collecting and validating data.",
      source: "2026 FP&A Trends Survey",
      sample: "475 respondents",
      href: "https://fpa-trends.com/article/closing-ai-readiness-gap-2026",
    },
    {
      value: "45%",
      label:
        "of surveyed teams take a week or more to deliver a decision-ready forecast when market conditions change unexpectedly.",
      source: "Vena, 2026 FP&A Impact Report",
      sample: "400+ finance leaders",
      href: "https://www.venasolutions.com/resources/fpa-impact-report",
    },
    {
      value: "57%",
      label:
        "of surveyed US finance leaders reported missing a time-sensitive strategic action in the last six months because financial visibility arrived too late.",
      source: "Intuit, 2026 Future of Finance Report",
      sample: "2,000 US finance leaders",
      href: "https://erp.intuit.com/blog/guide/future-of-finance-2026-report/",
    },
  ],
  /** Labels every source link. One string, not three. */
  sourceLabel: "Source",
  statsNote:
    "Survey findings reflect their stated samples and should not be interpreted as applying to every organisation.",
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
