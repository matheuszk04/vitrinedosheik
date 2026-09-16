/* Runtime da Vitrine do Sheik — sem dependências, sem framework.
   Tudo aqui é progressivo: se o JS falhar, o conteúdo continua legível. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* mesmo formato do build: R$ 209,90 e nunca R$ 209,9 */
  var brl = function (v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };
  var PAGE = document.body.dataset.page || "other";

  /* ==================================================== ANALYTICS + CAMPANHA
     Camada neutra: empurra para o dataLayer se existir, senão não faz nada.
     Plugar GA4, GTM ou Meta depois não exige tocar em nenhum template. */

  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];

  /* A campanha é capturada na chegada e mantida pela sessão inteira, para
     que o clique no WhatsApp lá no fim ainda saiba de qual anúncio veio. */
  function readCampaign() {
    var stored = {};
    try {
      stored = JSON.parse(sessionStorage.getItem("vds_campaign") || "{}");
    } catch (e) { /* sessão bloqueada: seguimos sem campanha */ }

    var params = new URLSearchParams(location.search);
    var fresh = {};
    UTM_KEYS.forEach(function (k) {
      var v = params.get(k);
      if (v) fresh[k] = v;
    });
    if (Object.keys(fresh).length) {
      stored = Object.assign(stored, fresh, { landing: location.pathname });
      try { sessionStorage.setItem("vds_campaign", JSON.stringify(stored)); } catch (e) {}
    }
    return stored;
  }

  var CAMPAIGN = readCampaign();

  function track(event, props) {
    var payload = Object.assign({ event: event, page: PAGE }, CAMPAIGN, props || {});
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
    if (window.__vdsDebug) console.log("[track]", payload);
  }
  window.vdsTrack = track;

  var PAGE_EVENT = {
    home: "homepage_view",
    collection: "fragrance_collection_view",
    perfume: "fragrance_view",
    discovery: "discovery_page_view",
    map: "olfactive_map_opened",
    consultant: "consultant_opened",
  };
  if (PAGE_EVENT[PAGE]) track(PAGE_EVENT[PAGE], { path: location.pathname });

  /* qualquer elemento com data-track vira evento, sem JS específico */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-track]");
    if (!el) return;
    var props = {};
    for (var key in el.dataset) {
      if (key.indexOf("track") === 0 && key !== "track") {
        props[key.slice(5).toLowerCase()] = el.dataset[key];
      }
    }
    var name = el.dataset.track;
    track(name, props);
    // um clique de WhatsApp qualificado também conta na conversão geral
    if (name.indexOf("whatsapp_clicked") === 0 && name !== "whatsapp_clicked") {
      track("whatsapp_clicked", props);
    }
  });

  /* profundidade de rolagem: mede interesse sem medir tempo à toa */
  (function () {
    var marks = [25, 50, 75, 100];
    var hit = {};
    window.addEventListener("scroll", function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      var pct = Math.round((window.scrollY / h) * 100);
      marks.forEach(function (m) {
        if (pct >= m && !hit[m]) { hit[m] = true; track("scroll_depth", { depth: m }); }
      });
    }, { passive: true });
  })();

  /* ================================================================ DRAWER */
  var burger = document.querySelector("[data-drawer-open]");
  function setDrawer(open) {
    document.body.classList.toggle("drawer-open", open);
    document.body.classList.toggle("is-locked", open);
    if (burger) burger.setAttribute("aria-expanded", String(open));
  }
  if (burger) burger.addEventListener("click", function () { setDrawer(true); });
  document.querySelectorAll("[data-drawer-close]").forEach(function (el) {
    el.addEventListener("click", function () { setDrawer(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setDrawer(false);
  });

  /* ==================================================== REVELAR NO SCROLL */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObs.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  }

  /* =============================================================== FILTROS */
  var grid = document.querySelector("[data-grid]");
  if (grid) {
    var active = {};
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
    var countEl = document.querySelector("[data-count]");
    var emptyEl = document.querySelector("[data-empty]");
    var clearEl = document.querySelector("[data-clear]");

    var matches = function (card) {
      return Object.keys(active).every(function (key) {
        var want = active[key];
        if (!want) return true;
        return (card.dataset[key] || "").split("|").indexOf(want) !== -1;
      });
    };

    var applyFilters = function () {
      var shown = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.classList.toggle("is-hidden", !ok);
        if (ok) shown++;
      });
      if (countEl) countEl.textContent = shown + (shown === 1 ? " fragrância" : " fragrâncias");
      if (emptyEl) emptyEl.hidden = shown > 0;
      if (clearEl) clearEl.hidden = !Object.keys(active).some(function (k) { return active[k]; });
    };

    document.querySelectorAll("[data-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.dataset.filter;
        active[key] = btn.dataset.value;
        document.querySelectorAll('[data-filter="' + key + '"]').forEach(function (sib) {
          sib.classList.toggle("is-on", sib === btn);
        });
        applyFilters();
        if (!btn.dataset.value) return;
        track("filter_used", { filter: key, value: btn.dataset.value });
        if (key === "gender" && btn.dataset.value === "masculino") track("category_male_clicked", { from: "filter" });
        if (key === "gender" && btn.dataset.value === "feminino") track("category_female_clicked", { from: "filter" });
      });
    });

    if (clearEl) {
      clearEl.addEventListener("click", function () {
        active = {};
        document.querySelectorAll("[data-filter]").forEach(function (btn) {
          btn.classList.toggle("is-on", btn.dataset.value === "");
        });
        applyFilters();
      });
    }

    /* gênero vindo da navegação: /fragrancias/?g=masculino */
    var wanted = new URLSearchParams(location.search).get("g");
    if (wanted) {
      var preset = document.querySelector('[data-filter="gender"][data-value="' + wanted + '"]');
      if (preset) {
        preset.click();
        grid.scrollIntoView({ block: "start" });
      }
    }
  }

  /* ==================================================== TERMOS EXPLICADOS
     No desktop o hover resolve; no celular precisa de toque. */
  document.querySelectorAll("[data-term]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var open = btn.getAttribute("aria-expanded") === "true";
      document.querySelectorAll('[data-term][aria-expanded="true"]').forEach(function (other) {
        other.setAttribute("aria-expanded", "false");
      });
      btn.setAttribute("aria-expanded", String(!open));
      if (!open) track("term_opened", { term: btn.getAttribute("aria-label") || "" });
    });
  });
  document.addEventListener("click", function () {
    document.querySelectorAll('[data-term][aria-expanded="true"]').forEach(function (btn) {
      btn.setAttribute("aria-expanded", "false");
    });
  });

  /* =============================================================== GALERIA */
  var galleryMain = document.querySelector("[data-gallery-main]");
  if (galleryMain) {
    var thumbs = document.querySelectorAll("[data-thumb]");
    var mainImg = galleryMain.querySelector("img");
    var mainSource = galleryMain.querySelector("source");
    var WIDTHS = [320, 480, 640, 960];

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var base = thumb.querySelector("img").getAttribute("src").replace(/-320\.webp$/, "");
        if (mainSource) {
          mainSource.srcset = WIDTHS.map(function (w) { return base + "-" + w + ".webp " + w + "w"; }).join(", ");
        }
        mainImg.srcset = WIDTHS.map(function (w) { return base + "-" + w + ".jpg " + w + "w"; }).join(", ");
        mainImg.src = base + "-960.jpg";
        thumbs.forEach(function (t) { t.classList.toggle("is-active", t === thumb); });
      });
    });
  }

  /* ======================================================= LINHA DO TEMPO */
  var timelineEl = document.querySelector("[data-timeline]");
  if (timelineEl) {
    var stages = Array.prototype.slice.call(timelineEl.querySelectorAll("[data-stage]"));
    if (reduceMotion || !("IntersectionObserver" in window)) {
      stages.forEach(function (s) { s.classList.add("is-on"); });
      timelineEl.style.setProperty("--fill", "100%");
    } else {
      var stageObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add("is-on");
        });
        var done = stages.filter(function (s) { return s.classList.contains("is-on"); }).length;
        timelineEl.style.setProperty("--fill", Math.round((done / stages.length) * 100) + "%");
      }, { rootMargin: "0px 0px -35% 0px", threshold: 0.2 });
      stages.forEach(function (s) { stageObs.observe(s); });
    }
  }

  /* ========================================================= MAPA OLFATIVO */
  var mapEl = document.querySelector("[data-map]");
  var readout = document.querySelector("[data-map-readout]");
  var mapDataEl = document.querySelector("[data-map-data]");

  if (mapEl && readout && mapDataEl) {
    var mapData = JSON.parse(mapDataEl.textContent);

    var clearMap = function () {
      mapEl.querySelectorAll(".is-on").forEach(function (el) { el.classList.remove("is-on"); });
    };

    mapEl.querySelectorAll("[data-map-region]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var region = mapData.regions[btn.dataset.mapRegion];
        if (!region) return;
        clearMap();
        btn.classList.add("is-on");
        readout.innerHTML =
          '<span class="eyebrow eyebrow--bare">Território</span>' +
          '<h2 class="display">' + region.label + "</h2>" +
          "<p>" + region.note + "</p>";
        track("olfactive_map_interaction", { kind: "region", value: btn.dataset.mapRegion });
      });
    });

    mapEl.querySelectorAll("[data-map-perfume]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var p = mapData.perfumes[btn.dataset.mapPerfume];
        if (!p) return;
        clearMap();
        btn.classList.add("is-on");
        readout.innerHTML =
          '<span class="eyebrow eyebrow--bare">' + p.families + "</span>" +
          '<h2 class="display">' + p.name + "</h2>" +
          "<p>" + p.tagline + "</p>" +
          '<a class="btn btn--ghost" href="' + p.href + '">Conhecer ' + p.name + "</a>";
        track("olfactive_map_interaction", { kind: "perfume", value: btn.dataset.mapPerfume });
      });
    });
  }

  /* ================================================================= BUSCA
     Índice pequeno e embutido: nenhuma requisição, resposta instantânea. */
  (function () {
    var overlay = document.getElementById("busca");
    var indexEl = document.querySelector("[data-search-index]");
    if (!overlay || !indexEl) return;

    var items = JSON.parse(indexEl.textContent);
    var input = document.getElementById("search-input");
    var results = document.getElementById("search-results");
    var lastLogged = "";

    var norm = function (s) {
      return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
    };
    items.forEach(function (it) { it._n = norm(it.n + " " + it.b); });

    /* distância de edição: tolera "kamrah" para "khamrah" */
    function distance(a, b) {
      if (Math.abs(a.length - b.length) > 3) return 99;
      var prev = [];
      for (var k = 0; k <= b.length; k++) prev[k] = k;
      for (var i = 1; i <= a.length; i++) {
        var cur = [i];
        for (var j = 1; j <= b.length; j++) {
          cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        }
        prev = cur;
      }
      return prev[b.length];
    }

    function score(q, item) {
      var name = item._n;
      if (name.indexOf(q) === 0) return 100;
      if (name.indexOf(q) !== -1) return 85;
      var words = name.split(" ");
      for (var i = 0; i < words.length; i++) {
        if (words[i].indexOf(q) === 0) return 75;
      }
      if (q.length >= 4) {
        for (var k = 0; k < words.length; k++) {
          var d = distance(q, words[k]);
          if (d <= 2) return 60 - d * 10;
        }
      }
      return 0;
    }

    function render(raw) {
      var query = norm(raw);
      if (!query) { results.innerHTML = ""; return; }

      var found = items
        .map(function (it) { return { it: it, s: score(query, it) }; })
        .filter(function (x) { return x.s > 0; })
        .sort(function (a, b) { return b.s - a.s; })
        .slice(0, 6);

      if (!found.length) {
        results.innerHTML = '<li class="search-empty">Nenhuma fragrância com esse nome.</li>';
        return;
      }

      results.innerHTML = found.map(function (x, i) {
        var it = x.it;
        var thumb = it.i
          ? '<img src="' + it.i + '" alt="" width="42" height="56" loading="lazy">'
          : '<span class="search-mark">' + it.n.trim().charAt(0) + "</span>";
        var price = it.p != null ? '<span class="search-price">' + brl(it.p) + "</span>" : "";
        return '<li role="option"><a href="' + it.h + '" data-search-hit data-index="' + i + '">' +
          thumb + '<span class="search-name">' + it.n + (it.b ? "<em>" + it.b + "</em>" : "") + "</span>" +
          price + "</a></li>";
      }).join("");
    }

    function openSearch() {
      overlay.hidden = false;
      document.body.classList.add("is-locked");
      requestAnimationFrame(function () {
        overlay.classList.add("is-open");
        input.focus();
      });
    }
    function closeSearch() {
      overlay.classList.remove("is-open");
      document.body.classList.remove("is-locked");
      setTimeout(function () { overlay.hidden = true; }, 220);
    }

    document.querySelectorAll("[data-search-open]").forEach(function (el) {
      el.addEventListener("click", openSearch);
    });
    document.querySelectorAll("[data-search-close]").forEach(function (el) {
      el.addEventListener("click", closeSearch);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.hidden) closeSearch();
      if (e.key === "/" && overlay.hidden && document.activeElement === document.body) {
        e.preventDefault();
        openSearch();
      }
    });

    var debounce;
    input.addEventListener("input", function () {
      render(input.value);
      clearTimeout(debounce);
      debounce = setTimeout(function () {
        var q = input.value.trim();
        if (q.length >= 2 && q !== lastLogged) {
          lastLogged = q;
          track("fragrance_search", { query: q, results: results.querySelectorAll("[data-search-hit]").length });
        }
      }, 700);
    });

    input.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      var first = results.querySelector("[data-search-hit]");
      if (first) { e.preventDefault(); first.click(); }
    });

    results.addEventListener("click", function (e) {
      var hit = e.target.closest("[data-search-hit]");
      if (!hit) return;
      track("fragrance_search_result_clicked", {
        query: input.value.trim(),
        position: Number(hit.dataset.index) + 1,
      });
    });
  })();

  /* ====================================================== CTA FIXO MOBILE */
  (function () {
    var bar = document.querySelector("[data-sticky]");
    var anchor = document.querySelector(".convert");
    if (!bar || !anchor || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      // aparece só depois que a caixa de preço saiu de vista para cima
      bar.hidden = e.isIntersecting || e.boundingClientRect.top > 0;
    }, { threshold: 0 }).observe(anchor);
  })();

  /* ============================================================ DESCOBRIR */
  (function () {
    var root = document.querySelector("[data-discovery]");
    var dataEl = document.querySelector("[data-discovery-data]");
    if (!root || !dataEl) return;

    var data = JSON.parse(dataEl.textContent);
    var copy = JSON.parse(document.querySelector("[data-discovery-copy]").textContent);
    var steps = root.querySelectorAll("[data-step]");
    var progress = root.querySelector("[data-progress]");
    var answers = [];
    var current = -1;

    function show(kind, index) {
      steps.forEach(function (el) {
        var match = el.dataset.step === kind && (index == null || Number(el.dataset.index) === index);
        el.hidden = !match;
      });
      progress.hidden = kind !== "q";
      if (kind === "q") {
        progress.firstElementChild.style.width = Math.round((index / data.questions.length) * 100) + "%";
        var back = root.querySelector('[data-step="q"][data-index="' + index + '"] [data-back]');
        if (back) back.hidden = index === 0;
      }
      root.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
    }

    function overlap(a, b) {
      if (!a || !b) return 0;
      return b.filter(function (x) { return a.indexOf(x) !== -1; }).length;
    }

    function scoreOf(perfume) {
      var total = 0;
      answers.forEach(function (ans) {
        if (!ans) return; // "ainda não sei" não penaliza ninguém
        var m = ans.match || {};
        total += overlap(m.personality, perfume.personality) * 3;
        total += overlap(m.families, perfume.families) * 2;
        total += overlap(m.occasions, perfume.occasions) * 2;
        total += overlap(m.moments, perfume.moments);
        if (m.projection && perfume.projection) {
          var lo = m.projection[0], hi = m.projection[1];
          if (perfume.projection >= lo && perfume.projection <= hi) total += 3;
          else if (Math.abs(perfume.projection - (lo + hi) / 2) <= 1) total += 1;
        }
      });
      return total;
    }

    function cardFor(p, primary) {
      var img = p.image
        ? '<img src="' + p.image + '" alt="" width="240" height="320" loading="lazy">'
        : '<span class="rec-mark">' + p.name.trim().charAt(0) + "</span>";
      var price = p.price != null ? '<span class="rec-price">' + brl(p.price) + "</span>" : "";
      return '<a class="rec' + (primary ? " rec--primary" : "") + '" href="' + p.href +
        '" data-track="discovery_result_clicked" data-track-perfume="' + p.slug + '">' +
        '<span class="rec-frame">' + img + "</span>" +
        '<span class="rec-body"><strong>' + p.name + "</strong>" +
        (p.tagline ? "<em>" + p.tagline + "</em>" : "") + price + "</span></a>";
    }

    /* A justificativa sai das respostas, não do jargão: "Você disse que quer
       transmitir algo sedutor, pretende usar à noite e gosta de sensação quente." */
    function recapSentence() {
      var parts = [];
      answers.forEach(function (ans, i) {
        if (!ans || !data.questions[i].recap) return;
        parts.push(data.questions[i].recap.replace("{a}", ans.label.toLowerCase()));
      });
      if (!parts.length) return "Você preferiu não responder, então começamos pelo mais versátil da coleção.";
      var text = parts.length === 1
        ? parts[0]
        : parts.slice(0, -1).join(", ") + " e " + parts[parts.length - 1];
      return copy.because.replace("{recap}", text);
    }

    function finish() {
      var ranked = data.perfumes
        .map(function (p) { return { p: p, s: scoreOf(p) }; })
        .sort(function (a, b) { return b.s - a.s; })
        .filter(function (x) { return x.s > 0; });

      var box = root.querySelector("[data-result]");
      var chosen = ranked.length ? ranked[0].p : null;

      if (!chosen) {
        box.innerHTML = '<span class="eyebrow">' + copy.weakTitle + "</span>" +
          '<p class="lede">' + copy.weakBody + "</p>";
      } else {
        var rest = ranked.slice(1, 3);
        box.innerHTML =
          '<span class="eyebrow">' + copy.eyebrow + "</span>" +
          '<h2 class="display step-title">' + chosen.name + "</h2>" +
          '<p class="lede">' + recapSentence() + "</p>" +
          cardFor(chosen, true) +
          (rest.length
            ? '<h3 class="rec-other">' + copy.otherTitle + "</h3>" +
              '<div class="rec-grid">' + rest.map(function (x) { return cardFor(x.p, false); }).join("") + "</div>"
            : "") +
          '<p class="rec-note">' + (ranked.length < 3
            ? "A curadoria com ficha completa ainda é curta — o consultor conhece as demais."
            : "Ficou entre duas? O consultor compara as duas em cinco minutos.") + "</p>";
      }

      /* O caminho percorrido entra na conversa em linguagem natural: o vendedor
         sabe que veio da descoberta sem o cliente precisar enviar código nenhum. */
      var message = chosen
        ? "Olá! Fiz a descoberta de fragrâncias no site e gostei da indicação do " + chosen.name + ". Gostaria de saber mais."
        : "Olá! Fiz a descoberta de fragrâncias no site e queria ajuda para escolher.";

      var wa = document.createElement("a");
      wa.className = "btn btn--gold rec-cta";
      wa.href = root.dataset.wa.replace("__MSG__", encodeURIComponent(message));
      wa.target = "_blank";
      wa.rel = "noopener";
      wa.textContent = chosen ? "Falar sobre o " + chosen.name : "Falar com um consultor";
      wa.setAttribute("data-track", "whatsapp_clicked_from_discovery");
      if (chosen) wa.setAttribute("data-track-perfume", chosen.slug);
      box.appendChild(wa);

      show("result");
      track("discovery_completed", {
        recommended: chosen ? chosen.slug : "nenhum",
        answered: answers.filter(Boolean).length,
      });
    }

    root.querySelector("[data-start]").addEventListener("click", function () {
      answers = [];
      current = 0;
      track("discovery_started", {});
      show("q", 0);
    });

    root.addEventListener("click", function (e) {
      var opt = e.target.closest(".opt");
      if (opt) {
        var qi = Number(opt.dataset.q);
        var oi = Number(opt.dataset.o);
        answers[qi] = oi === -1 ? null : data.questions[qi].options[oi];
        track("discovery_question_answered", {
          question: data.questions[qi].id,
          answer: oi === -1 ? data.unsure : data.questions[qi].options[oi].label,
        });
        current = qi + 1;
        if (current >= data.questions.length) finish();
        else show("q", current);
        return;
      }
      if (e.target.closest("[data-back]")) {
        current = Math.max(0, current - 1);
        show("q", current);
      }
      if (e.target.closest("[data-restart]")) {
        answers = [];
        current = 0;
        show("intro");
      }
    });
  })();
})();
