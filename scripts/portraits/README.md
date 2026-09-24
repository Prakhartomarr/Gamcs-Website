# Portraits

Every headshot on /team goes through this, so nine photographs from five
different shoots read as one set: greyscale, one crop rule, one tonal range,
and one studio backdrop.

```
swiftc -O faces.swift -o faces          # Vision: face boxes, for the crop
swiftc -O segment.swift -o segment      # Vision: person mask, for the backdrop
PORTRAIT_SRC=<originals> python3 build.py     # crop + greyscale + levels -> out/
python3 harmony.py out/*.jpg                  # one exposure, then onto the backdrop
```

`build.py` holds the person → source-file list and the two numbers that set the
framing: `FACE_FRAC` (the face box as a share of the frame) and `FACE_Y` (where
it sits down the frame). A source tighter than `FACE_FRAC` is left at its own
framing — the crop can only ever go in, never out.

`plate.py` holds the backdrop every portrait is composited onto. It is written
out, not fitted: the shoot's own falloff is steep, and at the head sizes these
cards crop to its hotspot sits right behind the head and reads as a halo. Run
`python3 plate.py` to print both and draw the one in use.

`ground.py` does the compositing. Vision's person segmentation gives the
silhouette — a threshold matte ate Asif's hair and glasses, since his wall and
his suit sit in the same values — and the edge is then refined against the
photograph's own background, fitted as a quadratic: a pixel near the edge that
still matches that background is background, however the mask called it. Without
that step the mask carries a few pixels of the original backdrop and leaves a
halo hugging the silhouette.

`harmony.py` is the exposure pass: a gamma that moves each face's median toward
the set's, clamped, so a dark frame moves most of the way and never all of it.

The `.tr-init` placeholder tile in globals.css is a CSS approximation of the
same plate, so a card with no photograph sits in the row quietly.

New photograph: put the original beside the others, add it to the list in
`build.py`, run the two steps, copy the result into `public/team/`. Always work
from originals — running this over its own output compounds every pass. Check
the result at 720×960 before shipping it: segmentation is good, not perfect.
