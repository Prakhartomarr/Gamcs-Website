# BUTTON-SURVEY.md

Phase 1 survey of every button and button-like CTA. **No code has been changed.**

Everything below was re-verified against the current tree (`9311393`), not the
audit. Where the brief's figures have drifted, the correction is called out.

---

## Corrections to the brief

**1. `.btn-blue`, `.btn-yellow`, `.btn-white` and `.btn-ghost` were NOT deleted.**
They are still in `app/globals.css` at lines **132, 134, 135, 136** (plus
`:133` and `:137` hover rules). My earlier dead-code pass classified them LIVE
and spared them — because `DESIGN-AUDIT.md` names them, and that scanner treated
markdown as a reference source. A file mentioned in prose is not a file that
loads; the same bug I caught for `public/brand/logo.jpg` bit here and I missed
it. All four have **0 JSX usages**. They are genuinely dead.

**2. The header CTA and `.btn-shimmer` are two different blues.**
The audit said `--primary` resolves to the same blue as `.btn-shimmer`. Measured
live, they do not:

| | Computed fill |
|---|---|
| header CTA (`--primary`, `hsl(203 73% 33%)`) | `rgb(23, 98, 146)` = **#176292** |
| `.btn-shimmer` (`--blue`) | `rgb(15, 94, 151)` = **#0F5E97** |

So there are **4 distinct filled-CTA fills**, not 3.

**3. The homepage CTA count is now lower than the audit's 13.**
I removed the hero's "Schedule a Call" in an earlier task. Current: **11
in-content CTAs → 9 destinations, 4 pointing at `/contact` under 4 different
labels** (audit: 13 → 10, 5 under 3 labels).

**4. Line numbers have shifted.** `button.tsx` still has the `--radius-md` bug at
lines 25, 26, 30, 32 — that part is accurate, and I confirmed `--radius-md` is
referenced but never defined anywhere, so those four size variants silently fall
back to `rounded-lg`.

---

## 1. Every button and button-like CTA

Measured from the running site at 1440px unless noted. `press` = carries
`data-press`, the shared press micro-interaction bound in `MotionLayer`.

### GAMCS-authored CTAs

| file:line | Impl | Height | Radius | Fill | Font | Pad-x | Press |
|---|---|---|---|---|---|---|---|
| `components/sections/Hero.tsx:89` | `.btn.btn-light` | 44px | 999px | `#FFFFFF` +1px | 14/700 | 20px | ✅ |
| `components/sections/WhoWeAre.tsx:42` | `.btn.btn-shimmer` | 44px | 999px | `#0F5E97` | 14/700 | 20px | ✅ |
| `components/sections/OurPartners.tsx:55` | `.btn.btn-light.partners-cta` | 44px | 999px | `#FFFFFF` +1px | 14/700 | 20px | ✅ |
| `components/sections/MaturityCurve.tsx:276` | `.fin-btn` | **58px** | 999px | **gradient** `#2E7CB8→#0F5E97` | **18/600** | 26px | ❌ |
| `components/ui/globe-feature-section.tsx:178` | `.globe-feature-cta` | 44px | 999px | **`#202020`** | 14/700 | 22px | ❌ |
| `components/sections/SolutionCards.tsx:43` ×6 | `.fsvc-link` | **40px** | 999px | `#FFFFFF` +1px | **14.4/600** | 18px | ❌ |
| `components/ServicePageLayout.tsx:118` | `.btn.btn-shimmer` | 44px | 999px | `#0F5E97` | 14/700 | 20px | ✅ |
| `components/StickyMobileCTA.tsx:68` | `.btn.btn-shimmer` | 48px @390 | 999px | `#0F5E97` | 14/700 | 22px | ✅ |
| `components/ContactForm.tsx:179` | `.btn.btn-shimmer` | **46px** | 999px | `#0F5E97` | 14/700 | 20px | ✅ |
| `app/team/page.tsx:27, 36, 53` | `.btn-shimmer` ×2, `.btn-light` | 44px | 999px | — | 14/700 | 20px | ✅ |
| `app/case-study/page.tsx:26, 35, 65` | `.btn-shimmer` ×2, `.btn-light` | 44px | 999px | — | 14/700 | 20px | ✅ |
| `app/solutions/page.tsx:44` | `.btn.btn-shimmer` | 44px | 999px | `#0F5E97` | 14/700 | 20px | ✅ |
| `app/thank-you/page.tsx:91, 96` | `.btn-shimmer`, `.btn-light` | 44px | 999px | — | 14/700 | 20px | ✅ |
| `app/not-found.tsx:43, 49` | `.btn-shimmer`, `.btn-light` | 44px | 999px | — | 14/700 | 20px | ✅ |
| `components/CookieConsent.tsx:105, 112, 168` | `.btn-shimmer` ×2, `.btn-light` | 44px | 999px | — | 14/700 | ❌ no press |

