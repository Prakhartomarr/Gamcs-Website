# Responsive audit — GAMCS site

**Method.** Static: full parse of `app/globals.css` (2,138 lines, 81 `@media`
blocks → 14 distinct conditions) with a brace-stack tokenizer that records each
declaration's at-rule context, plus the header components. Empirical: headless
Chrome against the running dev server.

**Empirical coverage.** Measured in headless Chrome at 320 and 390 (and
768/1440 on `/`): **`/`, `/solutions`, `/case-study`, `/contact`, `/faq`** — five
routes. **Not measured: `/team`, the six `/solutions/*` detail pages,
`/thank-you`, and the legal pages** — see S0; `/team` hangs the compiler and
wedges every route after it, which is a finding in its own right rather than
just a limitation. Those are static-analysis only. Cascade findings are
deterministic (source order and specificity, not rendering) and hold regardless.

Root font-size is `112.5%` = **18px**, so `1rem` = 18px throughout.

---

## S0 — `/team` hangs the Next compiler and wedges every route after it

- **What breaks:** `next dev` never finishes compiling `/team` — reproduced three times independently, on two separate server instances. `○ Compiling /team ...` never completes, and the wedged compiler then times out every route requested afterwards. This is what blocked most of this audit's route coverage; I initially misattributed it to memory pressure alone.
- **file:line:** not isolated to a line — start at `components/shadcn-space/blocks/team-01/team.tsx` and the `/team` route's imports.
- **Fix:** bisect `/team`'s imports to find the module that never resolves; the page's own markup (`max-w-7xl px-4 sm:px-6`, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) is responsive-safe by construction, so this is a build problem, not a CSS one.
- **Desktop risk:** n/a — nothing renders at any width until this is fixed.

## S1 — A block of unconditional rules at L1237–L1346 silently disables the responsive layer

This is the root cause, and the `.hero h1` bug you already knew about is one of
eight instances. Late in the file sits a block of restyles that re-declare
selectors **without a media query**. Media queries add *zero specificity* — they
only gate applicability. So at equal specificity the cascade falls through to
source order, and an unconditional rule appearing *after* a `@media` rule wins
inside that media query's own band.

Every one of these kills a responsive rule declared earlier:

| Killed at | Selector | Dead rule(s) | Affected widths |
|---|---|---|---|
| `globals.css:1237` | `.hero h1` | L649, L687, L727 | ≤1279 |
| `globals.css:1240` | `.hero h1 .line` | L688 | ≤767 |
| `globals.css:1256` | `.who,.metrics,.people,.quote-section` padding | tablet + mobile | ≤1279 |
| `globals.css:1261` | `.services` padding | tablet + mobile | 768–1279 |
| `globals.css:1265` | `.section-head` | flex align + margin | ≤1279 |
| `globals.css:1266` | `.section-head>p` | type scale | ≤1279 |
| `globals.css:1295` | `.who-lead` | mobile size step-down | ≤767 |
| `globals.css:1341` | `.page-head h1` | mobile page-title size | ≤1279 |

- **What breaks:** tablet and phone layout rules across eight selectors are dead code. Desktop is unaffected — every dead rule is a `max-width` query.
- **file:line:** `app/globals.css:1237–1346`
- **Fix:** move the whole L1237+ block *above* the first `@media` (i.e. merge into the L182–L560 base layer) so source order puts the base first and the media queries last.
- **Desktop risk:** **none.** These rules already win at ≥1280px; relocating them changes nothing there. Verify by diffing computed styles at 1440 before/after.

## S2 — Hero headline renders 44px on every phone (your reported bug — confirmed)

`.hero h1` is declared **five** times:

```
L182   unconditional                                    clamp(44px,6.4vw,92px)
L649   @media(min-width:768px) and (max-width:1279px)   clamp(40px,6.2vw,58px)
L687   @media(max-width:767px)                          clamp(32px,9.2vw,40px)
L727   @media(max-width:380px)                          1.7778rem  (= 32px @ 18px root)
L1237  unconditional  ← WINS EVERYWHERE                 clamp(44px,6.4vw,92px)
```

