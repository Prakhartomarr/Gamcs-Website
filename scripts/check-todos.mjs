/**
 * Lists every `[[TODO: …]]` placeholder in lib/content, with its file and line.
 *
 * A placeholder is a fact the business has not supplied. It renders on the
 * page on purpose, so that a hole never gets filled with a plausible guess —
 * see the rule at the top of lib/content/todo.ts, which is also the registry
 * this script checks the page against.
 *
 * ONE SWITCH:  TODO_CHECK=strict (the default) | warn
 *   strict — exits 1 if any placeholder is on the site, or if the page and the
 *            registry disagree. This is the release gate: `npm run check:todos`.
 *   warn   — prints the same report, exits 0. This is what `prebuild` runs.
 *            The page genuinely ships with placeholders today, so a hard
 *            failure there would block every deploy until the client answers
 *            them. Flip prebuild to strict the day the list is empty.
 *
 * usage: node scripts/check-todos.mjs   |   TODO_CHECK=warn node scripts/check-todos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "lib", "content");
const REGISTRY = path.join(DIR, "todo.ts");
const MARKER = /\[\[TODO:\s*([^\]]*?)\s*\]\]/g;
const warn = (process.env.TODO_CHECK || "strict").toLowerCase() === "warn";

/** Every marker on the site, in file order. The registry itself is not content. */
const found = [];
for (const name of fs.readdirSync(DIR).sort()) {
  const file = path.join(DIR, name);
  if (!name.endsWith(".ts") || file === REGISTRY) continue;
  fs.readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    for (const m of line.matchAll(MARKER)) {
      found.push({ where: `lib/content/${name}:${i + 1}`, need: m[1], text: m[0] });
    }
  });
}

/* The registry is read as text, not imported: this script runs under plain
   node with no TypeScript loader. The file is a flat literal, so its `need:`
   strings are unambiguous. */
const registered = [...fs.readFileSync(REGISTRY, "utf8").matchAll(/^\s*need:\s*"([^"]+)"/gm)].map((m) => m[1]);

for (const f of found) console.log(`${f.where}  ${f.text}`);

const unregistered = found.filter((f) => !registered.includes(f.need));
const stale = registered.filter((r) => !found.some((f) => f.need === r));
for (const f of unregistered) console.log(`  not in lib/content/todo.ts: ${f.text} (${f.where})`);
for (const r of stale) console.log(`  in lib/content/todo.ts but not on any page: "${r}" — delete the row`);

const bad = found.length || unregistered.length || stale.length;
if (!bad) {
  console.log("check:todos — no placeholders left in lib/content.");
  process.exit(0);
}
console.log(
  `\n${warn ? "WARNING" : "FAIL"}: ${found.length} placeholder${found.length === 1 ? "" : "s"} still on the site` +
    `${unregistered.length ? `, ${unregistered.length} unregistered` : ""}` +
    `${stale.length ? `, ${stale.length} stale registry row(s)` : ""}.` +
    `\nEach one is a fact the client has to supply. Do NOT guess one: see lib/content/todo.ts.`
);
process.exit(warn ? 0 : 1);
