import { NextResponse } from "next/server";
import { careers } from "@/lib/content/gamcs";

/**
 * POST /api/careers — a job application, mailed to careers@gamcs.in through
 * the Resend REST API (no SDK).
 *
 * This is a trust boundary: nothing the browser did is assumed. Every field is
 * re-validated here, the CV is checked by extension AND by its first bytes,
 * and no applicant data is ever logged.
 *
 * Until RESEND_API_KEY is set the route answers 503 `not_configured`, which
 * the form turns into a mailto: hand-over so the page works today.
 * Check: node scripts/careers-api-check.mjs
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE = 4 * 1024 * 1024;
/* The file plus generous room for the text fields and multipart framing. */
const MAX_BODY = MAX_FILE + 256 * 1024;
const LIMITS = { name: 120, email: 200, phone: 40, url: 300, note: 2000 } as const;

const TRACKS = new Map<string, string>([
  ...careers.tracks.map((t) => [t.id, t.title] as const),
  [careers.trackUnsure.id, careers.trackUnsure.label],
]);
const LOCATIONS = new Map<string, string>([
  ...careers.locations.map((l) => [l.id, l.label] as const),
  [careers.locationEither.id, careers.locationEither.label],
]);

/* Leading bytes each allowed extension must carry. */
const MAGIC: Record<string, number[]> = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  docx: [0x50, 0x4b, 0x03, 0x04], // PK.. (zip)
  doc: [0xd0, 0xcf, 0x11, 0xe0], // OLE2
};

const fail = (status: number, code: string, message: string, field?: string) =>
  NextResponse.json({ ok: false, code, message, ...(field ? { field } : {}) }, { status });

/* ponytail: in-memory, per-instance limiter. Serverless instances do not share
   memory, so the real ceiling is RATE_MAX x live instances, and it resets on a
   cold start. Move to a shared store (Upstash/Redis, or the host's WAF rate
   rule) if abuse ever shows up. */
