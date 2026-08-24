# 002 — Animate the cursor ring with transform, not layout

- **Status**: DONE
- **Commit**: n/a (not a git repo)
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 1 file, small

## Problem

The custom cursor's ring resizes by animating `width`, `height` and `margin` —
all layout-triggering — and it does so on every hover-state change. It is the
most frequently animated element on the page, and it already declares
`will-change: transform`, which does nothing for the properties actually animating.

```css
/* app/globals.css:223 — current */
.cursor-ring{width:34px;height:34px;margin:-17px 0 0 -17px;border:1.5px solid rgba(15,94,151,.5);
  transition:width .25s ease,height .25s ease,margin .25s ease,background .25s ease,border-color .25s ease,opacity .25s ease}
/* app/globals.css:225-227 — current state variants each re-set width/height/margin */
.cursor-ring[data-state="button"]{width:56px;height:56px;margin:-28px 0 0 -28px;…}
```

The JS already writes `transform: translate3d(...)` to position the ring each
frame (`components/hero/CustomCursor.tsx`), so any scale must compose with that.

## Target

One fixed 34px ring, centred once, scaled through a CSS variable that the
positioning transform multiplies in:

```css
/* target */
.cursor-ring{width:34px;height:34px;margin:-17px 0 0 -17px;--ring:1;
  transition:transform .25s var(--ease-out),background .25s var(--ease-out),
             border-color .25s var(--ease-out),opacity .25s var(--ease-out)}
.cursor-ring[data-state="button"]{--ring:1.65;background:rgba(15,94,151,.08);border-color:rgba(15,94,151,.7)}
.cursor-ring[data-state="card"]{--ring:1.35;border-color:rgba(15,94,151,.35)}
.cursor-ring[data-state="icon"]{--ring:1.3;background:rgba(242,194,48,.14);border-color:rgba(242,194,48,.85)}
```

```ts
// components/hero/CustomCursor.tsx — target (inside the rAF loop)
ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(var(--ring, 1))`;
```

Scales chosen to reproduce today's sizes: 56/34 ≈ 1.65, 46/34 ≈ 1.35, 44/34 ≈ 1.3.

## Repo conventions to follow

- The cursor positions itself in a single rAF loop in `components/hero/CustomCursor.tsx`; keep that loop the only writer of `ring.style.transform`.
- Easing tokens come from plan 004 (`var(--ease-out)`).

## Steps

1. `app/globals.css`: replace the `.cursor-ring` rule with the target above (fixed size, `--ring`, transform transition).
2. `app/globals.css`: in each `.cursor-ring[data-state=...]` rule, delete `width`/`height`/`margin` and set `--ring` to the value listed above.
3. `components/hero/CustomCursor.tsx`: append ` scale(var(--ring, 1))` to the ring's `transform` string in the rAF loop.

## Boundaries

- Do NOT change `.cursor-dot`.
- Do NOT change the lerp factor (0.2) or the reveal-on-first-move logic.
- Do NOT change markup or layout.

## Verification

- **Mechanical**: `npx tsc --noEmit` clean; `npm run build` succeeds.
- **Feel check**: hover a CTA, a product card, then an integration chip — the ring should grow smoothly to three distinct sizes and stay centred on the pointer at every size.
  - In DevTools Performance, record while sweeping the pointer across CTAs: there should be no "Layout" entries attributable to the cursor (before the fix, each state change forces layout).
- **Done when**: `grep -n 'cursor-ring\[data-state' app/globals.css` shows no `width`, `height` or `margin`.
