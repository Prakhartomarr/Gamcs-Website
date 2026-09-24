"""The set's one backdrop, and the fitting used to read a photograph's own.

The backdrop the portraits are composited onto is written out here rather than
fitted: the 2026 shoot's own falloff is steep, and at the head sizes these cards
crop to, its hotspot sits right behind the head and reads as a halo. This is the
same light, opened up — a broad centre, a gentle fall to the corners, and the
bottom carried down for the caption to sit on.

`fit`/`surface` stay: ground.py fits a quadratic to each PHOTOGRAPH's own
background to decide what is backdrop at the silhouette's edge.
"""
from PIL import Image
import numpy as np, os
D = os.path.dirname(os.path.abspath(__file__))

def bg_samples(img):
    """Background pixels: the side margins full height + the top band, minus a
    generous ellipse around where a head sits. Never the subject."""
    a = np.asarray(img, dtype=float); h, w = a.shape
    ys, xs = np.mgrid[0:h, 0:w]
    x, y = xs / w, ys / h
    side = (x < 0.10) | (x > 0.90)
    top = y < 0.22
    head = (((x - .5) / .34) ** 2 + ((y - .42) / .40) ** 2) < 1   # keep well clear
    m = (side | top) & ~head
    return x[m], y[m], a[m]

def fit(x, y, v):
    A = np.stack([np.ones_like(x), x, y, x * x, x * y, y * y], 1)
    return np.linalg.lstsq(A, v, rcond=None)[0]

def surface(c, w, h):
    ys, xs = np.mgrid[0:h, 0:w]
    x, y = xs / w, ys / h
    return c[0] + c[1] * x + c[2] * y + c[3] * x * x + c[4] * x * y + c[5] * y * y

# centre, spread and depth of the backdrop, in fractions of the frame
CENTRE = (0.50, 0.34)
SIGMA = (0.46, 0.52)
BASE, AMP = 78.0, 46.0
FOOT_FROM, FOOT_DEPTH, FOOT_CURVE = 0.55, 0.45, 1.6

def plate_image(w, h):
    ys, xs = np.mgrid[0:h, 0:w]
    x, y = xs / w, ys / h
    cx, cy = CENTRE; sx, sy = SIGMA
    v = BASE + AMP * np.exp(-(((x - cx) ** 2) / (2 * sx ** 2) + ((y - cy) ** 2) / (2 * sy ** 2)))
    return v * (1 - FOOT_DEPTH * np.clip((y - FOOT_FROM) / (1 - FOOT_FROM), 0, 1) ** FOOT_CURVE)

if __name__ == '__main__':
    # Print and draw the backdrop the portraits are composited onto, and, for
    # comparison, the 2026 shoot's own falloff fitted from three of its frames.
    s = plate_image(720, 960)
    at = lambda yy, xx: round(s[int(yy * 959), int(xx * 719)])
    print('backdrop  behind head', at(.34, .5), ' mid-sides', at(.5, .02), at(.5, .98),
          ' top corners', at(.02, .02), at(.02, .98), ' foot', at(.99, .5))
    Image.fromarray(np.clip(s, 0, 255).astype('uint8')).save(f'{D}/plate.png')

    X, Y, V = [], [], []
    for n in ('saurabh-aggarwal', 'amit-garg', 'dhawal-parvatikar'):
        x, y, v = bg_samples(Image.open(f'{D}/out/{n}.jpg'))
        X.append(x); Y.append(y); V.append(v)
    t = surface(fit(np.concatenate(X), np.concatenate(Y), np.concatenate(V)), 720, 960)
    at = lambda yy, xx: round(t[int(yy * 959), int(xx * 719)])
    print('the shoot behind head', at(.34, .5), ' mid-sides', at(.5, .02), at(.5, .98),
          ' top corners', at(.02, .02), at(.02, .98), ' foot', at(.99, .5))
