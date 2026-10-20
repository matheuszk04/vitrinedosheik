"""Importa o catálogo exportado do Wix (CSV) para src/data/products.ts.

Uso (a partir da pasta vitta/):

    python3 scripts/import-wix-catalog.py scripts/catalogo-wix.csv
    python3 scripts/import-wix-catalog.py scripts/catalogo-wix.csv --baixar-fotos
    python3 scripts/import-wix-catalog.py scripts/catalogo-wix.csv --pasta-fotos ~/Downloads/fotos

Fotos:
  --baixar-fotos   baixa de static.wixstatic.com (precisa de acesso à internet).
  --pasta-fotos    usa arquivos já baixados; cada arquivo deve conter no nome o
                   identificador da mídia que aparece na coluna "media" do CSV
                   (ex.: 22be8c_832e9e3ab86645cba8e5a15ae857de3f~mv2.png).
Em ambos os casos as fotos são convertidas para WebP (lado maior até 1600 px) e
salvas em public/images/products/<slug>-<n>.webp. Só entram no cadastro as fotos
que existirem nessa pasta; sem fotos, a loja mostra "Imagem em breve".

Mídias sem extensão no CSV são vídeos do Wix e são ignoradas.

O que o script faz com o texto:
  - remove HTML das descrições;
  - remove frases que citam outra loja ("versaone", "dropshipping", "nossa loja"...);
  - não inventa medidas, cores, estoque ou datas: só usa o que está no CSV.
Categoria e destaque de cada produto são definidos nas tabelas CATEGORIAS e
DESTAQUES abaixo (o CSV exportado não traz categorias).
"""

from __future__ import annotations

import argparse
import csv
import html
import io
import json
import re
import sys
import unicodedata
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_TS = ROOT / "src" / "data" / "products.ts"
IMG_DIR = ROOT / "public" / "images" / "products"
WIX_MEDIA = "https://static.wixstatic.com/media/"
MAX_SIDE = 1600

# Categoria de cada produto, pelo identificador (handle) do Wix.
# Produtos novos que não estiverem aqui vão para CATEGORIA_PADRAO (o script avisa).
CATEGORIA_PADRAO = "objetos-decorativos"
CATEGORIAS = {
    "Product_fdf6d95b-b83d-4fb5-9ada-01402cf9c8a7": "iluminacao",  # Luminária de Parede de Alabastro
    "Product_b15553e0-373b-4eea-8d64-152144af8227": "iluminacao",  # Lâmpada de Mesa LED
    "Product_98ae84b9-e2ad-4f64-a589-b4ad2535fe31": "iluminacao",  # Lanterna Vintage LED
    "Product_7477cc2b-f176-4183-9534-a14cde37e5ea": "vasos-e-plantas",  # Mini Terrário
    "Product_180c38ce-d7ee-446b-8104-17fbf916e1b3": "vasos-e-plantas",  # Vaso Curvo 3D
    "Product_2d7c2e9c-c129-445a-bce9-c8c1121d21a7": "vasos-e-plantas",  # Vaso Hidropônico Nogueira
    "Product_8c105aa7-a6d7-4e63-8a0e-f0730583bb2b": "vasos-e-plantas",  # Vaso Acrílico Nórdico
    "Product_52ca8f36-55a5-45dc-bd5f-0b616c804d84": "esculturas",  # Deusa da Justiça
    "Product_ff16e81d-5270-45c6-91d8-57256c2ce02f": "esculturas",  # Cavalo da Vitória
    "Product_59d826b6-5579-4f92-abf1-be8c7dc665ba": "esculturas",  # Casal Abraçando
    "Product_ddd9451f-2b1e-4617-943d-001b57d89c43": "esculturas",  # Escultura "Equilíbrio"
    "Product_4a848c4d-344c-436c-8807-2d38b199b5f8": "objetos-decorativos",  # Movimento Perpétuo
    "Product_f8aae040-9d47-4287-93f5-32f1d63eb0d7": "objetos-decorativos",  # Ampulheta
    "Product_6613cfb0-93bf-41ba-b307-8f797b1ecc72": "objetos-decorativos",  # Suporte de Óculos
    "Product_34deabf7-a914-4589-8288-db082e9f4f1d": "objetos-decorativos",  # Suporte de Óculos Branco
    "Product_e2a92d55-dcc7-416a-87d8-0ec652766ab0": "objetos-decorativos",  # Globo Terrestre
    "Product_d68d926b-0a27-48f1-937e-93bd7eb8064e": "objetos-decorativos",  # Pêndulo de Newton
    "Product_959324bd-cec2-452a-aebf-94179c712179": "objetos-decorativos",  # Relógio Surrealista
    "Product_0ec2991d-866b-476d-8ee5-b21afa2199f9": "objetos-decorativos",  # Sino de Bronze
    "Product_65892b51-b8b0-4c76-aa2f-e8e1cfb843a1": "objetos-decorativos",  # Suporte para Vela
}

