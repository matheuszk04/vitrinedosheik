/* Kits e presentes.

   Regra da casa: o kit é editorial, os perfumes dentro dele são reais.
   Nome, conceito e texto saem de content/kits.json (e estão marcados como
   rascunho ali). Preço nunca é inventado: é a soma dos preços reais no Pix,
   ou o valor que o lojista tiver preenchido em "price". */

import { u, esc, money, list } from "./base.mjs";

/** "MM-DD" -> número comparável. */
const md = (s) => Number(String(s).replace("-", ""));

/** A estação vira uma janela de calendário que se repete todo ano — não uma
    página de Natal que morre em janeiro. Dezembro→janeiro dá a volta. */
export function activeSeason(seasons, today = new Date()) {
  /* SEASON=natal node src/build.mjs mostra a estação fora da janela dela —
     serve para o lojista ver como o Natal vai ficar ainda em setembro. */
  const forced = process.env.SEASON;
  if (forced) return list(seasons).find((s) => s.id === forced) || null;

  const now = (today.getMonth() + 1) * 100 + today.getDate();
  return (
    list(seasons).find((s) => {
      const from = md(s.from);
      const to = md(s.to);
      return from <= to ? now >= from && now <= to : now >= from || now <= to;
    }) || null
  );
}

/** Junta o kit com os perfumes de verdade e calcula o total. */
export function resolveKit(kit, catalog) {
  const items = list(kit.perfumes)
    .map((slug) => catalog.find((p) => p.slug === slug))
    .filter(Boolean);
  const prices = items.map((p) => p.price).filter((v) => v != null);
  const sum = prices.length === items.length && items.length ? prices.reduce((a, b) => a + b, 0) : null;
  return { ...kit, items, total: kit.price != null ? kit.price : sum, isSum: kit.price == null && sum != null };
}

const AUDIENCE = {
  masculino: "Para ele",
  feminino: "Para ela",
  unissex: "Unissex",
  casal: "Para os dois",
};

/** Miniatura de cada perfume do kit, sobrepostas — lê-se como conjunto. */
function stack(items) {
  return `<span class="kit-stack" aria-hidden="true">${items
    .map((p) => {
      const img = list(p.images)[0];
      return img
        ? `<span class="kit-chip"><img src="${u(`/img/perfumes/${img.base}-320.webp`)}" alt="" width="320" height="427" loading="lazy" decoding="async"></span>`
        : `<span class="kit-chip kit-chip--empty">${esc(p.name.trim()[0] || "·")}</span>`;
    })
    .join("")}</span>`;
}

/** O card do kit é deliberadamente outro objeto: horizontal, com as peças à
    mostra. Se fosse igual ao card de perfume, a home viraria uma prateleira. */
export function kitCard(kit) {
  const count = kit.items.length;
  return `<a class="kit-card reveal" href="${u(`/presentes/${kit.slug}/`)}"
     data-track="kit_clicked" data-track-kit="${esc(kit.slug)}">
    ${stack(kit.items)}
    <span class="kit-head">
      <span class="kit-audience">${esc(AUDIENCE[kit.audience] || "Presente")} · ${count} fragrâncias</span>
      <strong class="kit-name">${esc(kit.name)}</strong>
      <span class="kit-concept">${esc(kit.concept)}</span>
    </span>
    <span class="kit-foot">
      ${kit.total != null ? `<span class="kit-price">${money(kit.total)}<em>${kit.isSum ? "somando as fragrâncias" : "no Pix"}</em></span>` : `<span class="kit-price muted">Sob consulta</span>`}
      <span class="card-more">Ver o kit</span>
    </span>
  </a>`;
}

export const audienceLabel = (id) => AUDIENCE[id] || "Presente";
