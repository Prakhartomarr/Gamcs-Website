// Finds and rewrites string literals in the content modules by dotted path,
// e.g. "faq.items[3].a" or "privacy.blocks[2].p[1].text", using the
// TypeScript parser already in devDependencies. Nothing is executed; the
// modules are read as text, so `as const`, `satisfies` and template literals
// are all fine.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ts = createRequire(import.meta.url)("typescript");

/** Which content module declares each top-level export. */
export const MODULES = {
  "lib/content/gamcs.ts": ["site", "hero", "intro", "story", "primaryCta", "whyUs", "services", "achievements", "team", "testimonials", "caseStudies", "contact", "footer", "faq", "solutions", "solutionsHub", "maturityCurve", "clients", "dataToDecision", "preloader", "careers"],
  "lib/content/ui.ts": ["header", "crumbs", "cookie", "map", "reel", "sections", "servicePage", "caseCard", "roster"],
  "lib/content/pages.ts": ["pages"],
  "lib/content/legal.ts": ["legal", "privacy", "cookiePolicy"],
};

export const fileFor = (locator) => {
  const root = locator.split(/[.[]/)[0];
  const file = Object.keys(MODULES).find((f) => MODULES[f].includes(root));
  if (!file) throw new Error(`No content module declares "${root}" (locator ${locator})`);
  return file;
};

const sources = new Map();
export function load(file, fresh = false) {
  if (fresh || !sources.has(file)) {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    sources.set(file, { text, sf: ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true) });
  }
  return sources.get(file);
}

/** "a.b[2].c" -> ["a", "b", 2, "c"] */
export const segments = (locator) =>
  locator.split(/\.|\[(\d+)\]\.?/).filter((s) => s !== undefined && s !== "").map((s) => (/^\d+$/.test(s) ? Number(s) : s));

const unwrap = (n) => {
  while (n && (ts.isAsExpression(n) || ts.isSatisfiesExpression(n) || ts.isParenthesizedExpression(n) || ts.isTypeAssertionExpression(n))) n = n.expression;
  return n;
};

/** The AST node at a dotted path inside `file`, or throws. */
export function nodeAt(file, locator) {
  const { sf } = load(file);
  const [root, ...rest] = segments(locator);
  let node = null;
  for (const st of sf.statements) {
    if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (d.name.getText(sf) === root) node = d.initializer;
  }
  if (!node) throw new Error(`${file}: no export "${root}"`);
  node = unwrap(node);
  for (const seg of rest) {
    if (typeof seg === "number") {
      if (!ts.isArrayLiteralExpression(node)) throw new Error(`${locator}: expected an array at [${seg}]`);
      node = unwrap(node.elements[seg]);
    } else {
      if (!ts.isObjectLiteralExpression(node)) throw new Error(`${locator}: expected an object at .${seg}`);
      const prop = node.properties.find((p) => ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === seg);
      if (!prop) throw new Error(`${locator}: no property "${seg}"`);
      node = unwrap(prop.initializer);
    }
    if (!node) throw new Error(`${locator}: nothing at ${seg}`);
  }
  return node;
}

/** The string at a dotted path: { text, raw, start, end, quote }. Throws if it is not a plain string literal. */
export function read(file, locator) {
  const node = nodeAt(file, locator);
  if (!ts.isStringLiteral(node) && !ts.isNoSubstitutionTemplateLiteral(node)) throw new Error(`${locator}: not a plain string (${ts.SyntaxKind[node.kind]})`);
  const { sf } = load(file);
  const start = node.getStart(sf);
  const raw = node.getText(sf);
  return { text: node.text, raw, start, end: node.end, quote: raw[0] };
}

/**
 * Serialises `text` as a literal with the same quote as the original, keeping
 * every \uXXXX escape the original used and always escaping invisible
 * characters (controls, zero-width, BOM) so they cannot hide in the source.
 */
export function literal(text, raw) {
  const quote = raw[0];
  const keep = new Set([...raw.matchAll(/\\u\{?([0-9a-fA-F]+)\}?/g)].map((m) => parseInt(m[1], 16)));
  let out = quote;
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (ch === "\\") out += "\\\\";
    else if (ch === quote) out += "\\" + quote;
    else if (ch === "\n") out += "\\n";
    else if (ch === "\r") out += "\\r";
    else if (ch === "\t") out += "\\t";
    else if (quote === "`" && ch === "$") out += "\\$";
    else if (keep.has(cp) || cp < 0x20 || (cp >= 0x200b && cp <= 0x200f) || cp === 0x2028 || cp === 0x2029 || cp === 0xfeff)
      out += "\\u" + cp.toString(16).padStart(4, "0");
    else out += ch;
  }
  return out + quote;
}

/** Applies { locator -> newText } edits to one file in a single pass (later offsets first). */
export function write(file, edits) {
  const { text } = load(file, true);
  const spans = [];
  for (const [locator, newText] of edits) {
    const r = read(file, locator);
    if (r.text === newText) continue;
    spans.push({ start: r.start, end: r.end, lit: literal(newText, r.raw) });
  }
  spans.sort((a, b) => b.start - a.start);
  let out = text;
  for (const s of spans) out = out.slice(0, s.start) + s.lit + out.slice(s.end);
  fs.writeFileSync(path.join(ROOT, file), out);
  load(file, true);
  return spans.length;
}

export { ROOT };
