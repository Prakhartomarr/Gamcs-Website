"""The backdrop every portrait is composited onto.

A glass office facade, thrown out of focus: the client asked for somewhere
rather than a studio wall. `backdrop-source.jpg` is the photograph, from
Unsplash (unsplash.com/photos/... , Unsplash License, free for commercial use);
CREDITS.md records it.

Defocus, flattened contrast and a foot that falls away are all so the thing
stays a backdrop — the building should read at a glance and never compete with
a face. `fit`/`surface` are the quadratic used elsewhere to read a PHOTOGRAPH's
own background at the silhouette's edge.
"""
from PIL import Image, ImageFilter
import numpy as np, os
D = os.path.dirname(os.path.abspath(__file__))

BLUR = 7          # px at 720x960
CONTRAST = 0.62   # of the original's spread
BASE = 118        # mid grey the backdrop sits around
FOOT = 0.50       # how far the bottom falls, for the caption to sit on
OFFSET = 0.35     # where the crop sits down the source frame

def backdrop(w, h):
    im = Image.open(f'{D}/backdrop-source.jpg').convert('L')
    k = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    x, y = (im.width - w) // 2, round((im.height - h) * OFFSET)
    im = im.crop((x, y, x + w, y + h)).filter(ImageFilter.GaussianBlur(BLUR * w / 720))
    a = np.asarray(im, dtype=float)
    a = BASE + (a - a.mean()) * CONTRAST
    ys = np.linspace(0, 1, h)[:, None]
    return a * (1 - FOOT * np.clip((ys - .5) / .5, 0, 1) ** 1.5)

def fit(x, y, v):
    A = np.stack([np.ones_like(x), x, y, x * x, x * y, y * y], 1)
    return np.linalg.lstsq(A, v, rcond=None)[0]

def surface(c, w, h):
    ys, xs = np.mgrid[0:h, 0:w]
    x, y = xs / w, ys / h
    return c[0] + c[1] * x + c[2] * y + c[3] * x * x + c[4] * x * y + c[5] * y * y

if __name__ == '__main__':
    Image.fromarray(np.clip(backdrop(720, 960), 0, 255).astype('uint8')).save(f'{D}/backdrop.png')
    print('wrote backdrop.png')
