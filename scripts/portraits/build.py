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
from backdrop import backdrop, fit, surface

D = os.path.dirname(os.path.abspath(__file__))
SRC = os.environ.get('PORTRAIT_SRC', '.')
OUT = f'{D}/out'

# person -> original photograph. The pre-2026 originals (Asif, the two founders)
# are in git history, before "Put every portrait on one backdrop".
PEOPLE = [
    ('sumit-chatterjee',  'sumit-chatterjee.jpg'),
    ('ramesh-yadav',      'ramesh-yadav.webp'),
    ('amit-garg',         'amit-garg.webp'),
    ('dhawal-parvatikar', 'dhawal-parvatikar.webp'),
    ('asif-masani',       'asif-masani.jpg'),
    ('sanjay-rikhy',      'sanjay-rikhy.webp'),
    ('saurabh-aggarwal',  'saurabh-aggarwal.webp'),
]
FOUNDERS = [
    ('gaurav-malik-bw',     'gaurav-malik-bw.jpg'),
    ('abhinav-aggarwal-bw', 'abhinav-aggarwal-bw.jpg'),
]

FACE_FRAC = 0.28        # the face box's share of the frame, where the photograph allows
FACE_FRAC_MAX = 0.38    # …and the most it may grow to fill a tightly shot frame
FACE_Y = 0.48           # where the face sits down the frame
FACE_TONE = 182         # the face median every portrait is exposed toward
GAMMA_FLOOR = 0.80      # …and how far any one frame may be moved to get there
GAMMA_CEIL = 1.20
CARD = (720, 960)       # 3:4, the adviser card
BIG = (800, 1040)       # 10:13, the founder card
BAND, TOL = 12, 16      # edge refinement: px either side of the mask, grey levels

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

def alpha(a, m):
    """The mask runs a few pixels wide of the person, and those pixels are the
    photograph's own backdrop — carried along they ring the cut-out. So near the
    edge, judge each pixel against that backdrop, fitted."""
    inner = ndimage.binary_erosion(m > 0.5, iterations=BAND)
    outer = ndimage.binary_dilation(m > 0.5, iterations=BAND)
    h, w = a.shape
    ys, xs = np.mgrid[0:h, 0:w]
    x, y = xs / w, ys / h
    bg = surface(fit(x[~outer], y[~outer], a[~outer]), w, h)
    edge = np.clip((np.abs(a - bg) - TOL) / TOL, 0, 1)
    al = np.where(inner, 1.0, np.where(outer, edge, 0.0))
    return np.asarray(Image.fromarray((al * 255).astype('uint8')).filter(
        ImageFilter.GaussianBlur(1.0)), dtype=float) / 255

def place(a, al, box, size):
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
    below = a.shape[0] - (fy + fh / 2)                    # body below the face centre
    k_fill = (1 - FACE_Y) * H / below                     # …just enough to reach the foot
    k = max((FACE_FRAC * H) / fh, min(k_fill, (FACE_FRAC_MAX * H) / fh))
    sw, sh = round(a.shape[1] * k), round(a.shape[0] * k)
    res = lambda arr: np.asarray(Image.fromarray(arr.astype('uint8')).resize((sw, sh), Image.LANCZOS), dtype=float)
    sub, sal = res(a), res(al * 255) / 255
    lay, lam = np.zeros((H, W)), np.zeros((H, W))
    ox = round(W / 2 - (fx + fw / 2) * k)
    oy = round(max(FACE_Y * H - (fy + fh / 2) * k, H - sh))   # never leave a gap at the foot
    x0, y0, sx0, sy0 = max(ox, 0), max(oy, 0), max(-ox, 0), max(-oy, 0)
    w, h = min(sw - sx0, W - x0), min(sh - sy0, H - y0)
    lay[y0:y0+h, x0:x0+w] = sub[sy0:sy0+h, sx0:sx0+w]
    lam[y0:y0+h, x0:x0+w] = sal[sy0:sy0+h, sx0:sx0+w]
    return lay, lam, (oy + (fy + fh / 2) * k) / H, fh * k / H

def make(name, src, size):
    path = f'{SRC}/{src}'
    box = face(path)
    m = person(path)
    a, med, g = expose(levels(np.asarray(Image.open(path).convert('L'), dtype=float)), box)
    lay, lam, depth, frac = place(a, alpha(a, m), box, size)
    out = np.clip(lay * lam + backdrop(*size) * (1 - lam), 0, 255)
    os.makedirs(OUT, exist_ok=True)
    Image.fromarray(out.astype('uint8')).save(f'{OUT}/{name}.jpg', quality=90, optimize=True, progressive=True)
    print(f'{name:20} face {med:3.0f} (gamma {g:.2f})  head {frac*100:.0f}% of frame, {depth*100:.0f}% down')

if __name__ == '__main__':
    want = set(sys.argv[1:])
    for name, src in PEOPLE:
        if not want or name in want: make(name, src, CARD)
    for name, src in FOUNDERS:
        if not want or name in want: make(name, src, BIG)
