/* Runtime da Vitrine do Sheik — sem dependências, sem framework.
   Tudo aqui é progressivo: se o JS falhar, o conteúdo continua legível. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------- analytics
     Camada neutra: empurra para o dataLayer se existir, senão não faz nada.
     Plugar GA4/GTM/Meta depois não exige tocar em nenhum template. */
  function track(event, props) {
    var payload = Object.assign({ event: event }, props || {});
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
    if (window.__vdsDebug) console.log("[track]", payload);
  }
  window.vdsTrack = track;

  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-track]");
    if (!el) return;
    var props = {};
    for (var key in el.dataset) {
      if (key.indexOf("track") === 0 && key !== "track") {
        props[key.slice(5).toLowerCase()] = el.dataset[key];
      }
    }
    track(el.dataset.track, props);
  });

  /* ------------------------------------------------------------- drawer */
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

  /* ------------------------------------------------------ reveal on scroll */
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

  /* ---------------------------------------------------------- filtros */
  var grid = document.querySelector("[data-grid]");
  if (grid) {
    var active = {};
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
    var countEl = document.querySelector("[data-count]");
    var emptyEl = document.querySelector("[data-empty]");
    var clearEl = document.querySelector("[data-clear]");

    function matches(card) {
      return Object.keys(active).every(function (key) {
        var want = active[key];
        if (!want) return true;
        var have = (card.dataset[key] || "").split("|");
        return have.indexOf(want) !== -1;
      });
    }

    function apply() {
      var shown = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.classList.toggle("is-hidden", !ok);
        if (ok) shown++;
      });
      if (countEl) countEl.textContent = shown + (shown === 1 ? " fragrância" : " fragrâncias");
      if (emptyEl) emptyEl.hidden = shown > 0;
      var any = Object.keys(active).some(function (k) { return active[k]; });
      if (clearEl) clearEl.hidden = !any;
    }

    document.querySelectorAll("[data-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.dataset.filter;
        active[key] = btn.dataset.value;
        document.querySelectorAll('[data-filter="' + key + '"]').forEach(function (sib) {
          sib.classList.toggle("is-on", sib === btn);
        });
        apply();
        if (btn.dataset.value) track("filter_use", { filter: key, value: btn.dataset.value });
      });
    });

    if (clearEl) {
      clearEl.addEventListener("click", function () {
        active = {};
        document.querySelectorAll("[data-filter]").forEach(function (btn) {
          btn.classList.toggle("is-on", btn.dataset.value === "");
        });
        apply();
      });
    }
  }

  /* ------------------------------------------------ termos explicados
     No desktop o hover resolve; no celular precisa de toque. */
  document.querySelectorAll("[data-term]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var open = btn.getAttribute("aria-expanded") === "true";
      document.querySelectorAll('[data-term][aria-expanded="true"]').forEach(function (other) {
        other.setAttribute("aria-expanded", "false");
      });
      btn.setAttribute("aria-expanded", String(!open));
      if (!open) track("term_opened", { term: btn.textContent.trim() });
    });
  });
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-term]")) return;
    document.querySelectorAll('[data-term][aria-expanded="true"]').forEach(function (btn) {
      btn.setAttribute("aria-expanded", "false");
    });
  });

  /* --------------------------------------------------------- galeria */
  var galleryMain = document.querySelector("[data-gallery-main]");
  if (galleryMain) {
    var thumbs = document.querySelectorAll("[data-thumb]");
    var mainImg = galleryMain.querySelector("img");
    var mainSource = galleryMain.querySelector("source");

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var src = thumb.querySelector("img").getAttribute("src");
        var base = src.replace(/-320\.webp$/, "");
        if (mainSource) {
          mainSource.srcset = [320, 480, 640, 960].map(function (w) {
            return base + "-" + w + ".webp " + w + "w";
          }).join(", ");
        }
        mainImg.srcset = [320, 480, 640, 960].map(function (w) {
          return base + "-" + w + ".jpg " + w + "w";
        }).join(", ");
        mainImg.src = base + "-960.jpg";
        thumbs.forEach(function (t) { t.classList.toggle("is-active", t === thumb); });
      });
    });
  }

  /* ------------------------------------------------- linha do tempo */
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

  /* --------------------------------------------------- mapa olfativo */
  var mapEl = document.querySelector("[data-map]");
  var readout = document.querySelector("[data-map-readout]");
  var dataEl = document.querySelector("[data-map-data]");

  if (mapEl && readout && dataEl) {
    var data = JSON.parse(dataEl.textContent);

    function clearActive() {
      mapEl.querySelectorAll(".is-on").forEach(function (el) { el.classList.remove("is-on"); });
    }

    function render(html) {
      readout.innerHTML = html;
    }

    mapEl.querySelectorAll("[data-map-region]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var region = data.regions[btn.dataset.mapRegion];
        if (!region) return;
        clearActive();
        btn.classList.add("is-on");
        render(
          '<span class="eyebrow eyebrow--bare">Território</span>' +
          "<h2 class=\"display\">" + region.label + "</h2>" +
          "<p>" + region.note + "</p>"
        );
        track("map_region", { region: btn.dataset.mapRegion });
      });
    });

    mapEl.querySelectorAll("[data-map-perfume]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var p = data.perfumes[btn.dataset.mapPerfume];
        if (!p) return;
        clearActive();
        btn.classList.add("is-on");
        render(
          '<span class="eyebrow eyebrow--bare">' + p.families + "</span>" +
          "<h2 class=\"display\">" + p.name + "</h2>" +
          "<p>" + p.tagline + "</p>" +
          '<a class="btn btn--ghost" href="' + p.href + '">Conhecer ' + p.name + "</a>"
        );
        track("map_perfume", { perfume: btn.dataset.mapPerfume });
      });
    });
  }
})();