### shadcn CTAs

| file:line | Impl | Height | Radius | Fill | Font | Pad-x | Press |
|---|---|---|---|---|---|---|---|
| `components/ui/header-2.tsx:293` | `buttonVariants({size:'lg'})` | **41px** | **13.5px** | **`#176292`** | **15.75/500** | **11.25px** | ❌ |
| `components/ui/header-2.tsx:348` | `buttonVariants({size:'lg'})` + `w-full` | 41px | 13.5px | `#176292` | 15.75/500 | 11.25px | ❌ |

### Not CTAs — controls and chrome (listed for completeness, out of scope)

| file:line | What | Treatment |
|---|---|---|
| `components/ui/header-2.tsx:298` | `<Button size="icon" variant="outline">` mobile nav toggle | 50px, 13.5px radius, white |
| `app/layout.tsx` (`.skip-link`) | accessibility skip link | 42px, 12px radius, `#0F5E97` |
| `components/sections/MaturityCurve.tsx` `.fmc-card` ×4 | stage selector cards rendered as `<button>` | 252–322px tall, 26px radius |
| `components/ui/scroll-reel-testimonials.tsx` ×2 | carousel prev/next icon buttons | 50px, 9999px, transparent |
| `components/ui/header-2.tsx:356` `.drawer-back` | drawer back control | — |
| `components/CookieConsent.tsx:117` `.cookie-link` | text button | — |
| `app/faq/page.tsx:31` `.faq-head-cta` | a `<p>`, not a button | — |

---

## 2. Distinct visual treatments — 7 CTA treatments (not 18)

The audit's 18 counted declarations including the four dead `.btn-*` variants and
files since deleted. Measured on the running site, **7 distinct CTA treatments**
survive, plus 4 non-CTA control treatments.

| # | Treatment | Impl | Height | Radius | Fill | Font | Sites |
|---|---|---|---|---|---|---|---|
| **T1** | `.btn.btn-shimmer` | GAMCS | 44 / 46 / 48 | 999px | `#0F5E97` | 14/700 | 13 |
| **T2** | `.btn.btn-light` | GAMCS | 44 / 48 | 999px | `#FFF` +1px | 14/700 | 7 |
| **T3** | shadcn `size:'lg'` | shadcn | 41 | 13.5px | `#176292` | 15.75/500 | 2 |
| **T4** | `.fin-btn` | GAMCS | 58 | 999px | gradient | 18/600 | 1 |
| **T5** | `.globe-feature-cta` | GAMCS | 44 | 999px | `#202020` | 14/700 | 1 |
| **T6** | `.fsvc-link` | GAMCS | 40 | 999px | `#FFF` +1px | 14.4/600 | 6 |
| **T7** | `.skip-link` | GAMCS | 42 | 12px | `#0F5E97` | 14/700 | 1 |

**Filled treatments: 4** (T1, T3, T4, T5) in **4 distinct fills** — `#0F5E97`,
`#176292`, a blue gradient, and `#202020`.

**Height spread across CTAs: 40, 41, 44, 46, 48, 58px. Radius spread: 12, 13.5,
999px. Font spread: 14/700, 14.4/600, 15.75/500, 18/600.**

---

## 3. Homepage CTAs at 1440px, DOM order

| # | Label | href | Treatment | Filled? |
|---|---|---|---|---|
| — | *Skip to content* | `#main` | T7 skip-link | (a11y) |
| 1 | **Schedule a Call** | `/contact` | **T3 shadcn** | 🔵 `#176292` |
| 2 | How We Help → | `/#how-we-help` | T2 | ⚪ |
| 3 | About our firm ↗ | `/contact` | **T1** | 🔵 `#0F5E97` |
| — | *STAGE 1–4 cards* | — | control | — |
| 4 | **See How We Get You There** | `/solutions` | **T4** | 🟦 gradient |
| 5–10 | Learn more (×6) | 6 solution slugs | T6 | ⚪ |
| 11 | Considering a similar back-office arrangement? Schedule a Call | `/contact` | T2 | ⚪ |
| — | *prev / next testimonial* | — | control | — |
| 12 | **Schedule a Call →** | `/contact` | **T5** | ⚫ `#202020` |

