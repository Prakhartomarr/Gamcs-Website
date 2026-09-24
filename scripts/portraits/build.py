"""Normalise the roster portraits into one set: greyscale, one crop rule, one tonal range."""
import os
from PIL import Image
import numpy as np, subprocess, sys

# Where the originals were when this last ran. The 2026 shoot arrived through
# chat, so SRC is a scratch folder rather than anything in the repo; point it at
# wherever the next batch lands.
SRC = os.environ.get('PORTRAIT_SRC', '.')
REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.dirname(os.path.abspath(__file__)) + '/out'
os.makedirs(OUT, exist_ok=True)

# person -> source file, as of the last run. The two REPO paths were the
# pre-2026 originals; those files have since been replaced by this script's own
# output, so re-running against them would process an already-processed image —
# take the originals out of git history (before the "one set" commit) instead.
PEOPLE = [
    ('sumit-chatterjee',  f'{REPO}/public/team/sumit-chatterjee.jpg'),
    ('ramesh-yadav',      f'{SRC}/15.webp'),
    ('amit-garg',         f'{SRC}/14.webp'),
    ('dhawal-parvatikar', f'{SRC}/16.webp'),
    ('asif-masani',       f'{REPO}/public/team/asif-masani.jpg'),
    ('sanjay-rikhy',      f'{SRC}/17.webp'),
    ('saurabh-aggarwal',  f'{SRC}/13.webp'),
]
FACE_FRAC = 0.34   # face-box height as a share of the frame
FACE_Y    = 0.40   # where the face-box centre sits down the frame
OUT_W, OUT_H = 720, 960   # 3:4, comfortably above the 640w the cards ever request

def faces(paths):
    exe = os.path.dirname(os.path.abspath(__file__)) + '/faces'
    out = subprocess.run([exe, *paths], capture_output=True, text=True).stdout
    d = {}
    for line in out.strip().split('\n'):
        p, size, box = line.split('\t')
        if box == 'NONE': continue
        x, y, w, h = (int(v) for v in box.split(','))
        if p not in d or w * h > d[p][2] * d[p][3]:   # keep the largest face
            d[p] = (x, y, w, h)
    return d

def crop_box(iw, ih, face):
    fx, fy, fw, fh = face
    ch = min(fh / FACE_FRAC, ih, iw / 0.75)
    cw = ch * 0.75
    cx = fx + fw / 2
    cy = fy + fh / 2 - (FACE_Y - 0.5) * ch     # put the face centre at FACE_Y
    left = min(max(cx - cw / 2, 0), iw - cw)
    top = min(max(cy - ch / 2, 0), ih - ch)
    return (round(left), round(top), round(left + cw), round(top + ch)), fh / ch

def levels(a, lo_t=6, hi_t=244):
    lo, hi = np.percentile(a, 0.5), np.percentile(a, 99.5)
    return np.clip((a - lo) * (hi_t - lo_t) / max(hi - lo, 1) + lo_t, 0, 255)

if __name__ == '__main__':
    F = faces([p for _, p in PEOPLE])
    for name, path in PEOPLE:
        im = Image.open(path).convert('L')
        box, frac = crop_box(*im.size, F[path])
        im = im.crop(box).resize((OUT_W, OUT_H), Image.LANCZOS)
        a = levels(np.asarray(im, dtype=float))
        Image.fromarray(a.astype('uint8')).save(f'{OUT}/{name}.jpg', quality=90, optimize=True, progressive=True)
        print(f'{name:20} src {os.path.basename(path):18} crop {box} face {frac*100:.1f}%')
