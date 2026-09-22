// Writes the site copy as a Word document from scripts/copy/manifest.json,
// refreshing every entry's text from the content modules first.
// usage: node scripts/copy/export.mjs [out.docx]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { paragraph, table, writeDocx } from "./docx.mjs";
import { read, ROOT } from "./source.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const MANIFEST = path.join(HERE, "manifest.json");
export const DEFAULT_OUT = path.join(ROOT, "content-doc", "GAMCS-website-copy.docx");

const TAG = { alt: "alt", "meta-title": "tab title", "meta-description": "search description", placeholder: "placeholder", error: "error", "aria-label": "screen reader", button: "button" };

/** The manifest with every text refreshed from source. */
export function loadManifest() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  for (const e of manifest) e.text = read(e.source.file, e.source.locator).text;
  return manifest;
}

/** Rows as the document shows them: shared text once, everything else in place. */
export function rows(manifest) {
  const byText = new Map();
  for (const e of manifest) byText.set(e.text, (byText.get(e.text) || 0) + 1);
  const shared = new Map(); // text -> entries, in first-appearance order
  const single = [];
  for (const e of manifest) {
    if (byText.get(e.text) > 1) { if (!shared.has(e.text)) shared.set(e.text, []); shared.get(e.text).push(e); }
    else single.push(e);
  }
  return { single, shared: [...shared.values()] };
}

export async function exportDocx(out = DEFAULT_OUT) {
  const manifest = loadManifest();
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + "\n");
  const { single, shared } = rows(manifest);
  const date = new Date().toISOString().slice(0, 10);
  let body = paragraph(`GAMCS website copy - generated ${date}`, "Title");
  body += paragraph("How to use this document: edit the text in the right-hand column and send the file back. Leave the grey codes alone, and do not add or delete rows — each code is how the text finds its place on the site. A line break inside a cell stays a line break. Text with {curly} placeholders is filled in by the site (an email address, a number); keep the placeholder where it is.", null);
  body += paragraph("Pages follow the site's order: the header, the homepage top to bottom, then every other page, then the footer and the cookie banner. A small tag under a code says what the text is when it is not ordinary page text: a tab title, a search description, an image's alt text, a form placeholder, a validation error, a screen-reader label or a button.", null);
  body += paragraph("The last section, Shared text, holds every line that appears in more than one place (for example “Schedule a Call”). It is listed once, with all of its codes, so it only needs editing once.", null);

  let page = null, section = null, pending = [];
  const flush = () => { if (pending.length) body += table(pending); pending = []; };
  for (const e of single) {
    if (e.page !== page) { flush(); page = e.page; section = null; body += paragraph(page, "Heading1"); }
    if (e.section !== section) { flush(); section = e.section; body += paragraph(section, "Heading2"); }
    pending.push({ codes: [e.code], tag: TAG[e.kind], text: e.text });
  }
  flush();
  body += paragraph("Shared text", "Heading1");
  body += paragraph("Each line below appears in every place its codes name. Edit it once here.", null);
  body += table(shared.map((list) => ({ codes: list.map((e) => e.code), tag: [...new Set(list.map((e) => TAG[e.kind]).filter(Boolean))].join(", ") || undefined, text: list[0].text })));

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, await writeDocx(body));
  return { out, entries: manifest.length, rows: single.length + shared.length, shared: shared.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_OUT;
  const r = await exportDocx(out);
  console.log(`Wrote ${r.out}: ${r.entries} entries in ${r.rows} rows (${r.shared} shared).`);
  if (out === DEFAULT_OUT) {
    const desk = path.join(os.homedir(), "Desktop", path.basename(out));
    fs.copyFileSync(out, desk);
    console.log(`Copied to ${desk}`);
  }
}