All five are `.hero h1` — specificity (0,1,1) in every case. L1237 is
unconditional *and* last, so it applies at every viewport and beats L649/L687/L727
inside their own bands.

Computed: at **320px** `6.4vw` = 20.5px → clamps to the **44px floor** (intended
32px). At **390px** `6.4vw` = 25.0px → **44px** (intended 35.9px). At 768px →
49.2px (intended 47.6px). At 1440px both rules give 92px, so nothing is visibly
wrong on desktop — which is why this survived.

- **What breaks:** hero headline is 44px instead of 32px at 320 and 35.9px at 390 — 37% oversized on the narrowest phones.
- **file:line:** `app/globals.css:1237`
- **Narrowest scoped fix:** delete **only** `font-size` and `line-height` from L1237, keeping its `letter-spacing:-.03em` and `color:var(--ink-deep)`. L182 then supplies the base font-size and the three media queries apply again.
- **Desktop risk:** **none.** L182's `font-size` is byte-identical to L1237's, so ≥1280px is unchanged. Note L1237 is *not* a stray duplicate — it deliberately changes tracking and colour vs L182, so deleting the whole block would silently revert those two.

## S3 — Mobile drawer starts 20–28px above the bottom of its own header

- **What breaks:** the drawer is `top-14` (56px) but the header bar is 76px tall (`py-4` around a 44px row), and 84px at ≥640px (`sm:py-5`). The sheet overlaps the header, or leaves a gap, by 20px below 640px and 28px from 640–1279px.
- **file:line:** `components/ui/header-2.tsx:358`
- **Fix:** replace `top-14` with `top-[var(--header-h)]`, which already resolves to 76/84px.
- **Desktop risk:** **none** — the sheet is `xl:hidden`, so it never renders ≥1280px.

## S4 — Breakpoint gaps between 621px and 1279px

14 distinct conditions exist, but they were added independently and their edges
don't meet. Bands where a layout rule from one tier runs into a container sized
by another:

- **901–980px** — 4-column maturity curve and 5-across logo wall inside a 920px container (`globals.css:1194`)
- **981–1023px** — 3-column services grid at ~295px per 440px-tall card (`globals.css:1876`)
- **1024–1100px** — no breakpoint of its own; `.hero h1 .line-inner{white-space:nowrap}` starts at 1101px, so the headline wraps differently either side (`globals.css:186`)
- **621–767px** — 4-across logos and 2-across service cards inside a phone-tier container (`globals.css:1877`)

- **Fix:** align the edges — pick one ladder (e.g. 640/768/1024/1280) and migrate the odd values (620, 900, 980, 1101) onto it.
- **Desktop risk:** **medium.** This touches many rules; do it one breakpoint at a time with before/after computed-style diffs.

## S5 — `.btn{white-space:nowrap}` un-neutralised in the drawer band

- **What breaks:** the nowrap escape hatch only applies below 768px, but the drawer is visible up to 1279px, so a long CTA label can overflow its pill at 768–1279px.
- **file:line:** `app/globals.css:131` (the `≤767px` patch is at `:2011`)
- **Fix:** widen the patch's media query from `max-width:767px` to `max-width:1279px`.
- **Desktop risk:** **none** — ≥1280px is outside the query either way.

## S6 — Fluid type that pins to its floor on phones

32 `clamp()` declarations; several never leave their floor at phone widths, so
the "fluid" range is inert there. Two are tight enough to be worth checking:

- `.contact-box h2` — `clamp(38px,4.5vw,…)`; at 320px `4.5vw`=14.4px → pins to **38px** in roughly 240px of usable width (`globals.css:371`)
- `.stat-hero-value` — pins to **42px** inside a 244px card at 320px (`globals.css:909`)

Others are merely inert rather than risky: `.fin-lead` doesn't leave its floor
until ~1565px (`:1813`), `.fmc-note` until ~1311px (`:1969`).

- **Fix:** lower the floors on the two tight ones, or reduce their container padding at ≤380px.
- **Desktop risk:** **none** if only the floor changes — the ceiling governs desktop.

## S7 — Dead `.nav.open` drawer stylesheet

