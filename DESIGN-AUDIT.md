# DESIGN-AUDIT.md

Front-end design-system consistency audit of the GAMCS website.

**Verdict up front: this site is not built on a design system. It is built on
ad-hoc values with a token file sitting next to them, unused.** 97 CSS custom
properties are defined; 54.5% of colour declarations ignore them and hardcode a
literal instead. There are 264 distinct colour values, 56 distinct font sizes,
64 distinct spacing values and 18 distinct button implementations in a site with
9 routes.

The one place real discipline exists is image assets, and that is because they
were produced by a script rather than by hand.

---

## Method

Every number below was extracted mechanically, not read off by eye.

| Source | What was parsed | Volume |
|---|---|---|
| `app/globals.css` | every `prop: value` declaration, comments stripped positionally so line numbers stay true | **3,773 declarations**, 2,019 lines |
| `.tsx` / `.ts` | every `className="…"` token | **1,032 class tokens** |
| `.tsx` / `.ts` | every `style={{…}}` property | **101 inline declarations** |
| `app/globals.css` | every `@media` block | **77 blocks** |
| `public/` | intrinsic pixel dimensions via `sips` | 31 files |
| running site | computed styles + WCAG contrast, walked from the live DOM at `localhost:3001` | 64 text/background pairs |

Extraction scripts: `extract.py` (parser), `c1_spacing.py`, `c2_type.py`,
`c3_color.py`, `c4589.py`, `tokens.py`, `opt.py`. Line-number accuracy was
spot-checked against the source on 6 random declarations (6/6 correct).

**Unit basis:** `app/globals.css:844` sets `html{font-size:112.5%}`, so
**1rem = 18px** throughout. All rem values are converted before comparison.
This matters: `0.7778rem` is 14px, not 12.4px.

**One correction to a common assumption.** `.container` is authored at
`min(1440px, 100% - 96px)` (`app/globals.css:111`) but **measures 1280px** in
the browser at a 1440px viewport — Tailwind's own `.container` component
utility applies `max-width:1280px` and wins. Every character-per-line figure
below uses the measured 1280px, not the authored 1440px.

**Not measured:** rendered appearance, whitespace quality, composition. Out of
scope and not inferable from source.

---

# A. SCORECARD

| # | Category | Rating | The number that justifies it |
|---|---|---|---|
| 1 | Spacing scale | **Ad-hoc** | 64 distinct values; only **53.3%** land on a 4px multiple, **30.2%** on 8px. 37 of 64 distinct values are off-scale, accounting for 46.7% of all occurrences. |
| 2 | Type scale | **Ad-hoc** | **56 distinct font sizes**; **36 of them (64%) are used fewer than 3 times**. 29 distinct line-heights, 31 distinct letter-spacings, 10 weight declarations. |
| 3 | Colour system | **Ad-hoc** | **264 distinct colour values** (139 hex, 76 rgb/rgba, 49 oklch) against 97 defined tokens. **54.5% of colour declarations are hardcoded.** 18 near-duplicate groups — one contains **26 near-identical light greys**. |
| 4 | Layout grid | **Partial** | 1 responsive container (4 breakpoint-scoped declarations) — but a 5th, Tailwind's `.container`, silently caps it at 1280px. **47 distinct `max-width` values**, 23 distinct `grid-template-columns`. |
| 5 | Breakpoints | **Partial** | 10 distinct px breakpoints across 77 blocks — a defensible count — but **mixed direction** (8 `min-width` vs 47 `max-width`) and a 767/768 near-duplicate pair. |
| 6 | Component reuse | **Ad-hoc** | **18 distinct button implementations across 31 render sites.** The primary-CTA markup block is copy-pasted **8 times** while a purpose-built `ShimmerCTA` component sits with **0 importers**. |
| 7 | Line length | **Partial** | 21 distinct `max-width` values govern body copy across **two unit systems** (13 `ch` values + 8 `px` values). 7 rules resolve above 80ch; **47 of 136** text elements have no authored measure at all. |
| 8 | Motion | **Ad-hoc** | **27 distinct durations**. The top 3 (300/250/200ms) cover only 42% of uses; the tail includes 180, 220, 240, 260, 280, 320, 460ms. 6 easings, and 2 of those are one-offs. |
| 9 | Radius | **Ad-hoc** | **22 distinct radius values** across 89 declarations, including 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 26, 30px. 5 are used exactly once. |
| 10 | Aspect ratios | **Systematic** | Only **3 distinct intrinsic ratios** ship; 24 of 29 image files are byte-identical 400×168. 7 of 7 render sites declare `object-fit`. *(See caveat below.)* |
| 11 | Interaction hierarchy | **Ad-hoc** | **4 filled-CTA treatments in 3 different fill colours** (`#0F5E97`, `#202020`, a blue gradient). **4 filled CTAs render simultaneously** on the homepage at ≥1280px — no single dominant action. The same label, "Schedule a Call", renders in two visually different buttons on one page. |
| 12 | Asset hygiene | **Partial** | **29 of 29 logo/icon assets are raster. 0 `.svg` files exist in the repo.** Offset by AVIF/WebP being configured and 6 of 7 image elements being sized correctly. |
| 13 | Accessibility | **Partial** | 64 distinct text/background pairs; **5 genuinely fail WCAG AA** (worst 2.38:1), plus 1 marginal gradient failure at 4.48:1 against a 4.5 threshold. |

