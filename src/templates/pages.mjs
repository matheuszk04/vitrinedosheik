import { u, esc, money, picture, waHref, layout, card, accords, meters, timeline, WHATS_ICON } from "./base.mjs";

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Ocasião, momento e clima num conjunto só, sem repetir "Noite" duas vezes. */
function whenChips(perfume) {
  const seen = new Map();
  const add = (label) => {
    const key = label.toLowerCase();
    if (!seen.has(key)) seen.set(key, label);
  };
  perfume.occasions.forEach((o) => add(cap(o)));
  perfume.moments.forEach((m) => add(cap(m)));
  perfume.climates.forEach((c) => add(`Clima ${c}`));
  return [...seen.values()];
}

const btnWhats = (href, label, source) =>
  `<a class="btn btn--gold" href="${href}" target="_blank" rel="noopener"
      data-track="whatsapp_click" data-track-source="${source}">${WHATS_ICON}${esc(label)}</a>`;

/* ------------------------------------------------------------------ HOME */
export function home(site, perfumes) {
  const { entrance, universe, closing } = site.home;
  const stages = site.pyramidExplainer.stages;

  const body = `
  <section class="entrance">
    <img class="entrance-mark" src="${u('/img/logo/logo-192.webp')}" width="192" height="192" alt="" fetchpriority="high">
    <h1 class="display entrance-line">Algumas fragrâncias entram em uma sala.<br><em>Outras permanecem nela.</em></h1>
    <p class="entrance-support">${esc(entrance.support)}</p>
    <a class="btn btn--ghost entrance-cta" href="${u('/fragrancias/')}">${esc(entrance.cta)}</a>
    <span class="scroll-hint">Role</span>
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
          <h2 class="display">${perfumes.length} fragrâncias, explicadas por inteiro</h2>
        </div>
        <a class="btn btn--quiet" href="${u('/fragrancias/')}">Ver todas</a>
      </div>
      <div class="grid">${perfumes.map((p, i) => card(p, { eager: i === 0 })).join("")}</div>
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
  { key: "gender", legend: "Gênero", from: (p) => [p.gender] },
  { key: "families", legend: "Família", from: (p) => p.families },
  { key: "occasions", legend: "Ocasião", from: (p) => p.occasions },
  { key: "personality", legend: "Perfil", from: (p) => p.personality },
  { key: "climates", legend: "Clima", from: (p) => p.climates },
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
  const msg = `Olá! Vi o ${perfume.name} no site da Vitrine do Sheik e queria conhecer melhor.`;
  const [main, ...rest] = perfume.images;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${perfume.name} — ${perfume.brand}`,
    brand: { "@type": "Brand", name: perfume.brand },
    description: perfume.story,
    image: site.url ? `${site.url.replace(/\/$/, "")}/img/perfumes/${main.base}-960.jpg` : `/img/perfumes/${main.base}-960.jpg`,
    offers: {
      "@type": "Offer",
      price: perfume.price.toFixed(2),
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    },
  };

  const body = `
  <div class="wrap">
    <a class="back" href="${u('/fragrancias/')}">&larr; Todas as fragrâncias</a>

    <article class="fragrance">
      <div class="fragrance-gallery">
        <div class="gallery-main" data-gallery-main>
          ${picture({ dir: "/img/perfumes", base: main.base, alt: main.alt, sizes: "(min-width:900px) 480px, 94vw", eager: true })}
        </div>
        ${rest.length ? `<div class="gallery-thumbs" role="group" aria-label="Fotos">
          ${perfume.images.map((img, i) => `<button class="gallery-thumb${i === 0 ? " is-active" : ""}" data-thumb="${i}" aria-label="Foto ${i + 1}">
            <img src="${u(`/img/perfumes/${img.base}-320.webp`)}" alt="" width="320" height="427" loading="lazy" decoding="async">
          </button>`).join("")}
        </div>` : ""}
      </div>

      <div class="fragrance-info">
        <span class="eyebrow">${esc(perfume.families.join(" · "))}</span>
        <h1 class="display fragrance-name">${esc(perfume.name)}</h1>
        <div class="fragrance-brand">${esc(perfume.brand)}</div>
        <p class="fragrance-tagline">${esc(perfume.tagline)}</p>

        <div class="personality">
          ${perfume.personality.map((t) => `<span class="chip chip--solid">${esc(t)}</span>`).join("")}
        </div>

        <div class="block">
          <h2 class="block-title">Perfil</h2>
          ${meters(perfume.profile)}
        </div>

        <div class="block">
          <h2 class="block-title">Composição</h2>
          ${accords(perfume.accords)}
        </div>

        <div class="block">
          <h2 class="block-title">Atmosfera</h2>
          <p class="atmosphere">${esc(perfume.atmosphere)}</p>
        </div>

        <div class="block">
          <h2 class="block-title">A experiência</h2>
          <p class="lede">${esc(perfume.story)}</p>
        </div>

        <div class="block">
          <h2 class="block-title">Como ele evolui</h2>
          ${timeline(perfume, site.pyramidExplainer.stages)}
        </div>

        <div class="block">
          <h2 class="block-title">Quando usar</h2>
          <div class="personality">
            ${whenChips(perfume).map((t) => `<span class="chip">${esc(t)}</span>`).join("")}
          </div>
        </div>

        <div class="block">
          <h2 class="block-title">Como usar</h2>
          <ul class="usage">${site.usageDefaults.map((u) => `<li>${esc(u)}</li>`).join("")}</ul>
        </div>

        <div class="verdict">
          <div class="verdict-box">
            <h3>Para quem é</h3>
            <p>${esc(perfume.recommendedFor)}</p>
          </div>
          <div class="verdict-box verdict-box--warn">
            <h3>Não é para você se</h3>
            <p>${esc(perfume.notFor)}</p>
          </div>
        </div>

        <div class="convert">
          <div class="convert-price">${money(perfume.price)}</div>
          <div class="convert-meta">${perfume.volumeMl ? `${perfume.volumeMl} ml · ` : ""}${esc(perfume.brand)}</div>
          ${btnWhats(waHref(site, msg), `Quero conhecer o ${perfume.name}`, "perfume_page")}
          <p class="convert-note">Atendimento individual com um consultor.<br>Sem carrinho, sem cadastro.</p>
        </div>
      </div>
    </article>
  </div>

  ${all.length > 1 ? `<section class="section">
    <div class="wrap">
      <div class="section-head reveal">
        <div><span class="eyebrow">Continue</span><h2 class="display">Outras fragrâncias</h2></div>
      </div>
      <div class="grid">${all.filter((p) => p.slug !== perfume.slug).map((p) => card(p)).join("")}</div>
    </div>
  </section>` : ""}`;

  return layout({
    site,
    path: `/perfumes/${perfume.slug}/`,
    title: `${perfume.name} — ${perfume.brand} | Vitrine do Sheik`,
    description: `${perfume.tagline} ${perfume.story}`.slice(0, 155),
    ogImage: `/img/perfumes/${main.base}-960.jpg`,
    jsonLd,
    body,
  });
}

/* ------------------------------------------------------------ MAPA OLFATIVO */
export function mapPage(site, perfumes) {
  const { axes, regions } = site.olfactiveMap;

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
