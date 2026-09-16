import { u, abs, esc, money, picture, waHref, layout, card, rail, accords, meters, timeline,
         list, isEnriched, inStock, term, WHATS_ICON } from "./base.mjs";
import { activeSeason, resolveKit, kitCard, audienceLabel } from "./kits.mjs";

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Ocasião, momento e clima num conjunto só, sem repetir "Noite" duas vezes. */
function whenChips(perfume) {
  const seen = new Map();
  const add = (label) => {
    const key = label.toLowerCase();
    if (!seen.has(key)) seen.set(key, label);
  };
  list(perfume.occasions).forEach((o) => add(cap(o)));
  list(perfume.moments).forEach((m) => add(cap(m)));
  list(perfume.climates).forEach((c) => add(`Clima ${c}`));
  return [...seen.values()];
}

const btnWhats = (href, label, source, perfume = "") =>
  `<a class="btn btn--gold" href="${href}" target="_blank" rel="noopener"
      data-track="whatsapp_click" data-track-source="${source}"${perfume ? ` data-track-perfume="${esc(perfume)}"` : ""}>${WHATS_ICON}${esc(label)}</a>`;

/* ------------------------------------------------------------------ HOME */

/* Um perfume unissex pertence honestamente aos dois trilhos, mas entra depois
   dos que são daquele gênero. Foto na frente: é a foto que vende. */
function railItems(perfumes, gender, limit = 8) {
  const rank = (p) => (p.gender === gender ? 0 : 1) * 10 + (list(p.images).length ? 0 : 1);
  return perfumes
    .filter((p) => p.gender === gender || p.gender === "unissex")
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, limit);
}

/** Faixa da estação: só aparece dentro da janela de calendário dela. */
function seasonBand(season, kits) {
  if (!season) return "";
  return `<section class="season reveal">
    <div class="wrap">
      <span class="eyebrow">${esc(season.label)}</span>
      <h2 class="display season-title">${esc(season.title)}</h2>
      <p class="season-body">${esc(season.body)}</p>
      <a class="btn btn--ghost" href="${u("/presentes/")}"
         data-track="season_banner_clicked" data-track-season="${esc(season.id)}">Ver a seleção${kits.length ? ` de ${season.label}` : ""}</a>
    </div>
  </section>`;
}

export function home(site, perfumes, kitsFile) {
  const { entrance, universe, rails, closing } = site.home;
  const stages = site.pyramidExplainer.stages;

  const season = activeSeason(kitsFile.seasons);
  const allKits = kitsFile.kits.map((k) => resolveKit(k, perfumes));
  /* Na estação, os kits dela vêm primeiro — o resto da vitrine continua ali. */
  const seasonKits = season ? allKits.filter((k) => list(season.kits).includes(k.slug)) : [];
  const homeKits = [...seasonKits, ...allKits.filter((k) => !seasonKits.includes(k))].slice(0, 6);

  const body = `
  <section class="entrance">
    <img class="entrance-mark" src="${u('/img/logo/logo-192.webp')}" width="192" height="192" alt="" fetchpriority="high">
    <h1 class="display entrance-line">${esc(entrance.line)}</h1>
    <p class="entrance-support">${esc(entrance.support)}</p>
    <div class="entrance-actions">
      <a class="btn btn--gold" href="${u('/fragrancias/')}"
         data-track="path_chosen" data-track-path="explore">${esc(entrance.cta)}</a>
      <a class="btn btn--quiet" href="${u('/descobrir/')}"
         data-track="path_chosen" data-track-path="discover">${esc(entrance.ctaAlt)}</a>
    </div>
  </section>

  ${rail({
    id: "masculinos",
    eyebrow: rails.eyebrow,
    title: rails.masculinos.title,
    note: rails.masculinos.note,
    link: { href: u("/fragrancias/?g=masculino"), label: "Ver todos" },
    items: railItems(perfumes, "masculino").map((p, i) => card(p, { eager: i < 2 })),
  })}

  ${rail({
    id: "femininos",
    title: rails.femininos.title,
    note: rails.femininos.note,
    link: { href: u("/fragrancias/?g=feminino"), label: "Ver todos" },
    items: railItems(perfumes, "feminino").map((p) => card(p)),
  })}

  ${seasonBand(season, seasonKits)}

  ${rail({
    id: "presentes",
    title: rails.presentes.title,
    note: rails.presentes.note,
    link: { href: u("/presentes/"), label: "Presentear" },
    items: homeKits.map((k) => kitCard(k)),
  })}

  <section class="section">
    <div class="wrap">
      <div class="editorial reveal">
        <span class="eyebrow">${esc(universe.eyebrow)}</span>
        <h2 class="display">${esc(universe.title)}</h2>
        ${universe.body.map((t) => `<p>${esc(t)}</p>`).join("")}
        <a class="btn btn--quiet" href="${u('/fragrancias/')}">${esc(rails.all.replace("{n}", perfumes.length))}</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="editorial reveal">
        <span class="eyebrow">Como ler um perfume</span>
        <h2 class="display">${esc(site.pyramidExplainer.title)}</h2>
        <p>${esc(site.pyramidExplainer.body)}</p>
      </div>
      <div class="stages reveal">
        ${stages.map((st, i) => `<article class="stage">
          <span class="stage-num">0${i + 1}</span>
          <div class="stage-when">${esc(st.time)}</div>
          <h3>${esc(st.label)}</h3>
          <p>${esc(st.body)}</p>
        </article>`).join("")}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap wrap--narrow">
      <div class="consultant-card reveal">
        <span class="eyebrow eyebrow--bare">${esc(site.consultant.eyebrow)}</span>
        <h2>${esc(site.consultant.title)}</h2>
        <p>${esc(site.consultant.body)}</p>
        <a class="btn btn--quiet" href="${u('/consultor/')}">Saber mais</a>
      </div>
    </div>
  </section>

  <section class="closing">
    <div class="wrap">
      <span class="eyebrow eyebrow--center reveal">Próximo passo</span>
      <h2 class="display reveal">${esc(closing.line)}</h2>
      <p class="reveal">${esc(closing.support)}</p>
      <div class="reveal">${btnWhats(waHref(site, site.whatsapp.greeting), closing.cta, "home_closing")}</div>
    </div>
  </section>`;

  return layout({
    site,
    path: "/",
    title: "Vitrine do Sheik — Perfumaria Árabe",
    description: site.brand.description,
    body,
  });
}

