"""Fit the studio backdrop of the new shots as a smooth 2D surface, so the two
odd portraits can be put on the same ground."""
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

if __name__ == '__main__':
    X, Y, V = [], [], []
    for n in ('saurabh-aggarwal', 'amit-garg', 'dhawal-parvatikar'):   # one backdrop, three shots
        x, y, v = bg_samples(Image.open(f'{D}/out/{n}.jpg'))
        X.append(x); Y.append(y); V.append(v)
    c = fit(np.concatenate(X), np.concatenate(Y), np.concatenate(V))
    np.save(f'{D}/plate.npy', c)
    s = surface(c, 720, 960)
    print('coeffs', np.round(c, 1))
    print('plate corners TL/TR/BL/BR', [round(s[int(yy*959), int(xx*719)]) for yy, xx in ((.02,.02),(.02,.98),(.98,.02),(.98,.98))])
    print('plate mid-sides L/R, behind head', round(s[480, 20]), round(s[480, 700]), round(s[300, 360]))
    Image.fromarray(np.clip(s, 0, 255).astype('uint8')).save(f'{D}/plate.png')