**Caveat on category 10.** That rating is not evidence of design discipline. The
24 identical 400×168 logos were generated by a normalisation script written
earlier in this same session, and the `.who-portrait` `aspect-ratio` came with
it. Before that work, the same folder held images at 186×209, 2565×2565,
1600×1042 and 300×52. Category 10 measures a script's output, not a team habit.

---

# B. FREQUENCY TABLES

## B1. Spacing — 666 values, 64 distinct

`margin` / `padding` / `gap` / `inset` from CSS, inline styles and Tailwind
spacing utilities.

| px | count | % | on 4px grid |
|---:|---:|---:|:---:|
| 12 | 45 | 6.8% | ✅ |
| 8 | 39 | 5.9% | ✅ |
| **10** | **38** | **5.7%** | ❌ |
| 24 | 36 | 5.4% | ✅ |
| **18** | **36** | **5.4%** | ❌ |
| 16 | 34 | 5.1% | ✅ |
| **22** | **33** | **5.0%** | ❌ |
| 20 | 32 | 4.8% | ✅ |
| **14** | **28** | **4.2%** | ❌ |
| **26** | **25** | **3.8%** | ❌ |
| 28 | 21 | 3.2% | ✅ |
| 40 | 19 | 2.9% | ✅ |
| **6** | **19** | **2.9%** | ❌ |
| 32 | 17 | 2.6% | ✅ |
| **30** | **17** | **2.6%** | ❌ |
| **9** | **16** | **2.4%** | ❌ |
| 4 | 15 | 2.3% | ✅ |
| **7** | **13** | **2.0%** | ❌ |
| 44 | 13 | 2.0% | ✅ |
| 56 | 13 | 2.0% | ✅ |
| **34** | **11** | **1.7%** | ❌ |
| 64 | 11 | 1.7% | ✅ |
| **5** | **11** | **1.7%** | ❌ |
| 36 | 11 | 1.7% | ✅ |

**Source split:** 590 from CSS literals, 69 from Tailwind scale classes, 5 from
inline styles, 2 from Tailwind arbitrary values.

**The 37 off-scale distinct values:** `1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15,
17, 18, 19, 21, 22, 25, 26, 30, 34, 35, 38, 42, 45, 46, 50, 54, 55, 70, 86, 90`
plus negatives `-2, -29, -33, -34, -125`.

Representative citations:

| px | file:line | declaration |
|---|---|---|
| 5 | `app/globals.css:206` | `.card-more{gap:5px}` |
| 5 | `app/globals.css:230` | `.bars{gap:5px}` |
| 5 | `app/globals.css:255` | `.chip-tip{padding:5px 9px}` |
| 5 | `app/globals.css:332` | `.trust-item{padding:5px 20px}` |
| 5 | `app/globals.css:371` | `.hub-head{padding:5px 7px 14px}` |
| 3 | `app/globals.css:120` | `.brand-name span{margin-top:3px}` |
| 3 | `app/globals.css:332` | `.trust-item span{margin-top:3px}` |
| 3 | `app/globals.css:371` | `.system-point small{margin-top:3px}` |
| 2 | `app/globals.css:977` | `.who-mission{margin:2px 0 0}` |
| 2 | `app/globals.css:1078` | `.tbc{padding:2px 8px}` |
| 2 | `app/globals.css:1088` | `.field-error{margin:2px 0 0}` |
| 1 | `app/globals.css:768` | `.mega-col ul{gap:1px}` |
| 1 | `app/globals.css:827` | `.brand-words{gap:1px}` |
| −125 | `app/globals.css:243` | `.orbit::before{margin:-125px 0 0 -180px}` |
| −33 | `app/globals.css:250` | `.ga-core{margin:-33px 0 0 -33px}` |
| −29 | `app/globals.css:257` | `.chipwrap{margin:-29px 0 0 -29px}` |

