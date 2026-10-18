"use client";

import { useEffect, useRef, useState } from "react";
import { assessment } from "@/lib/content/assessment";
import { fill } from "@/lib/content/fill";
import {
  QUESTION_COUNT,
  capabilityScores,
  stageFor,
  type Answer,
} from "@/lib/maturity";

/**
 * The self-assessment card: eight questions, then an indicative result.
 *
 * Nothing leaves the browser — no storage, no URL state, no request. The
 * answers are React state and a reload is a fresh start. That is deliberate
 * rather than unfinished: someone grading their own close process candidly
 * should not have to wonder where the answers went, and the page can promise
 * that because there is no code here that could break the promise.
 *
 * The page head (header.fma-head) belongs to the route. This component owns
 * div.fma-card and everything inside it, in both states.
 *
 * Nothing here animates. The progress and capability bars are widths set from
 * state and transitioned by the stylesheet, so prefers-reduced-motion is
 * answered once in globals.css instead of being re-decided in JS.
 */

/* The scorer reads answers positionally — its gates name Q1 through Q8 — so a
   content module that gained or lost a question would be scored against the
   wrong gates and still look plausible. Everything below counts questions from
   the content; this is the one place that notices the two have drifted. */
if (
  process.env.NODE_ENV !== "production" &&
  assessment.questions.length !== QUESTION_COUNT
) {
  console.warn("MaturityAssessment", {
    questions: assessment.questions.length,
    QUESTION_COUNT,
  });
}

/* The option number is composed from the index rather than written into each
   option, so reordering a question's options cannot leave the copy misnumbered.
   The separator is punctuation around that number, not words, which is why it
   sits here with the markup instead of in the content module. */
const OPTION_SEPARATOR = " · ";

/* The denominator for every bar: an Answer is 1-5, and a capability is the mean
   of two answers, so nothing can exceed it. The "/ 5" a visitor reads is copy
   and comes from the content module; this number never reaches the page. */
const MAX_SCORE = 5;

const QUESTIONS = assessment.questions;

const isAnswered = (a: Answer | null): a is Answer => a !== null;

/* The heading reads "Stage 02 · Management Reporting" while the badge beside
   it reads "2". Same number, two presentations, so the content module stores
   it once as a number and the zero-padding happens here. */
const padded = (n: number) => String(n).padStart(2, "0");

const blankAnswers = () => Array<Answer | null>(QUESTIONS.length).fill(null);