# Produtos exibidos em "Em destaque" (a ordem aqui é a ordem na página).
DESTAQUES = [
    "Product_fdf6d95b-b83d-4fb5-9ada-01402cf9c8a7",
    "Product_180c38ce-d7ee-446b-8104-17fbf916e1b3",
    "Product_59d826b6-5579-4f92-abf1-be8c7dc665ba",
    "Product_2d7c2e9c-c129-445a-bce9-c8c1121d21a7",
    "Product_ff16e81d-5270-45c6-91d8-57256c2ce02f",
    "Product_959324bd-cec2-452a-aebf-94179c712179",
    "Product_65892b51-b8b0-4c76-aa2f-e8e1cfb843a1",
    "Product_8c105aa7-a6d7-4e63-8a0e-f0730583bb2b",
]

# Material só quando o próprio nome do produto o declara.
MATERIAIS = [
    (r"\bem resina\b", "Resina"),
    (r"\bem metal\b|\bde metal\b", "Metal"),
    (r"\bmadeira maciça de nogueira\b", "Madeira de nogueira"),
    (r"\bacrílico\b", "Acrílico"),
    (r"\bde bronze\b", "Bronze"),
    (r"\bgarrafa de vidro\b", "Vidro"),
]

FRASES_REMOVIDAS = re.compile(
    r"versaone|dropshipping|nossa loja|nosso site|nossa plataforma|nossa seleção|nossas entregas|"
    r"nosso compromisso|comprar com|adquira|aproveite",
    re.I,
)

STOCK = {"IN_STOCK": "in_stock", "OUT_OF_STOCK": "out_of_stock", "PARTIALLY_OUT_OF_STOCK": "low_stock"}


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def clean_name(name: str) -> str:
    return re.sub(r"[\s|]+$", "", name.strip())


def clean_description(raw: str) -> str:
    text = html.unescape(re.sub(r"<[^>]+>", " ", raw))
    text = re.sub(r"\s+", " ", text).strip()
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return " ".join(s for s in sentences if s and not FRASES_REMOVIDAS.search(s))


def to_number(value: str) -> float | None:
    try:
        n = float(value.replace(",", "."))
    except ValueError:
        return None
    return n if n > 0 else None


def save_webp(data: bytes, dest: Path) -> None:
    from PIL import Image  # importado aqui: só é necessário quando há fotos

    with Image.open(io.BytesIO(data)) as im:
        im = im.convert("RGBA") if im.mode in ("P", "LA", "RGBA") else im.convert("RGB")
        im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
        if im.mode == "RGBA":
            # Fundo transparente vira o creme da loja, para não aparecer preto.
            bg = Image.new("RGB", im.size, (244, 239, 230))
            bg.paste(im, mask=im.split()[3])
            im = bg
        dest.parent.mkdir(parents=True, exist_ok=True)
        im.save(dest, "WEBP", quality=84, method=6)


