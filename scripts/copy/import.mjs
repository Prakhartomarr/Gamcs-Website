// Applies an edited copy document back to the content modules.
// usage: node scripts/copy/import.mjs <file.docx> [--dry-run]
// Refuses (exit 1, nothing written) on an unknown, duplicated or missing code.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readDocxTables } from "./docx.mjs";
import { loadManifest } from "./export.mjs";
import { write } from "./source.mjs";

const CODE = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/;

/** { changes, problems, warnings } for a document against the current source. */
export async function planImport(file) {
  const manifest = loadManifest();
  const byCode = new Map(manifest.map((e) => [e.code, e]));
  const seen = new Map(); // code -> new text
  const problems = [], warnings = [];
  const tables = await readDocxTables(fs.readFileSync(file));
  let rows = 0;
  for (const t of tables) for (const cells of t) {
    if (cells.length < 2) { problems.push(`a table row has ${cells.length} cell(s) instead of 2`); continue; }
    rows++;
    const codes = cells[0].split("\n").map((s) => s.trim()).filter((s) => CODE.test(s));
    const text = cells[1];
    if (!codes.length) { problems.push(`row ${rows}: no code in the left column (${JSON.stringify(cells[0].slice(0, 40))})`); continue; }
    for (const code of codes) {
      if (!byCode.has(code)) { problems.push(`unknown code ${code} (was it edited?)`); continue; }
      if (seen.has(code)) { problems.push(`code ${code} appears twice`); continue; }
      seen.set(code, text);
    }
  }
  for (const e of manifest) if (!seen.has(e.code)) problems.push(`missing row for ${e.code} (${e.label})`);
  const changes = [];
  for (const e of manifest) {
    if (!seen.has(e.code)) continue;
    const next = seen.get(e.code);
    if (next.trim() === "") { if (e.text !== "") warnings.push(`${e.code} is empty in the document — skipped (${e.label})`); continue; }
    if (next !== e.text) changes.push({ code: e.code, label: e.label, file: e.source.file, locator: e.source.locator, old: e.text, new: next });
  }
  return { changes, problems, warnings, rows };
}

/** Writes the planned changes into the content modules. Returns files touched. */
export function applyImport(changes) {
  const byFile = new Map();
  for (const c of changes) { if (!byFile.has(c.file)) byFile.set(c.file, []); byFile.get(c.file).push([c.locator, c.new]); }
  for (const [file, edits] of byFile) write(file, edits);
  return [...byFile.keys()];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry-run");
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) { console.error("usage: node scripts/copy/import.mjs <file.docx> [--dry-run]"); process.exit(2); }
  const { changes, problems, warnings, rows } = await planImport(path.resolve(file));
  for (const w of warnings) console.warn(`warning: ${w}`);
  if (problems.length) {
    for (const p of problems) console.error(`refused: ${p}`);
    console.error(`Nothing written (${problems.length} problem${problems.length > 1 ? "s" : ""}).`);
    process.exit(1);
  }
  console.log(`${rows} rows read, ${changes.length} change${changes.length === 1 ? "" : "s"}${dry ? " (dry run)" : ""}.`);
  for (const c of changes) console.log(`\n${c.code}  ${c.label}\n  - ${JSON.stringify(c.old)}\n  + ${JSON.stringify(c.new)}`);
  if (!dry && changes.length) {
    const files = applyImport(changes);
    console.log(`\nWrote ${files.join(", ")}. Review with: git diff -- ${files.join(" ")}`);
  }
}