## B2. Type — 334 size occurrences, 56 distinct

| px | count | % |
|---:|---:|---:|
| 14 | 54 | 16.2% |
| 16 | 41 | 12.3% |
| 12 | 35 | 10.5% |
| 13 | 31 | 9.3% |
| 17 | 28 | 8.4% |
| 15 | 27 | 8.1% |
| 19 | 8 | 2.4% |
| 18 | 6 | 1.8% |
| 11 | 6 | 1.8% |
| 36 | 6 | 1.8% |
| 30 | 6 | 1.8% |
| 40 | 6 | 1.8% |
| 28 | 6 | 1.8% |
| 24 | 5 | 1.5% |
| 20 | 5 | 1.5% |
| 38 | 4 | 1.2% |
| 34 | 4 | 1.2% |
| 32 | 4 | 1.2% |
| 46 | 4 | 1.2% |
| 44 | 3 | 0.9% |

**36 of 56 sizes are used fewer than 3 times.** The clearest evidence there is
no scale is the fractional set — these are arbitrary rem decimals typed by hand,
not steps chosen from a ramp:

| px | rem authored | file:line |
|---|---|---|
| 14.04 | `0.78rem` | `app/globals.css:1660` `.hwh-no` |
| 14.40 | `0.80rem` | `app/globals.css:1838` `.fsvc-link` |
| 15.12 | `0.84rem` | `app/globals.css:1907` `.fmc-body` |
| 15.39 | `0.855rem` | `app/globals.css:1669` `.hwh-copy p` |
| 15.48 | `0.86rem` | `app/globals.css:1826` `.fsvc-card p` |
| 17.64 | `0.98rem` | `app/globals.css:1910` `.fmc-name` |
| 19.08 | `1.06rem` | `app/globals.css:1824` `.fsvc-card h3` |
| 20.52 | `1.14rem` | `app/globals.css:1788` `.fin-lead` |

Six sizes — 14.04, 15.12, 15.39, 15.48, 17.64, 19.08 — sit within 5px of each
other and each appears once.

**Ratio between consecutive steps:** not consistent. Across the 20 sizes used
3+ times the step ratios run 1.08, 1.07, 1.07, 1.06, 1.13, 1.06, 1.11, 1.20 …
There is no 1.125 / 1.2 / 1.25 / 1.333 / 1.5 ramp.

**Weights:** 10 distinct declarations (400, 500, 600, 700, 800, `bold`,
`normal`, plus Tailwind `font-*`). **Sora 800 is declared in 13 rules but was
not in the font import** until fixed during this session — those numerals were
silently rendering at 700.

**Line-heights:** 29 distinct. Mixed unitless (`1.5`, `1.55`, `1.6`, `1.65`,
`1.12`, `1.14`, `.98`, `1.04`) and absolute. Not consistent per size.

**Letter-spacings:** 31 distinct, including `-.01em`, `-.012em`, `-.02em`,
`-.022em`, `-.025em`, `-.03em`, `-.04em`, `-.05em`, `-.055em`, `-.06em` — ten
near-identical negative tracking values.

**Families:** 5 — `Sora` (86), `Plus Jakarta Sans` (2, plus the `body` default),
`Georgia` (2), `ui-monospace` (2), and `Sora!important` (1).

## B3. Colour — 264 distinct values

| Notation | Distinct |
|---|---:|
| hex | 139 |
| `rgb()` / `rgba()` | 76 |
| `oklch()` | 49 |
| `hsl()` | 0 |
| **Total** | **264** |

97 CSS custom properties are defined. **286 colour declarations use `var()`;
342 hardcode a literal — 54.5% bypass the token layer.**

