// The one runnable check for the copy round trip. Exits non-zero on any mismatch.
//   export -> import the export back (expect 0 changes)
//   edit three cells in a copy of the .docx -> dry run (expect exactly those 3)
//   import for real -> tsc -> the dev server shows the new text -> restore the source
// usage: node scripts/copy/check.mjs   (dev server at $SITE, default http://localhost:3001)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import JSZip from "jszip";
import { exportDocx, loadManifest } from "./export.mjs";
import { applyImport, planImport } from "./import.mjs";
import { MODULES, ROOT, load } from "./source.mjs";

const SITE = process.env.SITE || "http://localhost:3001";
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "gamcs-copy-"));
const snapshot = new Map(Object.keys(MODULES).map((f) => [f, fs.readFileSync(path.join(ROOT, f), "utf8")]));
const restore = () => { for (const [f, text] of snapshot) { fs.writeFileSync(path.join(ROOT, f), text); load(f, true); } };
let failed = 0;
const step = (name, ok, detail = "") => { console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`); if (!ok) failed++; };
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

try {
  // 1. export, then import the export back: nothing may change
  const original = path.join(tmp, "export.docx");
  const r = await exportDocx(original);
  step("export", fs.statSync(original).size > 10_000, `${r.entries} entries, ${r.rows} rows, ${r.shared} shared`);
  const same = await planImport(original);
  step("import of the export is a no-op", same.problems.length === 0 && same.changes.length === 0, `${same.problems.length} problems, ${same.changes.length} changes, ${same.rows} rows`);

  // 2. edit three cells: a heading, a legal paragraph, a form error
  const manifest = loadManifest();
  const pick = (code) => { const e = manifest.find((x) => x.code === code); if (!e) throw new Error(`no ${code} in the manifest`); return e; };
  const edits = [
    { e: pick("HOME-HERO-01"), to: "From Spreadsheets to" },
    { e: manifest.find((x) => x.text.startsWith("We do not sell your information")), to: "We never sell your information, and we never use it for advertising or profiling." },
    { e: pick("CONTACT-FORM-10"), to: "Please tell us your name." },
  ];
  const zip = await JSZip.loadAsync(fs.readFileSync(original));
  let xml = await zip.file("word/document.xml").async("string");
  for (const { e, to } of edits) {
    const needle = `>${esc(e.text)}</w:t>`;
    const n = xml.split(needle).length - 1;
    step(`cell ${e.code} appears once in the document`, n === 1, `${n} occurrences`);
    xml = xml.replace(needle, `>${esc(to)}</w:t>`);
  }
  zip.file("word/document.xml", xml);
  const edited = path.join(tmp, "edited.docx");
  fs.writeFileSync(edited, await zip.generateAsync({ type: "nodebuffer" }));

  const plan = await planImport(edited);
  const got = plan.changes.map((c) => c.code).sort().join(",");
  const want = edits.map((x) => x.e.code).sort().join(",");
  step("dry run finds exactly the three edits", plan.problems.length === 0 && got === want, `got [${got}]`);
  step("dry run reads the new text back exactly", plan.changes.every((c) => c.new === edits.find((x) => x.e.code === c.code)?.to));

  // 3. import for real, type-check, and see the text on the site
  const files = applyImport(plan.changes);
  step("import writes the content modules", files.length > 0, files.join(", "));
  const again = await planImport(edited);
  step("a second import is a no-op", again.changes.length === 0, `${again.changes.length} changes`);
  try { execFileSync("npx", ["tsc", "--noEmit", "-p", "."], { cwd: ROOT, stdio: "pipe" }); step("tsc passes", true); }
  catch (err) { step("tsc passes", false, String(err.stdout || err.message).slice(0, 400)); }

  const until = async (name, fn) => { let last = ""; for (let i = 0; i < 40; i++) { try { last = await fn(); if (last === true) return step(name, true); } catch (err) { last = err.message; } await new Promise((s) => setTimeout(s, 1000)); } step(name, false, String(last).slice(0, 200)); };
  const html = async (route, text) => { const res = await fetch(SITE + route, { cache: "no-store" }); const body = await res.text(); return body.includes(esc(text)) || body.includes(text) ? true : `${res.status}, text not in ${route}`; };
  await until("/ shows the new hero line", () => html("/", edits[0].to));
  await until("/privacy-policy shows the new paragraph", () => html("/privacy-policy", edits[1].to));
  await until("/contact ships the new form error", async () => {
    // the error is client-side: find it in the route's own script chunks
    const res = await fetch(SITE + "/contact", { cache: "no-store" });
    const body = await res.text();
    const srcs = [...body.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
    for (const s of srcs) { const js = await (await fetch(new URL(s, SITE), { cache: "no-store" })).text(); if (js.includes(edits[2].to)) return true; }
    return `${res.status}, text in none of ${srcs.length} chunks`;
  });
} finally {
  restore();
  const back = await planImport(path.join(tmp, "export.docx")).catch((err) => ({ changes: [], problems: [err.message] }));
  step("source restored", back.problems.length === 0 && back.changes.length === 0);
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