export default function MaturityAssessment() {
  const [answers, setAnswers] = useState<(Answer | null)[]>(blankAnswers);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const legendRef = useRef<HTMLLegendElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  /* Focus is the visitor's until they ask for a different step; grabbing it on
     the first paint would pull a reader out of the page head above the card. */
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    /* Every control that changes the step can be disabled by the step it
       causes — Back on question 1, Next on a question not yet answered — and
       focus on a disabled or unmounted element falls back to <body>, which
       drops a keyboard or screen-reader user at the top of the document with
       no idea the card moved. So each change hands focus to what the new step
       is actually about: the question being asked, or the result. */
    (done ? resultRef.current : legendRef.current)?.focus();
  }, [step, done]);

  const review = () => {
    setDone(false);
    setStep(0);
  };

  const restart = () => {
    setAnswers(blankAnswers());
    review();
  };

  /* Choosing an option does not advance. The client's mockup shows an explicit
     Next, and a list that jumps away the instant it is touched takes away the
     second thought — on questions about your own finance function, the second
     thought is usually the honest one. */
  const choose = (value: Answer) =>
    setAnswers((prev) => prev.map((a, i) => (i === step ? value : a)));

  const complete = done && answers.every(isAnswered) ? answers : null;

  if (complete) {
    const r = assessment.result;
    const stage = assessment.stages.find((s) => s.n === stageFor(complete));
    /* Unreachable while the scorer returns 1-5 and the content ships five
       stages, but showing nothing beats showing someone another stage's
       diagnosis and recommended next step. */
    if (!stage) return null;
    const scores = capabilityScores(complete);

    return (
      <div className="fma-card">
        <p className="fma-result-eyebrow">{r.eyebrow}</p>

        <div className="fma-stage">
          {/* The badge is the heading's own "Stage n" set large. Reading the
              number out before the heading repeats it says it twice. */}
          <div className="fma-badge" aria-hidden="true">
            <span className="fma-badge-n">{stage.n}</span>
            <span className="fma-badge-of">{r.outOf}</span>
          </div>
          <div className="fma-stage-copy">
            {/* The result replaces the question the visitor was looking at, so
                the heading that names it takes focus and is read out. */}
            <h2 className="fma-stage-name" ref={resultRef} tabIndex={-1}>
              {fill(r.stageLabel, { n: padded(stage.n), name: stage.name })}
            </h2>
            {/* The question leads the paragraph, as the client's result card
                does: "Do we know how the business performed? The books close
                on an agreed timetable…". It is the stage's own framing, and
                without it the body opens mid-thought. One paragraph, not two
                — the comp runs them together. */}
            <p className="fma-stage-body">
              {stage.question} {stage.description}
            </p>
          </div>
        </div>

        <div className="fma-grid">
          <div className="fma-profile">
            <h3 className="fma-profile-h">{r.profileHeading}</h3>
            <ul className="fma-bars">
              {assessment.capabilities.map((cap) => {
                const score = scores[cap.key];
                return (
                  <li className="fma-bar" key={cap.key}>
                    <span className="fma-bar-label">{cap.label}</span>
                    {/* Each bar is the mean of two answers, so halves are a
                        real result and not a rounding artefact. */}
                    <span className="fma-bar-score">
                      {fill(r.scoreLabel, { score })}
                    </span>
                    <div className="fma-track" aria-hidden="true">
                      <div
                        className="fma-fill"
                        style={{ width: `${(score / MAX_SCORE) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <aside className="fma-step-card">
            <h3 className="fma-step-h">{r.nextHeading}</h3>
            <p className="fma-step-body">{stage.next}</p>
            <a className="fma-step-cta" href={r.exploreHref}>
              {r.explore}
            </a>
          </aside>
        </div>

        <p className="fma-disclaimer">{r.disclaimer}</p>

        <div className="fma-result-actions">
          <button type="button" className="fma-review" onClick={review}>
            {r.review}
          </button>
          <button type="button" className="fma-restart" onClick={restart}>
            {r.restart}
          </button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[step];
  const group = `fma-q${step + 1}`;
  const hintId = `${group}-hint`;
  const isLast = step === QUESTIONS.length - 1;
  /* "% complete" counts answers given, not steps walked: going back to reread
     a question must not make the bar retreat over answers that still stand. */
  const pct = Math.round(
    (answers.filter(isAnswered).length / QUESTIONS.length) * 100
  );

  return (
    <div className="fma-card">
      <div className="fma-progress">
        {/* Only the counter is live. A live region around the card would
            re-read the question and all five options every time an arrow key
            moved the selection. */}
        <p className="fma-step" role="status" aria-live="polite">
          {fill(assessment.progressLabel, {
            n: step + 1,
            total: QUESTIONS.length,
          })}
        </p>
        <p className="fma-pct">{fill(assessment.percentLabel, { pct })}</p>
        {/* No progressbar role: the two lines above already carry the position
            twice, in words, and are readable at any time rather than only when
            focus lands on the bar. A third announcement of the same number
            would be noise, so the bar is left as the picture of it. */}
        <div className="fma-track" aria-hidden="true">
          <div className="fma-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* A native fieldset of native radios: arrow-key navigation, group
          semantics and the legend as the group's name all come free and
          correct. The hint is wired as the group's description so it is read
          on entering the group, not only in browse mode. */}
      <fieldset className="fma-q" aria-describedby={hintId}>
        <legend className="fma-prompt" ref={legendRef} tabIndex={-1}>
          {q.prompt}
        </legend>
        <p className="fma-hint" id={hintId}>
          {q.hint}
        </p>
        <div className="fma-options">
          {q.options.map((o, i) => {
            const value = (i + 1) as Answer;
            const id = `${group}-o${value}`;
            return (
              /* The label wraps the input so the whole option box is the hit
                 area. The input keeps its own id and stays in the tab order —
                 .fma-radio is hidden by the stylesheet, which must do it
                 without display:none. */
              <label className="fma-option" key={id}>
                <input
                  className="fma-radio"
                  type="radio"
                  id={id}
                  name={group}
                  value={value}
                  checked={answers[step] === value}
                  onChange={() => choose(value)}
                />
                <span className="fma-option-label">
                  {value}
                  {OPTION_SEPARATOR}
                  {o.label}
                </span>
                <span className="fma-option-body">{o.body}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="fma-actions">
        <button
          type="button"
          className="fma-back"
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
        >
          {assessment.back}
        </button>
        <button
          type="button"
          className="fma-next"
          onClick={() => (isLast ? setDone(true) : setStep(step + 1))}
          disabled={!isAnswered(answers[step])}
        >
          {isLast ? assessment.finish : assessment.next}
        </button>
      </div>
    </div>
  );
}
