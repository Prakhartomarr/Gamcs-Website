# 005 — Gate hover motion for touch, and add press feedback

- **Status**: DONE
- **Commit**: n/a (not a git repo)
- **Severity**: MEDIUM
- **Category**: Accessibility & physicality
- **Estimated scope**: 1 file, small

## Problem

Two gaps, same area:

1. **No hover gating.** `app/globals.css` contains zero `@media (hover: hover)`
   blocks, yet five rules move on hover (`.btn`, `.bento-card`, `.ichip`,
   `.client`, `.card`). On a touch device a tap fires a false hover and the
   element stays visually stuck in its hover state.
2. **No press feedback.** The file contains zero `:active` rules. The primary
   conversion CTA rises on hover but does not respond to being pressed.

## Target

```css
/* target — press feedback, all pointer types */
.btn:active{transform:scale(.97)}
.btn{transition:transform var(--dur-press) var(--ease-out), box-shadow .25s var(--ease-out),
     background .25s var(--ease-out), border-color .25s var(--ease-out)}

/* target — hover motion only where hover is real */
@media (hover: hover) and (pointer: fine){
  .bento-card:hover{border-color:#C3CCD1;box-shadow:0 26px 54px rgba(16,45,68,.12)}
  .ichip:hover{box-shadow:0 26px 46px -12px rgba(10,45,75,.42)}
  .client:hover{opacity:1;transform:translateY(-2px)}
}
```

Note the interaction with plan 001: after 001, `.btn` has no hover transform, so
`:active{transform:scale(.97)}` is the only CSS transform on the button and will
not fight Motion — Motion animates on pointerenter/leave, `:active` only while held.

## Repo conventions to follow

- Reduced-motion overrides already live in a `@media (prefers-reduced-motion: reduce)` block at the end of `app/globals.css`; the press scale is small feedback and should be **kept** there, not nuked.
- Tokens from plan 004.

## Steps

1. `app/globals.css`: add `.btn:active{transform:scale(.97)}` and give `.btn` the transform transition above.
2. Wrap the `.bento-card:hover`, `.ichip:hover` and `.client:hover` rules in `@media (hover: hover) and (pointer: fine)`.
3. Leave `.card:hover` (box-shadow only, no movement) unwrapped — a stuck shadow is harmless.

## Boundaries

- Do NOT gate the GSAP card lift or Motion's handlers in JS — those are pointer-driven already.
- Do NOT change hover colours or shadows, only where they are allowed to apply.

## Verification

- **Mechanical**: `npm run build` succeeds.
- **Feel check**: in DevTools device emulation (touch), tap a bento card — it must not remain in a hover state after the tap.
  - On desktop, press and hold the primary CTA: it should compress slightly and spring back on release.
  - Toggle `prefers-reduced-motion`: the press scale should still work (it is feedback, not decoration).
- **Done when**: `grep -c "hover: hover" app/globals.css` ≥ 1 and `grep -c ":active" app/globals.css` ≥ 1.
