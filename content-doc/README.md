# Site copy: the Word document round trip

1. **Export** — `node scripts/copy/export.mjs` writes `content-doc/GAMCS-website-copy.docx` (and a copy to `~/Desktop`) from `scripts/copy/manifest.json`, with every line refreshed from `lib/content/*.ts`.
2. **Edit** — the owner changes text in the right-hand column only; codes stay, rows are never added or removed, and *Shared text* lines are edited once.
3. **Import** — `node scripts/copy/import.mjs <file.docx> --dry-run` lists every change (code, label, old, new); without `--dry-run` it writes them into the content modules and refuses on an unknown, duplicated or missing code.
4. **Review** — `git diff -- lib/content` and, if a line was reworded that a component keys on (the six How-we-help point titles), fix the component; `node scripts/copy/check.mjs` runs the whole loop against the dev server (it fetches `/`, `/privacy-policy` and `/contact`).
5. **Commit** — the `.docx` is never committed (this folder is gitignored except for this file); the manifest is, so codes stay stable.

New copy goes into a content module first, then into the manifest with a new code in the existing scheme (`<PAGE>-<SECTION>-<NN>`, appended at the end of its section). Codes never change once assigned.
