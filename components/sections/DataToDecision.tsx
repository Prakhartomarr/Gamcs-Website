import { Fragment, type CSSProperties } from "react";
import { dataToDecision as d } from "@/lib/content/gamcs";

/**
 * "The gap": why more reporting doesn't get a business to a decision.
 *
 * Built from the "Cascade" direction of the GAMCS — Data to Decision design
 * canvas. The today path steps one notch further right at every stage, so it
 * visibly drifts away from where the decision should have been made; the
 * GAMCS path beside it runs dead straight and stops after four. Static, no
 * toggle.
 *
 * Both paths are ordered lists. The connectors are ::after lines in CSS
 * (.d2d-path), dropped from each row's chip, so the cascade reads as one path
 * rather than five loose boxes. Copy is `dataToDecision` in gamcs.ts.
 */
const no = (i: number) => String(i + 1).padStart(2, "0");

export default function DataToDecision() {
  const { today, gamcs } = d;
  const lastToday = today.steps.length - 1;
  const lastGamcs = gamcs.steps.length - 1;

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
          <div className="reveal">
            <span className="d2d-label" id="d2d-today">
              {today.label}
            </span>
            <ol className="d2d-path d2d-path--cascade" aria-labelledby="d2d-today">
              <li>
                <div className="d2d-row d2d-row--wrap">
                  <span className="d2d-no">{no(0)}</span>
                  <span className="d2d-chips">
                    {today.sources.map((s, i) => (
                      <Fragment key={s}>
                        {i > 0 && (
                          <span className="d2d-plus" aria-hidden="true">
                            +
                          </span>
                        )}
                        <span className="d2d-chip d2d-chip--src">{s}</span>
                      </Fragment>
                    ))}
                  </span>
                </div>
              </li>
              {today.steps.map((s, i) => (
                /* --i: how many notches right this step sits */
                <li key={s.label} style={{ "--i": i + 1 } as CSSProperties}>
                  <div className="d2d-row">
                    <span className="d2d-no">{no(i + 1)}</span>
                    <span
                      className={`d2d-chip${s.detour ? " d2d-chip--detour" : ""}${
                        i === lastToday ? " d2d-chip--end" : ""
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="d2d-panel reveal">
            <span className="d2d-label" id="d2d-gamcs">
              {gamcs.label}
            </span>
            <ol className="d2d-path" aria-labelledby="d2d-gamcs">
              {gamcs.steps.map((s, i) => (
                <li key={s}>
                  <div className="d2d-row">
                    <span className="d2d-no">{no(i)}</span>
                    <span
                      className={`d2d-chip d2d-chip--gamcs${i === lastGamcs ? " d2d-chip--act" : ""}`}
                    >
                      {s}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
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