- **What breaks:** nothing. ~12 lines describing a mobile nav that no longer exists; `.nav`'s visibility is controlled by Tailwind `hidden xl:flex`, not this.
- **file:line:** `app/globals.css:585`
- **Fix:** delete.
- **Desktop risk:** **none** — the selector never matches.

## S8 — Horizontal overflow is *hidden*, not absent — and the repo documents a case it is hiding

**Correcting my own first reading.** I initially reported "no horizontal page
overflow" because `scrollWidth` equalled `clientWidth` at every width. That
measurement is real but it does not mean what it appears to:

```
globals.css:98    body{ … overflow-x:hidden }
globals.css:110   .shell{ … overflow:clip }
```

`body`'s `overflow-x` propagates to the viewport, so **a horizontal scrollbar is
impossible on this site by construction.** Content that escapes is silently cut
instead of scrolling. So `scrollWidth == clientWidth` proves only that the guard
is working — not that content fits.

The repo already knows this and says so at `globals.css:2022–2025`: the longest
CTA label rendered **474px wide inside a 292px button — 91px outside it, "cut
silently by the body's overflow-x:hidden."**

- **What breaks:** an overflow regression can never surface as a scrollbar in QA. It appears only as clipped text, which is far easier to miss.
- **file:line:** `app/globals.css:98`, `:110`
- **Fix:** don't remove the guard — it is load-bearing. Instead add a CI/dev assertion that walks the DOM for `getBoundingClientRect().right > innerWidth` at 320/390 and fails the build, so the guard stops doubling as a blindfold.
- **Desktop risk:** **none** — a check, not a style change.

Measured offenders, all currently contained by an `overflow:hidden` ancestor:

| Route | Width | Offenders |
|---|---|---|
| `/` | 390 | none |
| `/` | 320 | 18 — testimonial reel cells, inside `overflow-hidden` + mask |
| `/` | 1440 / 768 | `.globe-feature-stage` + canvas, 34px / 113px over; clipped by `.globe-feature{overflow:hidden}` (`:878`) |
| `/solutions` | 320 & 390 | 22 — six `.pillar-glyph` spans (clipped by `.pillar-card{overflow:hidden}`) and `.pillar-rail` anchors (the intentional `overflow-x:auto` scroller, `:2062`) |
| `/case-study`, `/contact`, `/faq` | 320 & 390 | none |

`.hero-bg` uses `width:100vw` (`globals.css:170`). `100vw` includes the
scrollbar, so it can exceed the viewport by ~15px on desktop browsers with a
classic scrollbar. Headless Chrome hides scrollbars, so **this case remains
untested** — and the `overflow-x:hidden` guard would mask it anyway.

## S9 — A second override mechanism: specificity, not source order

`.hero .sub` at `globals.css:1242` is specificity (0,2,0). The responsive rules
it overrides — `.sub` at `:639` and `:650` — are (0,1,0). This one wins on
**specificity**, so unlike S1 it would survive simply reordering the file.

- **What breaks:** the ≤767px and tablet `.sub` sizing never applies inside the hero.
- **file:line:** `app/globals.css:1242`
- **Fix:** scope the responsive rules to `.hero .sub` too, or drop `.hero` from the L1242 selector.
- **Desktop risk:** **low** — but unlike S1 this one is not fixed by relocation, so it needs its own change.

## S10 — Twelve empty `@media` blocks and a stale tier comment

- **What breaks:** nothing functionally. Twelve `@media` blocks contain no live declarations (L826, 937, 942, 946, 950, 974, 1234, 1447, 1522, 1526, 1546, 1549). Separately, the file documents its own responsive system at `L564–571` as "≤1100 touch / 769–980 tablet / ≤768 phone / desktop ≥1101" — **none of those four numbers is a breakpoint the file uses.** The real ones are 1279 / 768 / 767 / 380.
- **file:line:** `app/globals.css:564–571` and the twelve blocks above
- **Fix:** delete the empty blocks; rewrite the comment to the actual stops.
- **Desktop risk:** **none.**

---

## Not verified

- `/team`, the six `/solutions/*` detail pages, `/thank-you` and the legal pages — blocked by the S0 compile hang.
- The `100vw` scrollbar case in S8 (needs a real browser with a classic scrollbar).
- `npm run build` has not run at any point today.
