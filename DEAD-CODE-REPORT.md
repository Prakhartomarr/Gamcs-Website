# DEAD-CODE-REPORT.md

Verified inventory of dead CSS and dead modules in the GAMCS front end.
**Nothing has been deleted.** This is the report you asked for before any removal.

## Headline

| | Count | Bytes |
|---|---:|---:|
| CSS classes defined in `app/globals.css` | 437 | — |
| — LIVE | 274 | 62,911 |
| — DYNAMIC (spared) | 17 | 3,071 |
| — GLOBAL (spared) | 6 | 3,135 |
| — **DEAD** | **140** | **17,011** |
| CSS rules where *every* selector class is dead | **214** of 1073 | **17,011** of 96,420 |
| Rules mixing dead + live selectors (NOT proposed for deletion) | 65 | 5,135 |
| Unreachable modules | **55** of 124 | **229,085** |
| Orphan assets in `public/` | **1** | **22,733** |

**Total safely removable: 268,829 bytes** — 17,011 CSS + 229,085 modules + 22,733 asset.

### Against the audit's estimate

| Source | Class names dead | Rules orphaned |
|---|---|---|
| DESIGN-AUDIT.md method A | 142 / 416 (34%) | 300 / 1,076 |
| DESIGN-AUDIT.md method B | 162 / 440 (37%) | — |
| **This report (verified)** | **140 / 437 (32%)** | **214 / 1073** |

Both audit numbers were too high. The audit counted a rule orphaned if any
class in it was unreferenced; this report requires **every** class in **every**
selector of the rule to be dead, which moves 65 rules (5,135 B) into a MIXED
bucket that needs selector surgery rather than deletion.

---

## Method, and the two false positives it caught

Four buckets, assigned in priority order: GLOBAL → LIVE → DYNAMIC → DEAD.
DEAD requires all three: no static literal anywhere, no dynamic prefix
collision, not a third-party namespace.

Sources scanned: every `.tsx .ts .jsx .js .mjs .cjs .md .mdx .json .yaml .yml
.html .css` file outside `node_modules`, `.next`, `.next-build`.

**Two bugs in the first pass were found and fixed before any conclusion:**

**1. Quoted strings inside a template literal's `${...}` were invisible.**
A single combined regex let a backtick template swallow the quotes inside its
interpolations. `` `stat-hero ${i === 0 ? "is-blue" : "is-dark"} reveal` ``
(`components/sections/Achievements.tsx:37`) hid two live class names. Fixed by
scanning double-quote, single-quote and backtick strings in three independent
passes. **This rescued 9 classes** that would otherwise have been deleted:
`is-blue`, `is-dark`, `is-show`, `is-goal`, `is-display`, and 4 others.

`is-goal` is the sharpest case — its only production site in the entire repo is
`setAttribute("class", \`fmc-dot${i === pts.length - 1 ? " is-goal" : ""}\`)`
at `components/sections/MaturityCurve.tsx:122`, on an SVG circle built with
`createElementNS`. It appears in no JSX at all.

**2. CSS escapes produced a class that does not exist.**
`.bento-card.md\:col-span-2` (`app/globals.css:343`) is one class named
`md:col-span-2`. A regex stopping at the backslash invented a class `md` and
filed it as dead. Acting on that would have corrupted a valid selector. Fixed
by allowing `\\.` inside the class-name pattern.

**Adversarial pass.** Six agents then tried to *refute* the dead list, hunting
for template literals, clsx/cn, concatenation, prop objects, joined arrays, map
lookups, cva, `data-*`/`aria-*` selectors, `:has()`/`:is()`/`:where()`, markdown
and JSON, `classList`/`setAttribute`, GSAP and ScrollTrigger selector strings,
`querySelector`, and `dangerouslySetInnerHTML`. Of 141 candidates they refuted
exactly **one** — the `md` artifact above. The other 52 survivor entries they
reported were already classified LIVE or DYNAMIC.

---

## Bucket 1 — DEAD (proposed for deletion)

140 class names, 214 rules, 17,011 bytes. Every one cited.

