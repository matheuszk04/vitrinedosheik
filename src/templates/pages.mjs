import { u, abs, esc, money, picture, waHref, layout, card, accords, meters, timeline,
         list, isEnriched, inStock, term, WHATS_ICON } from "./base.mjs";

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
export function home(site, perfumes) {
  const { entrance, universe, closing } = site.home;
  // a home mostra só o que está pronto para ser lido por inteiro
  const featured = perfumes.filter(isEnriched).slice(0, 3);
  const stages = site.pyramidExplainer.stages;

  const body = `
  <section class="entrance">
    <img class="entrance-mark" src="${u('/img/logo/logo-192.webp')}" width="192" height="192" alt="" fetchpriority="high">
    <h1 class="display entrance-line">Algumas fragrâncias entram em uma sala.<br><em>Outras permanecem nela.</em></h1>
    <p class="entrance-support">${esc(entrance.support)}</p>
    <a class="btn btn--ghost entrance-cta" href="${u('/fragrancias/')}">${esc(entrance.cta)}</a>
    <span class="scroll-hint">Role</span>
  </section>

  <section class="section section--tight">
    <div class="wrap">
      <div class="paths reveal">
        <div class="paths-head">
          <span class="eyebrow">${esc(site.paths.eyebrow)}</span>
          <h2 class="display">${esc(site.paths.title)}</h2>
        </div>
        <div class="paths-grid">
          <a class="path" href="${u('/fragrancias/')}" data-track="path_chosen" data-track-path="explore">
            <span class="path-label">${esc(site.paths.explore.label)}</span>
            <p>${esc(site.paths.explore.body)}</p>
            <span class="path-cta">${esc(site.paths.explore.cta)} &rarr;</span>
          </a>
          <a class="path path--alt" href="${u('/descobrir/')}" data-track="path_chosen" data-track-path="discover">
            <span class="path-label">${esc(site.paths.discover.label)}</span>
            <p>${esc(site.paths.discover.body)}</p>
            <span class="path-cta">${esc(site.paths.discover.cta)} &rarr;</span>
          </a>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="editorial reveal">
        <span class="eyebrow">${esc(universe.eyebrow)}</span>
        <h2 class="display">${esc(universe.title)}</h2>
        ${universe.body.map((p) => `<p>${esc(p)}</p>`).join("")}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section-head reveal">
        <div>
          <span class="eyebrow">A curadoria</span>
          <h2 class="display">${featured.length} fragrâncias, explicadas por inteiro</h2>
        </div>
        <a class="btn btn--quiet" href="${u('/fragrancias/')}">Ver as ${perfumes.length}</a>
      </div>
      <div class="grid">${featured.map((p, i) => card(p, { eager: i === 0 })).join("")}</div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="editorial reveal">
        <span class="eyebrow">Mapa olfativo</span>
        <h2 class="display">Toda fragrância ocupa um lugar.</h2>
        <p>Entre o fresco e o intenso, entre o seco e o doce, cada perfume tem uma coordenada. Ver onde eles caem é a forma mais rápida de entender do que você gosta — e do que não gosta.</p>
        <a class="btn btn--ghost" href="${u('/mapa/')}">Abrir o mapa</a>
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
        ${stages.map((s, i) => `<article class="stage">
          <span class="stage-num">0${i + 1}</span>
          <div class="stage-when">${esc(s.time)}</div>
          <h3>${esc(s.label)}</h3>
          <p>${esc(s.body)}</p>
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

/* ------------------------------------------------------------- EXPLORADOR */
const FILTER_GROUPS = [
  { key: "gender", legend: "Gênero", from: (p) => (p.gender ? [p.gender] : []) },
  { key: "families", legend: "Família", from: (p) => list(p.families) },
  { key: "occasions", legend: "Ocasião", from: (p) => list(p.occasions) },
  { key: "personality", legend: "Perfil", from: (p) => list(p.personality) },
  { key: "climates", legend: "Clima", from: (p) => list(p.climates) },
];

export function explorer(site, perfumes) {
  const rows = FILTER_GROUPS.map((group) => {
    const values = [...new Set(perfumes.flatMap(group.from))].sort();
    if (values.length < 2) return "";
    return `<div class="filter-row">
      <span class="filter-legend">${esc(group.legend)}</span>
      <div class="filter-opts">
        <button class="filter-btn is-on" data-filter="${group.key}" data-value="">Todos</button>
        ${values.map((v) => `<button class="filter-btn" data-filter="${group.key}" data-value="${esc(v)}">${esc(v[0].toUpperCase() + v.slice(1))}</button>`).join("")}
      </div>
    </div>`;
  }).join("");

  const body = `
  <div class="wrap">
    <section class="section section--tight">
      <span class="eyebrow reveal">A vitrine</span>
      <h1 class="display reveal" style="font-size:clamp(32px,6vw,52px);margin:16px 0 18px">Fragrâncias</h1>
      <p class="lede reveal" style="max-width:52ch">Poucas, escolhidas uma a uma. Cada uma com o que ela é — e com o que ela não é.</p>

      <div class="filters reveal" role="group" aria-label="Filtrar fragrâncias">${rows}</div>

      <h2 class="sr-only">Resultados</h2>
      <div class="result-line">
        <span data-count>${perfumes.length} fragrâncias</span>
        <button class="filter-btn" data-clear hidden>Limpar filtros</button>
      </div>

      <div class="grid" data-grid>${perfumes.map((p, i) => card(p, { eager: i < 2 })).join("")}</div>

      <div class="no-result" data-empty hidden>
        <p>Nenhuma fragrância da curadoria atual combina com essa seleção.</p>
        ${btnWhats(waHref(site, "Olá! Procuro algo específico e não encontrei no site. Pode me ajudar?"), "Dizer o que procuro", "explorer_empty")}
      </div>
    </section>
  </div>`;

  return layout({
    site,
    path: "/fragrancias/",
    title: "Fragrâncias — Vitrine do Sheik",
    description: "A curadoria completa da Vitrine do Sheik, com perfil olfativo, ocasião e clima de cada fragrância.",
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

  const decision = `
    ${traits.length ? `<div class="personality">${traits.map((t) => `<span class="chip chip--solid">${esc(t)}</span>`).join("")}</div>` : ""}
    ${perfume.recommendedFor ? `<p class="quick-for"><b>Para quem é.</b> ${esc(perfume.recommendedFor)}</p>` : ""}
    ${quickFacts.length ? `<dl class="quick-facts">${quickFacts
      .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
      .join("")}</dl>` : ""}
    ${perfume.profile ? `<div class="block"><h2 class="block-title">Perfil ${term("projecao")}</h2>${meters(perfume.profile)}</div>` : ""}`;

  /* --------- caixa de conversão, agora acima da dobra longa */
  const convert = `<div class="convert">
    ${perfume.price != null
      ? `<div class="convert-price">${money(perfume.price)}<em>no pix</em></div>
         ${perfume.priceCard ? `<div class="convert-alt">ou ${money(perfume.priceCard)} no cartão</div>` : ""}`
      : `<div class="convert-price">Sob consulta</div>`}
    <div class="convert-meta">${[perfume.brand, perfume.volumeMl ? `${perfume.volumeMl} ml` : null, inStock(perfume) ? null : "Sob encomenda"]
      .filter(Boolean).map(esc).join(" · ")}</div>
    ${btnWhats(waHref(site, msg), enriched ? `Quero conhecer o ${perfume.name}` : `Perguntar sobre o ${perfume.name}`, "perfume_page", perfume.slug)}
    <p class="convert-note">${enriched
      ? "Atendimento individual com um consultor.<br>Sem carrinho, sem cadastro."
      : "Ainda não publicamos a ficha completa desta fragrância.<br>O consultor conta tudo sobre ela por mensagem."}</p>
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
    (perfume.recommendedFor || perfume.notFor) && `<div class="verdict">
      ${perfume.recommendedFor ? `<div class="verdict-box"><h3>Você vai gostar se</h3><p>${esc(perfume.recommendedFor)}</p></div>` : ""}
      ${perfume.notFor ? `<div class="verdict-box verdict-box--warn"><h3>Talvez não seja para você</h3><p>${esc(perfume.notFor)}</p></div>` : ""}
    </div>`,
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
        <p class="lede">${esc(d.intro.body)}</p>
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
    title: "Descobrir sua fragrância — Vitrine do Sheik",
    description: "Quatro perguntas, nenhuma técnica. No fim, indicamos por onde começar na perfumaria árabe.",
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