| hex | count | % |
|---|---:|---:|
| `#ffffff` | 98 | 30.0% |
| `#c3ccd1` | 11 | 3.4% |
| `#e0e3e4` | 10 | 3.1% |
| `#777777` | 6 | 1.8% |
| `#5b6067` | 5 | 1.5% |
| `#8a9198` | 5 | 1.5% |
| `#6e767d` | 5 | 1.5% |
| `#0f5e97` | 4 | 1.2% |
| `#f2c230` | 4 | 1.2% |
| `#98a0a6` | 4 | 1.2% |
| `#5a6165` | 4 | 1.2% |
| `#eaf2f8` | 4 | 1.2% |
| `#4a5560` | 4 | 1.2% |

### The proof there is no colour system: 18 near-duplicate groups

Grouped at a maximum per-channel delta of 12/255 — differences no one can see.

**Group 1 — 26 near-identical hairline/border greys:**

`#e0e3e4`(10) `#e1e4e5`(3) `#dce0e1`(3) `#e7ebef`(3) `#d4d9dc`(2) `#dce1e3`(2)
`#e2e5e6`(2) `#d9dee1`(1) `#e3e7ea`(1) `#dce6ee`(1) `#dcdee2`(1) `#e7e8e9`(1)
`#dde0e1`(1) `#e3e6e7`(1) `#d8e6ee`(1) `#d7e3e9`(1) `#e7ecef`(1) `#d9e5eb`(1)
`#e7e8e8`(1) `#e4eaee`(1) `#e7eaec`(1) `#e6eaed`(1) `#d5dce3`(1) `#d7e2ec`(1)
`#e4e9ee`(1) `#dbe6f0`(1)

Twenty-six values doing one job. `--line: #D9DEE1` is defined at
`app/globals.css:19` and is used **once**.

**Group 2 — 9 near-identical off-whites:**
`#ffffff`(98) `#fbfcfc`(2) `#fefefe`(1) `#f6f7f8`(1) `#f7f8f8`(1) `#f3f5f5`(1)
`#f4f6f8`(1) `#f4fafe`(1) `#f4f7fa`(1)
— e.g. `#f6f7f8` at `app/globals.css:296` `.btn-light:hover`, `#f7f8f8` at
`app/globals.css:371` `.hub`, `#f3f5f5` at `app/globals.css:371`
`.decision-stats div`, `#f4f6f8` at `app/globals.css:1674` `.hwh-step:hover`.

**Group 3 — 6 near-identical mid-greys:**
`#c3ccd1`(11) `#bfc7cb`(2) `#c5cccf`(2) `#c6cccf`(1) `#c7cdd0`(1) `#c9d0d5`(1)

15 further groups follow the same pattern.

### Tailwind arbitrary values are *not* the drift signal here

The brief expected `p-[13px]` / `text-[#3a3a3c]` to be the primary signal. In
this codebase they are not:

| Metric | Value |
|---|---:|
| Arbitrary-value classes | **47** |
| Distinct arbitrary classes | 38 |
| As share of all class tokens | **4.6%** |
| Arbitrary colour classes (`text-[#…]`) | **0** |

And they are concentrated in imported islands, not authored code:
`scroll-reel-testimonials.tsx` (21), `tailwind-image-accordion.tsx` (8),
`flickering-footer.tsx` (7), `header-2.tsx` (5), `shadcn-space/…/team.tsx` (4).
Many are `data-[state]` selectors, not values at all.

**The drift is not in Tailwind. It is in the 2,019-line hand-written
stylesheet.** Auditing this project through a Tailwind lens would have found
almost nothing and concluded the site was fine.

## B4. Motion, radius, breakpoints

**Durations — 27 distinct:**

| ms | count | | ms | count |
|---:|---:|---|---:|---:|
| 300 | 20 | | 600 | 2 |
| 250 | 10 | | 260 | 2 |
| 200 | 10 | | 220 | 2 |
| 350 | 8 | | 1000 | 1 |
| 500 | 7 | | 3400 | 1 |
| 400 | 6 | | 6000 | 1 |
| 450 | 5 | | 2900 | 1 |
| 550 | 4 | | 50 | 1 |
| 150 | 3 | | 1400, 460, 240, 180, 280, 320 | 1 each |