def fetch_photo(media_id: str, folder: Path | None, download: bool) -> bytes | None:
    if folder:
        key = media_id.split("~")[0]
        for f in folder.iterdir():
            if f.is_file() and key in f.name:
                return f.read_bytes()
    if download:
        try:
            with urllib.request.urlopen(WIX_MEDIA + media_id, timeout=30) as r:
                return r.read()
        except Exception as exc:  # noqa: BLE001 — relata e segue para a próxima foto
            print(f"  ! não foi possível baixar {media_id}: {exc}", file=sys.stderr)
    return None


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("csv", type=Path)
    parser.add_argument("--baixar-fotos", action="store_true")
    parser.add_argument("--pasta-fotos", type=Path)
    args = parser.parse_args()

    rows = list(csv.DictReader(args.csv.open(encoding="utf-8-sig")))
    products: list[dict] = []
    media: dict[str, list[str]] = {}
    for r in rows:
        handle = r["handle"]
        if r["fieldType"] == "PRODUCT":
            if r.get("visible", "true").lower() == "false":
                continue
            products.append(r)
        elif r["fieldType"] == "MEDIA" and r["media"].strip():
            media.setdefault(handle, []).append(r["media"].strip())

    seen_slugs: set[str] = set()
    out: list[dict] = []
    report = {"fotos": 0, "sem_foto": [], "videos": 0, "sem_categoria": []}

    for r in products:
        handle = r["handle"]
        name = clean_name(r["name"])
        slug = slugify(name)
        n = 2
        while slug in seen_slugs:
            slug, n = f"{slugify(name)}-{n}", n + 1
        seen_slugs.add(slug)

        images: list[str] = []
        photos = [m for m in media.get(handle, []) if re.search(r"\.(png|jpe?g|webp|gif)$", m, re.I)]
        report["videos"] += len(media.get(handle, [])) - len(photos)
        for i, media_id in enumerate(photos, start=1):
            dest = IMG_DIR / f"{slug}-{i}.webp"
            if args.baixar_fotos or args.pasta_fotos:
                data = fetch_photo(media_id, args.pasta_fotos, args.baixar_fotos)
                if data:
                    save_webp(data, dest)
            if dest.exists():
                images.append(f"/images/products/{dest.name}")
        report["fotos"] += len(images)
        if not images:
            report["sem_foto"].append(name)

        if handle not in CATEGORIAS:
            report["sem_categoria"].append(name)

        product = {
            "id": "wix-" + handle.removeprefix("Product_")[:8],
            "slug": slug,
            "name": name,
            "description": clean_description(r["plainDescription"]),
            "price": to_number(r["price"]),
            "compareAtPrice": to_number(r["strikethroughPrice"]),
            "categoryId": CATEGORIAS.get(handle, CATEGORIA_PADRAO),
            "images": images,
            "material": next((m for pat, m in MATERIAIS if re.search(pat, name, re.I)), None),
            "color": {"name": "Branco"} if re.search(r"-\s*branco$", name, re.I) else None,
            "stockStatus": "preorder" if r["preOrderEnabled"].lower() == "true" else STOCK.get(r["inventory"], "in_stock"),
            "featured": handle in DESTAQUES or None,
            "_order": DESTAQUES.index(handle) if handle in DESTAQUES else len(DESTAQUES),
            "_handle": handle,
        }
        if product["price"] is None:
            sys.exit(f"Produto sem preço válido: {name}")
        out.append(product)

    # Destaques primeiro (na ordem definida), depois a ordem do CSV.
    out.sort(key=lambda p: p["_order"])

    lines = [
        "import type { Product } from '../types/product'",
        "",
        "/**",
        " * Catálogo de produtos da VITTA.",
        " *",
        " * Gerado a partir da exportação do Wix por scripts/import-wix-catalog.py.",
        " * Pode ser editado à mão (veja docs/EDITAR-CATALOGO.md); se o script for",
        " * rodado de novo, este arquivo é substituído.",
        " */",
        "export const products: Product[] = [",
    ]
    for p in out:
        lines.append(f"  // Wix: {p['_handle']}")
        lines.append("  {")
        for key in ["id", "slug", "name", "description", "price", "compareAtPrice", "categoryId", "images", "material", "color", "stockStatus", "featured"]:
            value = p[key]
            if value is None:
                continue
            if key == "images":
                inner = "".join(f"\n      {json.dumps(v)}," for v in value)
                lines.append(f"    images: [{inner}\n    ]," if value else "    images: [],")
            elif key == "color":
                lines.append(f"    color: {{ name: {json.dumps(value['name'], ensure_ascii=False)} }},")
            elif isinstance(value, bool):
                lines.append(f"    {key}: {'true' if value else 'false'},")
            elif isinstance(value, float):
                lines.append(f"    {key}: {value:g},")
            else:
                lines.append(f"    {key}: {json.dumps(value, ensure_ascii=False)},")
        lines.append("  },")
    lines.append("]")
    OUT_TS.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"{len(out)} produtos gravados em {OUT_TS.relative_to(ROOT)}")
    print(f"{report['fotos']} fotos associadas; {report['videos']} vídeos ignorados")
    if report["sem_foto"]:
        print(f"{len(report['sem_foto'])} produtos sem foto local:")
        for name in report["sem_foto"]:
            print(f"  - {name}")
    if report["sem_categoria"]:
        print(f"Sem categoria definida (foram para '{CATEGORIA_PADRAO}'):")
        for name in report["sem_categoria"]:
            print(f"  - {name}")


if __name__ == "__main__":
    main()
