# Portraits

Every headshot on /team goes through this, so nine photographs from six shoots
read as one set: greyscale, one exposure, one framing, and one backdrop.

```
swiftc -O faces.swift -o faces                 # Vision: face boxes
swiftc -O segment.swift -o segment             # Vision: person masks
PORTRAIT_SRC=<folder of originals> python3 build.py [name…]
cp out/*.jpg ../../public/team/
```

Work from the **originals**, never from `public/team/` — this pass over its own
output applies the exposure, the cut and the backdrop twice. The pre-2026
originals (Asif, the two founders) are in git history, before the commit "Put
every portrait on one backdrop".

**Framing.** `FACE_FRAC` is the face box's share of the frame and `FACE_Y` is
where it sits down it. Two rules pull against each other — same head size on
every card, same face height on every card — and a photograph shot tight has no
body left to fill the frame once its head is small enough. A torso cannot be
invented, so head size is what gives: it opens up to `FACE_FRAC` wherever the
photograph allows and grows toward `FACE_FRAC_MAX` only as far as filling the
frame demands. Amit's and Sanjay's frames are the tight ones; wider originals
from the photographer would let them match the rest.

**Exposure.** A gamma that moves each face's median toward `FACE_TONE`, clamped
by `GAMMA_FLOOR`/`GAMMA_CEIL`, so a dark frame moves most of the way and never
all of it. A face pushed all the way to a target is not an exposure correction —
it changes how the person looks.

**The cut.** Vision's person segmentation gives the silhouette; a threshold
matte ate Asif's hair and glasses, since his wall and his suit sit in the same
values. The edge is then refined against the photograph's own background,
fitted as a quadratic: a pixel near the edge that still matches that background
is background, however the mask called it. Without that step the mask carries a
few pixels of the original backdrop and leaves a halo hugging the silhouette.

**The backdrop** is `backdrop.py`: a glass office facade thrown out of focus,
flattened and falling away at the foot so it never competes with a face. See
CREDITS.md. `public/team/backdrop.jpg` is the same thing with nobody on it — the
`.tr-init` placeholder tile in globals.css uses it, so a card with no photograph
still belongs in the row.

New photograph: put the original beside the others, add it to the list in
`build.py`, run it, copy the result over. Check the result at 720×960 before
shipping it — segmentation is good, not perfect.
