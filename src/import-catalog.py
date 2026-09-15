"""Importa a planilha de estoque para content/perfumes.json.

Lê apenas o que é seguro publicar: nome, preços de venda, unidades e as pistas
de gênero/volume embutidas no nome. Preço de custo e margem NUNCA são lidos —
o repositório é público.

Não sobrescreve conteúdo editorial já revisado: perfumes que já existem são
enriquecidos, não substituídos.

    python3 src/import-catalog.py caminho/para/planilha.xlsx [--aplicar]

Sem --aplicar, apenas mostra o que mudaria.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "content" / "perfumes.json"

COL_NAME, COL_UNITS, COL_PIX, COL_CARD = 1, 2, 7, 8

# tokens que são metadado, não nome comercial
VOLUME_RE = re.compile(r"\b(\d{2,3})\s*ml\b", re.I)
CONCENTRATION_RE = re.compile(r"\b(EDP|EDT|EDC|EDPI)\b", re.I)
GENDER_TAIL_RE = re.compile(r"\s+(F|M|Masculino|Feminino)\s*$", re.I)
NOISE_FOR_MATCHING = {"edp", "edt", "edc", "ml", "f", "m", "masculino", "feminino"}


def strip_accents(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def match_key(name):
    """Chave para detectar que dois registros são o mesmo produto."""
    s = strip_accents(name).lower()
    s = VOLUME_RE.sub(" ", s)
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    words = [w for w in s.split() if w and w not in NOISE_FOR_MATCHING]
    return " ".join(words)


def slugify(name):
    s = strip_accents(name).lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


SMALL_WORDS = {"de", "da", "do", "du", "di", "la", "le", "el", "of", "the"}


def fix_caps(name):
    """Corrige só palavras inteiramente minúsculas num nome já capitalizado.

    Preserva siglas (9PM, EDP), parênteses ((Normal)) e preposições (de, la).
    """
    words = name.split()
    if not any(w[:1].isupper() for w in words):
        return name
    out = []
    for w in words:
        untouchable = (
            not w.isalpha()                      # tem dígito ou pontuação
            or any(c.isupper() for c in w)       # já tem maiúscula em algum lugar
            or w.lower() in SMALL_WORDS
        )
        out.append(w if untouchable else w.capitalize())
    return " ".join(out)


def parse_row(raw_name, units, pix, card):
    original = str(raw_name).strip()
    name = original

    volume = None
    m = VOLUME_RE.search(name)
    if m:
        volume = int(m.group(1))
        name = VOLUME_RE.sub(" ", name)

    concentration = None
    m = CONCENTRATION_RE.search(name)
    if m:
        concentration = m.group(1).upper()

    gender = None
    m = GENDER_TAIL_RE.search(name.strip())
    if m:
        tag = m.group(1).lower()
        gender = "feminino" if tag in ("f", "feminino") else "masculino"
        name = GENDER_TAIL_RE.sub("", name.strip())
    elif re.search(r"\bmasculino\b", name, re.I):
        gender = "masculino"
        name = re.sub(r"\s*\bmasculino\b\s*", " ", name, flags=re.I)
    elif re.search(r"\bfeminino\b", name, re.I):
        gender = "feminino"
        name = re.sub(r"\s*\bfeminino\b\s*", " ", name, flags=re.I)

    name = fix_caps(re.sub(r"\s{2,}", " ", name).strip())

    return {
        "original": original,
        "name": name,
        "volumeMl": volume,
        "concentration": concentration,
        "gender": gender,
        "units": int(units) if units is not None else None,
        "price": round(float(pix)) if pix is not None else None,
        "priceCard": round(float(card)) if card is not None else None,
    }


def blank_perfume(row):
    """Registro novo: só o que veio da planilha. Nada inventado."""
    return {
        "slug": slugify(row["name"]),
        "name": row["name"],
        "brand": None,
        "gender": row["gender"],
        "price": row["price"],
        "priceCard": row["priceCard"],
        "units": row["units"],
        "volumeMl": row["volumeMl"],
        "concentration": row["concentration"],
        "images": [],
        "review": ["brand"] + ([] if row["gender"] else ["gender"]),
    }


def main():
    if len(sys.argv) < 2:
        sys.exit("uso: python3 src/import-catalog.py planilha.xlsx [--aplicar]")
    apply = "--aplicar" in sys.argv
    ws = openpyxl.load_workbook(sys.argv[1], data_only=True)["Perfumes"]

    rows = []
    for raw in ws.iter_rows(min_row=3, values_only=True):
        name = raw[COL_NAME]
        if not name or not str(name).strip() or str(name).strip().upper() in ("PERFUMES", "TOTAL"):
            continue
        rows.append(parse_row(name, raw[COL_UNITS], raw[COL_PIX], raw[COL_CARD]))

    existing = json.loads(CATALOG.read_text(encoding="utf8"))
    by_key = {match_key(p["name"]): p for p in existing}
    used_slugs = {p["slug"] for p in existing}

    merged, created, updated, conflicts, dupes = list(existing), [], [], [], []
    seen_keys = {}

    for row in rows:
        key = match_key(row["name"])

        if key in seen_keys:
            dupes.append((row["original"], seen_keys[key]))
            continue
        seen_keys[key] = row["original"]

        target = by_key.get(key)
        if target:
            for field in ("price", "priceCard", "units", "volumeMl", "concentration"):
                if row[field] is None:
                    continue
                old = target.get(field)
                if field == "price" and old is not None and old != row[field]:
                    conflicts.append((target["name"], "price", old, row[field]))
                target[field] = row[field]
            if row["gender"] and target.get("gender") != row["gender"]:
                conflicts.append((target["name"], "gender", target.get("gender"), row["gender"]))
            updated.append(target["name"])
        else:
            new = blank_perfume(row)
            while new["slug"] in used_slugs:
                new["slug"] += "-2"
            used_slugs.add(new["slug"])
            merged.append(new)
            created.append(new["name"])

    orphans = [p["name"] for p in existing if match_key(p["name"]) not in seen_keys]

    print(f"planilha: {len(rows)} linhas · catálogo: {len(existing)} → {len(merged)}\n")
    print(f"NOVOS ({len(created)}):")
    for n in created:
        print(f"   + {n}")
    print(f"\nATUALIZADOS ({len(updated)}):")
    for n in updated:
        print(f"   ~ {n}")
    if conflicts:
        print(f"\n⚠ CONFLITOS ({len(conflicts)}) — planilha diverge do site:")
        for name, field, old, new in conflicts:
            print(f"   ! {name}: {field} {old} → {new}")
    if dupes:
        print(f"\n⚠ DUPLICATAS NA PLANILHA ({len(dupes)}):")
        for a, b in dupes:
            print(f"   ! '{a}' parece o mesmo produto que '{b}'")
    if orphans:
        print(f"\n⚠ NO SITE MAS FORA DA PLANILHA ({len(orphans)}):")
        for n in orphans:
            print(f"   ? {n}")

    if apply:
        CATALOG.write_text(json.dumps(merged, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
        print(f"\n✓ {CATALOG.relative_to(ROOT)} atualizado")
    else:
        print("\n(simulação — rode com --aplicar para gravar)")


if __name__ == "__main__":
    main()
