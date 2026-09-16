/* Componentes compartilhados e o shell HTML de todas as páginas. */

/* Prefixo de caminho. Fica vazio em domínio próprio e vira "/repositorio"
   quando o site é publicado num subcaminho (GitHub Pages de projeto). */
let BASE = "";
export const setBase = (value) => { BASE = value.replace(/\/$/, ""); };
export const u = (path) => BASE + path;

export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const money = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PERFUME_WIDTHS = [320, 480, 640, 960];
const LOGO_WIDTHS = [96, 192, 384];

/** <picture> com WebP + fallback JPEG e srcset — o navegador baixa só o que precisa. */
export function picture({ dir, base, alt, sizes, widths = PERFUME_WIDTHS, eager = false, w = 960, h = 1280 }) {
  const set = (ext) => widths.map((n) => `${u(dir)}/${base}-${n}.${ext} ${n}w`).join(", ");
  return `<picture>
    <source type="image/webp" srcset="${set("webp")}" sizes="${sizes}">
    <img src="${u(dir)}/${base}-${widths[widths.length - 1]}.jpg" srcset="${set("jpg")}" sizes="${sizes}"
         alt="${esc(alt)}" width="${w}" height="${h}"
         loading="${eager ? "eager" : "lazy"}" decoding="async"${eager ? ' fetchpriority="high"' : ""}>
  </picture>`;
}

export const logoImg = (cls = "", eager = false) => {
  const set = (ext) => LOGO_WIDTHS.map((n) => `${u("/img/logo/logo-")}${n}.${ext} ${n}w`).join(", ");
  return `<picture>
    <source type="image/webp" srcset="${set("webp")}" sizes="96px">
    <img class="${cls}" src="${u('/img/logo/logo-192.jpg')}" srcset="${set("jpg")}" sizes="96px"
         alt="Vitrine do Sheik" width="192" height="192"
         loading="${eager ? "eager" : "lazy"}" decoding="async">
  </picture>`;
};

/** URL absoluta — necessária em Open Graph e dados estruturados. */
export const abs = (site, path) =>
  site.url ? site.url.replace(/\/$/, "") + path : u(path);

let CATALOG = [];
export const setCatalog = (items) => { CATALOG = items || []; };

/* Glossário: o site ensina enquanto o cliente navega, sem aula de química. */
let GLOSSARY = {};
export const setGlossary = (g) => { GLOSSARY = g || {}; };

export function term(id) {
  const t = GLOSSARY[id];
  if (!t) return "";
  return `<button class="term" type="button" data-term aria-expanded="false" aria-label="O que significa ${esc(t.label)}?">
    <span aria-hidden="true">?</span>
    <span class="term-pop" role="tooltip"><b>${esc(t.label)}</b>${esc(t.body)}</span>
  </button>`;
}

export const waHref = (site, message) =>
  `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}`;

