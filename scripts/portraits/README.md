# Portraits

Every headshot on /team goes through this, so nine photographs from five
different shoots read as one set: greyscale, one crop rule, one tonal range,
and one studio backdrop.

```
swiftc -O faces.swift -o faces          # Vision: face boxes, for the crop
swiftc -O segment.swift -o segment      # Vision: person mask, for the backdrop
python3 build.py                        # crop + greyscale + levels -> out/
python3 ground.py <name> [<name>…]      # put a portrait on the fitted backdrop
```

`build.py` holds the person → source-file list and the two numbers that set the
framing: `FACE_FRAC` (the face box as a share of the frame) and `FACE_Y` (where
it sits down the frame). A source tighter than `FACE_FRAC` is left at its own
framing — the crop can only ever go in, never out.

`plate.npy` is the backdrop: a quadratic fitted to the background of the 2026
shoot (`plate.py` refits it). `ground.py` is for the odd ones out — Sumit was
shot on a white sweep, Asif against a near-black wall. A threshold matte ate
Asif's hair and glasses, so the silhouette comes from Vision's person
segmentation instead.

The `.tr-init` placeholder tile in globals.css is a CSS approximation of the
same plate, so a card with no photograph sits in the row quietly.

New photograph: drop it in the list in `build.py`, run the two steps, copy the
result into `public/team/`. Check the result at 720×960 before shipping it —
segmentation is good, not perfect.
