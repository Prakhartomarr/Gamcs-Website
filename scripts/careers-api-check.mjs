// Asserts the /api/careers trust boundary against a running server.
//   node scripts/careers-api-check.mjs [baseUrl]      (default http://localhost:3001)
// Run it WITHOUT RESEND_API_KEY set on the server: the valid application must
// stop at 503 not_configured, so this check can never send real mail.
const base = (process.argv[2] || "http://localhost:3001").replace(/\/$/, "");
const url = `${base}/api/careers`;

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a]); // "%PDF-1.4\n"
const file = (bytes, name) => new File([bytes], name);
const padded = (size) => { const b = new Uint8Array(size); b.set(PDF); return b; };

function form(overrides = {}) {
  const fields = {
    name: "Check Script", email: "check@example.com", phone: "+91 00000 00000",
    track: "fpa", location: "either", url: "https://example.com/profile",
    note: "Automated check. Not a real application.", consent: "yes",
    cv: file(PDF, "cv.pdf"), ...overrides,
  };
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) if (v != null) fd.append(k, v);
  return fd;
}

const post = async (body, origin = base) => {
  const res = await fetch(url, { method: "POST", body, headers: origin ? { Origin: origin } : {} });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
};

const cases = [
  ["missing CV -> 400 on cv", () => post(form({ cv: null })), (r) => r.status === 400 && r.json?.field === "cv" && r.json.ok === false],
  ["wrong type (.exe) -> 415/400", () => post(form({ cv: file(new Uint8Array([0x4d, 0x5a, 0x90, 0x00]), "cv.exe") })), (r) => [400, 415].includes(r.status) && r.json?.ok === false],
  ["fake .pdf without %PDF -> 415/400", () => post(form({ cv: file(new TextEncoder().encode("MZ not a pdf"), "cv.pdf") })), (r) => [400, 415].includes(r.status) && r.json?.ok === false],
  ["oversize file (4 MB + 1 KB) -> 413", () => post(form({ cv: file(padded(4 * 1024 * 1024 + 1024), "cv.pdf") })), (r) => r.status === 413],
  ["oversize body (6 MB) -> 413", () => post(form({ cv: file(padded(6 * 1024 * 1024), "cv.pdf") })), (r) => r.status === 413],
  ["cross-origin Origin -> 403", () => post(form(), "https://evil.example"), (r) => r.status === 403],
  ["no Origin -> 403", () => post(form(), null), (r) => r.status === 403],
  ["not multipart -> 415", async () => { const res = await fetch(url, { method: "POST", headers: { Origin: base, "Content-Type": "application/json" }, body: "{}" }); return { status: res.status, json: await res.json().catch(() => null) }; }, (r) => r.status === 415],
  ["unknown track -> 400 on track", () => post(form({ track: "ceo" })), (r) => r.status === 400 && r.json?.field === "track"],
  ["javascript: URL -> 400 on url", () => post(form({ url: "javascript:alert(1)" })), (r) => r.status === 400 && r.json?.field === "url"],
  ["honeypot filled -> 200 ok, nothing sent", () => post(form({ website: "https://spam.example" })), (r) => r.status === 200 && r.json?.ok === true],
  ["valid, no RESEND_API_KEY -> 503 not_configured", () => post(form()), (r) => r.status === 503 && r.json?.code === "not_configured"],
];

let failed = 0;
for (const [label, run, ok] of cases) {
  let r;
  try { r = await run(); } catch (e) { r = { status: "fetch error", json: String(e) }; }
  const pass = ok(r);
  if (!pass) failed++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}  [${r.status}${r.json?.code ? " " + r.json.code : ""}]`);
}
console.log(failed ? `\n${failed} of ${cases.length} failed` : `\nall ${cases.length} passed`);
process.exit(failed ? 1 : 0);