**Easings — 6 distinct:** `ease-out` (69), `ease` (31), `ease-in-out` (5),
`linear` (2), `cubic-bezier(.22,1,.36,1)` (1), `cubic-bezier(.65,0,.35,1)` (1).
Note `--ease-out` and `--ease-in-out` tokens exist at `app/globals.css:29-30`
but 31 declarations use the bare CSS keyword `ease` instead.

**Radii — 22 distinct across 89 declarations:** 999(13), 22(11), 18(10), 2(7),
12(6), 14(6), 17(5), 20(5), 16(4), 24(3), 7(2), 10(2), 6(2), 3(2), 30(2),
15(2), 4(2), 9(1), 13(1), 8(1), 26(1), `var(--radius)`(1).

One-offs: `9px` (`app/globals.css:371` `.decision-stats div`), `13px`
(`app/globals.css:373` `.result`), `8px` (`app/globals.css:1078` `.tbc`),
`26px` (`app/globals.css:1893` `.fmc-card`).

**`--radius` is defined three times** — `24px` (`:25`), `0.75rem` = 13.5px
(`:60`), `0.625rem` = 11.25px (`:421`). The unlayered `:60` wins, so any rule
using `var(--radius)` silently gets 13.5px rather than the 24px the design
system declares.

**Breakpoints — 10 distinct across 77 blocks:**

| px | count | % |
|---:|---:|---:|
| 767 | 24 | 43.6% |
| 1279 | 11 | 20.0% |
| 768 | 4 | 7.3% |
| 900 | 4 | 7.3% |
| 1023 | 3 | 5.5% |
| 620 | 3 | 5.5% |
| 1101 | 2 | 3.6% |
| 640 | 2 | 3.6% |
| 380 | 1 | 1.8% |
| 980 | 1 | 1.8% |

**Mixed direction:** 8 `min-width` vs 47 `max-width` queries. Near-duplicate
pair: **767 / 768**.

## B5. Line length (measured at the real 1280px container)

| Selector | file:line | Authored | Font | ch | Flag |
|---|---|---|---:|---:|---|
| `.notfound-hint` | `app/globals.css:1054` | *(none)* | 14px | **≈183** | ⚠️ unconstrained |
| `.service-list li` | `app/globals.css:1383` | *(none)* | 16px | **≈150** | ⚠️ unconstrained |
| legal-page prose | `app/globals.css:1069` | `760px` | 16px | **95** | ⚠️ 47 elements |
| `.faq-a li` | `app/globals.css:1128` | `84ch` | — | **84** | ⚠️ |
| `.section-head>p` | `app/globals.css:1277` | `34ch` | 17px | 34 | ok |
| `.hero .sub` | `app/globals.css:1248` | `52ch` | 18px | 52 | ok |

- **21 distinct `max-width` values** govern body copy — **13 in `ch`** (84, 76,
  70, 68, 66, 64, 62, 60, 52, 40, 38, 34, 24) and **8 in `px`** (760, 620, 560,
  520, 500, 475, 420, 380). Two unit systems doing one job.
- **47 of 136** text-bearing elements have no authored measure. 38 of those are
  incidentally capped by a grid or flex cell — a layout accident, not a
  typographic decision — leaving **9 genuinely loose**.
- `.section-head>p` declares `max-width` **twice in the same media context**,
  943 lines apart, in different units — `380px` at `:334` and `34ch` at
  `:1277`. The 380px is dead.
- `.sub{max-width:475px}` (`:195`) never applies; `.hero .sub{max-width:52ch}`
  (`:1248`) overrides it at its only usage.

---

# C. PROPOSED TOKENS

Derived by fitting candidate scales to the values **already** most common in
this codebase and choosing the set with the lowest weighted shift. This is a
migration, not a redesign.

## C1. Spacing — 7 steps

```css
--space-1:  8px;   --space-2: 12px;  --space-3: 16px;  --space-4: 24px;
--space-5: 36px;   --space-6: 56px;  --space-7: 88px;
```

Chosen over 5 alternatives. Weighted mean shift **2.88px**; 27.8% of the 655
positive spacing occurrences already land exactly on a step.

