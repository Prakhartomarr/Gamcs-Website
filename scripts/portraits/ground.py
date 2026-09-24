"""Put a portrait on the set's one backdrop.

Vision's person segmentation gives the silhouette — a threshold matte ate Asif's
hair and glasses, because his wall and his suit sit in the same values. The mask
runs a few pixels wide of the person, though, and those pixels are the
photograph's OWN background: composited as subject they leave a halo hugging the
silhouette, bright on the shots that were lit from behind.

So the edge is refined against the original: a quadratic is fitted to the
photograph's own background, and in a band either side of the mask a pixel that
still matches that background is treated as background. Hair reads as hair — it
is nowhere near the backdrop's value — while the fringe drops out.
"""
from PIL import Image, ImageFilter
import numpy as np, subprocess, os, sys
from scipy import ndimage
D = os.path.dirname(os.path.abspath(__file__))
from plate import surface, fit, plate_image

BAND = 12      # px either side of the mask edge that get judged against the backdrop
TOL = 16       # grey levels: below this a pixel is the backdrop, at twice it is the person

def person_mask(path):
    png = f'{D}/.mask.png'
    r = subprocess.run([f'{D}/segment', path, png], capture_output=True, text=True)
    if r.returncode != 0 or 'x' not in r.stdout:
        raise RuntimeError(f'no person found in {path}: {r.stdout}{r.stderr}')
    return np.asarray(Image.open(png).convert('L'), dtype=float) / 255

def own_background(a, outside):
    """Fit the photograph's own backdrop from the pixels well clear of the person."""
    h, w = a.shape
    ys, xs = np.mgrid[0:h, 0:w]
    x, y = xs / w, ys / h
    c = fit(x[outside], y[outside], a[outside])
    return surface(c, w, h)

def alpha_for(a, m, band=BAND, tol=TOL):
    inner = ndimage.binary_erosion(m > 0.5, iterations=band)
    outer = ndimage.binary_dilation(m > 0.5, iterations=band)
    bg = own_background(a, ~outer)
    edge = np.clip((np.abs(a - bg) - tol) / tol, 0, 1)
    return np.where(inner, 1.0, np.where(outer, edge, 0.0))

def reground(path, out, feather=1.0):
    a = np.asarray(Image.open(path).convert('L'), dtype=float)
    al = alpha_for(a, person_mask(path))
    al = np.asarray(Image.fromarray((al * 255).astype('uint8')).filter(
        ImageFilter.GaussianBlur(feather)), dtype=float) / 255
    plate = plate_image(*a.shape[::-1])
    res = a * al + plate * (1 - al)
    Image.fromarray(np.clip(res, 0, 255).astype('uint8')).save(out, quality=90, optimize=True, progressive=True)
    print(f'{os.path.basename(out):24} subject {al.mean()*100:.1f}% of frame')

if __name__ == '__main__':
    for who in sys.argv[1:]:
        p = who if os.path.sep in who else f'{D}/out/{who}.jpg'
        reground(p, p)
