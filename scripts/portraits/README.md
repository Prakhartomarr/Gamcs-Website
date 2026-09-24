# Portraits

Every headshot on /team goes through this, so photographs from three sittings
read as one set: greyscale, one crop rule, one exposure, and — for the two that
were not part of the 2026 sitting — one studio grey behind them.

```
swiftc -O faces.swift -o faces          # Vision: face boxes, for the crop
swiftc -O segment.swift -o segment      # Vision: person masks, for the two
PORTRAIT_SRC=<folder of originals> python3 build.py
```

Always run from the ORIGINALS. Running this over its own output compounds every
pass.

`PEOPLE` and `FOUNDERS` in build.py hold the roster; the third column is
whether that photograph needs a ground under it. It is `False` for the 2026
sitting, whose frames keep exactly the wall they were shot against, and `True`
only for Asif (a near-black wall) and Sumit (an office window) — those two are
cut out with Vision's person segmentation and set on a grey fitted from three
frames of the sitting, so they sit with the rest.

`FACE_FRAC` and `FACE_Y` set the framing. A photograph that cannot fill the
card at that framing is scaled up until it does rather than being padded, so a
tightly shot frame keeps a larger head — nothing is invented at the edges.

`expose` moves each face's median toward `FACE_TONE`, clamped, so a dark frame
moves most of the way and never all of it: a face pushed all the way to a
target is not an exposure correction, it changes how the person looks.

The two on a plate are matched to the other six by measurement rather than by
eye. Sample each card's corners, mid-sides, face and overall mean; the six set
the range, and these two have to land inside it. `TONE` holds a per-person
exposure target for that (Sumit's office lighting put his face twenty levels
above the brightest of them), and `WALL_CORNER`/`WALL_SIDE` map their wall onto
the six's own levels at two points, so its falloff survives the correction.

The `.tr-init` placeholder tile in globals.css approximates the same grey, for
a card with no photograph. None has one today.

New photograph: add it to the list in `build.py`, run the two steps, copy the
result into `public/team/`. Check the result at 720x960 before shipping it —
segmentation is good, not perfect.

Then clear the dev server's image cache, or it will keep serving the old one:
Next keys `.next/cache/images` on the source path, which has not changed, and
does not revalidate on the file. Stop the server first or the delete does not
take.

```
rm -rf .next/cache/images*      # with `next dev` stopped
```

A deployed build is unaffected: it renders from the files as they are.