| Class | Defined at | Class | Defined at |
|---|---|---|---|
| `.amt` | `globals.css:218` | `.avatar` | `globals.css:213` |
| `.band` | `globals.css:177` | `.bars-chart` | `globals.css:374` |
| `.bento` | `globals.css:340` | `.bento-num` | `globals.css:347` |
| `.bento-spotlight` | `globals.css:351` | `.brand-ga` | `globals.css:823` |
| `.brand-lockup` | `globals.css:822` | `.brand-mark` | `globals.css:826` |
| `.brand-mark-wipe` | `globals.css:1516` | `.brand-mark-wrap` | `globals.css:1515` |
| `.brand-w1` | `globals.css:828` | `.brand-w2` | `globals.css:829` |
| `.c1` | `globals.css:258` | `.c2` | `globals.css:265` |
| `.c3` | `globals.css:259` | `.c4` | `globals.css:254` |
| `.c5` | `globals.css:261` | `.c6` | `globals.css:266` |
| `.c7` | `globals.css:260` | `.card-head` | `globals.css:208` |
| `.card-icon` | `globals.css:205` | `.card-kicker` | `globals.css:106` |
| `.card-list` | `globals.css:568` | `.card1` | `globals.css:210` |
| `.card2` | `globals.css:211` | `.card3` | `globals.css:212` |
| `.cards` | `globals.css:199` | `.cards-tilt` | `globals.css:202` |
| `.caret` | `globals.css:225` | `.case-bottom` | `globals.css:377` |
| `.case-grid` | `globals.css:373` | `.case-kicker` | `globals.css:373` |
| `.case-result` | `globals.css:373` | `.chart-skeleton` | `globals.css:375` |
| `.chip-logo` | `globals.css:220` | `.chips` | `globals.css:234` |
| `.clients-label` | `globals.css:278` | `.clients-row` | `globals.css:271` |
| `.clients-rule` | `globals.css:282` | `.completion` | `globals.css:221` |
| `.dashboard-label` | `globals.css:106` | `.dashboard-number` | `globals.css:106` |
| `.down` | `globals.css:222` | `.drawer` | `globals.css:774` |
| `.drawer-cta` | `globals.css:691` | `.eyebrow` | `globals.css:106` |
| `.feature` | `globals.css:365` | `.flow-line` | `globals.css:371` |
| `.fsvc-ico` | `globals.css:1863` | `.g1` | `globals.css:184` |
| `.g2` | `globals.css:185` | `.ghost` | `globals.css:178` |
| `.hub-window` | `globals.css:371` | `.illuminated` | `globals.css:204` |
| `.initials` | `globals.css:379` | `.is-accent` | `globals.css:284` |
| `.l` | `globals.css:217` | `.mail` | `globals.css:381` |
| `.maturity-foot` | `globals.css:1439` | `.maturity-grid` | `globals.css:1422` |
| `.maturity-heading` | `globals.css:1420` | `.maturity-n` | `globals.css:1429` |
| `.maturity-rail` | `globals.css:1427` | `.maturity-stage` | `globals.css:1424` |
| `.md\:col-span-1` | `globals.css:344` | `.md\:col-span-2` | `globals.css:343` |
| `.member` | `globals.css:799` | `.member-grid` | `globals.css:798` |
| `.member-link` | `globals.css:806` | `.member-photo` | `globals.css:802` |
| `.metric` | `globals.css:365` | `.metric-grid` | `globals.css:365` |
| `.metric-value` | `globals.css:106` | `.mobile` | `globals.css:138` |
| `.model-list` | `globals.css:336` | `.nav-actions` | `globals.css:127` |
| `.nav-cta` | `globals.css:689` | `.nav-left` | `globals.css:116` |
| `.num` | `globals.css:338` | `.o1` | `globals.css:245` |
| `.o2` | `globals.css:246` | `.o3` | `globals.css:247` |
| `.o4` | `globals.css:248` | `.o5` | `globals.css:249` |
| `.orbit-dot` | `globals.css:244` | `.orbit-ring` | `globals.css:239` |
| `.people-grid` | `globals.css:379` | `.people-list` | `globals.css:379` |
| `.quote` | `globals.css:105` | `.quote-grid` | `globals.css:544` |
| `.quote-inner` | `globals.css:379` | `.quote-mark` | `globals.css:379` |
| `.r1` | `globals.css:242` | `.r2` | `globals.css:241` |
| `.r3` | `globals.css:240` | `.ribbon-canvas` | `globals.css:1238` |
| `.ribbon-field` | `globals.css:1234` | `.row` | `globals.css:215` |
| `.rowend` | `globals.css:219` | `.s1` | `globals.css:181` |
| `.s2` | `globals.css:182` | `.s3` | `globals.css:183` |
| `.service-graphic` | `globals.css:338` | `.service-grid` | `globals.css:338` |
| `.service-link` | `globals.css:338` | `.shimmer-kicker` | `globals.css:361` |
| `.site-nav` | `globals.css:115` | `.sp` | `globals.css:179` |
| `.spark` | `globals.css:209` | `.spend-chart` | `globals.css:377` |
| `.spend-label` | `globals.css:373` | `.spend-number` | `globals.css:373` |
| `.spend-top` | `globals.css:373` | `.spend-visual` | `globals.css:373` |
| `.spinner` | `globals.css:223` | `.stat-value` | `globals.css:106` |
| `.sys` | `globals.css:371` | `.system-beams` | `globals.css:369` |
| `.system-points` | `globals.css:371` | `.system-section` | `globals.css:105` |
| `.system-wrap` | `globals.css:371` | `.tags` | `globals.css:338` |
| `.team-block` | `globals.css:796` | `.team-grid` | `globals.css:537` |
| `.team-intro` | `globals.css:793` | `.team-page` | `globals.css:792` |
| `.theme` | `globals.css:397` | `.trust-row` | `globals.css:332` |
| `.who-network` | `globals.css:976` | `.who-story` | `globals.css:974` |
| `.why-grid` | `globals.css:521` | `.why-index` | `globals.css:938` |
| `.why-item` | `globals.css:523` | `.why-list` | `globals.css:522` |
| `.why-mark` | `globals.css:525` | `.why-meta` | `globals.css:936` |
| `.why-rule` | `globals.css:940` | `.why-text` | `globals.css:939` |

