# unity-advisory.com/what-we-do — measured spec

Every value below was read from the live page's computed styles in headless
Chrome, at 1440×900 and 390×844, on 2026-09-24. Font families are ignored on
purpose: the build keeps GAMCS's own faces and matches size, weight, leading
and tracking only.

Full-page screenshots: `/tmp/ref/desktop.png`, `/tmp/ref/mobile.png`.

## Page

| | value |
|---|---|
| background | `rgb(249, 249, 248)` — #F9F9F8 |
| base text | `rgb(26, 26, 26)` — #1A1A1A |
| base font | 18px / 27px (1.5) |
| side margin (1440) | 21px |
| side margin (390) | ~12px page + ~20px card padding (text starts at 32.7px) |

## Hero

| element | value |
|---|---|
| h1 (1440) | 87.06px / lh 83.58px (0.96) / weight 400 / ls −1.74px (−0.02em) |
| h1 max-width | 772.66px |
| h1 (390) | 48px / lh 46.08px (0.96) / ls −0.48px |
| h1 scaling | fluid 87.06 → 48, clamped at 48 below 640 |
| intro paragraph | 18px / 27px / weight 400 / colour #1A1A1A |
| chips | 12px / lh 12px / ls 0.48px (0.04em) / uppercase / weight 400 |
| chip box | height 28px, padding 8px 8px 6px, radius 6px, background `rgba(134,131,127,0.1)` |
| chip reveal | `opacity 1.5s cubic-bezier(0.215,0.705,0.44,0.97) 0.3s` |

## Pillar section

| element | value |
|---|---|
| section height (1440) | 836px |
| section padding | 20.97px 0 |
| columns | two, 689px each at 1440 |
| gutter between columns | 20px (1440 − 2×21 margin − 2×689) |
| page margin | 21px |
| card | 689 × 794.1, radius **12px**, `overflow: hidden` |
| card inner padding | 52px |
| card text column | 533px wide (a max-width, not padding) |
| eyebrow | plain text, no chip |
| h2 (1440) | 53.18px / lh 53.18px (1.0) / weight 400 / ls −0.53px (−0.01em) / colour #F9F9F8 |
| h2 (390) | 38.16px |
| h2 scaling | fluid 53.18 → 38.16 |
| card paragraph | 18.99px / lh 22.79px (1.2) / weight 500 / margin-top 18.99px |
| CTA button | 269.4 × 55px, font 15.49px, weight 500 |

## Accordion

| element | value |
|---|---|
| row height | 60px |
| title | 18px / 27px / weight 400 |
| chevron | svg, 13 × 24 |
| divider | 1px hairline, low-contrast grey (no border on the item itself — drawn by a child) |
| open state | height animates; the item's wrapper grows from 60px to its content height |

## Scroll behaviour

- **Neither column is sticky.** The card's ancestors are all `position: relative`;
  the only three `position: sticky` elements on the page belong to the header.
- Content fades in as each section enters the viewport — the chips carry
  `opacity 1.5s cubic-bezier(0.215, 0.705, 0.44, 0.97) 0.3s`, and the same
  easing and duration family runs on the section content.

## Breakpoints

Measured by resizing and watching where the two columns stop sitting side by side.

| width | columns | h1 | pillar h2 | text gutter |
|---|---|---|---|---|
| 1440 | side by side | 87.06 | 53.18 | 73 |
| 1280 | side by side | 73.41 | 48.24 | 71.6 |
| 1100 | side by side | 64.87 | 45.54 | 64.9 |
| 1024 | side by side | 62.08 | 44.75 | 61.5 |
| 900 | **stacked** | 57.53 | 43.46 | 55.8 |
| 768 | stacked | 52.69 | 42.09 | 49.8 |
| 640 | stacked | 48 (clamp) | 40.76 | 44 |
| 390 | stacked | 48 (clamp) | 38.16 | 32.7 |

**The stacking breakpoint is between 1024 and 900.** Everything else is fluid,
scaling with the viewport rather than stepping at a media query.
