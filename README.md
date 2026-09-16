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
| `content/site.json` | Marca, WhatsApp, textos da home, mapa olfativo, o teste de assinatura |
| `content/kits.json` | Kits de presente, datas comemorativas e os textos da página Presentear |

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

## Kits e presentes

A página `/presentes/` reúne as duas formas de dar um perfume de presente:

- **Kits prontos** — combinações de duas ou três fragrâncias, cada uma com a
  sua página (`/presentes/primeira-vez/`).
- **Monte seu kit** — a pessoa marca as fragrâncias que quiser e a seleção vira
  uma mensagem no WhatsApp: *"Olá! Quero montar um kit com: Khamrah + Al Wesal."*
  Nada é cobrado no site; o valor do conjunto é fechado por você na conversa.

### Como mexer nos kits

Tudo em `content/kits.json`. Um kit é só isto:

```json
{
  "slug": "primeira-vez",
  "name": "Primeira Vez",
  "audience": "unissex",
  "concept": "uma frase",
  "body": "o parágrafo que explica a dupla",
  "perfumes": ["al-wesal", "khamrah"],
  "price": null
}
```

Os `perfumes` são os `slug` do catálogo real — o nome, a foto e o preço vêm de
lá, então **nada é digitado duas vezes**. Com `"price": null`, o site mostra a
soma dos preços no Pix e diz que é a soma. Se você fechar um valor de kit,
escreva o número em `price` e o site passa a mostrar só ele.

> **Nome, conceito e texto dos seis kits são rascunho meu** — é o que o campo
> `review` de cada kit registra, e o build avisa no terminal a cada rodada.
> As fragrâncias dentro deles são reais. Corrija os textos à vontade.

### Datas comemorativas

Cada estação é uma janela de calendário que **se repete todo ano**:

```json
{ "id": "natal", "label": "Natal", "from": "11-10", "to": "12-26",
  "kits": ["primeira-vez", "tres-territorios"] }
```

Dentro da janela, a home ganha uma faixa da data e a página Presentear sobe os
kits dela para o topo. Fora dela, nada aparece — não fica um Natal esquecido no
ar em março. Dezembro para janeiro dá a volta sozinho (Ano Novo).

Para ver como uma data vai ficar antes da hora:

```bash
SEASON=natal node src/build.mjs && node src/serve.mjs
```

O site é gerado na hora do build, então o GitHub Action roda **uma vez por dia**
(além de a cada push) só para as datas entrarem e saírem sozinhas.

---

## Rodando localmente

Precisa apenas do Node instalado.

```bash
node src/build.mjs     # gera o site em dist/
node src/serve.mjs     # abre em http://localhost:4000
```

Outros comandos, todos opcionais:

| Comando | Quando usar |
|---|---|
| `python3 src/optimize-images.py` | trocou ou adicionou fotos |
| `python3 src/import-catalog.py planilha.xlsx` | atualizou a planilha de estoque |
| `python3 src/make-enrichment-sheet.py` | quer preencher os dados olfativos |
| `python3 src/import-enrichment.py enriquecimento.xlsx` | devolver a planilha preenchida |
| `python3 src/fetch-fonts.py` | raramente; só se trocar a tipografia |

Os dois importadores rodam em simulação por padrão. Acrescente `--aplicar` para gravar.

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
  kits.json
assets-src/       fotos originais (fonte da verdade)
public/           imagens otimizadas e fontes, servidas como estão
src/
  build.mjs       o gerador: JSON → HTML estático
  serve.mjs       servidor local de preview
  templates/      o HTML (base.mjs = shell e componentes, pages.mjs = páginas,
                  kits.mjs = kits e datas comemorativas)
  styles/         main.css = design system, fonts.css = fontes auto-hospedadas
  scripts/app.js  o pouco de JavaScript que roda no navegador
