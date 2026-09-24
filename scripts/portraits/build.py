"""Build the roster portraits: one framing, one exposure, one backdrop.

Nine headshots from six shoots — a white sweep, a near-black wall, two greys, an
office window, the 2026 studio set. Each is cut out, exposed to match, and put
on the same defocused glass facade, at a framing that shows the person rather
than only the face.

    swiftc -O faces.swift -o faces          # Vision: face boxes
    swiftc -O segment.swift -o segment      # Vision: person masks
    PORTRAIT_SRC=<folder of originals> python3 build.py

Always run from the ORIGINALS. Running this over its own output compounds every
pass — the exposure, the cut and the backdrop all get applied twice.
"""
import os, subprocess, sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
from backdrop import fit, surface

D = os.path.dirname(os.path.abspath(__file__))
SRC = os.environ.get('PORTRAIT_SRC', '.')
OUT = f'{D}/out'

# person -> original photograph. Asif's is the pre-2026 original, in git history
# before "Put every portrait on one backdrop"; everyone else was reshot.
# person -> original photograph, and whether we have to put a ground under
# them. The 2026 sitting was shot against one studio wall, so those frames keep
# exactly the backdrop they came with. Asif's near-black wall and Sumit's office
# window are from other years and other rooms; those two, and only those two,
# are cut out and set on a grey fitted from the sitting itself.
PEOPLE = [
    ('sumit-chatterjee',  'sumit-chatterjee.jpg', True),
    ('ramesh-yadav',      'ramesh-yadav.webp',    False),
    ('amit-garg',         'amit-garg.webp',       False),
    ('dhawal-parvatikar', 'dhawal-parvatikar.webp', False),
    ('asif-masani',       'asif-masani.jpg',      True),
    ('sanjay-rikhy',      'sanjay-rikhy.webp',    False),
    ('geeta-karnik',      'geeta-karnik.webp',    False),
    ('saurabh-aggarwal',  'saurabh-aggarwal.webp', False),
]
FOUNDERS = [
    ('gaurav-malik-bw',     'gaurav-malik-bw.jpg',     False),
    ('abhinav-aggarwal-bw', 'abhinav-aggarwal-bw.webp', False),
]

# The frames the studio grey is fitted from: three of the sitting, so one
# photograph's lighting cannot skew it.
GROUND_FROM = ['saurabh-aggarwal.webp', 'amit-garg.webp', 'geeta-karnik.webp']

FACE_FRAC = 0.28        # the face box's share of the frame, where the photograph allows
FACE_FRAC_MAX = 0.38    # …and the most it may grow to fill a tightly shot frame
FACE_Y = 0.48           # where the face sits down the frame
FACE_TONE = 182         # the face median every portrait is exposed toward
GAMMA_FLOOR = 0.80      # …and how far any one frame may be moved to get there
GAMMA_CEIL = 1.20
CARD = (720, 960)       # 3:4, the adviser card
BIG = (800, 1040)       # 10:13, the founder card
BAND, TOL = 12, 16      # edge refinement: px either side of the mask, grey levels

def studio_grey(size):
    """The sitting's own wall, fitted as a smooth surface.

    Sampled from the margins and top band of three frames — never near a face —
    and averaged, so the ground under Asif and Sumit is the same grey the other
    eight were actually photographed against rather than a colour we invented.
    """
    X, Y, V = [], [], []
    for src in GROUND_FROM:
        a = levels(np.asarray(Image.open(f'{SRC}/{src}').convert('L'), dtype=float))
        h, w = a.shape
        ys, xs = np.mgrid[0:h, 0:w]
        x, y = xs / w, ys / h
        keep = ((x < 0.10) | (x > 0.90) | (y < 0.20)) & ~((((x - .5) / .36) ** 2 + ((y - .45) / .44) ** 2) < 1)
        X.append(x[keep]); Y.append(y[keep]); V.append(a[keep])
    x, y, v = np.concatenate(X), np.concatenate(Y), np.concatenate(V)
    c = fit(x, y, v)
    return surface(c, *size)

def face(path):
    line = subprocess.run([f'{D}/faces', path], capture_output=True, text=True).stdout.strip()
    boxes = [l.split('\t')[-1] for l in line.split('\n') if l.split('\t')[-1] != 'NONE']
    if not boxes: raise RuntimeError(f'no face in {path}')
    return max((tuple(int(v) for v in b.split(',')) for b in boxes), key=lambda b: b[2] * b[3])

def person(path):
    png = f'{D}/.mask.png'
    r = subprocess.run([f'{D}/segment', path, png], capture_output=True, text=True)
    if r.returncode != 0 or 'x' not in r.stdout:
        raise RuntimeError(f'no person in {path}: {r.stdout}{r.stderr}')
    return np.asarray(Image.open(png).convert('L'), dtype=float) / 255

def levels(a, lo_t=6, hi_t=244):
    lo, hi = np.percentile(a, 0.5), np.percentile(a, 99.5)
    return np.clip((a - lo) * (hi_t - lo_t) / max(hi - lo, 1) + lo_t, 0, 255)

def expose(a, box):
    """A gamma toward the set's face tone, clamped. A face pushed all the way to
    a target is not an exposure correction — it changes how the person looks."""
    x, y, w, h = box
    med = float(np.median(a[y + int(h * .35):y + int(h * .75), x + int(w * .2):x + int(w * .8)]))
    g = min(max(np.log(FACE_TONE / 255) / np.log(max(med, 1) / 255), GAMMA_FLOOR), GAMMA_CEIL)
    return 255 * np.power(np.clip(a, 0, 255) / 255, g), med, g

