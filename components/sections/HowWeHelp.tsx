import { STEP_ICONS } from "@/components/ui/stroke-icons";
import { whyUs } from "@/lib/content/gamcs";

/**
 * "How we help" as an alternating step run down a centre spine.
 *
 * This replaced a drag carousel, and with it went ~200 lines of client code:
 * the scroll-snap contract, the pointer drag with its fling-and-glide, the
 * measured stop table, the arrows, the counter and the progress rail. None of
 * that has an equivalent here — the steps are simply a list — so the component
 * is a server component with no JavaScript at all.
 *
 * Layout is a three-column grid per step: outer copy, a fixed centre gutter
 * holding the spine and its node, outer copy. Odd steps put the tile group
 * left of the spine and the copy right; even steps mirror it. The tile group
 * always hugs the spine and the copy always sits outside it, which is what
 * makes the zig-zag read as one path rather than two columns.
 *
 * Below 768px the three columns collapse to one with the spine on the left —
 * an alternating layout needs width on both sides of the centre, and a phone
 * has neither.
 *
 * The highlighted step is `:hover` only. The mockup showed step 1 filled to
 * demonstrate the state; a permanently highlighted first step would imply it
 * is special, which it isn't.
 */
export default function HowWeHelp() {
  return (
    <section className="section hwh fin-sec" id="how-we-help">
      <div className="container">
        <div className="hwh-panel reveal">
          <div className="hwh-head">
            <span className="fin-eyebrow">
              <i aria-hidden="true" />
              How we help
            </span>
            <h2 className="hwh-h2">
              {whyUs.headingLead}{" "}
              <span className="accent">{whyUs.headingAccent}</span>{" "}
              {whyUs.headingTail}
            </h2>
          </div>

          <ol className="hwh-steps">
            <span className="hwh-spine" aria-hidden="true" />
            {whyUs.points.map((point, i) => {
              const n = String(i + 1).padStart(2, "0");
              /* the tile sits left of the spine on odd steps, right on even */
              const iconFirst = i % 2 === 0;
              const tile = (
                <div
                  className={`hwh-grp ${iconFirst ? "to-spine" : "from-spine"}`}
                >
                  {iconFirst ? null : <span className="hwh-no">{n}</span>}
                  <span className="hwh-tile" aria-hidden="true">
                    <svg viewBox="0 0 24 24">{STEP_ICONS[point.lead]}</svg>
                  </span>
                  {iconFirst ? <span className="hwh-no">{n}</span> : null}
                </div>
              );
              const copy = (
                <div
                  className={`hwh-copy ${iconFirst ? "at-left" : "at-right"}`}
                >
                  <h3>{point.lead}</h3>
                  <p>{point.body}</p>
                </div>
              );
              return (
                <li className="hwh-step" key={point.lead}>
                  {iconFirst ? tile : copy}
                  <span className="hwh-node" aria-hidden="true" />
                  {iconFirst ? copy : tile}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
