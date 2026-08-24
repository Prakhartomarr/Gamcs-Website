"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { contact, site } from "@/lib/content/gamcs";

type Errors = Partial<Record<string, string>>;

/**
 * Contact form. Field set matches the live site's form exactly.
 *
 * There is no backend, so submitting hands the details to the visitor's own
 * mail client via a mailto: URL. That shapes three decisions here:
 *
 *  - validation runs in the browser before the mail client opens, because
 *    there is no server to catch a bad address afterwards;
 *  - the button locks while the handover happens, so an impatient double-tap
 *    cannot open two draft windows;
 *  - failure is a real state. Some browsers and locked-down desktops refuse
 *    mailto: entirely, and silently doing nothing would look like a bug — so
 *    the error branch shows the address to copy instead.
 *
 * `noValidate` turns off the browser's own bubbles in favour of inline
 * messages that are wired up with aria-describedby and announced by
 * screen readers.
 */
const validators: Record<string, (v: string) => string | undefined> = {
  name: (v) =>
    v.trim().length < 2 ? "Please enter your name." : undefined,
  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
      ? undefined
      : "Please enter a valid email address.",
  phone: (v) =>
    v.replace(/\D/g, "").length < 7
      ? "Please enter a phone number we can reach you on."
      : undefined,
};

export default function ContactForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");

  const validate = (fd: FormData): Errors => {
    const next: Errors = {};
    for (const f of contact.fields) {
      const check = validators[f.name];
      if (!check) continue;
      const message = check(String(fd.get(f.name) ?? ""));
      if (message) next[f.name] = message;
    }
    return next;
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return; // no double submits

    const form = e.currentTarget;
    const fd = new FormData(form);
    const found = validate(fd);
    setErrors(found);

    const firstBad = contact.fields.find((f) => found[f.name]);
    if (firstBad) {
      form.querySelector<HTMLInputElement>(`#${firstBad.name}`)?.focus();
      return;
    }

    setStatus("sending");
    const val = (k: string) => String(fd.get(k) ?? "");
    const subject = encodeURIComponent(`Enquiry from ${val("name")}`);
    const body = encodeURIComponent(
      contact.fields
        .map((f) => `${f.label}: ${val(f.name)}`)
        .join("\n")
    );

    track("generate_lead", { form_name: "contact", method: "mailto" });

    try {
      window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    } catch {
      setStatus("error");
      return;
    }

    /* Give the mail client a moment to take over before the route changes,
       otherwise some browsers cancel the handover mid-navigation. */
    window.setTimeout(() => router.push("/thank-you"), 600);
  }

  /** Clear a field's error as soon as it becomes valid again. */
  const revalidate = (name: string, value: string) => {
    if (!errors[name]) return;
    const check = validators[name];
    if (check && !check(value)) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate ref={formRef}>
      {contact.fields.map((f) => {
        const error = errors[f.name];
        const describedBy = error ? `${f.name}-error` : undefined;
        const shared = {
          id: f.name,
          name: f.name,
          "aria-invalid": error ? (true as const) : undefined,
          "aria-describedby": describedBy,
          onBlur: (
            e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => revalidate(f.name, e.currentTarget.value),
          onInput: (
            e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => revalidate(f.name, e.currentTarget.value),
        };

        return (
          <div
            className={f.name === "goal" || f.name === "source" ? "field full" : "field"}
            key={f.name}
          >
            <label htmlFor={f.name}>
              {f.label}
              {f.required ? (
                <>
                  {" "}
                  <span aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </>
              ) : null}
            </label>

            {f.name === "goal" ? (
              <textarea {...shared} />
            ) : (
              <input
                {...shared}
                required={f.required}
                type={
                  f.name === "email" ? "email" : f.name === "phone" ? "tel" : "text"
                }
                inputMode={f.name === "phone" ? "tel" : undefined}
                autoComplete={
                  f.name === "name"
                    ? "name"
                    : f.name === "company"
                    ? "organization"
                    : f.name === "title"
                    ? "organization-title"
                    : f.name === "email"
                    ? "email"
                    : f.name === "phone"
                    ? "tel"
                    : "off"
                }
              />
            )}

            {error ? (
              <p className="field-error" id={`${f.name}-error`} role="alert">
                {error}
              </p>
            ) : null}
          </div>
        );
      })}

      <button
        className="btn btn-shimmer"
        type="submit"
        data-cta="contact-form"
        data-press
        disabled={status === "sending"}
        aria-busy={status === "sending"}
      >
        <span className="btn-label">
          {status === "sending" ? "Opening your email…" : contact.submit}{" "}
          <span aria-hidden="true">↗</span>
        </span>
      </button>

      {/* Live region: empty until something needs announcing. */}
      <p className="form-status" role="status" aria-live="polite">
        {status === "error" ? (
          <>
            We couldn&rsquo;t open your email app. Please write to{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a> instead.
          </>
        ) : null}
      </p>
    </form>
  );
}
