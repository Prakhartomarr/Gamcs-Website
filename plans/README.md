# Animation plans — GAMCS hero

Audit run: `improve-animations`, scope = hero + shared motion layer.
Bar: Emil Kowalski's animation philosophy (see the skill's AUDIT.md).

| # | Title | Severity | Status |
| --- | --- | --- | --- |
| 001 | Give the CTA transform a single owner | HIGH | DONE |
| 002 | Animate the cursor ring with transform, not layout | HIGH | DONE |
| 003 | Replace the nav underline's `transition: all` + layout animation | HIGH | DONE |
| 004 | Introduce easing and duration tokens | MEDIUM | DONE |
| 005 | Gate hover motion for touch, and add press feedback | MEDIUM | DONE |
| 006 | Pause ambient loops when they leave the viewport | MEDIUM | DONE |

## Recommended order

**004 first** — it creates the `--ease-out` / `--dur-*` tokens that 001, 002, 003
and 005 all reference. Running any of those before 004 means writing a literal
cubic-bezier that has to be swapped later.

Then: 001 → 002 → 003 (the three HIGH performance/correctness fixes, independent
of each other), then 005, then 006.

## Dependencies

- 001, 002, 003, 005 depend on **004** for token names.
- 005 depends on **001**: it adds `.btn:active{transform:scale(.97)}`, which is only
  safe once 001 has removed the competing `.btn:hover` transform.
- 006 is independent.

## Deliberately not planned

- `ease: "none"` on every scrubbed ScrollTrigger — correct for scroll-linked motion.
- `gsap.quickTo` for the hero card hover — correct; GSAP owns those inline transforms.
- `filter: blur(7px)` on the CTA glow — within the 20px budget.
- Reduced-motion coverage — already branched in both CSS and JS.