export const WHATS_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.5 5.2L2 22l5-1.4c1.5.8 3.2 1.2 5 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.2-.4-4.5-1.3l-.3-.2-3 .8.8-2.9-.2-.3C4 15 3.6 13.5 3.6 12c0-4.6 3.8-8.4 8.4-8.4s8.4 3.8 8.4 8.4-3.8 8.2-8.4 8.2z"/><path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.5s-.6-1.5-.9-2c-.2-.5-.4-.4-.6-.5h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3z"/></svg>`;

const ACCORD_COLORS = {
  gourmand: "--a-gourmand", doce: "--a-gourmand",
  baunilha: "--a-baunilha",
  especiado: "--a-especiado",
  ambar: "--a-ambar", resina: "--a-ambar",
  amadeirado: "--a-amadeirado",
  citrico: "--a-citrico",
  floral: "--a-floral",
  frutado: "--a-frutado",
  almiscarado: "--a-almiscarado",
};

export function accordColor(label) {
  const key = label.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  for (const [needle, token] of Object.entries(ACCORD_COLORS)) {
    if (key.includes(needle)) return `var(${token})`;
  }
  return "var(--gold-deep)";
}

/** Barra proporcional de acordes — mostra o peso de cada família, não só a lista. */
export function accords(list) {
  const total = list.reduce((sum, a) => sum + a.weight, 0);
  const bar = list
    .map((a) => `<i class="accords-seg" style="width:${((a.weight / total) * 100).toFixed(1)}%;background:${accordColor(a.label)}"></i>`)
    .join("");
  const key = list
    .map((a) => `<li><i style="background:${accordColor(a.label)}"></i>${esc(a.label)} <b>${Math.round((a.weight / total) * 100)}%</b></li>`)
    .join("");
  return `<div class="accords-bar" role="img" aria-label="Composição por família olfativa">${bar}</div>
    <ul class="accords-key">${key}</ul>`;
}

const METER_WORDS = ["", "Suave", "Moderada", "Média", "Marcante", "Intensa"];

export function meters(profile) {
  const rows = [
    ["Intensidade", profile.intensity],
    ["Projeção", profile.projection],
    ["Fixação", profile.longevity],
  ];
  return `<div class="meters">${rows
    .map(([label, value]) => `<div class="meter">
      <span class="meter-label">${label}</span>
      <span class="meter-dots" role="img" aria-label="${label}: ${value} de 5">
        ${Array.from({ length: 5 }, (_, i) => `<i class="meter-dot${i < value ? " is-on" : ""}"></i>`).join("")}
      </span>
      <span class="meter-value">${METER_WORDS[value]}</span>
    </div>`)
    .join("")}</div>`;
}

/** Pirâmide como linha do tempo: o cliente vê a fragrância acontecendo, não uma lista. */
export function timeline(perfume, stages) {
  const byId = { topo: perfume.notes.top, coracao: perfume.notes.heart, fundo: perfume.notes.base };
  const hints = { topo: perfume.perception.opens, coracao: perfume.perception.becomes, fundo: perfume.perception.ends };
  return `<div class="timeline" data-timeline>
    <span class="timeline-track" aria-hidden="true"></span>
    ${stages
      .map((s) => `<div class="timeline-stage" data-stage>
        <div class="timeline-when">${esc(s.time)}</div>
        <h3 class="timeline-label">${esc(s.label)}</h3>
        <p class="timeline-notes">${byId[s.id].map(esc).join(" · ")}</p>
        <p class="timeline-hint">${esc(hints[s.id])}</p>
      </div>`)
      .join("")}
  </div>`;
}

/* O catálogo cresce por etapas: nome primeiro, dados olfativos depois.
   Tudo daqui para baixo precisa funcionar com perfil parcial. */
export const list = (v) => (Array.isArray(v) ? v : []);

/** Um perfume só participa de recomendação quando tem com o que ser comparado. */
export const isEnriched = (p) =>
  list(p.families).length > 0 && list(p.personality).length > 0 && !!p.profile;

export const inStock = (p) => p.units == null || p.units > 0;

/** Sem foto, a moldura vira uma inicial — nunca uma imagem de outro perfume. */
const placeholderFrame = (perfume) =>
  `<div class="card-frame card-frame--empty"><span class="mark">${esc(perfume.name.trim()[0] || "·")}</span></div>`;

export function card(perfume, { eager = false } = {}) {
  const img = list(perfume.images)[0];
  const traits = list(perfume.personality).slice(0, 3);
  const families = list(perfume.families);

  const frame = img
    ? `<div class="card-frame">
        ${picture({ dir: "/img/perfumes", base: img.base, alt: img.alt, sizes: "(min-width:1024px) 300px, 45vw", eager })}
        <span class="card-rule" aria-hidden="true"></span>
        ${families.length ? `<span class="card-tags">${families.slice(0, 2).map(esc).join(" · ")}</span>` : ""}
      </div>`
    : placeholderFrame(perfume);

  return `<a class="card reveal" href="${u(`/perfumes/${perfume.slug}/`)}"
     data-card
     data-name="${esc(perfume.name.toLowerCase())}"
     data-gender="${esc(perfume.gender || "")}"
     data-families="${esc(families.join("|"))}"
     data-occasions="${esc(list(perfume.occasions).join("|"))}"
     data-personality="${esc(traits.join("|"))}"
     data-climates="${esc(list(perfume.climates).join("|"))}"
     data-enriched="${isEnriched(perfume)}"
     data-track="perfume_view" data-track-perfume="${perfume.slug}">
    ${frame}
    <div class="card-body">
      <h3 class="card-name">${esc(perfume.name)}</h3>
      ${perfume.brand ? `<div class="card-brand">${esc(perfume.brand)}</div>` : ""}
      ${traits.length ? `<p class="card-traits">${traits.map(esc).join(" · ")}</p>` : ""}
      ${!traits.length && perfume.tagline ? `<p class="card-tagline">${esc(perfume.tagline)}</p>` : ""}
      <div class="card-foot">
        ${priceTag(perfume)}
        <span class="card-more">${inStock(perfume) ? "Descobrir" : "Sob encomenda"}</span>
      </div>
    </div>
  </a>`;
}

/* Trilho horizontal: cabe mais coleção na primeira tela sem virar prateleira
   de marketplace — o card continua grande e a rolagem é lateral, não infinita.
   Sem biblioteca: scroll-snap no CSS, as setas do desktop são um extra. */
export function rail({ id, eyebrow, title, note, link, items }) {
  if (!items.length) return "";
  return `<section class="section section--rail">
    <div class="wrap">
      <div class="rail-head reveal">
        <div>
          ${eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ""}
          <h2 class="display">${esc(title)}</h2>
          ${note ? `<p class="rail-note">${esc(note)}</p>` : ""}
        </div>
        <div class="rail-tools">
          ${link ? `<a class="btn btn--quiet" href="${link.href}">${esc(link.label)}</a>` : ""}
          <div class="rail-arrows" aria-hidden="true">
            <button class="rail-arrow" data-rail-prev tabindex="-1">&larr;</button>
            <button class="rail-arrow" data-rail-next tabindex="-1">&rarr;</button>
          </div>
        </div>
      </div>
    </div>
    <div class="rail" data-rail="${esc(id)}" role="group" aria-label="${esc(title)}">
      <div class="rail-track">${items.join("")}</div>
    </div>
  </section>`;
}

export function priceTag(perfume) {
  if (perfume.price == null) return `<span class="card-price muted">Sob consulta</span>`;
  return `<span class="card-price">${money(perfume.price)}<em>no Pix</em></span>`;
}

/* O mapa olfativo saiu daqui: é uma experiência secundária, não um caminho de
   compra. Continua acessível a partir de Fragrâncias. */
const NAV = [
  { href: "/", label: "Início" },
  { href: "/fragrancias/", label: "Fragrâncias" },
  { href: "/presentes/", label: "Presentear" },
  { href: "/descobrir/", label: "Descobrir" },
  { href: "/consultor/", label: "Consultor" },
];

const GENDER_NAV = [
  { value: "masculino", label: "Masculinos" },
  { value: "feminino", label: "Femininos" },
  { value: "unissex", label: "Unissex" },
];

const SEARCH_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>`;