def infill(a, known):
    """The photograph's own backdrop, everywhere — including behind the person.

    A quadratic could not hold Sumit's office window or the 2026 set's
    spotlight, and a backdrop read wrong at the silhouette is exactly where the
    halo came from. This diffuses the known background inward over an image
    pyramid: coarse levels carry it across the body, fine levels keep the
    detail that matters, which is the few pixels either side of the edge.
    """
    F = lambda arr: Image.fromarray(arr.astype('float32'), 'F')
    pyr = [(F(a * known), F(known.astype(float)))]
    while min(pyr[-1][0].size) > 4:
        half = tuple(max(v // 2, 1) for v in pyr[-1][0].size)
        pyr.append(tuple(im.resize(half, Image.BILINEAR) for im in pyr[-1]))
    est = None
    for v, w in reversed(pyr):
        V, W = np.asarray(v, dtype=float), np.asarray(w, dtype=float)
        cur = V / np.maximum(W, 1e-6)
        if est is not None:
            up = np.asarray(F(est).resize(v.size, Image.BILINEAR), dtype=float)
            conf = np.clip(W, 0, 1)
            cur = cur * conf + up * (1 - conf)
        est = cur
    return est

def alpha(a, m):
    """The mask runs a few pixels wide of the person, and those pixels are the
    photograph's own backdrop — carried along they ring the cut-out. So near the
    edge, judge each pixel against that backdrop. Returns the coverage and the
    backdrop, which the composite needs to subtract back out."""
    inner = ndimage.binary_erosion(m > 0.5, iterations=BAND)
    outer = ndimage.binary_dilation(m > 0.5, iterations=BAND)
    bg = infill(a, ~outer)
    edge = np.clip((np.abs(a - bg) - TOL) / TOL, 0, 1)
    al = np.where(inner, 1.0, np.where(outer, edge, 0.0))
    al = np.asarray(Image.fromarray((al * 255).astype('uint8')).filter(
        ImageFilter.GaussianBlur(1.0)), dtype=float) / 255
    return al, bg

def place(layers, box, size, cover=False):
    """Scale and position the subject.

    Two rules pull against each other: the head should be the same size on every
    card, and the face should sit at the same height on every card. A photograph
    shot tight has no body left to fill the bottom of the frame once its head is
    small enough, and a torso cannot be invented. So the head size is the one
    that gives: it opens up to FACE_FRAC wherever the photograph allows, and
    grows toward FACE_FRAC_MAX only as far as filling that frame demands.
    """
    W, H = size
    fx, fy, fw, fh = box
    below = layers[0].shape[0] - (fy + fh / 2)            # body below the face centre
    k_fill = (1 - FACE_Y) * H / below                     # …just enough to reach the foot
    k = max((FACE_FRAC * H) / fh, min(k_fill, (FACE_FRAC_MAX * H) / fh))
    src_h, src_w = layers[0].shape
    if cover:
        # Nothing is composited behind this one, so the photograph itself has to
        # reach every edge: never scale it smaller than the frame.
        k = max(k, W / src_w, H / src_h)
    sw, sh = round(src_w * k), round(src_h * k)
    res = lambda arr: np.asarray(Image.fromarray(arr.astype('float32'), 'F').resize((sw, sh), Image.BILINEAR), dtype=float)
    ox = round(W / 2 - (fx + fw / 2) * k)
    oy = round(max(FACE_Y * H - (fy + fh / 2) * k, H - sh))   # never leave a gap at the foot
    if cover:
        # Centring on the face can still push the photograph off an edge; with
        # nothing behind it, that edge would be empty. Hold it over the frame.
        ox = min(0, max(ox, W - sw))
        oy = min(0, max(oy, H - sh))
    x0, y0, sx0, sy0 = max(ox, 0), max(oy, 0), max(-ox, 0), max(-oy, 0)
    w, h = min(sw - sx0, W - x0), min(sh - sy0, H - y0)
    out = []
    for arr in layers:
        dst, src = np.zeros((H, W)), res(arr)
        dst[y0:y0+h, x0:x0+w] = src[sy0:sy0+h, sx0:sx0+w]
        out.append(dst)
    return out, (oy + (fy + fh / 2) * k) / H, fh * k / H

def make(name, src, size, ground):
    path = f'{SRC}/{src}'
    box = face(path)
    a, med, g = expose(levels(np.asarray(Image.open(path).convert('L'), dtype=float)), box)

    if not ground:
        # The photograph as it was taken: its own wall, cropped to the card.
        (lay,), depth, frac = place([a], box, size, cover=True)
        out = np.clip(lay, 0, 255)
    else:
        al, bg = alpha(a, person(path))
        (lay, lam, bgp), depth, frac = place([a, al, bg], box, size)
        # Un-mix rather than blend. An edge pixel is a mix of the person and the
        # backdrop they were shot against, so take that backdrop back out in the
        # same proportion and put this one in: I + (1-a)(new - old). Where the
        # mask is opaque nothing moves; where it is clear the old wall is
        # replaced outright; in the band between, the ring is not there to see.
        out = np.clip(lay + (1 - lam) * (studio_grey(size) - bgp), 0, 255)

    os.makedirs(OUT, exist_ok=True)
    Image.fromarray(out.astype('uint8')).save(f'{OUT}/{name}.jpg', quality=90, optimize=True, progressive=True)
    where = 'on the sitting\u2019s grey' if ground else 'as shot'
    print(f'{name:20} face {med:3.0f} (gamma {g:.2f})  head {frac*100:.0f}% of frame, {depth*100:.0f}% down  {where}')

if __name__ == '__main__':
    want = set(sys.argv[1:])
    for name, src, ground in PEOPLE:
        if not want or name in want: make(name, src, CARD, ground)
    for name, src, ground in FOUNDERS:
        if not want or name in want: make(name, src, BIG, ground)
