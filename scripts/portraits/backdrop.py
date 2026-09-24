"""Reading a photograph's own background as a smooth surface.

Ten portraits from three sittings sit on the wall they were each shot against;
only the two strangers to the 2026 sitting are cut out and set on a grey, and
that grey is fitted from the sitting itself (`studio_grey` in build.py). This
module is the quadratic those fits use — the same one that reads a
photograph's own backdrop at the silhouette's edge.

Until 2026-09-24 it also built a defocused glass facade that every portrait was
composited onto. The client asked for the photographs as taken, so the facade
and its source image are gone.
"""
import numpy as np


def fit(x, y, v):
    A = np.stack([np.ones_like(x), x, y, x * x, x * y, y * y], 1)
    return np.linalg.lstsq(A, v, rcond=None)[0]


def surface(c, w, h):
    ys, xs = np.mgrid[0:h, 0:w]
    x, y = xs / w, ys / h
    return c[0] + c[1] * x + c[2] * y + c[3] * x * x + c[4] * x * y + c[5] * y * y