function nav(current, site) {
  const items = NAV.map((item, i) => {
    const sub = item.href === "/fragrancias/"
      ? `<ul class="nav-sub">${GENDER_NAV.map((g) =>
          `<li><a href="${u(`/fragrancias/?g=${g.value}`)}">${esc(g.label)}</a></li>`).join("")}</ul>`
      : "";
    return `<li><a class="nav-link" href="${u(item.href)}"${item.href === current ? ' aria-current="page"' : ""}>
      <span class="idx">0${i + 1}</span>${esc(item.label)}</a>${sub}</li>`;
  }).join("");
  return `<nav class="drawer" id="drawer" aria-label="Navegação principal">
    <button class="drawer-close" data-drawer-close aria-label="Fechar menu">&times;</button>
    <a class="brand" href="${u('/')}">${logoImg("", false)}<span class="brand-name">Vitrine do Sheik</span></a>
    <ul class="nav-list">${items}
      <li><a class="nav-link" href="${waHref(site, site.whatsapp.greeting)}" target="_blank" rel="noopener"
             data-track="whatsapp_click" data-track-source="nav">
        <span class="idx">0${NAV.length + 1}</span>WhatsApp</a></li>
    </ul>
    <p class="nav-tail">Atendimento individual.<br>Sem carrinho, sem cadastro.</p>
  </nav>`;
}

