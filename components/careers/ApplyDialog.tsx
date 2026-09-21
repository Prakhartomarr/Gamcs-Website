"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CTA from "@/components/CTA";
import { track as trackEvent } from "@/lib/analytics";
import { careers } from "@/lib/content/gamcs";

const { form, tracks, locations } = careers;
const trackOptions = [...tracks.map((t) => ({ id: t.id, label: t.title })), careers.trackUnsure];
const locationOptions = [...locations, careers.locationEither];

const MAX_FILE = 4 * 1024 * 1024;
const STEP_OF: Record<string, number> = { name: 0, email: 0, phone: 0, track: 1, location: 1, url: 1, cv: 1, note: 2, consent: 2 };

export type ApplyRequest = { track?: string; loc?: string };
type Errors = Record<string, string>;
type Status = "idle" | "sending" | "sent" | "mailto" | "error";

const val = (f: HTMLFormElement, k: string) => String(new FormData(f).get(k) ?? "").trim();
const cvError = (cv: File | undefined) =>
  !cv ? form.errors.cv : !/\.(pdf|docx?)$/i.test(cv.name) ? form.errors.cvType : cv.size > MAX_FILE ? form.errors.cvSize : "";

/** Client-side mirror of the server's rules, one step at a time. The server
    (app/api/careers/route.ts) checks everything again regardless. */
function validate(f: HTMLFormElement, step: number): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (val(f, "name").length < 2) e.name = form.errors.name;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val(f, "email"))) e.email = form.errors.email;
  }
  if (step === 1) {
    if (!val(f, "track")) e.track = form.errors.track;
    const url = val(f, "url");
    if (url && !/^https?:\/\/\S+\.\S+/i.test(url)) e.url = form.errors.url;
    const cv = cvError((f.elements.namedItem("cv") as HTMLInputElement).files?.[0]);
    if (cv) e.cv = cv;
  }
  if (step === 2 && !val(f, "consent")) e.consent = form.errors.consent;
  return e;
}

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

/**
 * The application overlay: a native modal <dialog>, which supplies the focus
 * trap, Esc, the inert page behind it and the return of focus to whatever
 * opened it. All three steps stay mounted inside one <form> (the inactive ones
 * `hidden`), so one FormData carries every field and the chosen File survives
 * moving between steps.
 */
