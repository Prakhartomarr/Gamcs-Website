# 003 — Replace the nav underline's `transition: all` + layout animation

- **Status**: DONE
- **Commit**: n/a (not a git repo)
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 1 file, tiny

## Problem

The nav underline uses a bare `transition` shorthand — which means `all` — and
animates `right`, a layout property, from `100%` to `0`:

```css
/* app/globals.css:113-114 — current */
.nav a:after{content:"";position:absolute;left:0;right:100%;bottom:-8px;height:2px;background:var(--blue);transition:.2s}
.nav a:hover:after{right:0}
```

Nav links are among the most-hovered elements on the page, and every hover runs
layout → paint → composite instead of a composited transform.

## Target

```css
/* target */
.nav a:after{content:"";position:absolute;left:0;right:0;bottom:-8px;height:2px;background:var(--blue);
  transform:scaleX(0);transform-origin:left center;
  transition:transform .2s var(--ease-out)}
.nav a:hover:after{transform:scaleX(1)}
```

Same visual wipe from the left, now transform-only and explicitly scoped.

## Repo conventions to follow

- Easing tokens come from plan 004; use `var(--ease-out)`.
- Hover motion is gated for touch by plan 005 — if that plan has already landed, this rule's `:hover` belongs inside its `@media (hover: hover) and (pointer: fine)` block.

## Steps

1. `app/globals.css:113`: replace the `.nav a:after` rule with the target above.
2. `app/globals.css:114`: replace `.nav a:hover:after{right:0}` with `transform:scaleX(1)`.

## Boundaries

- Do NOT change the underline's colour, thickness or offset.
- Do NOT touch `.nav a` colour transition.

## Verification

- **Mechanical**: `npm run build` succeeds.
- **Feel check**: hover each nav link — the underline must still wipe in from the left edge (not grow from the centre); check `transform-origin: left center` if it doesn't.
  - In DevTools Performance, hovering must produce no Layout entries for the nav.
- **Done when**: `grep -n "transition:\.2s" app/globals.css` returns nothing.
