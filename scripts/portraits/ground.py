"""Put an odd-one-out portrait on the set's own backdrop.

Sumit was shot on a white sweep and Asif against a near-black wall; every other
card is the same soft grey spotlight. Vision's person segmentation gives the
silhouette (a threshold matte ate Asif's hair and glasses), and the subject is
composited onto the fitted plate. The mask is pulled in a couple of pixels so no
rim of the old backdrop survives at the edge.
"""
from PIL import Image, ImageFilter
import numpy as np, subprocess, os, sys
from scipy import ndimage
D = os.path.dirname(os.path.abspath(__file__))
from plate import surface

def person_mask(path):
    png = f'{D}/.mask.png'
    r = subprocess.run([f'{D}/segment', path, png], capture_output=True, text=True)
    if r.returncode != 0 or 'x' not in r.stdout:
        raise RuntimeError(f'no person found in {path}: {r.stdout}{r.stderr}')
    return np.asarray(Image.open(png).convert('L'), dtype=float) / 255

def reground(path, out, erode=2, feather=1.2):
    a = np.asarray(Image.open(path).convert('L'), dtype=float)
    m = person_mask(path)
    m = ndimage.binary_erosion(m > 0.5, iterations=erode).astype(float)
    m = np.asarray(Image.fromarray((m * 255).astype('uint8')).filter(
        ImageFilter.GaussianBlur(feather)), dtype=float) / 255
    plate = surface(np.load(f'{D}/plate.npy'), *a.shape[::-1])
    res = a * m + plate * (1 - m)
    Image.fromarray(np.clip(res, 0, 255).astype('uint8')).save(out, quality=90, optimize=True, progressive=True)
    print(f'{os.path.basename(out):22} subject {m.mean()*100:.1f}% of frame')

if __name__ == '__main__':
    for who in sys.argv[1:]:
        reground(f'{D}/out/{who}.jpg', f'{D}/out/{who}.jpg')