**11 in-content CTAs + 1 chrome CTA = 12. 9 distinct destinations.**

**4 point at `/contact`, under 4 different labels:** "Schedule a Call" (header),
"About our firm ↗", "Considering a similar back-office arrangement? Schedule a
Call", "Schedule a Call →".

**4 filled CTAs render simultaneously at ≥1280px**, in 4 different fills. Two of
them — #1 and #12 — are literally the same action with the same href, drawn two
different ways on one screen.

---

## 4. What imports `components/ui/button.tsx`

**Exactly one file: `components/ui/header-2.tsx:5`** —
`import { Button, buttonVariants } from '@/components/ui/button';`

It uses the import in **two different ways**:

| Usage | Line | Purpose | Is it a CTA? |
|---|---|---|---|
| `buttonVariants({size:'lg'})` | 293 | desktop "Schedule a Call" | ✅ yes |
| `buttonVariants({size:'lg'})` + `w-full` | 348 | mobile drawer "Schedule a Call" | ✅ yes |
| `<Button size="icon" variant="outline">` | 298 | **mobile nav toggle (hamburger)** | ❌ no |

**This decides Phase 2 step 3, and the answer is not the simple one.** Replacing
the two CTA usages does **not** orphan the file, because the nav toggle still
imports `<Button>`. The `--radius-md` bug therefore does **not** go away for
free. Three options:

- **(a) Leave `button.tsx`, replace only the two CTAs.** Nav toggle keeps
  shadcn. The `--radius-md` bug stays but is unreachable from any CTA — it only
  affects `xs`/`sm`/`icon-xs`/`icon-sm`, and the toggle uses `size="icon"`,
  which is unaffected. Smallest diff. **My recommendation.**
- **(b) Also convert the nav toggle to plain markup, then delete `button.tsx`.**
  Kills the `--radius-md` bug and drops the `@base-ui/react` dependency, but
  restyles a non-CTA control, which the brief's "do not restyle" rule argues
  against.
- **(c) Leave the toggle, delete only the dead variants inside `button.tsx`.**
  Touches an imported file's internals for no visual gain.

---

## 5. Proposed three-tier hierarchy

### The tiers

| Tier | Treatment | Spec | Basis |
|---|---|---|---|
| **PRIMARY** | filled pill | **44px, 999px radius, `#0F5E97`, 14px/700, 20px pad, `data-press`** | exactly today's `.btn.btn-shimmer` — unchanged |
| **SECONDARY** | outlined pill | 44px, 999px radius, `#FFF` + 1px `#DCDEE2`, 14px/700, 20px pad, `data-press` | exactly today's `.btn.btn-light` — unchanged |
| **TERTIARY** | text link with arrow | inline, no fill, colour `--blue`, arrow affordance, underline on hover | closest to today's `.fsvc-link`, minus the pill |

No new visual is introduced. PRIMARY and SECONDARY are the two treatments that
already carry 20 of the 31 CTA render sites.

### Mapping every CTA

| CTA | Now | → Tier | Note |
|---|---|---|---|
| Header "Schedule a Call" (×2) | T3 | **PRIMARY** | the change the brief is about |
| WhoWeAre "About our firm ↗" | T1 | **SECONDARY** | see demotion below |
| Hero "How We Help →" | T2 | SECONDARY | unchanged |
| OurPartners "Considering a similar…" | T2 | SECONDARY | unchanged |
| MaturityCurve "See How We Get You There" | T4 | **SECONDARY** | see demotion below |
| Globe "Schedule a Call →" | T5 | **PRIMARY** | the page's one conversion action |
| SolutionCards "Learn more" ×6 | T6 | **TERTIARY** | six identical CTAs should not read as buttons |
| ServicePageLayout / solutions / team / case-study / thank-you / 404 primary CTAs | T1 | PRIMARY | unchanged |
| …their paired secondary CTAs | T2 | SECONDARY | unchanged |
| ContactForm "Submit ↗" | T1 | PRIMARY | unchanged (46px → 44px) |
| StickyMobileCTA | T1 | PRIMARY | unchanged |
| CookieConsent ×3 | T1/T2 | PRIMARY/SECONDARY | gains `data-press`, currently missing |

### Competing primaries, and what I would demote