| Existing value | → token | Occurrences | Shift |
|---:|---:|---:|---|
| 8 | `--space-1` | 39 | exact |
| 5, 6, 7, 9, 10 | `--space-1` | 97 | ≤3px |
| 12 | `--space-2` | 45 | exact |
| 11, 13, 14 | `--space-2` | 39 | ≤2px |
| 16 | `--space-3` | 34 | exact |
| 15, 17, 18 | `--space-3` | 43 | ≤2px |
| 24 | `--space-4` | 36 | exact |
| 20, 22, 26, 28 | `--space-4` | 111 | ≤4px |
| 36 | `--space-5` | 11 | exact |
| 30, 32, 34, 38, 40 | `--space-5` | 72 | ≤6px |
| 56 | `--space-6` | 13 | exact |
| 44, 48, 52, 60, 64 | `--space-6` | 44 | ≤12px |
| 88 | `--space-7` | 4 | exact |
| 72, 80, 90, 96, 104, 108 | `--space-7` | 26 | ≤20px |

**Dropped:** 50 of 57 distinct values. `1px` and `2px` survive as hairlines/
optical nudges — exempt them explicitly rather than rounding them to 8px. The
five negative margins (`-125, -34, -33, -29, -2`) are positioning hacks, not
spacing; leave them and mark them.

## C2. Type — 7 steps

```css
--text-1: 12px;  --text-2: 14px;  --text-3: 16px;  --text-4: 20px;
--text-5: 28px;  --text-6: 40px;  --text-7: 56px;
```

Weighted mean shift **1.88px**, and **44.0%** of the 334 size occurrences
already land exactly. Step ratios 1.17 / 1.14 / 1.25 / 1.40 / 1.43 / 1.40 —
tighter at body sizes, looser at display sizes, which is what the existing
usage actually is.

| Existing | → token | Occurrences | Shift |
|---:|---:|---:|---|
| 11, 12, 13 | `--text-1` | 72 | ≤1px |
| 14, 14.04, 14.4, 15, 15.12, 15.39, 15.48 | `--text-2` | 85 | ≤1.5px |
| 16, 17, 17.64 | `--text-3` | 71 | ≤1.6px |
| 18, 19, 19.08, 20, 20.52, 21, 22 | `--text-4` | 25 | ≤2px |
| 24, 26, 27, 28, 29, 30, 30.6, 31, 32 | `--text-5` | 27 | ≤4px |
| 34–46 | `--text-6` | 25 | ≤6px |
| 48–66.6 | `--text-7` | 14 | ≤10px |

**Dropped:** 39 of 56 distinct sizes, including every fractional value.
`92px` and `196px` are one-off display/decorative sizes — exempt or move to
`--text-7`.

Also collapse: **29 line-heights → 3** (`1.1` display, `1.35` headings, `1.6`
body) and **31 letter-spacings → 3** (`-0.02em` display, `-0.01em` heading,
`0` body).

## C3. Colour — 6 tokens

```css
--ink:        #0D1828;  /* headings, primary body            */
--ink-muted:  #55606F;  /* secondary text                    */
--blue:       #0F5E97;  /* the one brand accent              */
--line:       #D9DEE1;  /* every hairline and border         */
--band:       #EFEFEF;  /* the one alternate section ground  */
--paper:      #FFFFFF;  /* page ground                       */
```

All six already exist in the codebase. Mapping:

| Token | Absorbs | Count |
|---|---|---:|
| `--ink` | `#202020`, `#1c1c1c`, `#232323`, `#2d2d2d`, `#0d1828` | ~30 |
| `--ink-muted` | `#5b6067`, `#5a6165`, `#6b7480`, `#6e767d`, `#707070`, `#666666`, `#777777`, `#888888`, `#98a0a6`, `#8a9198`, `#4a5560` | ~45 |
| `--blue` | `#0f5e97`, `#0c5387`, `#2e8ac9`, `#3e9bd6`, `#0a4169` (keep as `--blue-dark` if a hover shade is needed) | ~15 |
| `--line` | the entire **26-member** grey group | ~40 |
| `--band` | `#efefef`, `#f1f3f4`, `#f2f3f5`, `#f0f1f3`, `#eef1f2` | ~20 |
| `--paper` | `#ffffff`, `#fefefe`, `#fbfcfc`, `#f6f7f8`, `#f7f8f8`, `#f3f5f5`, `#f4f6f8` | ~105 |

**Dropped:** `#f2c230` (yellow) — declared as brand but used 4 times, all on
dead classes. The 49 `oklch()` values are the shadcn dark-mode layer; leave them
alone but stop them colliding with the brand tokens (see Fix 3).

