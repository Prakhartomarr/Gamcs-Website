/**
 * The Finance Maturity Self-Assessment page: eight questions, then an
 * indicative stage and a capability profile. Every string here is the
 * client's supplied copy, transcribed verbatim — British spellings, the
 * middot separators and the unspaced em dashes are theirs, not typos.
 *
 * The eleven interface strings the copy does not supply (the progress and
 * score labels, the navigation buttons, the two result headings) are flagged
 * individually below and are awaiting client sign-off.
 *
 * Strings with `{slots}` are filled at render time with lib/content/fill.ts.
 */

export const assessment = {
  eyebrow: "FINANCE MATURITY SELF-ASSESSMENT",
  heading: "See where your finance function stands.",
  lead: "Answer eight practical questions to identify your indicative maturity stage, see where capabilities are stronger or weaker, and understand the next useful step.",
  /* "three" is spelled out because the copy spells it out. The client's mockup
     writes "About 3 minutes"; the copy overrules it. */
  meta: "Eight questions · About three minutes · Results shown immediately",
  /** Sits under the head, before the first question: what the result is not. */
  note: "No industry-specific metrics or systems required. Results are indicative, based on your responses, and not benchmarked against peers.",

  /* DERIVED — not in the supplied copy. {n} is the 1-based question number,
     {total} the count of `questions`. Neutral placeholder pending sign-off. */
  progressLabel: "Question {n} of {total}",
  /** DERIVED. {pct} is a whole number, 0-100. Pending sign-off. */
  percentLabel: "{pct}% complete",
  /** From the mockup's question card. */
  back: "Back",
  /** From the mockup's question card. */
  next: "Next question",
  /* DERIVED — replaces `next` on question 8. Neither copy nor mockup supplies
     it; kept to the plainest wording. Pending sign-off. */
  finish: "See result",

  /* Eight questions, five options each, scored 1-5 by index: the scoring gates
     in the copy address them by number, so the order here is load-bearing.
     `prompt` drops the copy's "QUESTION n — " prefix (the progress label
     carries the number) and `label` drops the "1. " ordinal for the same
     reason. */
  questions: [
    {
      prompt: "How consistently does your team close the books?",
      hint: "Think about process, ownership, controls and predictability.",
      options: [
        { label: "Ad hoc", body: "There is no consistent process or predictable close timeline." },
        { label: "Developing", body: "Some routines exist, but responsibilities and deadlines vary." },
        { label: "Defined", body: "A close calendar and owners exist, but manual follow-up and rework are common." },
        { label: "Controlled", body: "The close is repeatable; exceptions are tracked and resolved." },
        { label: "Highly mature", body: "Routine steps are streamlined, with clear ownership of exceptions and controls." },
      ],
    },
    {
      prompt: "How is the monthly management report produced?",
      hint: "Think about consistency, preparation effort and usefulness for management.",
      options: [
        { label: "Ad hoc", body: "There is no consistent monthly management pack." },
        { label: "Mostly manual", body: "Reports are assembled manually and formats or definitions can vary." },
        { label: "Standardised", body: "A standard management information pack exists but still requires significant manual preparation." },
        { label: "Repeatable", body: "Reporting follows consistent logic and is refreshed through a defined process." },
        { label: "Highly automated", body: "Reports refresh with minimal effort and feed a regular performance review." },
      ],
    },
    {
      prompt: "How much recurring reporting work is automated?",
      hint: "Consider the whole process—from collecting data to refreshing the final report.",
      options: [
        { label: "Mostly manual", body: "People collect data and build most reports by hand." },
        { label: "Some templates", body: "Templates or macros help, but teams still combine and verify many sources." },
        { label: "Partly automated", body: "Core reports are standardised and some recurring steps are automated." },
        { label: "Mostly automated", body: "Connected data and reporting processes remove most manual preparation." },
        { label: "Automated and controlled", body: "Reliable refreshes and checks run routinely; people focus on exceptions and insight." },
      ],
    },
    {
      prompt: "How confident are you in the consistency of your numbers?",
      hint: "Think about differences between systems, reports, definitions and business units.",
      options: [
        { label: "Low confidence", body: "Different versions often disagree and issues are difficult to trace." },
        { label: "Reactive checks", body: "Teams reconcile differences after they appear; definitions may vary." },
        { label: "Generally reliable", body: "Main numbers are reconciled, but definitions or data ownership are not always clear." },
        { label: "Well controlled", body: "Definitions, ownership and checks are consistent; differences can be traced." },
        { label: "Trusted and monitored", body: "Governed sources and timely exception monitoring maintain confidence across reports." },
      ],
    },
    {
      prompt: "Can finance explain why performance changed?",
      hint: "Think beyond reporting the variance to identifying the drivers behind it.",
      options: [
        { label: "Limited explanation", body: "Reports show headline numbers but rarely explain underlying drivers." },
        { label: "Basic analysis", body: "Some variances are explained, often manually and after the event." },
        { label: "Repeatable commentary", body: "Key variances are explained, but deeper investigation still takes time." },
        { label: "Driver-based insight", body: "Financial results are connected to operational and commercial drivers." },
        { label: "Timely insight", body: "Drivers surface early enough to anticipate risks and opportunities." },
      ],
    },
    {
      prompt: "How are forecasts and scenarios used?",
      hint: "Consider whether future views change as the business changes.",
      options: [
        { label: "Static budget", body: "Planning is mainly an annual budget with limited updates." },
        { label: "Periodic updates", body: "Forecasts are updated manually or only at set intervals." },
        { label: "Regular reforecasting", body: "Forecasts are refreshed, but assumptions and scenarios may be disconnected." },
        { label: "Driver-based planning", body: "Forecasts and scenarios reflect changing business drivers and conditions." },
        { label: "Decision tool", body: "Forecasts and scenarios routinely inform trade-offs, priorities and resource allocation." },
      ],
    },
    {
      prompt: "How directly does finance contribute to business decisions?",
      hint: "Think about the role finance plays in management discussions.",
      options: [
        { label: "Reporting role", body: "Finance mainly supplies historical reports." },
        { label: "Reactive support", body: "Finance answers questions when asked but is rarely involved early." },
        { label: "Some recommendations", body: "Finance provides commentary and recommendations for selected decisions." },
        { label: "Active partner", body: "Finance helps evaluate options, risks and likely outcomes." },
        { label: "Embedded in decisions", body: "Insights routinely shape management and board choices, including trade-offs." },
      ],
    },
    {
      prompt: "How well are actions and outcomes tracked after a decision?",
      hint: "Think about ownership, follow-through and learning.",
      options: [
        { label: "Rarely tracked", body: "Actions are not consistently recorded and ownership is unclear." },
        { label: "Inconsistent follow-up", body: "Actions may be noted, but follow-up varies." },
        { label: "Owners assigned", body: "Responsibilities and deadlines are set, but impact is not consistently measured." },
        { label: "Reviewed regularly", body: "Progress and outcomes are reviewed through management routines." },
        { label: "Closed loop", body: "Impact is measured and lessons feed back into forecasts and future plans." },
      ],
    },
  ],

  /* The four bars of the result's capability profile, in the copy's order.
     `key` is what the scorer groups question scores under; the copy names only
     the labels, so the keys are ours. */
  capabilities: [
    { key: "foundation", label: "Foundation & close" },
    { key: "reporting", label: "Reporting & automation" },
    { key: "insight", label: "Insight & planning" },
    { key: "decisions", label: "Decisions & impact" },
  ],

  /* The five maturity stages. This is deliberately only the subset the result
     screen renders: `name` and `question` for the heading, `description` for
     the short explanation, `next` for the recommended next step. The copy also
     gives each stage a one-word verb, a "What this stage looks like" and an
     "outcome to aim for" — those belong to the homepage maturity curve, which
     is not being rebuilt, so they are not duplicated here. */
  /* `n` is the plain number the scorer returns, not the "01" the result
     heading shows: zero-padding is presentation, and keeping it here would
     mean the one value the stage is looked up by never matched. */
  stages: [
    {
      n: 1,
      name: "Finance Foundation",
      question: "Can we close reliably?",
      description: "Processes and responsibilities are undocumented or inconsistently followed. Reconciliations depend on manual follow-up, and close timelines are difficult to predict.",
      next: "Document core processes, assign owners, establish a close calendar and build a consistent reconciliation routine.",
    },
    {
      n: 2,
      name: "Management Reporting",
      question: "Do we know how the business performed?",
      description: "The books close on an agreed timetable, but producing the management information pack, comparing actuals with budget and explaining variances still takes time and effort.",
      next: "Standardise the reporting pack, KPI definitions, data sources and management review process.",
    },
    {
      n: 3,
      name: "Automated Reporting",
      question: "Can we produce reports without rebuilding them every month?",
      description: "Recurring reports and dashboards refresh with minimal manual preparation. Finance spends less time collecting and assembling information—but automation alone does not explain why performance moved.",
      next: "Connect financial results to relevant operational and commercial information so the business drivers become clearer.",
    },
    {
      n: 4,
      name: "Performance Insight",
      question: "Do we understand why performance changed?",
      description: "Financial results are connected to relevant operational and commercial context. The team can explain the drivers behind performance, evaluate scenarios and anticipate likely outcomes.",
      next: "Embed insights into management reviews, connect forecasts to business decisions, and assign clear ownership to actions.",
    },
    {
      n: 5,
      name: "Decision-Led Finance",
      question: "Do insights translate into action and impact?",
      /* Stage 5 has nowhere further to go, so the copy labels its `next` "The
         ongoing priority" rather than "The next move". Same field, same slot
         on the result screen. */
      description: "Insights are embedded in management and board conversations. Decisions have owners and expected outcomes; progress is tracked, and lessons feed into future plans.",
      next: "Keep the loop moving: measure outcomes, learn from results and feed those lessons into the next forecast and plan.",
    },
  ],

  result: {
    eyebrow: "YOUR INDICATIVE RESULT",
    /** {n} and {name} come from the matched `stages` entry. */
    stageLabel: "Stage {n} · {name}",
    /* DERIVED — the denominator beside the overall score, split out so the
       numeral can be set apart from it. Pending sign-off. */
    outOf: "/ 5",
    /** From the mockup, above the capability bars. */
    profileHeading: "Your capability profile",
    /** DERIVED. {score} is one capability's average, to one decimal. Pending sign-off. */
    scoreLabel: "{score} / 5",
    /** Heads the stage's `next`. */
    nextHeading: "Your recommended next step",
    /* The copy insists on this wherever the result appears: it is a guide, not
       an audit or a benchmark. Not to be shortened. */
    disclaimer: "This self-assessment is an indicative guide based on your responses, not an audit, independently validated maturity rating or industry benchmark. Capabilities can vary across teams and processes. The stage shown summarises your response pattern; review the individual scores to identify gaps.",
    review: "Review answers",
    restart: "Start again",
    explore: "Explore GAMCS solutions",
    exploreHref: "/solutions",
  },
} as const;
