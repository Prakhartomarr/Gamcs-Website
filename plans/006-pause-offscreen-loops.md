# 006 — Pause ambient loops when they leave the viewport

- **Status**: DONE
- **Commit**: n/a (not a git repo)
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 2 files, small

## Problem

Two ambient loops run for the entire session regardless of visibility:

```ts
// lib/hooks/useAnimeFloat.ts:17 — current: 7 loops, never paused
const runners = els.map((el, i) => anime({ targets: el, translateY: [0, -11], …, loop: true }));
```

```css
/* app/globals.css:214 — current: blurred conic gradient, spinning forever,
   on a CTA that lives in the sticky header and is therefore always on screen */
.btn-shimmer::before{…;filter:blur(7px);animation:spin 6s linear infinite}
```

The hero's chips keep ticking after the hero scrolls away, and the header CTA
composites a blurred rotating gradient for the whole visit.

## Target

- `useAnimeFloat` observes a root element and calls `.pause()` / `.play()` on each runner as it leaves/enters the viewport.
- The shimmer's conic glow animates only while the hero is on screen or the button is hovered:

```css
/* target */
.btn-shimmer::before{animation-play-state:paused}
.hero .btn-shimmer::before,
.btn-shimmer:hover::before{animation-play-state:running}
```

## Repo conventions to follow

- `components/motion/BklitBars.tsx` already shows the IntersectionObserver pattern used in this codebase (observe, act, `io.disconnect()`); mirror its structure, but keep the observer alive to toggle rather than disconnecting.
- `components/sections/Hero.tsx` already pauses its pointer-parallax rAF loop with an IntersectionObserver — imitate that.

## Steps

1. `lib/hooks/useAnimeFloat.ts`: accept an optional root `Element`; create an IntersectionObserver on the first matched element's closest `.hero` (fallback: the element itself) that calls `runners.forEach(r => r.pause())` when not intersecting and `.play()` when intersecting. Disconnect on cleanup.
2. `app/globals.css`: add the two `animation-play-state` rules above after the existing `.btn-shimmer::before` rule.

## Boundaries

- Do NOT remove either animation — they are wanted, just not when unseen.
- Do NOT change the float distance (−11px), durations, or stagger.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npx tsc --noEmit` clean; `npm run build` succeeds.
- **Feel check**: scroll past the hero, open DevTools Performance and record 5s — there should be no recurring animation frames attributable to `.ichip` or the conic glow. Scroll back up and confirm the chips resume floating (not jump).
- **Done when**: with the hero off screen, the Rendering panel's "Frame Rendering Stats" shows an idle main thread while stationary.