**This mapping also fixes every accessibility failure.** Verified:

| Selector | Before | After (`--ink-muted`) |
|---|---:|---:|
| `.cookie-cat-locked` | 2.38:1 ❌ | **5.74:1** ✅ |
| `.mega-head` | 2.65:1 ❌ | **6.39:1** ✅ |
| `.globe-feature-lead span` | 2.87:1 ❌ | **5.74:1** ✅ |
| `.cookie-panel-note` | 3.19:1 ❌ | **6.39:1** ✅ |
| `.cookie p` | 4.15:1 ❌ | **5.74:1** ✅ |

Token set self-check: `--ink` on `--paper` 17.82:1; `--ink` on `--band` 15.50:1;
`--ink-muted` on `--paper` 6.39:1; `--ink-muted` on `--band` 5.55:1; `--blue`
on `--paper` 6.84:1; `--paper` on `--blue` 6.84:1. **All pass AA.**

## C4. Supporting scales

```css
--radius-1:  8px;  --radius-2: 16px;  --radius-3: 22px;  --radius-pill: 999px;
--dur-fast: 150ms; --dur-base: 250ms; --dur-slow: 400ms;
--ease: cubic-bezier(0.23, 1, 0.32, 1);
```

22 radii → 4 (999 and 22 are already the two most common, at 13 and 11 uses).
27 durations → 3. 6 easings → 1 plus `linear` for infinite loops.

---

# D. FIX LIST

Ordered by visual impact.

### FIX 1 — Delete the second button system, or adopt it. Do not keep both.

**Why this is first:** it is the only defect on this list that a visitor can see
without scrolling, and it breaks the site's most important element. The header's
"Schedule a Call" and the in-page "Schedule a Call" are **the same call to
action, rendered as two different buttons on the same screen**:

| | Header CTA | Every other CTA |
|---|---|---|
| Implementation | shadcn `buttonVariants` | `.btn` |
| Height | **41px** | **44px** |
| Radius | **13.5px** | **999px** (pill) |
| Font | 15.75px / 500 | 14px / 700 |
| Side padding | 11.25px | 20px |
| Press animation | none | `data-press` |

Measured live at 1440px. It is the **only non-pill button on the site** (1 of 8
treatments at 13.5px radius; the other 7 are 999px).

- **Files:** `components/ui/header-2.tsx:293` and `:348`
- **Find:** `className={buttonVariants({ size: 'lg' })}`
- **Replace:** `className="btn btn-shimmer" data-press` and wrap the label in
  `<span className="btn-label">…</span>`
- Then delete `components/ui/button.tsx` if nothing else imports it.

### FIX 2 — Collapse the 26 hairline greys to `--line`

The single largest source of measurable inconsistency: 26 distinct values, no
two distinguishable, for one job.

- **Files:** `app/globals.css` throughout
- **Find/replace:** each of `#e0e3e4 #e1e4e5 #dce0e1 #e7ebef #d4d9dc #dce1e3
  #e2e5e6 #e3e7ea #dce6ee #dcdee2 #e7e8e9 #dde0e1 #e3e6e7 #d8e6ee #d7e3e9
  #e7ecef #d9e5eb #e7e8e8 #e4eaee #e7eaec #e6eaed #d5dce3 #d7e2ec #e4e9ee
  #dbe6f0` → `var(--line)`
- Mechanical, ~40 sites, zero visual risk — every replacement moves colour by
  less than 12/255 per channel.

### FIX 3 — Stop `--radius` resolving to the wrong value

`--radius` is declared three times; the shadcn `0.75rem` at `app/globals.css:60`
beats the design system's `24px` at `:25`. Anything using `var(--radius)`
silently renders at 13.5px. This already bit `.who-portrait` during this
session, and `.case-cta` (`:1030`) is still picking it up.

- **Files:** `app/globals.css:25`, `:60`
- **Fix:** rename the GAMCS one to `--radius-lg: 24px` and update its consumers,
  leaving `--radius` to shadcn. Do not delete the shadcn value — imported
  components depend on it.

### FIX 4 — Delete the dead code before migrating anything

Migrating tokens across dead rules is wasted work. Measured:

- **142 of 416** class names in `globals.css` never appear in any `.ts`/`.tsx`
  (34%). A second, cruder count run independently gave 162/440 (37%) — the
  figure is a third of the stylesheet either way.