const RATE_MAX = 5;
const RATE_WINDOW = 10 * 60 * 1000;
const hits = new Map<string, { n: number; reset: number }>();
function limited(ip: string) {
  const now = Date.now();
  if (hits.size > 1000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  const h = hits.get(ip);
  if (!h || h.reset < now) {
    hits.set(ip, { n: 1, reset: now + RATE_WINDOW });
    return false;
  }
  return ++h.n > RATE_MAX;
}

const CONTROL = /[\x00-\x1f\x7f]/g;
/** One line, no control characters (so no CR/LF can reach a mail header). */
const line = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.replace(CONTROL, " ").trim() : "");
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Basename only, no control or shell-hostile characters, at most 100 chars. */
function safeName(raw: string, ext: string) {
  const base = (raw.split(/[\\/]/).pop() ?? "")
    .replace(CONTROL, "")
    .replace(/[<>:"|?*]/g, "")
    .replace(/\.[^.]*$/, "")
    .trim()
    .slice(0, 100 - ext.length - 1);
  return `${base || "cv"}.${ext}`;
}

export async function POST(req: Request) {
  const type = req.headers.get("content-type") ?? "";
  if (!type.toLowerCase().startsWith("multipart/form-data"))
    return fail(415, "unsupported_media_type", "Send the application as multipart/form-data.");

  /* Same-origin only. Browsers attach Origin to every POST, so a missing one is
     not a browser form and is refused along with a foreign one. */
  const origin = req.headers.get("origin");
  const hosts = [req.headers.get("host"), req.headers.get("x-forwarded-host")];
  let originHost = "";
  try {
    originHost = origin ? new URL(origin).host : "";
  } catch {}
  if (!originHost || !hosts.includes(originHost))
    return fail(403, "forbidden", "This form only accepts applications sent from the GAMCS website.");

  /* ponytail: Content-Length is the only pre-read guard; a chunked body is
     buffered by formData() before the per-file check below. The host's own
     body cap (4.5 MB on Vercel) is the backstop. */
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY)
    return fail(413, "too_large", "Your CV needs to be 4 MB or smaller.", "cv");

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return fail(400, "invalid", "We couldn't read that application. Please try again.");
  }

  /* Honeypot: a field no person sees. Bots get the ordinary success answer and
     nothing is sent. */
  if (line(fd.get("website"))) return NextResponse.json({ ok: true });

  const name = line(fd.get("name"));
  const email = line(fd.get("email"));
  const phone = line(fd.get("phone"));
  const track = line(fd.get("track"));
  const location = line(fd.get("location")) || careers.locationEither.id;
  const url = line(fd.get("url"));
  const rawNote = fd.get("note");
  const note = typeof rawNote === "string" ? rawNote.replace(/[\x00-\x08\x0b-\x1f\x7f]/g, "").trim() : "";
  const cv = fd.get("cv");
  const errors = careers.form.errors;

  if (name.length < 2 || name.length > LIMITS.name) return fail(400, "invalid", errors.name, "name");
  if (email.length > LIMITS.email || !/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]{2,}$/.test(email))
    return fail(400, "invalid", errors.email, "email");
  if (phone.length > LIMITS.phone || (phone && !/^[0-9+()\-. ]+$/.test(phone)))
    return fail(400, "invalid", "Enter a phone number using digits only", "phone");
  if (!TRACKS.has(track)) return fail(400, "invalid", errors.track, "track");
  if (!LOCATIONS.has(location)) return fail(400, "invalid", "Choose a location preference", "location");
  if (url) {
    let ok = url.length <= LIMITS.url;
    try {
      ok = ok && ["http:", "https:"].includes(new URL(url).protocol);
    } catch {
      ok = false;
    }
    if (!ok) return fail(400, "invalid", errors.url, "url");
  }
  if (note.length > LIMITS.note) return fail(400, "invalid", "Keep the note under 2,000 characters", "note");
  if (!line(fd.get("consent"))) return fail(400, "invalid", errors.consent, "consent");

  /* `File` is not a global on every Node this can run on; a non-string entry is one. */
  if (!cv || typeof cv === "string" || cv.size === 0) return fail(400, "invalid", errors.cv, "cv");
  if (cv.size > MAX_FILE) return fail(413, "too_large", errors.cvSize, "cv");
  const ext = (cv.name.split(".").pop() ?? "").toLowerCase();
  const magic = MAGIC[ext];
  if (!magic) return fail(415, "unsupported_file", errors.cvType, "cv");
  const bytes = Buffer.from(await cv.arrayBuffer());
  if (!magic.every((b, i) => bytes[i] === b)) return fail(415, "unsupported_file", errors.cvType, "cv");

  const key = process.env.RESEND_API_KEY;
  if (!key) return fail(503, "not_configured", "Applications by form are not switched on yet.");

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return fail(429, "rate_limited", "Too many applications from this connection. Please try again later.");

  const rows: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Phone", phone || "—"],
    ["Track", TRACKS.get(track)!],
    ["Location preference", LOCATIONS.get(location)!],
    ["Link", url || "—"],
    ["Note", note || "—"],
  ];
  const html =
    `<h2>New application: ${esc(TRACKS.get(track)!)}</h2><table cellpadding="6">` +
    rows.map(([k, v]) => `<tr><th align="left" valign="top">${esc(k)}</th><td>${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("") +
    `</table><p>The applicant agreed to GAMCS storing these details to assess the application.</p>`;

  let sent = false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CAREERS_FROM_EMAIL || `GAMCS Careers <${careers.email}>`,
        to: [process.env.CAREERS_TO_EMAIL || careers.email],
        reply_to: email,
        subject: `Application: ${TRACKS.get(track)} — ${name}`,
        text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
        html,
        attachments: [{ filename: safeName(cv.name, ext), content: bytes.toString("base64") }],
      }),
      signal: AbortSignal.timeout(15000),
    });
    sent = res.ok;
    /* Status only: the response body can echo the applicant's address. */
    if (!sent) console.error(`careers: mail provider answered ${res.status}`);
  } catch {
    console.error("careers: mail provider unreachable");
  }
  if (!sent) return fail(502, "mail_failed", `We couldn't send your application. Please try again, or write to ${careers.email}.`);

  return NextResponse.json({ ok: true });
}
