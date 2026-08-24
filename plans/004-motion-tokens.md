# 004 — Introduce easing and duration tokens

- **Status**: DONE
- **Commit**: n/a (not a git repo)
- **Severity**: MEDIUM
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 file, medium (mechanical)

## Problem

`app/globals.css` contains 11 distinct `transition` declarations and **zero**
motion tokens. Every curve is either the browser default or a bare `ease`:

```css
/* app/globals.css — current, representative */
.reveal{opacity:0;transform:translateY(22px);transition:opacity .65s ease,transform .65s ease}
.bento-card{…;transition:border-color .3s ease,box-shadow .3s ease,transform .3s ease}
.ichip{…;transition:box-shadow .3s ease}
.logo-tip{…;transition:opacity .2s ease,transform .2s ease}
```

Built-in CSS easings are too weak for deliberate motion, and near-identical
durations (.2/.25/.3/.35/.65) have drifted apart with no shared source.

## Target

Add to the existing `:root` block in `app/globals.css` (the file already has a
`:root` token layer for colour):

```css
:root{
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --dur-press: 160ms;
  --dur-hover: 200ms;
  --dur-panel: 260ms;
  --dur-reveal: 560ms;
}
```

Then replace the easing in existing transitions with `var(--ease-out)`, keeping
each declaration's current duration except `.reveal`, which moves .65s → `var(--dur-reveal)`.

Entrances and hovers both take `--ease-out` (audit: entering/exiting → ease-out;
hover → ease, but the strong ease-out curve is the house curve here and reads
crisper on a fintech page). Reserve `--ease-in-out` for on-screen movement.

## Repo conventions to follow

- `:root` colour tokens already live at the top of `app/globals.css`; add motion tokens to the same block so there is one token home.
- Do not introduce a Tailwind theme extension for these — this codebase styles the hero in plain CSS.

## Steps

1. `app/globals.css`: add the six tokens above to the existing `:root`.
2. Replace `ease` with `var(--ease-out)` in these rules: `.reveal`, `.bento-card`, `.bento-link`, `.ichip`, `.logo-tip`, `.chip-tip`, `.client`, `.card`, `.pcard`, `.nav a`, `.nav-mail`, `.btn`.
3. In `.reveal`, change both `.65s` values to `var(--dur-reveal)`.
4. Leave `linear` on `spin`/`rot`/`sheen`/`chartShimmer` — constant motion is correctly linear.
5. Leave every GSAP/anime/Motion easing in TS untouched; this plan is CSS-only.

## Boundaries

- Do NOT change any duration other than `.reveal`'s.
- Do NOT touch keyframe definitions.
- Do NOT change JS easing.

## Verification

- **Mechanical**: `npm run build` succeeds; `grep -c "var(--ease-out)" app/globals.css` ≥ 12.
- **Feel check**: reveal a section by scrolling — the rise should now decelerate hard at the end rather than drifting linearly to a stop.
  - Hover a bento card and an integration chip: both should share the same deceleration character.
- **Done when**: no `transition:` in `app/globals.css` ends in a bare ` ease` (except intentional `linear` keyframes).
