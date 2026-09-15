"""Gera as versoes responsivas servidas em public/img/ a partir de assets-src/.

Rode apenas quando adicionar ou trocar uma foto:
    python3 src/optimize-images.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src"
OUT = ROOT / "public" / "img"

PERFUME_WIDTHS = [320, 480, 640, 960]
LOGO_WIDTHS = [96, 192, 384]


def save_variants(im, stem, out_dir, widths, quality=82):
    out_dir.mkdir(parents=True, exist_ok=True)
    written = []
    for w in widths:
        if w > im.width:
            continue
        h = round(im.height * w / im.width)
        resized = im.resize((w, h), Image.LANCZOS)
        for ext, params in (
            ("webp", {"quality": quality, "method": 6}),
            ("jpg", {"quality": quality, "optimize": True, "progressive": True}),
        ):
            path = out_dir / f"{stem}-{w}.{ext}"
            resized.save(path, **params)
            written.append(path)
    return written


def main():
    total_before = 0
    total_after = 0

    logo = Image.open(SRC / "logo.png").convert("RGB")
    total_before += (SRC / "logo.png").stat().st_size
    for p in save_variants(logo, "logo", OUT / "logo", LOGO_WIDTHS, quality=86):
        total_after += p.stat().st_size

    for src in sorted((SRC / "perfumes").glob("*.jpeg")):
        total_before += src.stat().st_size
        im = Image.open(src).convert("RGB")
        for p in save_variants(im, src.stem, OUT / "perfumes", PERFUME_WIDTHS):
            total_after += p.stat().st_size

    print(f"origem:  {total_before / 1024:8.0f} KB")
    print(f"gerado:  {total_after / 1024:8.0f} KB  (todas as variantes somadas)")


if __name__ == "__main__":
    main()
