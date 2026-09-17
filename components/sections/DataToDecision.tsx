import { GAP_ICONS } from "@/components/ui/stroke-icons";
import { dataToDecision as d } from "@/lib/content/gamcs";

/**
 * "The gap": why more reporting doesn't get a business to a decision.
 *
 * Two panels from the gap-panels design canvas — the typical path from data to
 * a decision, and the same path with GAMCS. Each panel is the systems it runs
 * on (chips), a connector, the four stages of the path (cards), and a rail
 * saying how long it takes. The GAMCS panel puts one hub between the chips and
 * the path, which is the whole point of it. Static, no toggle.
 *
 * Both paths are ordered lists named by their panel title. Everything drawn —
 * connectors, the arrows between cards, the turn between the panels — is CSS
 * or aria-hidden SVG. Copy is `dataToDecision` in gamcs.ts; the glyphs are
 * GAP_ICONS in stroke-icons.tsx.
 */
/** Keys of GAP_ICONS, so a typo in gamcs.ts fails the build, not the glyph. */
type IconName = keyof typeof GAP_ICONS;
type Chip = { label: string; icon: IconName };
type Step = { label: string; caption: string; icon: IconName };

const Icon = ({ name }: { name: IconName }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {GAP_ICONS[name]}
  </svg>
);

/**
 * One connector. A lane is one grid cell per column of the thing it meets, so
 * "chips" and "cards" inherit their column count from the panel and stay on
 * those centres at every width; "one" is the single line to or from the hub.
 * The cells CSS hides below 1280/1024 are the columns those grids lose there.
 */
const CELLS = { chips: 3, cards: 4, one: 1 };
type Lane = keyof typeof CELLS;

const Flow = ({ from, to, hub }: { from: Lane; to: Lane; hub?: boolean }) => (
  <div className={`d2d-flow${hub ? " d2d-flow--hub" : ""}`} aria-hidden="true">
    {([from, to] as const).map((kind, lane) => (
      <span className={`d2d-lane d2d-lane--${kind}`} key={lane}>
        {Array.from({ length: CELLS[kind] }, (_, i) => (
          <i key={i} />
        ))}
      </span>
    ))}
  </div>
);

function Panel({
  tone,
  id,
  title,
  subtitle,
  chips,
  hub,
  steps,
  rail,
}: {
  tone: "today" | "gamcs";
  id: string;
  title: string;
  subtitle: string;
  chips: readonly Chip[];
  hub?: { name: string; caption: string };
  steps: readonly Step[];
  rail: string;
}) {
  return (
    <div className={`d2d-panel d2d-panel--${tone} reveal`}>
      <p className="d2d-p-title" id={id}>
        {title}
      </p>
      <p className="d2d-p-sub">{subtitle}</p>

      <ul className="d2d-chips" role="list">
        {chips.map((c) => (
          <li className="d2d-chip" key={c.label}>
            <Icon name={c.icon} />
            {c.label}
          </li>
        ))}
      </ul>

      {hub ? (
        <>
          <Flow from="chips" to="one" hub />
          <div className="d2d-hub">
            <span className="d2d-hub-name">{hub.name}</span>
            <span className="d2d-hub-sub">{hub.caption}</span>
          </div>
          <Flow from="one" to="cards" />
        </>
      ) : (
        <Flow from="chips" to="cards" />
      )}

      <ol className="d2d-cards" role="list" aria-labelledby={id}>
        {steps.map((s, i) => (
          <li className="d2d-card" key={s.label}>
            {i > 0 && (
              <svg className="d2d-arrow" viewBox="0 0 24 24" aria-hidden="true">
                {GAP_ICONS.chevron}
              </svg>
            )}
            <span className="d2d-card-ico">
              <Icon name={s.icon} />
            </span>
            <span className="d2d-card-t">{s.label}</span>
            <span className="d2d-card-c">{s.caption}</span>
          </li>
        ))}
      </ol>

      <div className="d2d-rail">
        <span className="d2d-rail-dot" />
        <span className="d2d-rail-ln" />
        <span className="d2d-rail-lbl">{rail}</span>
        <span className="d2d-rail-ln" />
        <span className="d2d-rail-dot" />
      </div>
    </div>
  );
}

export default function DataToDecision() {
  return (
    <section className="section d2d" id="data-to-decision" aria-labelledby="d2d-heading">
      <div className="container">
        <div className="d2d-head reveal">
          <span className="fin-eyebrow">
            <i aria-hidden="true" />
            {d.eyebrow}
          </span>
          <h2 id="d2d-heading" className="fin-h2">
            {d.headingLead}
            <br />
            <span className="d2d-accent">{d.headingAccent}</span>
          </h2>
          <p className="fin-lead">{d.body}</p>
        </div>

        <div className="d2d-grid">
          <Panel tone="today" id="d2d-today" {...d.today} />
          <Panel tone="gamcs" id="d2d-gamcs" {...d.gamcs} />
          <div className="d2d-turn" aria-hidden="true">
            <svg viewBox="0 0 24 24">{GAP_ICONS.chevron}</svg>
          </div>
        </div>

        <div className="d2d-close reveal">
          <p>
            {d.closeLead} <span className="d2d-accent">{d.closeAccent}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
