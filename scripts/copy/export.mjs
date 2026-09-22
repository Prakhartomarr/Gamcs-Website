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

/**
 * Rows as the document shows them, in site order. A line used in several
 * places is one row at its FIRST appearance, carrying every code, so it is
 * edited once and the page still reads top to bottom; each later appearance
 * gets a grey note under its section instead of a second row.
 */
export function rows(manifest) {
  const byText = new Map();
  for (const e of manifest) {
    if (!byText.has(e.text)) byText.set(e.text, []);
    byText.get(e.text).push(e);
  }
  const out = []; // { page, section, codes, tag, text } | { page, section, note }
  for (const e of manifest) {
    const list = byText.get(e.text);
    if (list.length === 1) out.push({ page: e.page, section: e.section, codes: [e.code], tag: TAG[e.kind], text: e.text });
    else if (list[0] === e) out.push({ page: e.page, section: e.section, codes: list.map((x) => x.code), tag: [...new Set(list.map((x) => TAG[x.kind]).filter(Boolean))].join(", ") || undefined, text: e.text });
    else out.push({ page: e.page, section: e.section, note: { text: e.text, at: list[0].code } });
  }
  return out;
}

export async function exportDocx(out = DEFAULT_OUT) {
  const manifest = loadManifest();
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + "\n");
  const all = rows(manifest);
  const date = new Date().toISOString().slice(0, 10);
  let body = paragraph(`GAMCS website copy - generated ${date}`, "Title");
  body += paragraph("How to use this document: edit the text in the right-hand column and send the file back. Leave the grey codes alone, and do not add or delete rows — each code is how the text finds its place on the site. A line break inside a cell stays a line break. Text with {curly} placeholders is filled in by the site (an email address, a number); keep the placeholder where it is.", null);
  body += paragraph("Pages follow the site's order: the header, the homepage top to bottom, then every other page, then the footer and the cookie banner. A small tag under a code says what the text is when it is not ordinary page text: a tab title, a search description, an image's alt text, a form placeholder, a validation error, a screen-reader label or a button.", null);
  body += paragraph("A line that appears in more than one place (for example “Schedule a Call”) is listed once, where it first appears, with all of its codes. Where it appears again, a grey note under that section points back to it — edit it once, at the first place.", null);

  const GREY = '<w:i/><w:color w:val="767676"/><w:sz w:val="18"/>';
  let page = null, section = null, pending = [], notes = [];
  const flush = () => {
    if (pending.length) body += table(pending);
    if (notes.length) body += paragraph("Also shown in this section (edit it where its code is): " + notes.map((n) => `“${n.text.length > 60 ? n.text.slice(0, 57) + "…" : n.text}” (${n.at})`).join(" · "), null, GREY);
    pending = []; notes = [];
  };
  for (const r of all) {
    if (r.page !== page) { flush(); page = r.page; section = null; body += paragraph(page, "Heading1"); }
    if (r.section !== section) { flush(); section = r.section; body += paragraph(section, "Heading2"); }
    if (r.note) { if (!notes.some((n) => n.text === r.note.text)) notes.push(r.note); }
    else pending.push(r);
  }
  flush();
  const shared = all.filter((r) => r.codes && r.codes.length > 1).length;

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, await writeDocx(body));
  return { out, entries: manifest.length, rows: all.filter((r) => r.codes).length, shared };
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
