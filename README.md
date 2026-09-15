# Vitrine do Sheik

Portfólio digital de perfumaria árabe. Site estático, sem framework e sem dependências —
gerado a partir de arquivos JSON.

O objetivo do site não é fechar a venda. É levar o visitante de *curiosidade* até
*conversa no WhatsApp*, apresentando cada fragrância por inteiro: perfil, atmosfera,
evolução, quando usar — e para quem ela **não** serve.

---

## Como adicionar ou editar um perfume

Todo o conteúdo do site vive em dois arquivos. **Você não precisa mexer em código.**

| Arquivo | O que controla |
|---|---|
| `content/perfumes.json` | Os perfumes: nome, preço, notas, perfil, textos |
| `content/site.json` | Marca, WhatsApp, textos da home, mapa olfativo |

Para adicionar um perfume novo:

1. Coloque as fotos em `assets-src/perfumes/` com o nome `slug-1.jpeg`, `slug-2.jpeg`
   (ex.: `oud-mood-1.jpeg`).
2. Rode `python3 src/optimize-images.py` para gerar as versões otimizadas.
3. Copie um bloco inteiro dentro de `content/perfumes.json`, cole no fim da lista e
   troque os valores. O `slug` vira o endereço da página (`/perfumes/oud-mood/`).
4. Faça o commit. O site se atualiza sozinho.

O card, a página, os filtros, o mapa olfativo e o link de WhatsApp são gerados
automaticamente a partir desse bloco.

### Campos que não devem ser inventados

`volumeMl` e `concentration` estão como `null` porque são informação de produto que só
você tem. O site esconde o que estiver vazio — nada quebra. O build avisa no terminal o
que ainda falta.

O campo `review` lista o que foi **redigido como rascunho** e espera sua correção.
Quando você revisar um campo, tire o nome dele dessa lista.

---

## Rodando localmente

Precisa apenas do Node instalado.

```bash
node src/build.mjs     # gera o site em dist/
node src/serve.mjs     # abre em http://localhost:4000
```

Para regerar as imagens (só quando trocar fotos): `python3 src/optimize-images.py`
Para regerar as fontes (raramente): `python3 src/fetch-fonts.py`

---

## Publicação

O GitHub Action em `.github/workflows/deploy.yml` gera e publica a cada push na `main`.
Para ativar: **Settings → Pages → Source: GitHub Actions**.

Dois ajustes quando o domínio final existir:

1. `content/site.json` → preencha `"url": "https://seudominio.com"`.
   Sem isso, o preview de link no WhatsApp e no Instagram não mostra a imagem certa,
   e o `sitemap.xml` não é gerado.
2. Se o site ficar num subcaminho (`usuario.github.io/vitrinedosheik/`), ajuste
   `BASE_PATH` no workflow. Em domínio próprio, deixe vazio.

---

## Estrutura

```
content/          os dados — é aqui que o conteúdo mora
  site.json
  perfumes.json
assets-src/       fotos originais (fonte da verdade)
public/           imagens otimizadas e fontes, servidas como estão
src/
  build.mjs       o gerador: JSON → HTML estático
  serve.mjs       servidor local de preview
  templates/      o HTML (base.mjs = shell e componentes, pages.mjs = páginas)
  styles/         main.css = design system, fonts.css = fontes auto-hospedadas
  scripts/app.js  o pouco de JavaScript que roda no navegador
dist/             o site gerado (não versionado)
```

---

## Analytics

Os eventos já estão instrumentados e empurrados para `window.dataLayer`:

`perfume_view` · `whatsapp_click` (com a origem do clique) · `filter_use` ·
`map_region` · `map_perfume`

Basta instalar GA4, GTM ou Meta Pixel — nada nos templates precisa mudar.
Para conferir no navegador: `window.__vdsDebug = true` e clique pelo site.

---

## Pendências

### Dados que dependem de você

- **Volume (ml) e concentração** (EDP/EDT/Extrait) dos três perfumes.
- **Preço do Atheeri** (R$ 519,90) — muito acima dos outros dois Lattafa. Confirmar.
- **Gênero do Asad Elixir e do Khamrah** — marquei como `unissex` (as notas indicam
  isso). Estavam como femininos no site antigo.
- **Notas do Atheeri** — o material de origem traz "Frutas", "Notas florais",
  "Notas amadeiradas". Genérico demais. Se tiver a lista real, ganha muito.
- **Intensidade, projeção e fixação** — são a sua leitura de quem vende e sente o
  produto. Estimei a partir da estrutura das notas; confira e corrija.
- **A afirmação "+12h de fixação"** e as **"★★★★★ aprovação das clientes"** do site
  antigo foram removidas: não havia dado que as sustentasse. Vale recolocar só quando
  houver avaliação real de cliente.

### Fotos que valem produzir

Hoje existem 2 fotos por perfume, todas **da caixa** sobre uma superfície cinza. Dá para
um site bonito, mas não para uma campanha. Por ordem de impacto:

1. **Frasco fora da caixa**, fundo escuro, luz lateral — é a foto que vende.
2. **Ambientada**: o frasco em contexto (madeira, tecido, mesa posta).
3. **Ingrediente**: âmbar, tabaco, canela, flor branca. Dá matéria à narrativa das notas.
4. **Atmosférica**: uma imagem que represente a sensação, sem o produto.

Celular moderno com luz de janela lateral e fundo escuro já resolve as três primeiras.
