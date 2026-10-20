"""Recorta as logos originais da VITTA e torna o fundo off-white transparente.

Não redesenha a marca: cada pixel recebe a cor de tinta original mais próxima
(marrom ou dourado) e uma opacidade proporcional à sua distância do fundo,
preservando o antisserrilhado. Uso:

    python3 brand-src/prepare-logo.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / "public" / "brand"
BG = (249, 250, 244)
INKS = [(77, 64, 48), (184, 151, 84)]  # marrom e dourado amostrados dos arquivos


def to_alpha(im: Image.Image) -> Image.Image:
    src = im.convert("RGB")
    out = Image.new("RGBA", src.size)
    sp, op = src.load(), out.load()
    for y in range(src.height):
        for x in range(src.width):
            p = sp[x, y]
            best = None
            for ink in INKS:
                d = [ink[i] - BG[i] for i in range(3)]
                v = [p[i] - BG[i] for i in range(3)]
                dd = sum(c * c for c in d)
                t = max(0.0, min(1.0, sum(v[i] * d[i] for i in range(3)) / dd))
                err = sum((BG[i] + t * d[i] - p[i]) ** 2 for i in range(3))
                if best is None or err < best[0]:
                    best = (err, t, ink)
            _, t, ink = best
            a = 0 if t < 0.06 else round(min(1.0, t * 1.04) * 255)
            op[x, y] = (*ink, a)
    return out


def crop(im: Image.Image, box, pad: int) -> Image.Image:
    x0, y0, x1, y1 = box
    return im.crop((x0 - pad, y0 - pad, x1 + pad + 1, y1 + pad + 1))


horizontal = Image.open(ROOT / "vitta-logo-horizontal-original.jpg")
symbol = Image.open(ROOT / "vitta-simbolo-original.jpg")

h = to_alpha(crop(horizontal, (136, 429, 888, 590), 8))
h.save(OUT / "vitta-logo-horizontal.png", optimize=True)
h.save(OUT / "vitta-logo-horizontal.webp", lossless=True)

s = to_alpha(crop(symbol, (209, 277, 814, 731), 12))
s.save(OUT / "vitta-simbolo.png", optimize=True)
s.save(OUT / "vitta-simbolo.webp", lossless=True)

# Favicons: símbolo centralizado em quadrado, sobre o off-white da marca.
side = max(s.size) + 80
sq = Image.new("RGBA", (side, side), (*BG, 255))
sq.alpha_composite(s, ((side - s.width) // 2, (side - s.height) // 2))
for size in (32, 180, 512):
    sq.resize((size, size), Image.LANCZOS).convert("RGB").save(OUT / f"favicon-{size}.png", optimize=True)
print("ok", h.size, s.size)