export default function ApplyDialog({ request, onClose }: { request: ApplyRequest | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [trackId, setTrackId] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [mailHref, setMailHref] = useState("");
  /* Whether the applicant chose the track in the select themselves. */
  const [picked, setPicked] = useState(false);
  const [seen, setSeen] = useState(request);

  /* Adjusted during render, not in the effect, so the dialog never shows the
     previous track. A track's own Apply sets it; the hero and the bar keep only
     a track the applicant picked by hand. */
  if (request !== seen) {
    setSeen(request);
    if (request?.track) {
      setTrackId(request.track);
      setPicked(false);
    } else if (request && !picked) setTrackId("");
  }

  const done = status === "sent" || status === "mailto";

  useEffect(() => {
    const d = dialog.current;
    const f = formRef.current;
    if (!request || !d || !f || d.open) return;
    if (request.loc && request.loc !== "all") {
      const radio = f.querySelector<HTMLInputElement>(`input[name="location"][value="${request.loc}"]`);
      if (radio) radio.checked = true;
    }
    document.body.style.overflow = "hidden";
    d.showModal();
    /* Start at the step, not on the Close button showModal() would pick. */
    heading.current?.focus();
  }, [request]);

  /* Fires for Esc, the Close button and "Back to careers" alike. */
  const reset = () => {
    formRef.current?.reset();
    setStep(0);
    setTrackId("");
    setPicked(false);
    setFileName("");
    setStatus("idle");
  };
  const handleClose = () => {
    document.body.style.overflow = "";
    if (done) reset();
    setErrors({});
    onClose();
  };

  const focusField = (name: string) =>
    requestAnimationFrame(() => {
      const el = formRef.current?.elements.namedItem(name);
      (el instanceof RadioNodeList ? (el[0] as HTMLElement) : (el as HTMLElement | null))?.focus();
    });

  const go = (n: number) => {
    setStep(n);
    requestAnimationFrame(() => heading.current?.focus());
  };

  const next = () => {
    const found = validate(formRef.current!, step);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) focusField(first);
    else go(step + 1);
  };

  const clear = (name: string) => setErrors((prev) => (prev[name] ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== name)) : prev));

  const cvInput = () => formRef.current!.elements.namedItem("cv") as HTMLInputElement;
  /* A wrong or oversize file is named at once; its chip stays so it can be removed. */
  const syncFile = () => {
    const file = cvInput().files?.[0];
    setFileName(file?.name ?? "");
    setErrors(({ cv: _, ...rest }) => (file && cvError(file) ? { ...rest, cv: cvError(file) } : rest));
  };
  const removeFile = () => {
    cvInput().value = "";
    setFileName("");
    clear("cv");
    focusField("cv");
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const f = e.currentTarget;
    if (step < 2) return next(); // Continue, or Enter in a field
    const found = validate(f, 2);
    setErrors(found);
    if (found.consent) return focusField("consent");

    setStatus("sending");
    const fd = new FormData(f);
    let res: Response | null = null;
    let json: { ok?: boolean; code?: string; field?: string; message?: string } = {};
    try {
      res = await fetch("/api/careers", { method: "POST", body: fd });
      json = await res.json();
    } catch {}

    const sent = Boolean(res?.ok && json.ok);
    if (sent) trackEvent("careers_apply", { form_name: "careers", method: "form", track: fd.get("track") });
    /* Dismissal is refused while sending, but a browser lets a second Esc
       through: a closed dialog never opens a mail app or keeps a stale screen. */
    if (!dialog.current?.open) return sent ? reset() : setStatus("idle");
    if (sent) {
      setStatus("sent");
      return requestAnimationFrame(() => heading.current?.focus());
    }

    /* The mail route has no key yet: hand the application to the applicant's
       own mail app, the way ContactForm does. A browser cannot attach a file
       to a mailto:, so the next screen says so plainly. */
    if (res?.status === 503 && json.code === "not_configured") {
      const label = (list: { id: string; label: string }[], id: FormDataEntryValue | null) => list.find((o) => o.id === id)?.label ?? "";
      const L = form.labels;
      const body = [
        `${L.name}: ${fd.get("name")}`,
        `${L.email}: ${fd.get("email")}`,
        `${L.phone}: ${fd.get("phone") || "-"}`,
        `${L.track}: ${label(trackOptions, fd.get("track"))}`,
        `${L.location}: ${label(locationOptions, fd.get("location"))}`,
        `${L.url}: ${fd.get("url") || "-"}`,
        "",
        `${fd.get("note") || ""}`,
        "",
        "(CV attached)",
      ].join("\n");
      const href = `mailto:${careers.email}?subject=${encodeURIComponent(`Application: ${label(trackOptions, fd.get("track"))} — ${fd.get("name")}`)}&body=${encodeURIComponent(body)}`;
      trackEvent("careers_apply", { form_name: "careers", method: "mailto", track: fd.get("track") });
      setMailHref(href);
      setStatus("mailto");
      window.location.href = href;
      return requestAnimationFrame(() => heading.current?.focus());
    }

    if (json.field && json.field in STEP_OF) {
      setStatus("idle");
      setErrors({ [json.field]: json.message ?? "Check this field" });
      setStep(STEP_OF[json.field]);
      return focusField(json.field);
    }
    setMessage(json.code === "rate_limited" && json.message ? json.message : "");
    setStatus("error");
  }

  /* aria-invalid + aria-describedby for a field, and its inline alert. */
  const aria = (name: string) => ({
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `ap-${name}-err` : undefined,
  });
  const err = (name: string) =>
    errors[name] ? (
      <p className="ap-err" id={`ap-${name}-err`} role="alert">{errors[name]}</p>
    ) : null;
  const req = (
    <>
      {" "}<span className="ap-req" aria-hidden="true">*</span><span className="sr-only">(required)</span>
    </>
  );

  const current = done ? 3 : step;
  const stepLabel = status === "sent" ? "Done" : status === "mailto" ? "Almost done" : `Step ${step + 1} of 3`;
  const trackLabel = trackOptions.find((t) => t.id === trackId)?.label;

  return (
    <dialog
      ref={dialog}
      className="ap"
      aria-modal="true"
      aria-labelledby="ap-title"
      onClose={handleClose}
      onCancel={(e) => { if (status === "sending") e.preventDefault(); }}
    >
      <div className="ap-bar">
        <span className="ap-brand">
          <svg className="ga-logo-mark" aria-hidden="true" focusable="false"><use href="#ga-mark" /></svg>
          <span>Careers</span>
        </span>
        <CTA tier="secondary" type="button" disabled={status === "sending"} onClick={() => dialog.current?.close()}>
          <span aria-hidden="true">✕</span> Close
        </CTA>
      </div>
      <div className="ap-progress" role="progressbar" aria-label="Application progress" aria-valuemin={1} aria-valuemax={3} aria-valuenow={Math.min(current + 1, 3)}>
        <div style={{ transform: `scaleX(${Math.min(current + 1, 3) / 3})` }} />
      </div>

      <div className="ap-body">
        <aside className="ap-panel page-head--art">
          <div className="section-kicker">{stepLabel}</div>
          <h1 id="ap-title">{form.title}</h1>
          <ol className="ap-steps">
            {form.steps.map((s, i) => (
              <li key={s.title} aria-current={i === current ? "step" : undefined} data-state={i < current ? "done" : i === current ? "current" : "todo"}>
                <span className="ap-step-n" aria-hidden="true">{i < current ? <Check /> : i + 1}</span>
                <div>
                  <div className="ap-step-t">{s.title}{i < current ? <span className="sr-only"> (done)</span> : null}</div>
                  <div className="ap-step-f">{s.fields}</div>
                </div>
              </li>
            ))}
          </ol>
          <div className="ap-panel-foot">
            {trackLabel ? (
              <>
                <div className="ap-caps">Applying to</div>
                <div className="ap-applying">{trackLabel}</div>
              </>
            ) : null}
            <a className="cr-mail" href={`mailto:${careers.email}`}>{careers.email}</a>
          </div>
        </aside>

        <div className="ap-main">
          {/* Announces each move; the step heading also takes focus. */}
          <p className="sr-only" aria-live="polite">
            {status === "sent" ? form.success.heading : status === "mailto" ? form.mailto.heading : `${stepLabel}: ${form.steps[step].title}`}
          </p>

          <form ref={formRef} onSubmit={submit} noValidate hidden={done} className="ap-form" key="form">
            {/* Honeypot. Off-screen, out of the tab order, hidden from assistive tech. */}
            <div className="ap-hp" aria-hidden="true">
              {/* Named so that no autofill maps profile data onto it: a filled
                  honeypot drops a real application silently. */}
              <label htmlFor="ap-hp">Leave this field empty</label>
              <input id="ap-hp" name="hp_confirm" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="ap-caps ap-caps--blue">{stepLabel}</div>
            <h2 ref={done ? undefined : heading} tabIndex={-1}>{form.steps[step].title}</h2>

            <div className="ap-step" hidden={step !== 0}>
              <div className="ap-field">
                <label htmlFor="ap-name">{form.labels.name}{req}</label>
                <input id="ap-name" name="name" type="text" autoComplete="name" required maxLength={120} {...aria("name")} onInput={() => clear("name")} />
                {err("name")}
              </div>
              <div className="ap-field">
                <label htmlFor="ap-email">{form.labels.email}{req}</label>
                <input id="ap-email" name="email" type="email" autoComplete="email" required maxLength={200} {...aria("email")} onInput={() => clear("email")} />
                {err("email")}
              </div>
              <div className="ap-field">
                <label htmlFor="ap-phone">{form.labels.phone}</label>
                <input id="ap-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={40} {...aria("phone")} onInput={() => clear("phone")} />
                {err("phone")}
              </div>
            </div>

            <div className="ap-step" hidden={step !== 1}>
              <div className="ap-field">
                <label htmlFor="ap-track">{form.labels.track}{req}</label>
                <div className="cr-select">
                  <select id="ap-track" name="track" required value={trackId} {...aria("track")} onChange={(e) => { setTrackId(e.target.value); setPicked(true); clear("track"); }}>
                    <option value="" disabled>Choose a track</option>
                    {trackOptions.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                </div>
                {err("track")}
              </div>

              <fieldset className="ap-field">
                <legend>{form.labels.location}</legend>
                <div className="ap-seg">
                  {locationOptions.map((l) => (
                    <span key={l.id}>
                      <input type="radio" name="location" id={`ap-loc-${l.id}`} value={l.id} defaultChecked={l.id === careers.locationEither.id} />
                      <label htmlFor={`ap-loc-${l.id}`}>{l.label}</label>
                    </span>
                  ))}
                </div>
                {err("location")}
              </fieldset>

              <div className="ap-field">
                <label htmlFor="ap-url">{form.labels.url}</label>
                <input id="ap-url" name="url" type="url" inputMode="url" autoComplete="url" placeholder="https://" maxLength={300} {...aria("url")} onInput={() => clear("url")} />
                {err("url")}
              </div>

              <div className="ap-field ap-file">
                <label htmlFor="ap-cv">{form.labels.cv}{req}</label>
                {/* Stays mounted in both states so the File is kept and the label
                    always has a target; it leaves the tab order while the chip shows. */}
                <input
                  id="ap-cv"
                  name="cv"
                  type="file"
                  required
                  tabIndex={fileName ? -1 : undefined}
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  {...aria("cv")}
                  onChange={syncFile}
                />
                {fileName ? (
                  <>
                    <div className="ap-chip">
                      <span className="ap-chip-name">{fileName}</span>
                      <span aria-hidden="true">·</span>
                      <button type="button" onClick={removeFile} aria-label="Remove the attached CV">remove</button>
                    </div>
                    <p className="ap-hint">{form.cvHint}.</p>
                  </>
                ) : (
                  <label
                    htmlFor="ap-cv"
                    className="ap-drop"
                    data-drag={dragging ? "" : undefined}
                    data-bad={errors.cv ? "" : undefined}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      if (!e.dataTransfer.files.length) return;
                      cvInput().files = e.dataTransfer.files;
                      syncFile();
                    }}
                  >
                    <span className="ap-drop-icon" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></svg>
                    </span>
                    <span>
                      <span className="ap-drop-t">Drag and drop or <u>browse</u></span>
                      <span className="ap-drop-h">{form.cvHint}</span>
                    </span>
                  </label>
                )}
                {err("cv")}
              </div>
            </div>

            <div className="ap-step" hidden={step !== 2}>
              <div className="ap-field">
                <label htmlFor="ap-note">{form.labels.note}</label>
                <textarea id="ap-note" name="note" rows={4} maxLength={2000} placeholder={form.notePlaceholder} {...aria("note")} onInput={() => clear("note")} />
                {err("note")}
              </div>
              <div className="ap-field ap-consent">
                <input id="ap-consent" name="consent" type="checkbox" value="yes" required {...aria("consent")} onChange={() => clear("consent")} />
                <div>
                  <label htmlFor="ap-consent">{form.consent}</label>{" "}
                  <span>See our <Link href="/privacy-policy" target="_blank" rel="noopener">Privacy Policy</Link>.</span>
                </div>
              </div>
              {err("consent")}
            </div>

            <div className="ap-actions">
              {step > 0 ? (
                <CTA tier="secondary" type="button" onClick={() => go(step - 1)} disabled={status === "sending"}>
                  <span aria-hidden="true">←</span> Back
                </CTA>
              ) : <span />}
              {/* One submit button for all three steps; submit() routes it. Swapping
                  a type="button" for a type="submit" in the same slot let React
                  change the type mid-click, and Continue also sent the form. */}
              <CTA
                type="submit"
                icon={step < 2 ? "arrow" : "diagonal"}
                data-cta={step < 2 ? undefined : "careers-apply-send"}
                disabled={status === "sending"}
                aria-busy={status === "sending"}
              >
                {step < 2 ? "Continue" : status === "sending" ? "Sending…" : form.submit}
              </CTA>
            </div>
            {step === 2 ? <p className="ap-helper">{form.helper}</p> : null}
            <p className="ap-err ap-err--form" role="alert">
              {status === "error" ? (
                message || <>{form.sendError} <a href={`mailto:${careers.email}`}>{careers.email}</a>.</>
              ) : null}
            </p>
          </form>

          {done ? (
            <div className="ap-done" role="status">
              <svg className="ap-done-mark" width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" />
                {status === "sent" ? <path d="M20 33l8 8 16-17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength={1} /> : <path d="M18 24h28v18H18zM18 25l14 10 14-10" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" pathLength={1} />}
              </svg>
              <h2 ref={heading} tabIndex={-1}>{status === "sent" ? form.success.heading : form.mailto.heading}</h2>
              <p>{status === "sent" ? form.success.body : form.mailto.body}</p>
              {status === "mailto" ? (
                <p>{form.mailto.retry} <a href={mailHref}>{careers.email}</a>.</p>
              ) : null}
              <CTA tier="secondary" type="button" icon="arrow" onClick={() => dialog.current?.close()}>{form.success.back}</CTA>
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
