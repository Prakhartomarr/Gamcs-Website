"""Bring every portrait to one exposure and one backdrop.

Exposure: a gamma that moves the face's median toward a common target, so the
set reads as one lighting setup. It is clamped hard — a portrait that is far off
moves most of the way, never all of it. Pushing a face all the way to a target
does not correct exposure, it changes how the person looks.

Backdrop: the subject is cut with Vision's person segmentation and composited
onto the fitted plate, so every card carries the identical ground.
"""
from PIL import Image
import numpy as np, subprocess, sys, os
D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, D)
import ground

TARGET = 182          # Sumit's face median: the card the client picked as the reference
GAMMA_FLOOR = 0.80    # how far a dark frame may be lifted
GAMMA_CEIL = 1.20     # …and a bright one pulled down

def face_box(path):
    line = subprocess.run([f'{D}/faces', path], capture_output=True, text=True).stdout.strip().split('\t')
    if line[-1] == 'NONE': raise RuntimeError(f'no face in {path}')
    return tuple(int(v) for v in line[-1].split(','))

def face_median(a, box):
    x, y, w, h = box
    return float(np.median(a[y + int(h * .35):y + int(h * .75), x + int(w * .2):x + int(w * .8)]))

def harmonise(path, target=TARGET):
    a = np.asarray(Image.open(path).convert('L'), dtype=float)
    box = face_box(path)
    med = face_median(a, box)
    g = np.log(target / 255) / np.log(max(med, 1) / 255)
    g = min(max(g, GAMMA_FLOOR), GAMMA_CEIL)
    a = 255 * np.power(np.clip(a, 0, 255) / 255, g)
    Image.fromarray(np.clip(a, 0, 255).astype('uint8')).save(path, quality=90, optimize=True, progressive=True)
    after = face_median(np.asarray(Image.open(path).convert('L'), dtype=float), box)
    ground.reground(path, path)
    print(f'{os.path.basename(path):24} face {med:3.0f} -> {after:3.0f}  (gamma {g:.2f})')

if __name__ == '__main__':
    for p in sys.argv[1:]:
        harmonise(p)
