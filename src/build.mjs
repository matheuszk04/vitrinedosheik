/* Gerador estático da Vitrine do Sheik.
   Node puro, zero dependências. Lê content/*.json e escreve dist/.

   Uso:  node src/build.mjs
*/
import { readFile, writeFile, mkdir, rm, cp } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { setBase } from "./templates/base.mjs";
import { home, explorer, perfumePage, mapPage, consultantPage } from "./templates/pages.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

const readJson = async (p) => JSON.parse(await readFile(join(ROOT, p), "utf8"));

async function emit(path, html) {
  const full = join(DIST, path);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, html);
  return Buffer.byteLength(html);
}

function sitemap(site, paths) {
  if (!site.url) return null;
  const base = site.url.replace(/\/$/, "");
  const urls = paths
    .map((p) => `  <url><loc>${base}${p}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/** Avisa no terminal sobre campos que ainda dependem de revisão do dono da loja. */
function reportPending(perfumes) {
  const missingFacts = [];
  const needsReview = [];

  for (const p of perfumes) {
    const gaps = [];
    if (p.volumeMl == null) gaps.push("volumeMl");
    if (p.concentration == null) gaps.push("concentration");
    if (gaps.length) missingFacts.push(`  ${p.name}: ${gaps.join(", ")}`);
    if (p.review?.length) needsReview.push(`  ${p.name}: ${p.review.length} campos`);
  }

  if (missingFacts.length) {
    console.log("\n⚠ dados de produto ausentes (só o lojista tem):");
    console.log(missingFacts.join("\n"));
  }
  if (needsReview.length) {
    console.log("\n⚠ conteúdo redigido como rascunho, aguardando revisão:");
    console.log(needsReview.join("\n"));
  }
}

async function build() {
  const [site, perfumes] = await Promise.all([readJson("content/site.json"), readJson("content/perfumes.json")]);

  // BASE_PATH permite publicar num subcaminho (ex.: GitHub Pages de projeto)
  const base = (process.env.BASE_PATH || site.base || "").replace(/\/$/, "");
  setBase(base);

  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  const pages = [
    ["index.html", home(site, perfumes), "/"],
    ["fragrancias/index.html", explorer(site, perfumes), "/fragrancias/"],
    ["mapa/index.html", mapPage(site, perfumes), "/mapa/"],
    ["consultor/index.html", consultantPage(site), "/consultor/"],
    ...perfumes.map((p) => [
      `perfumes/${p.slug}/index.html`,
      perfumePage(site, p, perfumes),
      `/perfumes/${p.slug}/`,
    ]),
  ];

  let bytes = 0;
  for (const [path, html] of pages) bytes += await emit(path, html);

  await cp(join(ROOT, "public"), DIST, { recursive: true });
  await mkdir(join(DIST, "assets"), { recursive: true });

  // fontes + estilos viram um único arquivo: uma requisição em vez de duas
  const [fontsCss, mainCss] = await Promise.all([
    readFile(join(ROOT, "src/styles/fonts.css"), "utf8"),
    readFile(join(ROOT, "src/styles/main.css"), "utf8"),
  ]);
  // as url() do @font-face são absolutas: precisam do mesmo prefixo das páginas
  const css = `${fontsCss}\n${mainCss}`.replace(/url\(\/fonts\//g, `url(${base}/fonts/`);
  await writeFile(join(DIST, "assets/main.css"), css);
  await cp(join(ROOT, "src/scripts/app.js"), join(DIST, "assets/app.js"));

  if (site.noindex) {
    // site no ar, mas fora das buscas: ninguém chega sem o link
    await emit("robots.txt", "User-agent: *\nDisallow: /\n");
  } else {
    const map = sitemap(site, pages.map(([, , url]) => url));
    if (map) await emit("sitemap.xml", map);
    await emit(
      "robots.txt",
      `User-agent: *\nAllow: /\n${site.url ? `Sitemap: ${site.url.replace(/\/$/, "")}/sitemap.xml\n` : ""}`
    );
  }

  console.log(`✓ ${pages.length} páginas geradas (${(bytes / 1024).toFixed(0)} KB de HTML)`);
  pages.forEach(([, , url]) => console.log(`  ${url}`));
  if (!site.url) {
    console.log("\n⚠ content/site.json: campo 'url' vazio — defina o domínio final para");
    console.log("  gerar sitemap.xml e para os previews de link do WhatsApp funcionarem.");
  }
  reportPending(perfumes);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