### The 214 rules, by line range

| Lines | Bytes | Selector | Inside |
|---|---:|---|---|
| `115-115` | 206 | `.site-nav` | — |
| `116-116` | 81 | `.nav-left` | — |
| `127-127` | 64 | `.nav-actions` | — |
| `138-138` | 107 | `.mobile` | — |
| `177-177` | 172 | `.band` | — |
| `178-178` | 122 | `.ghost` | — |
| `179-179` | 96 | `.ghost .sp` | — |
| `184-184` | 52 | `.ghost.g1` | — |
| `185-185` | 52 | `.ghost.g2` | — |
| `199-199` | 82 | `.cards` | — |
| `202-202` | 66 | `.cards-tilt` | — |
| `205-205` | 209 | `.card-icon` | — |
| `208-208` | 129 | `.card-head` | — |
| `209-209` | 45 | `.spark` | — |
| `210-210` | 104 | `.card1` | — |
| `211-211` | 106 | `.card2` | — |
| `212-212` | 106 | `.card3` | — |
| `213-213` | 222 | `.avatar` | — |
| `214-214` | 69 | `.card1 p` | — |
| `215-215` | 130 | `.row` | — |
| `216-216` | 35 | `.row:first-of-type` | — |
| `217-217` | 90 | `.row .l` | — |
| `218-218` | 59 | `.row .amt` | — |
| `219-219` | 78 | `.row.rowend` | — |
| `220-220` | 190 | `.chip-logo` | — |
| `221-221` | 80 | `.completion` | — |
| `222-222` | 20 | `.down` | — |
| `223-223` | 137 | `.spinner` | — |
| `225-225` | 160 | `.caret` | — |
| `234-234` | 63 | `.chips` | — |
| `239-239` | 105 | `.orbit-ring` | — |
| `240-240` | 57 | `.orbit-ring.r3` | — |
| `241-241` | 59 | `.orbit-ring.r2` | — |
| `242-242` | 59 | `.orbit-ring.r1` | — |
| `244-244` | 165 | `.orbit-dot` | — |
| `245-245` | 31 | `.orbit-dot.o1` | — |
| `246-246` | 31 | `.orbit-dot.o2` | — |
| `247-247` | 30 | `.orbit-dot.o3` | — |
| `248-248` | 31 | `.orbit-dot.o4` | — |
| `249-249` | 30 | `.orbit-dot.o5` | — |
| `276-277` | 120 | `.clients-row` | — |
| `281-281` | 109 | `.clients-label` | — |
| `282-282` | 77 | `.clients-rule` | — |
| `313-313` | 58 | `.site-nav .nav-actions` | — |
| `314-314` | 53 | `.site-nav .mobile` | — |
| `332-332` | 78 | `.trust-row` | — |
| `336-336` | 80 | `.model-list` | — |
| `338-338` | 66 | `.service-grid` | — |
| `338-338` | 79 | `.service-graphic:after` | — |
| `338-338` | 135 | `.service-graphic:before,.service-graphic:after` | — |
| `338-338` | 149 | `.service-graphic` | — |
| `338-338` | 182 | `.service-link` | — |
| `340-340` | 65 | `.bento` | — |
| `347-347` | 68 | `.bento-num` | — |
| `351-351` | 95 | `.bento-spotlight` | — |
| `352-352` | 209 | `.bento-spotlight li` | — |
| `361-361` | 57 | `.shimmer-kicker>div` | — |
| `362-362` | 34 | `.shimmer-kicker>div>div` | — |
| `363-363` | 193 | `.shimmer-kicker span` | — |
| `365-365` | 32 | `.metric.feature p` | — |
| `365-365` | 53 | `.metric p` | — |
| `365-365` | 59 | `.metric.feature .metric-value,.metric.feature b` | — |
| `365-365` | 61 | `.metric b` | — |
| `365-365` | 71 | `.metric-grid` | — |
| `365-365` | 75 | `.metric-value` | — |
| `365-365` | 76 | `.metric` | — |
| `365-365` | 95 | `.metric.feature` | — |
| `367-367` | 118 | `.system-section` | — |
| `369-369` | 82 | `.system-beams` | — |
| `370-370` | 67 | `.system-beams>div` | — |
| `371-371` | 31 | `.system-points` | — |
| `371-371` | 36 | `.sys strong` | — |
| `371-371` | 48 | `.system-wrap h2 em` | — |
| `371-371` | 49 | `.system-wrap p` | — |
| `371-371` | 74 | `.sys small` | — |
| `371-371` | 80 | `.sys` | — |
| `371-371` | 85 | `.hub-window` | — |
| `371-371` | 87 | `.system-wrap` | — |
| `371-371` | 104 | `.flow-line:after` | — |
| `371-371` | 110 | `.system-wrap h2` | — |
| `371-371` | 117 | `.flow-line` | — |
| `371-371` | 175 | `.sys i` | — |
| `373-373` | 31 | `.spend-top b` | — |
| `373-373` | 63 | `.case-grid` | — |
| `373-373` | 69 | `.case-kicker` | — |
| `373-373` | 69 | `.spend-label` | — |
| `373-373` | 80 | `.case-result` | — |
| `373-373` | 98 | `.spend-number` | — |
| `373-373` | 110 | `.spend-top` | — |
| `373-373` | 150 | `.spend-visual` | — |
| `374-374` | 47 | `.bars-chart` | — |
| `375-375` | 198 | `.chart-skeleton` | — |
| `377-377` | 36 | `.bars-chart .spend-chart` | — |
| `377-377` | 142 | `.case-bottom` | — |
| `379-379` | 42 | `.quote cite b` | — |
| `379-379` | 56 | `.quote` | — |
| `379-379` | 59 | `.quote-inner` | — |
| `379-379` | 64 | `.quote cite` | — |
| `379-379` | 65 | `.people-list` | — |
| `379-379` | 70 | `.people-grid` | — |
| `379-379` | 74 | `.quote-mark` | — |
| `379-379` | 107 | `.quote blockquote` | — |
| `381-381` | 142 | `.mail` | — |
| `397-400` | 83 | `.theme` | @layer base |
| `521-521` | 26 | `.why-grid` | — |
| `522-522` | 110 | `.why-list` | — |
| `523-523` | 254 | `.why-item` | — |
| `524-524` | 79 | `.why-item:hover` | — |
| `525-525` | 74 | `.why-mark` | — |
| `537-537` | 69 | `.team-grid` | — |
| `541-541` | 163 | `.team-grid .avatar` | — |
| `544-544` | 64 | `.quote-grid` | — |
| `568-568` | 52 | `.card-list` | — |
| `569-569` | 186 | `.card-list li` | — |
| `570-570` | 41 | `.card-list li:last-child` | — |
| `571-571` | 39 | `.card-list li:first-child` | — |
| `586-586` | 93 | `.mobile` | @media(max-width:1279px) |
| `587-587` | 22 | `.nav-actions` | @media(max-width:1279px) |
| `589-589` | 46 | `.site-nav` | @media(max-width:1279px) |
| `604-604` | 37 | `.cards-tilt` | @media(max-width:1279px) |
| `605-605` | 32 | `.chips` | @media(max-width:1279px) |
| `614-614` | 15 | `.card1` | @media(max-width:1279px) |
| `614-614` | 15 | `.card2` | @media(max-width:1279px) |
| `614-614` | 15 | `.card3` | @media(max-width:1279px) |
| `623-623` | 43 | `.why-item` | @media(max-width:1279px) |
| `625-625` | 52 | `.bento-num` | @media(max-width:1279px) |
| `626-626` | 29 | `.metric-value` | @media(max-width:1279px) |
| `627-627` | 30 | `.metric p` | @media(max-width:1279px) |
| `645-645` | 31 | `.card-head` | @media(max-width:1279px) |
| `646-646` | 67 | `.card-list li` | @media(max-width:1279px) |
| `659-659` | 20 | `.ghost` | @media(min-width:768px) and (m |
| `660-660` | 58 | `.band` | @media(min-width:768px) and (m |
| `663-663` | 89 | `.cards` | @media(min-width:768px) and (m |
| `664-665` | 137 | `.cards-tilt` | @media(min-width:768px) and (m |
| `668-668` | 24 | `.card3` | @media(min-width:768px) and (m |
| `669-669` | 20 | `.chips` | @media(min-width:768px) and (m |
| `673-673` | 52 | `.clients-row` | @media(min-width:768px) and (m |
| `676-676` | 43 | `.metric-grid` | @media(min-width:768px) and (m |
| `689-689` | 22 | `.nav-cta` | @media(max-width:767px) |
| `701-701` | 27 | `.ghost,.chips` | @media(max-width:767px) |
| `702-702` | 58 | `.band` | @media(max-width:767px) |
| `705-705` | 89 | `.cards` | @media(max-width:767px) |
| `706-706` | 84 | `.cards-tilt` | @media(max-width:767px) |
| `710-710` | 20 | `.card3` | @media(max-width:767px) |
| `711-711` | 50 | `.card-head` | @media(max-width:767px) |
| `712-712` | 67 | `.card-list li` | @media(max-width:767px) |
| `717-717` | 57 | `.clients-row` | @media(max-width:767px) |
| `718-718` | 27 | `.clients-rule` | @media(max-width:767px) |
| `737-737` | 34 | `.metric-value` | @media(max-width:380px) |
| `743-743` | 43 | `.site-nav` | — |
| `774-775` | 139 | `.drawer` | — |
| `792-792` | 28 | `.team-page` | — |
| `793-793` | 47 | `.team-intro` | — |
| `794-794` | 85 | `.team-intro p` | — |
| `796-796` | 28 | `.team-block` | — |
| `798-798` | 71 | `.member-grid` | — |
| `799-800` | 159 | `.member` | — |
| `801-801` | 77 | `.member:hover` | — |
| `802-803` | 174 | `.member-photo` | — |
| `804-804` | 72 | `.member h3` | — |
| `805-805` | 70 | `.member p` | — |
| `806-807` | 129 | `.member-link` | — |
| `810-810` | 43 | `.member-grid` | @media(min-width:768px) and (m |
| `814-814` | 39 | `.member-grid` | @media(max-width:767px) |
| `815-815` | 28 | `.team-page` | @media(max-width:767px) |
| `816-816` | 31 | `.team-intro` | @media(max-width:767px) |
| `817-817` | 28 | `.team-block` | @media(max-width:767px) |
| `822-822` | 75 | `.brand-lockup` | — |
| `823-823` | 83 | `.brand-ga` | — |
| `826-826` | 59 | `.brand-mark` | — |
| `828-828` | 84 | `.brand-w1` | — |
| `829-829` | 81 | `.brand-w2` | — |
| `831-831` | 30 | `.brand-ga` | @media(max-width:767px) |
| `832-832` | 24 | `.brand-mark` | @media(max-width:767px) |
| `833-833` | 61 | `.brand-w1,.brand-w2` | @media(max-width:767px) |
| `936-936` | 50 | `.why-meta` | — |
| `937-937` | 82 | `.why-item .why-mark` | — |
| `938-938` | 107 | `.why-index` | — |
| `939-939` | 118 | `.why-text` | — |
| `940-940` | 123 | `.why-rule` | — |
| `942-942` | 85 | `.why-item:hover` | @media(hover:hover) and (point |
| `943-943` | 37 | `.why-item:hover .why-rule` | @media(hover:hover) and (point |
| `944-944` | 45 | `.why-item:hover .why-index` | @media(hover:hover) and (point |
| `947-947` | 50 | `.why-item` | @media(max-width:1279px) |
| `948-948` | 47 | `.why-text` | @media(max-width:1279px) |
| `951-951` | 46 | `.why-item` | @media(max-width:767px) |
| `952-952` | 47 | `.why-text` | @media(max-width:767px) |
| `955-955` | 26 | `.why-rule` | @media(prefers-reduced-motion: |
| `974-974` | 49 | `.who-story` | — |
| `976-976` | 76 | `.who-network` | — |
| `978-978` | 26 | `.who-story` | @media(max-width:1279px) |
| `981-981` | 20 | `.who-story` | @media(max-width:767px) |
| `1234-1235` | 117 | `.ribbon-field` | — |
| `1238-1239` | 122 | `.ribbon-canvas` | — |
| `1240-1240` | 47 | `.ribbon-canvas` | @media (max-width:767px) |
| `1420-1421` | 163 | `.maturity-heading` | — |
| `1422-1423` | 131 | `.maturity-grid` | — |
| `1424-1425` | 177 | `.maturity-stage` | — |
| `1426-1426` | 85 | `.maturity-stage:hover` | — |
| `1427-1427` | 112 | `.maturity-rail` | — |
| `1428-1428` | 87 | `.maturity-rail>span` | — |
| `1429-1429` | 100 | `.maturity-n` | — |
| `1430-1431` | 123 | `.maturity-stage h3` | — |
| `1432-1432` | 77 | `.maturity-stage p` | — |
| `1439-1440` | 120 | `.maturity-foot` | — |
| `1441-1442` | 118 | `.maturity-foot p` | — |
| `1454-1454` | 51 | `.maturity-grid` | @media (max-width:1279px) |
| `1456-1456` | 41 | `.maturity-grid` | @media (max-width:767px) |
| `1457-1457` | 37 | `.maturity-heading` | @media (max-width:767px) |
| `1515-1515` | 79 | `.brand-mark-wrap` | — |
| `1516-1521` | 298 | `.brand-mark-wipe` | — |
| `1524-1524` | 62 | `.brand-lockup:hover .brand-mark-wipe` | @media (hover:hover) and (poin |
| `1526-1526` | 70 | `.brand-lockup:focus-visible .brand-mark-wipe` | — |
| `1528-1528` | 33 | `.brand-mark-wipe` | @media (prefers-reduced-motion |

---

## Bucket 2 — DYNAMIC (spared)

17 classes. Each shares a prefix with a name assembled at runtime, so the
literal never appears in source and a grep would wrongly call it dead.

| Class | Spared because |
|---|---|
| `.footer-anim` | prefix 'footer-' is built at runtime - components/StickyMobileCTA.tsx:33 (querySelector) |
| `.footer-bottom` | prefix 'footer-' is built at runtime - components/StickyMobileCTA.tsx:33 (querySelector) |
| `.footer-brand` | prefix 'footer-' is built at runtime - components/StickyMobileCTA.tsx:33 (querySelector) |
| `.footer-grid` | prefix 'footer-' is built at runtime - components/StickyMobileCTA.tsx:33 (querySelector) |
| `.footer-links` | prefix 'footer-' is built at runtime - components/StickyMobileCTA.tsx:33 (querySelector) |
| `.footer-title` | prefix 'footer-' is built at runtime - components/StickyMobileCTA.tsx:33 (querySelector) |
| `.hero-bg` | prefix 'hero-' is built at runtime - components/Preloader.tsx:76 (querySelector) |
| `.hero-clients` | prefix 'hero-' is built at runtime - components/Preloader.tsx:76 (querySelector) |
| `.hero-diagonal` | prefix 'hero-' is built at runtime - components/Preloader.tsx:76 (querySelector) |
| `.hero-rule` | prefix 'hero-' is built at runtime - components/Preloader.tsx:76 (querySelector) |
| `.hero-rule-line` | prefix 'hero-' is built at runtime - components/Preloader.tsx:76 (querySelector) |
| `.hero-sparkle` | prefix 'hero-' is built at runtime - components/Preloader.tsx:76 (querySelector) |
| `.solution-count` | prefix 'solution-' is built at runtime - components/ServicePageLayout.tsx:120 (template-literal-any) |
| `.solution-grid` | prefix 'solution-' is built at runtime - components/ServicePageLayout.tsx:120 (template-literal-any) |
| `.solution-head` | prefix 'solution-' is built at runtime - components/ServicePageLayout.tsx:120 (template-literal-any) |
| `.solution-list` | prefix 'solution-' is built at runtime - components/ServicePageLayout.tsx:120 (template-literal-any) |
| `.svc-head-centre` | prefix 'svc-' is built at runtime - components/sections/SolutionCards.tsx:45 (template-literal-any) |

## Bucket 3 — GLOBAL (spared)

6 classes owned by a third party or the browser, or applied imperatively.

| Class | Spared because |
|---|---|
| `.container` | Tailwind's own `.container` component utility also matches; deleting the GAMCS rule changes every section width. |
| `.dark` | shadcn dark-mode root class, toggled by the theme layer. |
| `.next-steps` | third-party or browser-generated namespace |
| `.next-steps-no` | third-party or browser-generated namespace |
| `.open` | toggled imperatively on the nav drawer. |
| `.visible` | applied only by `classList.add("visible")` — `components/motion/MotionLayer.tsx:28`. Drives every scroll reveal on the site. |

---

## Bucket 4 — Unreachable modules

55 of 124 modules, **229,085 bytes**.

Established by walking the import graph from every Next.js entry point, not by
asking "does this file have an importer". That distinction matters: **most of
these files DO have importers — each other.** `components/charts/` is a closed
island of 39 files importing one another with no door in from any route.

Entry points used (20): `app/case-study/page.tsx`, `app/contact/page.tsx`, `app/cookie-policy/page.tsx`, `app/faq/page.tsx`, `app/layout.tsx`, `app/manifest.ts`, `app/not-found.tsx`, `app/opengraph-image.tsx`, `app/page.tsx`, `app/privacy-policy/page.tsx`, `app/robots.ts`, `app/sitemap.ts`, `app/solutions/[slug]/page.tsx`, `app/solutions/page.tsx`, `app/team/page.tsx`, `app/thank-you/page.tsx`, `next-env.d.ts`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`

### Whole directories unreachable

| Directory | Files | Bytes |
|---|---:|---:|
| `components/charts/` | 39 | 173,358 |
| `components/charts/tooltip/` | 7 | 36,391 |
| `components/kokonutui/` | 3 | 9,694 |

### Standalone unreachable modules

| File | Lines | Bytes | Note |
|---|---:|---:|---|
| `components/hero/MagneticButton.tsx` | 57 | 1,669 | no references anywhere |
| `components/kokonutui/BeamsLazy.tsx` | 38 | 1,146 | no references anywhere |
| `components/kokonutui/beams-background.tsx` | 261 | 7,196 | only importer is BeamsLazy, itself unreachable |
| `components/kokonutui/shimmer-text.tsx` | 53 | 1,352 | no references anywhere |
| `components/motion/BklitBars.tsx` | 65 | 1,676 | no references anywhere |
| `components/motion/Reveal.tsx` | 58 | 1,665 | only textual hits are a `revealEpoch` variable inside a dead chart file |
| `components/motion/ShimmerCTA.tsx` | 33 | 690 | the CTA component DESIGN-AUDIT.md Fix 5 wants adopted — 0 importers |
| `components/ui/accordion.tsx` | 87 | 3,233 | shadcn accordion; the FAQ uses a hand-rolled one in `components/sections/FAQ.tsx` |
| `lib/hooks/useInView.ts` | 28 | 709 | no references anywhere |

### Dynamic imports checked

`next/dynamic` appears at `components/sections/Hero.tsx` (loads `HeroShader`,
which IS reachable) and inside `components/kokonutui/BeamsLazy.tsx` (itself
unreachable, so its dynamic target dies with it). No `React.lazy`, no computed
`import()`. No Next.js convention filename appears among the unreached.

---

## Bucket 5 — Orphan assets

| File | Bytes | Evidence |
|---|---:|---|
| `public/brand/logo.jpg` | 22,733 | No reference in any `.tsx .ts .css .json`. Named only in `README.md` and `DESIGN-AUDIT.md` — documentation, not loading. |

Every other asset in `public/` resolves to a real reference. Note the first
orphan scan reported **zero** orphans because it searched markdown too, and
`DESIGN-AUDIT.md` names `logo.jpg`; a file mentioned in prose is not a file the
site loads.

---

## Not proposed for deletion

**65 MIXED rules (5,135 B)** list dead and live classes in one selector group,
e.g. a rule styling `.metric-value, .stat-tile-value`. Deleting the rule removes
live styling; keeping it retains dead selectors. These need selector-level edits
and belong in a separate pass with its own review.

**36 rules (5,157 B)** have no class in their selector at all — element, `:root`,
`@keyframes` bodies. Out of scope for a class-based analysis.

---

## Verification baseline captured

45 full-page screenshots taken **before** any deletion — 15 routes × 3 widths
(1440 / 1024 / 390), reveal animations settled, overlays hidden. Stored at
`scratchpad/shots/before/`. The post-deletion sweep will diff against these.

---

## Awaiting your approval

Nothing above has been deleted. On your go-ahead the order is:

1. `public/brand/logo.jpg` — 22,733 B — commit, `npm run build`
2. Unreachable modules — 229,085 B — commit, `npm run build`
3. The 214 dead CSS rules — 17,011 B — commit, `npm run build`

If any build fails, that commit gets reverted and reported rather than patched
forward. Then the 45-screenshot sweep is repeated and diffed pixel-for-pixel.

**One open question before step 2:** deleting `components/charts/` removes a
39-file, 173 KB charting library that is complete and unreferenced. It is dead
by every test here, but it looks like deliberate future work rather than
accumulated cruft. Confirm you want it gone, or I will skip it and delete only
the 16 remaining modules (55,727 B).