**Homepage, ≥1280px — four filled CTAs, and two are the same action:**

1. **Header "Schedule a Call" (#176292) vs Globe "Schedule a Call →" (#202020).**
   Same label, same href, two fills. **Demote neither — unify both to PRIMARY.**
   Chrome CTA plus one in-page primary repeating the same action is the correct
   marketing pattern; the defect is that they look different, not that both exist.

2. **"About our firm ↗" wears the PRIMARY fill but is not the primary action.**
   It goes to `/contact` under a label that promises firm information — a
   mismatch already flagged in an earlier review. **Demote to SECONDARY.** It
   competes with the real conversion CTA directly above the fold.

3. **"See How We Get You There" is the loudest element on the page** — 58px tall,
   18px/600, the only gradient fill, 32% taller than any other CTA — for a
   navigation link to `/solutions`. **Demote to SECONDARY.** It currently
   out-shouts the actual conversion action.

**Result: one primary action ("Schedule a Call"), in one treatment, appearing
twice — header and in-page. Everything else steps down.**

---

## Awaiting your decision

Nothing has been changed. Before Phase 2 I need:

1. **Confirm the primary action is "Schedule a Call" → `/contact`**, and that
   both the header and globe instances carry the PRIMARY treatment.
2. **Confirm the two demotions** — "About our firm ↗" and "See How We Get You
   There" — to SECONDARY.
3. **Pick (a), (b) or (c) for `button.tsx`.** I recommend (a).
4. **Say whether the 4 dead `.btn-*` variants** (globals.css:132–137) should go
   in the Phase 2 commit. They are button code and genuinely dead, but deleting
   them is dead-code removal, not unification — I will not touch them without a
   yes.

One thing worth flagging separately: **`.fmc-card` renders four `<button>`
elements 252–322px tall** with no press feedback and a 26px radius found nowhere
else. They are stage selectors, not CTAs, so I have left them out of the
tiering — but they are the largest interactive targets on the homepage and no
tier currently describes them.

---

# LOGGED — deferred, deliberately not fixed

Recorded during Phase 2 at your instruction. None of these were touched.

| # | Issue | Location | Why deferred |
|---|---|---|---|
| L1 | **"About our firm ↗" points at `/contact`** while its label promises firm information. The CTA was demoted to SECONDARY, but the label/href mismatch is untouched. | `components/sections/WhoWeAre.tsx` (`primaryCta.href`) | Content decision — you will decide whether the label or the href is wrong. |
| L2 | **`--radius-md` is referenced but never defined.** `rounded-[min(var(--radius-md),10px)]` at `components/ui/button.tsx:25, 26, 30, 32` makes the `min()` invalid, so the `xs`/`sm`/`icon-xs`/`icon-sm` variants silently fall back to `rounded-lg`. Dormant: the only surviving consumer is the nav toggle at `header-2.tsx:299`, which uses `size="icon"` and is unaffected. | `components/ui/button.tsx` | Out of scope; `button.tsx` kept per option (a). |
| L3 | **`.fmc-card` uses a 26px border-radius found nowhere else**, on four `<button>` elements 252–322px tall. Not CTAs, no tier describes them. | `app/globals.css` (`.fmc-card`) | Radius outlier for the later radius migration. |
| L4 | **`.fin-btn` and `.globe-feature-cta` are now unreferenced** — their call sites moved to the shared component. Their CSS remains. | `app/globals.css` | Dead-code removal, not unification. Will be caught by the next dead-code pass. |
| L5 | **78 classes fall into DEAD when markdown is excluded** from the reference set (7 → 85), across 112 all-dead rules / 10,129 bytes. Four of them (`.btn-*`) were deleted in their own commit; the other 74 were not. | `app/globals.css` | Reported only, per instruction — no deletion from that re-run. |

## Verification note — a gap in my own method

The 45-screenshot sweep used to verify this and the two preceding tasks hides
overlays with `[class*="consent"],[class*="cookie"],[class*="sticky"]`. The site
header carries Tailwind's `sticky` class (`components/ui/header-2.tsx:245`), so
**that selector has been hiding the header in every sweep I have run** — including
the dead-code and `--radius` verifications. No sweep ever photographed the
header.

The header CTA in this task was therefore verified separately, with viewport
captures (`position: fixed` chrome is not composited by `captureBeyondViewport`)
against a stashed pre-change tree. The sweep selector should be narrowed to
`.cookie-banner,.cookie-panel,.sticky-cta` before it is trusted again.