- **300 of 1,076** rules entirely orphaned = **28,785 of 124,752 bytes (23%)**
- 4 of 6 `.btn` colour variants have zero render sites: `.btn-blue` (`:132`),
  `.btn-yellow` (`:134`), `.btn-white` (`:135`), `.btn-ghost` (`:136`)
- 16 orphaned card families, incl. `.bento-card`, `.model-card`, `.case-panel`,
  `.solution-card`, `.quote-card`, `.service`, `.leader`, `.person`
- 2 dead components: `components/motion/ShimmerCTA.tsx` and
  `components/hero/MagneticButton.tsx` — **0 importers each, 88 lines**
- 1 orphan asset: `public/brand/logo.jpg` (22.2 KB, 0 references)

### FIX 5 — Use the dead `ShimmerCTA`, or delete it and the 8 copies

The primary-CTA block is copy-pasted **verbatim across 8 files** (11 files use
`.btn-shimmer` in total) while a component that renders exactly it has zero
importers — independently re-verified: `grep -rl ShimmerCTA` returns 0 importers,
`grep -rl 'btn btn-shimmer'` returns 11 files.

- **Files:** `app/case-study/page.tsx:25` and `:64`, `app/not-found.tsx:48`,
  `app/solutions/page.tsx:43`, `app/team/page.tsx:26` and `:52`,
  `components/ServicePageLayout.tsx:117`, `components/StickyMobileCTA.tsx:67`
- **Replace** each with `<ShimmerCTA href={primaryCta.href} cta="…">` from
  `components/motion/ShimmerCTA.tsx`

### FIX 6 — Constrain the two unbounded text blocks

- `app/globals.css:1054` `.notfound-hint` — no `max-width` anywhere in its
  ancestor chain → **≈183 characters per line**. Add `max-width:60ch`.
- `app/globals.css:1383` `.service-list li` — full container width →
  **≈150ch**. Add `max-width:66ch`.
- `app/globals.css:1069` — legal prose capped at `760px` but set at 16px = 95ch
  across **47 elements**. Change `760px` → `66ch`.

### FIX 7 — Convert the logos to SVG

**29 of 29 logos and icons ship as raster. There is not one `.svg` file in the
repo.** 24 client logos at 400×168 PNG total **566.8 KB** for flat wordmarks;
`public/brand/logo.png` is **115.2 KB** for a 534×339 mark (0.65 bytes/pixel).
The brand mark exists in three incompatible copies — an inline SVG `<symbol>`
in `GaLogo`, a PNG, and an orphan JPEG — and the source `.svg` is not in the
repo.

Lower priority than 1–6 only because AVIF/WebP conversion is already configured
in `next.config.mjs` and covers 26 of 31 assets, so the payload is not as bad in
production as it looks on disk.

### FIX 8 — Pick one breakpoint per boundary

767 and 768 both appear. Standardise on `max-width:767px` (24 uses) and drop the
4 `min-width:768px` queries, or invert the whole file to mobile-first. Currently
8 `min-width` vs 47 `max-width` — pick one direction.

### FIX 9 — Reduce 4 competing filled CTAs to 1 primary

At ≥1280px the homepage renders **4 filled CTAs simultaneously** in 3 fill
colours (`#0F5E97`, `#202020`, and a blue gradient). 13 in-content CTAs point at
10 destinations; 5 point at `/contact` under 3 different labels. Decide which
single action is primary and demote the rest to `.btn-light`.

### FIX 10 — Fix the one marginal contrast case

`.fin-btn` (`app/globals.css:1796`) puts white text on
`linear-gradient(180deg, #2E7CB8, #0F5E97)`. At the light end that is
**4.48:1** against a 4.5 requirement for its 18px/600 text. Darken the gradient
start to `#2A76B0` or raise the text to 700 weight.

---

## Appendix — what is actually working

- **Breakpoint count** (10 across 77 blocks) is disciplined; the problem is
  direction, not proliferation.
- **`object-fit` coverage** is 7/7 at image render sites.
- **AVIF/WebP** is configured and covers 26 of 31 assets.
- **Alt text** is present on 7 of 7 image elements, and 6 of 7 build it from
  real data.
- **`SectionEyebrow`** is a real shared component — it just only reaches 6 of
  24 header sites.
- **59 of 64** text/background pairs pass WCAG AA.