/* ------------------------------------------------------------- EXPLORADOR
   Gênero e uso ficam à vista; o resto fica recolhido. Perfil, família e clima
   são as mesmas dimensões que o quiz pergunta — deixá-las abertas aqui fazia
   as duas páginas parecerem a mesma coisa. */
const PRIMARY_FILTERS = [
  { key: "gender", legend: "Para quem", from: (p) => (p.gender ? [p.gender] : []),
    labels: { masculino: "Masculinos", feminino: "Femininos", unissex: "Unissex" }, allLabel: "Todas" },
  { key: "occasions", legend: "Para quê", from: (p) => list(p.occasions), allLabel: "Tanto faz" },
];

const ADVANCED_FILTERS = [
  { key: "families", legend: "Família", from: (p) => list(p.families) },
  { key: "personality", legend: "Estilo", from: (p) => list(p.personality) },
  { key: "climates", legend: "Clima", from: (p) => list(p.climates) },
];

function filterRow(group, perfumes) {
  const values = [...new Set(perfumes.flatMap(group.from))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  if (values.length < 2) return "";
  const label = (v) => (group.labels && group.labels[v]) || v[0].toUpperCase() + v.slice(1);
  return `<div class="filter-row">
    <span class="filter-legend">${esc(group.legend)}</span>
    <div class="filter-opts">
      <button class="filter-btn is-on" data-filter="${group.key}" data-value="">${esc(group.allLabel || "Todos")}</button>
      ${values.map((v) => `<button class="filter-btn" data-filter="${group.key}" data-value="${esc(v)}">${esc(label(v))}</button>`).join("")}
    </div>
  </div>`;
}

export function explorer(site, perfumes) {
  const primary = PRIMARY_FILTERS.map((g) => filterRow(g, perfumes)).join("");
  const advanced = ADVANCED_FILTERS.map((g) => filterRow(g, perfumes)).join("");
  const semFoto = perfumes.filter((p) => !list(p.images).length).length;

  const body = `
  <div class="wrap">
    <section class="section section--tight">
      <span class="eyebrow reveal">${esc(site.home.collection.eyebrow)}</span>
      <h1 class="display reveal" style="font-size:clamp(32px,6vw,52px);margin:16px 0 0">Fragrâncias</h1>

      <div class="filters reveal" role="group" aria-label="Filtrar fragrâncias">
        ${primary}
        ${advanced ? `<details class="filters-more">
          <summary>Mais filtros</summary>
          ${advanced}
        </details>` : ""}
      </div>

      <h2 class="sr-only">Resultados</h2>
      <div class="result-line">
        <span data-count>${perfumes.length} fragrâncias</span>
        <button class="filter-btn" data-clear hidden>Limpar filtros</button>
      </div>

      <div class="grid" data-grid>${perfumes.map((p, i) => card(p, { eager: i < 2 })).join("")}</div>

      <div class="no-result" data-empty hidden>
        <p>Nenhuma fragrância da coleção atual combina com essa seleção.</p>
        ${btnWhats(waHref(site, "Olá! Procuro uma fragrância específica e não encontrei no site. Pode me ajudar?"), "Dizer o que procuro", "explorer_empty")}
      </div>

      <div class="quiet-help reveal">
        <p>Não sabe qual escolher? <a href="${u('/descobrir/')}" data-track="path_chosen" data-track-path="discover_from_collection">Responda quatro perguntas</a> e indicamos por onde começar.</p>
        <p>É para presentear? <a href="${u('/presentes/')}" data-track="path_chosen" data-track-path="gifts_from_collection">Veja os kits</a> ou monte um com as fragrâncias que quiser.</p>
        <p class="muted">Prefere explorar pelo cheiro? <a href="${u('/mapa/')}">Veja o mapa olfativo</a>.</p>
        ${semFoto ? `<p class="muted">${semFoto} fragrâncias ainda estão sem foto no site. O consultor manda fotos reais por mensagem.</p>` : ""}
      </div>
    </section>
  </div>`;

  return layout({
    site,
    path: "/fragrancias/",
    title: "Fragrâncias — Vitrine do Sheik",
    description: "A coleção completa da Vitrine do Sheik: perfumaria árabe masculina, feminina e unissex, com preço e atendimento por WhatsApp.",
    body,
  });
}

/* -------------------------------------------------------------- FRAGRÂNCIA */
export function perfumePage(site, perfume, all) {
  const enriched = isEnriched(perfume);
  const msg = enriched
    ? `Olá! Estava conhecendo o ${perfume.name} no site e gostaria de saber mais sobre ele.`
    : `Olá! Vi o ${perfume.name} no site e gostaria de saber mais sobre essa fragrância.`;

  const images = list(perfume.images);
  const main = images[0];
  const families = list(perfume.families);
  const traits = list(perfume.personality);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: perfume.brand ? `${perfume.name} — ${perfume.brand}` : perfume.name,
    ...(perfume.brand ? { brand: { "@type": "Brand", name: perfume.brand } } : {}),
    ...(perfume.story ? { description: perfume.story } : {}),
    ...(main ? { image: abs(site, `/img/perfumes/${main.base}-960.jpg`) } : {}),
    ...(perfume.price != null
      ? {
          offers: {
            "@type": "Offer",
            price: perfume.price.toFixed(2),
            priceCurrency: "BRL",
            availability: inStock(perfume)
              ? "https://schema.org/InStock"
              : "https://schema.org/BackOrder",
          },
        }
      : {}),
  };

  /* --------- galeria (ou moldura vazia, nunca a foto de outro perfume) */
  const gallery = main
    ? `<div class="gallery-main" data-gallery-main>
        ${picture({ dir: "/img/perfumes", base: main.base, alt: main.alt, sizes: "(min-width:900px) 480px, 94vw", eager: true })}
      </div>
      ${images.length > 1 ? `<div class="gallery-thumbs" role="group" aria-label="Fotos">
        ${images.map((img, i) => `<button class="gallery-thumb${i === 0 ? " is-active" : ""}" data-thumb="${i}" aria-label="Foto ${i + 1}">
          <img src="${u(`/img/perfumes/${img.base}-320.webp`)}" alt="" width="320" height="427" loading="lazy" decoding="async">
        </button>`).join("")}
      </div>` : ""}`
    : `<div class="gallery-main gallery-main--empty"><span class="mark">${esc(perfume.name.trim()[0] || "·")}</span></div>`;

  /* --------- decisão rápida: o que o cliente precisa em 10 segundos */
  const quickFacts = [
    families.length && ["Família", families.join(" · ")],
    list(perfume.occasions).length && ["Ocasião", list(perfume.occasions).join(" · ")],
    perfume.volumeMl && ["Volume", `${perfume.volumeMl} ml`],
    perfume.concentration && ["Concentração", perfume.concentration],
  ].filter(Boolean);

  const verdict = (perfume.recommendedFor || perfume.notFor) ? `<div class="verdict">
      ${perfume.recommendedFor ? `<div class="verdict-box"><h3>Você provavelmente vai gostar se</h3><p>${esc(perfume.recommendedFor)}</p></div>` : ""}
      ${perfume.notFor ? `<div class="verdict-box verdict-box--warn"><h3>Pode não ser para você se</h3><p>${esc(perfume.notFor)}</p></div>` : ""}
    </div>` : "";

  const decision = `
    ${traits.length ? `<div class="personality">${traits.map((t) => `<span class="chip chip--solid">${esc(t)}</span>`).join("")}</div>` : ""}
    ${quickFacts.length ? `<dl class="quick-facts">${quickFacts
      .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
      .join("")}</dl>` : ""}
    ${perfume.profile ? `<div class="block"><h2 class="block-title">Perfil ${term("projecao")}</h2>${meters(perfume.profile)}</div>` : ""}
    ${verdict}`;

  /* --------- caixa de conversão, agora acima da dobra longa */
  const convert = `<div class="convert">
    ${perfume.price != null
      ? `<div class="convert-price">${money(perfume.price)}<em>no Pix</em></div>
         ${perfume.priceCard ? `<div class="convert-alt">ou ${money(perfume.priceCard)} no cartão</div>` : ""}`
      : `<div class="convert-price">Sob consulta</div>`}
    <div class="convert-meta">${[perfume.brand, perfume.volumeMl ? `${perfume.volumeMl} ml` : null, inStock(perfume) ? null : "Sob encomenda"]
      .filter(Boolean).map(esc).join(" · ")}</div>
    ${btnWhats(waHref(site, msg), enriched ? `Quero conhecer o ${perfume.name}` : `Perguntar sobre o ${perfume.name}`, "perfume_page", perfume.slug)}
    <p class="convert-note">${enriched
      ? "Atendimento individual com um consultor.<br>Sem carrinho, sem cadastro."
      : "Ainda não publicamos a ficha completa desta fragrância.<br>O consultor conta tudo sobre ela por mensagem."}</p>
    <a class="convert-aside" href="${u(`/presentes/?add=${perfume.slug}#montar`)}"
       data-track="kit_from_perfume_clicked" data-track-perfume="${perfume.slug}">Montar um kit com esta fragrância</a>
  </div>`;

  /* --------- camadas para quem quer profundidade */
  const experience = [
    perfume.atmosphere && `<div class="block"><h2 class="block-title">Atmosfera</h2><p class="atmosphere">${esc(perfume.atmosphere)}</p></div>`,
    perfume.story && `<div class="block"><h2 class="block-title">A experiência</h2><p class="lede">${esc(perfume.story)}</p></div>`,
    perfume.notes && perfume.perception &&
      `<div class="block"><h2 class="block-title">Como ele evolui ${term("piramide")}</h2>${timeline(perfume, site.pyramidExplainer.stages)}</div>`,
    list(perfume.accords).length &&
      `<div class="block"><h2 class="block-title">Composição ${term("familia")}</h2>${accords(perfume.accords)}</div>`,
    whenChips(perfume).length &&
      `<div class="block"><h2 class="block-title">Quando usar</h2><div class="personality">${whenChips(perfume)
        .map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div></div>`,
    `<div class="block"><h2 class="block-title">Como usar</h2><ul class="usage">${site.usageDefaults
      .map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`,
  ].filter(Boolean).join("");

  const related = relatedTo(perfume, all);

  const body = `
  <div class="wrap">
    <a class="back" href="${u('/fragrancias/')}">&larr; Todas as fragrâncias</a>

    <article class="fragrance">
      <div class="fragrance-gallery">${gallery}</div>

      <div class="fragrance-info">
        ${families.length ? `<span class="eyebrow">${esc(families.join(" · "))}</span>` : ""}
        <h1 class="display fragrance-name">${esc(perfume.name)}</h1>
        ${perfume.brand ? `<div class="fragrance-brand">${esc(perfume.brand)}</div>` : ""}
        ${perfume.tagline ? `<p class="fragrance-tagline">${esc(perfume.tagline)}</p>` : ""}
        ${decision}
        ${convert}
        ${experience}
      </div>
    </article>
  </div>

  ${related.length ? `<section class="section">
    <div class="wrap">
      <div class="section-head reveal">
        <div><span class="eyebrow">Se você gostou deste</span><h2 class="display">Fragrâncias próximas</h2></div>
      </div>
      <div class="grid">${related.map((p) => card(p)).join("")}</div>
    </div>
  </section>` : ""}

  <div class="sticky-cta" data-sticky hidden>
    <span class="sticky-name">${esc(perfume.name)}${perfume.price != null ? ` · ${money(perfume.price)}` : ""}</span>
    <a class="btn btn--gold" href="${waHref(site, msg)}" target="_blank" rel="noopener"
       data-track="whatsapp_clicked_from_product" data-track-perfume="${perfume.slug}" data-track-source="sticky">Conhecer</a>
  </div>

  <section class="closing">
    <div class="wrap">
      <span class="eyebrow eyebrow--center reveal">Ainda em dúvida?</span>
      <h2 class="display reveal">Comparar duas fragrâncias leva cinco minutos.</h2>
      <p class="reveal">Nosso consultor conhece cada uma delas na pele — e diz com franqueza qual combina mais com você.</p>
      <div class="reveal">${btnWhats(waHref(site, msg), "Falar com um consultor", "perfume_closing", perfume.slug)}</div>
    </div>
  </section>`;

  return layout({
    site,
    path: `/perfumes/${perfume.slug}/`,
    title: `${perfume.name}${perfume.brand ? ` — ${perfume.brand}` : ""} | Vitrine do Sheik`,
    description: perfume.tagline
      ? `${perfume.tagline} ${perfume.story || ""}`.trim().slice(0, 155)
      : `${perfume.name} na Vitrine do Sheik. Atendimento individual com um consultor de perfumaria árabe.`,
    // sem foto própria, o preview usa a marca — nunca a foto de outro perfume
    ogImage: main ? `/img/perfumes/${main.base}-960.jpg` : "/img/logo/logo-384.jpg",
    jsonLd,
    body,
  });
}

/** Relacionados por afinidade real: família, depois ocasião, depois gênero. */
function relatedTo(perfume, all) {
  const fams = new Set(list(perfume.families));
  const occs = new Set(list(perfume.occasions));

  const scored = all
    .filter((p) => p.slug !== perfume.slug)
    .map((p) => {
      let score = 0;
      list(p.families).forEach((f) => { if (fams.has(f)) score += 3; });
      list(p.occasions).forEach((o) => { if (occs.has(o)) score += 2; });
      if (p.gender && p.gender === perfume.gender) score += 1;
      if (isEnriched(p)) score += 1;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((x) => x.p);
}

/* ------------------------------------------------------------ MAPA OLFATIVO */
export function mapPage(site, allPerfumes) {
  const { axes, regions } = site.olfactiveMap;
  // só entra no mapa quem já tem coordenada olfativa real
  const perfumes = allPerfumes.filter((p) => p.map);

  // projeta 0..1 numa faixa interna, para que rótulo nenhum encoste na borda
  const px = (v) => (8 + v * 84).toFixed(1) + "%";
  const py = (v) => (8 + (1 - v) * 84).toFixed(1) + "%";

  const dots = perfumes
    .map((p) => `<button class="map-dot" data-map-perfume="${p.slug}"
        style="left:${px(p.map.x)};top:${py(p.map.y)}"
        aria-label="${esc(p.name)}"><span>${esc(p.name)}</span></button>`)
    .join("");

  const regionEls = regions
    .map((r) => `<button class="map-region" data-map-region="${r.id}"
        style="left:${px(r.x)};top:${py(r.y)}">${esc(r.label)}</button>`)
    .join("");

  const payload = {
    regions: Object.fromEntries(regions.map((r) => [r.id, { label: r.label, note: r.note }])),
    perfumes: Object.fromEntries(
      perfumes.map((p) => [p.slug, {
        name: p.name,
        brand: p.brand,
        tagline: p.tagline,
        families: p.families.join(" · "),
        href: u(`/perfumes/${p.slug}/`),
      }])
    ),
  };

  const body = `
  <div class="wrap">
    <section class="section section--tight">
      <span class="eyebrow reveal">Experiência</span>
      <h1 class="display reveal" style="font-size:clamp(32px,6vw,52px);margin:16px 0 18px">Mapa olfativo</h1>
      <p class="lede reveal" style="max-width:56ch">Dois eixos bastam para situar quase qualquer fragrância. Toque em uma região para entender o território, ou em uma fragrância para ver onde ela cai.</p>

      <div class="map-layout" style="margin-top:44px">
        <div class="map-wrap reveal">
          <span class="map-axis map-axis--l">${esc(axes.x.min)}</span>
          <span class="map-axis map-axis--r">${esc(axes.x.max)}</span>
          <span class="map-axis map-axis--t">${esc(axes.y.max)}</span>
          <span class="map-axis map-axis--b">${esc(axes.y.min)}</span>
          <div class="map" data-map>
            <span class="map-grid" aria-hidden="true"></span>
            ${regionEls}
            ${dots}
          </div>
        </div>
        <p class="map-hint">${perfumes.length} fragrâncias posicionadas — toque em um ponto para ver qual é.</p>

        <aside class="map-readout reveal" data-map-readout>
          <span class="eyebrow eyebrow--bare">Selecione no mapa</span>
          <h2 class="display">O território</h2>
          <p>Da esquerda para a direita, a fragrância ganha força. De baixo para cima, ela fica mais doce. Onde essas duas coisas se cruzam está o seu gosto.</p>
        </aside>
      </div>
    </section>
  </div>

  <script type="application/json" data-map-data>${JSON.stringify(payload)}</script>`;

  return layout({
    site,
    path: "/mapa/",
    title: "Mapa olfativo — Vitrine do Sheik",
    description: "Situe cada fragrância entre o fresco e o intenso, o seco e o doce. Uma forma visual de entender do que você gosta.",
    body,
  });
}


/* ------------------------------------------------------------- DESCOBRIR */
export function discoveryPage(site, perfumes) {
  const d = site.discovery;
  // só entra na recomendação quem tem com o que ser comparado
  const pool = perfumes.filter(isEnriched);

  const payload = {
    questions: d.questions,
    unsure: d.unsure,
    perfumes: pool.map((p) => ({
      slug: p.slug,
      name: p.name,
      brand: p.brand || "",
      tagline: p.tagline || "",
      href: u(`/perfumes/${p.slug}/`),
      image: list(p.images)[0] ? u(`/img/perfumes/${list(p.images)[0].base}-480.webp`) : "",
      price: p.price ?? null,
      families: list(p.families),
      personality: list(p.personality),
      occasions: list(p.occasions),
      moments: list(p.moments),
      projection: (p.profile || {}).projection || null,
    })),
  };

  const steps = d.questions
    .map((q, i) => `<section class="step" data-step="q" data-index="${i}" role="group" aria-labelledby="q${i}-t" hidden>
      <div class="step-count">Pergunta ${i + 1} de ${d.questions.length}</div>
      <h2 class="step-title display" id="q${i}-t">${esc(q.title)}</h2>
      <p class="step-help">${esc(q.help)}</p>
      <div class="step-options">
        ${q.options.map((o, j) => `<button type="button" class="opt" data-q="${i}" data-o="${j}">${esc(o.label)}</button>`).join("")}
        <button type="button" class="opt opt--unsure" data-q="${i}" data-o="-1">${esc(d.unsure)}</button>
      </div>
      <button type="button" class="step-back" data-back hidden>&larr; Voltar</button>
    </section>`)
    .join("");

  const body = `
  <div class="wrap wrap--narrow">
    <section class="section" data-discovery data-wa="${waHref(site, "__MSG__")}">
      <div class="step" data-step="intro">
        <span class="eyebrow">${esc(d.intro.eyebrow)}</span>
        <h1 class="display step-title step-title--intro">${esc(d.intro.title)}</h1>
        <p class="step-help">${esc(d.intro.body)}</p>
        <div class="step-actions">
          <button type="button" class="btn btn--gold" data-start>${esc(d.intro.cta)}</button>
          <a class="btn btn--quiet" href="${u('/fragrancias/')}">${esc(d.intro.skip)}</a>
        </div>
      </div>

      <div class="progress" data-progress hidden><span></span></div>
      ${steps}

      <div class="step" data-step="result" hidden>
        <div data-result></div>
        <button type="button" class="btn btn--quiet" data-restart>${esc(d.result.restart)}</button>
      </div>
    </section>
  </div>

  <script type="application/json" data-discovery-data>${JSON.stringify(payload)}</script>
  <script type="application/json" data-discovery-copy>${JSON.stringify(d.result)}</script>`;

  return layout({
    site,
    path: "/descobrir/",
    title: "Qual é a sua assinatura? — Vitrine do Sheik",
    description: "Quatro perguntas sobre você, nenhuma sobre perfume. No fim, dizemos qual é a sua assinatura olfativa e por onde começar.",
    body,
  });
}

/* ------------------------------------------------------------- PRESENTEAR
   Kits prontos e "monte o seu" na mesma página. Separar as duas coisas
   repetiria o erro de Fragrâncias vs Descobrir: presentear é a intenção,
   o kit é só o formato. */

/** Lista de seleção — de propósito uma lista, não cards: os cards editoriais
    são da vitrine, e o montador precisa ser rápido de ler e de tocar. */
function picker(perfumes) {
  const rows = perfumes
    .map((p) => {
      const img = list(p.images)[0];
      const frame = img
        ? `<img src="${u(`/img/perfumes/${img.base}-320.webp`)}" alt="" width="320" height="427" loading="lazy" decoding="async">`
        : `<span class="pick-mark-letter">${esc(p.name.trim()[0] || "·")}</span>`;
      return `<li><button type="button" class="pick" aria-pressed="false"
          data-pick="${esc(p.slug)}" data-pick-name="${esc(p.name)}">
        <span class="pick-frame">${frame}</span>
        <span class="pick-body">
          <strong>${esc(p.name)}</strong>
          ${p.brand ? `<em>${esc(p.brand)}</em>` : ""}
        </span>
        ${p.price != null ? `<span class="pick-price">${money(p.price)}</span>` : `<span class="pick-price muted">Sob consulta</span>`}
        <span class="pick-tick" aria-hidden="true"></span>
      </button></li>`;
    })
    .join("");
  return `<ul class="picker">${rows}</ul>`;
}

export function giftsPage(site, perfumes, kitsFile) {
  const { page, builder } = kitsFile;
  const season = activeSeason(kitsFile.seasons);
  const all = kitsFile.kits.map((k) => resolveKit(k, perfumes));
  const seasonKits = season ? all.filter((k) => list(season.kits).includes(k.slug)) : [];
  const rest = all.filter((k) => !seasonKits.includes(k));

  const body = `
  <div class="wrap">
    <section class="section section--tight">
      <span class="eyebrow reveal">${esc(page.eyebrow)}</span>
      <h1 class="display reveal gifts-title">${esc(page.title)}</h1>
      <p class="lede reveal gifts-lede">${esc(page.body)}</p>
    </section>
  </div>

  ${season ? `<section class="season season--page reveal">
    <div class="wrap">
      <span class="eyebrow">${esc(season.label)}</span>
      <h2 class="display season-title">${esc(season.title)}</h2>
      <p class="season-body">${esc(season.body)}</p>
      ${seasonKits.length ? `<div class="kit-grid">${seasonKits.map((k) => kitCard(k)).join("")}</div>` : ""}
    </div>
  </section>` : ""}

  <div class="wrap">
    <section class="section">
      <div class="section-head reveal">
        <div>
          <span class="eyebrow">${esc(season ? "Fora da estação" : "A seleção")}</span>
          <h2 class="display">${esc(season ? "O resto dos kits" : page.kitsTitle)}</h2>
          <p class="rail-note">${esc(page.kitsBody)}</p>
        </div>
      </div>
      <div class="kit-grid">${(season ? rest : all).map((k) => kitCard(k)).join("")}</div>
    </section>

    <section class="section" id="montar" data-builder
             data-wa="${waHref(site, "__MSG__")}"
             data-template="${esc(builder.message)}">
      <div class="section-head reveal">
        <div>
          <span class="eyebrow">${esc(builder.eyebrow)}</span>
          <h2 class="display">${esc(builder.title)}</h2>
          <p class="rail-note">${esc(builder.body)}</p>
        </div>
      </div>
      ${picker(perfumes)}
      <p class="builder-note">${esc(builder.note)}</p>
      <noscript><p class="builder-note">A seleção precisa de JavaScript. Sem ele, ${btnWhats(waHref(site, "Olá! Quero montar um kit de perfumes."), "fale direto no WhatsApp", "gifts_noscript")} que o consultor monta com você.</p></noscript>

      <div class="quiet-help reveal">
        <p>${esc(page.help)}</p>
      </div>
    </section>
  </div>

  <div class="kitbar" data-kitbar hidden>
    <span class="kitbar-count" data-kitbar-count>1 fragrância</span>
    <button type="button" class="kitbar-clear" data-kitbar-clear>Limpar</button>
    <a class="btn btn--gold" data-kitbar-go href="#" target="_blank" rel="noopener"
       data-track="whatsapp_clicked_from_kit" data-track-source="builder">${WHATS_ICON}${esc(builder.cta)}</a>
  </div>`;

  return layout({
    site,
    path: "/presentes/",
    title: "Presentear — kits de perfumaria árabe | Vitrine do Sheik",
    description: "Kits prontos de perfumaria árabe ou montados por você. O consultor fecha o valor do conjunto por WhatsApp.",
    body,
  });
}

export function kitPage(site, kit, perfumes, kitsFile) {
  const names = kit.items.map((p) => p.name);
  const msg = `Olá! Me interessei pelo kit ${kit.name}${names.length ? ` (${names.join(" + ")})` : ""}. Gostaria de saber mais.`;
  const others = kitsFile.kits
    .filter((k) => k.slug !== kit.slug)
    .map((k) => resolveKit(k, perfumes))
    .slice(0, 3);

  const body = `
  <div class="wrap">
    <a class="back" href="${u('/presentes/')}">&larr; Todos os presentes</a>

    <article class="section section--tight">
      <span class="eyebrow reveal">${esc(audienceLabel(kit.audience))} · ${kit.items.length} fragrâncias</span>
      <h1 class="display gifts-title reveal">${esc(kit.name)}</h1>
      <p class="lede gifts-lede reveal">${esc(kit.concept)}</p>

      <h2 class="block-title kit-pieces-title">O que vem no kit</h2>
      <div class="kit-pieces">${kit.items.map((p) => card(p, { eager: true })).join("")}</div>

      <div class="kit-detail">
        <p>${esc(kit.body)}</p>
      </div>

      <div class="convert reveal">
        ${kit.total != null
          ? `<div class="convert-price">${money(kit.total)}<em>${esc(kit.isSum ? kitsFile.priceNote : "no Pix")}</em></div>`
          : `<div class="convert-price">Sob consulta</div>`}
        <div class="convert-meta">${esc(names.join(" · "))}</div>
        ${btnWhats(waHref(site, msg), `Quero o kit ${kit.name}`, "kit_page", kit.slug)}
        <p class="convert-note">${esc(kitsFile.priceHelp)}</p>
      </div>

      <div class="quiet-help reveal">
        <p>Prefere trocar uma das fragrâncias? <a href="${u('/presentes/#montar')}">Monte o kit do seu jeito</a> — o consultor fecha o valor depois.</p>
      </div>
    </article>
  </div>

  ${others.length ? `<section class="section">
    <div class="wrap">
      <div class="section-head reveal"><div><span class="eyebrow">Outros presentes</span><h2 class="display">Mais combinações</h2></div></div>
      <div class="kit-grid">${others.map((k) => kitCard(k)).join("")}</div>
    </div>
  </section>` : ""}

  <div class="sticky-cta" data-sticky hidden>
    <span class="sticky-name">${esc(kit.name)}${kit.total != null ? ` · ${money(kit.total)}` : ""}</span>
    <a class="btn btn--gold" href="${waHref(site, msg)}" target="_blank" rel="noopener"
       data-track="whatsapp_clicked_from_kit" data-track-kit="${esc(kit.slug)}" data-track-source="sticky">Quero</a>
  </div>`;

  return layout({
    site,
    path: `/presentes/${kit.slug}/`,
    title: `Kit ${kit.name} | Vitrine do Sheik`,
    description: `${kit.concept} ${names.join(" e ")}.`.slice(0, 155),
    ogImage: (() => {
      const withPhoto = kit.items.find((p) => list(p.images).length);
      return withPhoto ? `/img/perfumes/${list(withPhoto.images)[0].base}-960.jpg` : "/img/logo/logo-384.jpg";
    })(),
    body,
  });
}

/* ----------------------------------------------------------------- CONSULTOR */
export function consultantPage(site) {
  const c = site.consultant;
  const body = `
  <div class="wrap wrap--narrow">
    <section class="section">
      <div class="consultant-card reveal">
        <span class="eyebrow eyebrow--bare">${esc(c.eyebrow)}</span>
        <h1>${esc(c.title)}</h1>
        <p>${esc(c.body)}</p>
        <p class="muted" style="font-size:13.5px">${esc(c.note)}</p>
        <div style="margin-top:28px">
          ${btnWhats(waHref(site, "Olá! Queria ajuda para escolher uma fragrância. Pode me orientar?"), c.cta, "consultant_page")}
        </div>
      </div>

      <div class="editorial reveal" style="margin-top:60px">
        <span class="eyebrow">Enquanto isso</span>
        <h2 class="display">Três perguntas que já resolvem quase tudo</h2>
        <p>Para que ocasião você quer a fragrância? Em que clima vai usar? E como quer ser percebido quando entrar no ambiente?</p>
        <p>Com essas três respostas, um consultor acerta a indicação na primeira tentativa. É exatamente isso que o consultor olfativo vai automatizar.</p>
        <a class="btn btn--quiet" href="${u('/fragrancias/')}">Ver a curadoria</a>
      </div>
    </section>
  </div>`;

  return layout({
    site,
    path: "/consultor/",
    title: "Consultor Olfativo — Vitrine do Sheik",
    description: "Em breve, uma forma de descobrir sua fragrância a partir de como você quer ser percebido.",
    body,
  });
}
