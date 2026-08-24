# 001 — Give the CTA transform a single owner

- **Status**: DONE
- **Commit**: n/a (not a git repo)
- **Severity**: HIGH
- **Category**: Interruptibility & cohesion
- **Estimated scope**: 2 files, small

## Problem

`.btn:hover` and Motion both write `transform` on the same elements, so the CSS
lift never renders — Motion's inline style always wins.

```css
/* app/globals.css:119 — current */
.btn:hover{transform:translateY(-2px)}
```

```ts
// components/motion/MotionLayer.tsx:57 — current
animate(target, { scale: 1.045 }, { duration: 0.18 });
```

Every `.btn` that carries `data-press` (primary CTA in the header, both hero
CTAs, the contact submit) is affected. This is the same defect already fixed
twice on the hero cards: two libraries, one property.

## Target

Motion is the sole owner of the CTA transform, animating both properties in one
call so they compose:

```ts
animate(target, { scale: 1.03, y: -2 }, { duration: 0.18, ease: [0.23, 1, 0.32, 1] });
// leave: animate(target, { scale: 1, y: 0 }, { duration: 0.22, ease: [0.23, 1, 0.32, 1] })
```

```css
/* app/globals.css — target: no transform here */
.btn{transition:box-shadow .25s var(--ease-out),background .25s var(--ease-out),border-color .25s var(--ease-out)}
```

Scale drops 1.045 → 1.03: a 44px-tall pill scaling 4.5% reads as wobble at this size.

## Repo conventions to follow

- Motion owns hover/inView page-wide (`components/motion/MotionLayer.tsx`); GSAP owns
  anything it has already given an inline transform (see the card hover in
  `components/sections/Hero.tsx`, which uses `gsap.quickTo` for exactly this reason).
- Easing tokens are introduced by plan 004; use `var(--ease-out)` in CSS and the
  literal `[0.23, 1, 0.32, 1]` array in Motion calls.

## Steps

1. `app/globals.css`: delete `transform` from the `.btn:hover` rule. Keep the rule only if it still carries non-transform properties; otherwise remove the whole rule.
2. `app/globals.css`: in `.btn`, replace `transition:transform .25s,box-shadow .25s,background .25s` with the transform-free transition above.
3. `components/motion/MotionLayer.tsx`: in the `[data-press]` handler, animate `{ scale: 1.03, y: -2 }` on enter and `{ scale: 1, y: 0 }` on leave, with the easing above.

## Boundaries

- Do NOT touch the `[data-lift]` handler or the GSAP card hover in `Hero.tsx`.
- Do NOT change markup, copy, or layout.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npx tsc --noEmit` clean; `npm run build` succeeds.
- **Feel check**: hover the header CTA — it should rise ~2px *and* scale slightly, as one movement. Before this fix only the scale happened.
  - Move the pointer on and off rapidly: it must retarget smoothly, never snap.
  - In DevTools Animations panel at 10% speed, confirm a single composited transform, not two competing ones.
- **Done when**: `grep -n "btn:hover" app/globals.css` shows no `transform`, and the hover visibly lifts.