dist/             o site gerado (não versionado)
```

---

## Os dois caminhos

O site atende dois visitantes diferentes pela mesma porta:

- **Ver as fragrâncias** (`/fragrancias/`) — para quem já sabe o que quer. Filtros
  primários de gênero e ocasião à vista; família, estilo e clima recolhidos em
  "Mais filtros". A navegação aceita `/fragrancias/?g=masculino` para campanhas
  que apontam direto para uma categoria.
- **Presentear** (`/presentes/`) — kits prontos e "monte o seu". É a porta para
  quem chega procurando presente, não perfume.
- **Qual é a sua assinatura?** (`/descobrir/`) — quatro perguntas sobre a pessoa,
  nenhuma sobre perfume. O resultado nomeia a assinatura dela antes de indicar
  qualquer produto: *"Sua assinatura é presença elegante."* Depois vem a
  justificativa nas palavras dela e só então as indicações. "Ainda não sei" é
  resposta válida — a assinatura sai mesmo assim.

As duas páginas foram deliberadamente separadas: filtrar por *estilo* e responder
"o que você quer transmitir" são a mesma pergunta, e ter as duas abertas lado a
lado fazia as páginas parecerem redundantes. Por isso as dimensões subjetivas
ficam recolhidas em Fragrâncias e pertencem ao quiz.

O **mapa olfativo** continua em `/mapa/`, mas saiu da navegação principal: é uma
experiência de exploração, não um caminho de compra. Ele é alcançado a partir de
Fragrâncias.

A busca abre pelo ícone de lupa em qualquer página (ou pela tecla `/` no
computador). Ela tolera erro de digitação: "kamrah" encontra Khamrah.

### Perfil completo e perfil parcial

Um perfume só entra na recomendação quando tem família, personalidade e perfil
preenchidos. Os demais continuam aparecendo na busca, na coleção e nos filtros —
eles só não são recomendados com dados que não existem.

Editar `content/discovery` dentro de `site.json` muda as perguntas, as opções e
o que cada resposta procura, sem tocar em código.

## Analytics

Os eventos já estão instrumentados e empurrados para `window.dataLayer`:

**Vitrine:** `homepage_view` · `fragrance_collection_view` · `fragrance_view` ·
`fragrance_search` · `fragrance_search_result_clicked` · `category_male_clicked` ·
`category_female_clicked` · `filter_used` · `rail_scrolled` · `scroll_depth` ·
`term_opened` · `path_chosen`

**Presentes:** `gift_page_view` · `kit_view` · `kit_clicked` ·
`kit_from_perfume_clicked` · `season_banner_clicked` · `kit_builder_started` ·
`kit_perfume_selected` · `kit_perfume_removed` · `kit_cleared` · `kit_submitted`

**Descoberta:** `discovery_started` · `discovery_question_answered` ·
`discovery_completed` (leva a assinatura junto) · `discovery_result_clicked`

**Conversão:** `whatsapp_clicked` · `whatsapp_clicked_from_product` ·
`whatsapp_clicked_from_discovery` · `whatsapp_clicked_from_kit` ·
`olfactive_map_opened` · `olfactive_map_interaction` · `consultant_opened`

Basta instalar GA4, GTM ou Meta Pixel — nada nos templates precisa mudar.
Para conferir no navegador: `window.__vdsDebug = true` e clique pelo site.

### Campanhas

Os parâmetros `utm_*`, `gclid` e `fbclid` são capturados na chegada e guardados
pela sessão inteira, então o clique no WhatsApp lá no fim ainda sabe de qual
anúncio o visitante veio. Eles vão junto em todo evento.

Eles **não** entram na mensagem que o cliente envia — quem veio da descoberta já
diz isso em português na própria mensagem, e ninguém precisa mandar código de
campanha para o vendedor.

---

## Pendências

### Textos de kit que esperam sua correção

Os seis kits têm nome, conceito e descrição redigidos por mim como rascunho —
as fragrâncias dentro deles são reais e os preços são a soma dos preços reais.
Se o nome não combinar com a loja ou a combinação não fizer sentido comercial,
troque em `content/kits.json`: é só texto.

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