function pageKind(path) {
  if (path === "/") return "home";
  if (path === "/fragrancias/") return "collection";
  if (path === "/descobrir/") return "discovery";
  if (path === "/mapa/") return "map";
  if (path === "/consultor/") return "consultant";
  if (path === "/presentes/") return "gifts";
  if (path.startsWith("/presentes/")) return "kit";
  if (path.startsWith("/perfumes/")) return "perfume";
  return "other";
}

export function layout({ site, title, description, path, body, jsonLd = null, ogImage = null }) {
  const canonical = site.url ? site.url.replace(/\/$/, "") + path : u(path);
  const og = ogImage || "/img/perfumes/khamrah-1-960.jpg";
  const ogAbs = site.url ? site.url.replace(/\/$/, "") + og : u(og);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">${site.noindex ? '\n<meta name="robots" content="noindex, nofollow">' : ""}
<meta name="theme-color" content="#050505">

<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Vitrine do Sheik">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(ogAbs)}">
<meta property="og:url" content="${esc(canonical)}">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="${u("/img/logo/logo-96.jpg")}">
<link rel="apple-touch-icon" href="${u("/img/logo/logo-192.jpg")}">

<link rel="preload" href="${u("/fonts/CormorantGaramond-300-latin.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${u("/fonts/Inter-300-latin.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${u("/assets/main.css")}">
<script>document.documentElement.classList.add("js")</script>
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ""}
</head>
<body data-page="${pageKind(path)}">
<a class="skip" href="#conteudo">Ir para o conteúdo</a>
<div class="texture" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>

<header class="topbar">
  <a class="brand" href="${u('/')}">${logoImg("", true)}<span class="brand-name">Vitrine do Sheik</span></a>
  <div class="topbar-actions">
    <button class="icon-btn" data-search-open aria-label="Buscar fragrância">${SEARCH_ICON}</button>
    <button class="burger" data-drawer-open aria-label="Abrir menu" aria-controls="drawer" aria-expanded="false">
      <span></span><span></span>
    </button>
  </div>
</header>

<div class="drawer-scrim" data-drawer-close aria-hidden="true"></div>
${nav(path, site)}

<div class="shell">
  <main class="main" id="conteudo">${body}</main>

  <footer class="foot">
    <div class="wrap foot-grid">
      <span>Vitrine do Sheik — perfumaria árabe, curadoria e atendimento individual.</span>
      <a href="${waHref(site, site.whatsapp.greeting)}" target="_blank" rel="noopener"
         data-track="whatsapp_click" data-track-source="footer">Falar no WhatsApp</a>
    </div>
  </footer>
</div>

<div class="search" id="busca" role="dialog" aria-modal="true" aria-label="Buscar fragrância" hidden>
  <div class="search-scrim" data-search-close></div>
  <div class="search-panel">
    <div class="search-field">
      ${SEARCH_ICON}
      <input type="search" id="search-input" placeholder="Buscar por nome…" autocomplete="off"
             spellcheck="false" aria-controls="search-results" aria-describedby="search-help">
      <button class="search-close" data-search-close aria-label="Fechar busca">&times;</button>
    </div>
    <p class="search-help" id="search-help">Digite o nome da fragrância. Erros de digitação não atrapalham.</p>
    <ul class="search-results" id="search-results" role="listbox"></ul>
  </div>
</div>

<script type="application/json" data-search-index>${JSON.stringify(
  CATALOG.map((p) => ({
    n: p.name,
    h: u(`/perfumes/${p.slug}/`),
    b: p.brand || "",
    p: p.price ?? null,
    i: (Array.isArray(p.images) && p.images[0] ? u(`/img/perfumes/${p.images[0].base}-320.webp`) : ""),
  }))
)}</script>
<script src="${u("/assets/app.js")}" defer></script>
</body>
</html>`;
}
