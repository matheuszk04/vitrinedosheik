"""Baixa as fontes do Google e as auto-hospeda em public/fonts/.

Auto-hospedar evita uma conexão a terceiros no caminho crítico do carregamento,
e mantém só os subsets latinos — que é tudo que o português precisa.

    python3 src/fetch-fonts.py
"""
import os
import pathlib
import re
import ssl
import urllib.request

FAMILIES = (
    "family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400"
    "&family=Inter:wght@300;400;500"
)
KEEP_SUBSETS = {"latin", "latin-ext"}

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "fonts"
CSS_OUT = ROOT / "src" / "styles" / "fonts.css"

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0"


def build_opener():
    ca = "/root/.ccr/ca-bundle.crt"
    ctx = ssl.create_default_context(cafile=ca) if os.path.exists(ca) else ssl.create_default_context()
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    opener = urllib.request.build_opener(
        urllib.request.ProxyHandler({"https": proxy} if proxy else {}),
        urllib.request.HTTPSHandler(context=ctx),
    )
    opener.addheaders = [("User-Agent", UA)]
    return opener


def main():
    opener = build_opener()
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    css_url = f"https://fonts.googleapis.com/css2?{FAMILIES}&display=swap"
    css = opener.open(css_url, timeout=30).read().decode()

    blocks = re.findall(r"/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*\{.*?\})", css, re.S)
    downloaded, rules, total = {}, [], 0

    for subset, block in blocks:
        if subset not in KEEP_SUBSETS:
            continue
        url = re.search(r"url\((https://[^)]+)\)", block).group(1)
        family = re.search(r"font-family:\s*'([^']+)'", block).group(1).replace(" ", "")
        weight = re.search(r"font-weight:\s*(\d+)", block).group(1)
        suffix = "i" if "italic" in block else ""
        name = f"{family}-{weight}{suffix}-{subset}.woff2"

        if url not in downloaded:
            data = opener.open(url, timeout=30).read()
            (OUT_DIR / name).write_bytes(data)
            downloaded[url] = name
            total += len(data)

        rules.append(re.sub(r"url\(https://[^)]+\)", f"url(/fonts/{downloaded[url]})", block))

    CSS_OUT.write_text(
        "/* Fontes auto-hospedadas — subsets latin e latin-ext.\n"
        "   Regenerar com: python3 src/fetch-fonts.py */\n\n" + "\n\n".join(rules) + "\n"
    )
    print(f"{len(downloaded)} arquivos woff2, {total / 1024:.0f} KB")


if __name__ == "__main__":
    main()
