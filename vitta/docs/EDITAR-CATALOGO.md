# Como editar o catálogo da VITTA

Este guia explica como cadastrar e alterar produtos, categorias, coleções e imagens
**sem mexer nos componentes visuais**. Todo o conteúdo da loja vive em poucos arquivos
de dados; a interface lê tudo a partir deles.

> **Estado atual:** o catálogo tem os 20 produtos importados da exportação do Wix
> (`scripts/catalogo-wix.csv`), **ainda sem fotos** — a loja mostra "Imagem em breve".
> Veja [Importar do Wix e baixar as fotos](#importar-do-wix-e-baixar-as-fotos).

---

## Mapa rápido

| O que você quer mudar | Arquivo |
|---|---|
| Produtos (nome, preço, fotos, medidas, estoque…) | `src/data/products.ts` |
| Categorias | `src/data/categories.ts` |
| Coleções / ambientes | `src/data/collections.ts` |
| Contatos, redes sociais, textos de entrega e trocas, aviso de protótipo | `src/config/store-config.ts` |
| Logo | `public/brand/` (caminhos em `src/config/brand.ts`) |
| Fotos de produtos | `public/images/products/` |
| Fotos de categorias | `public/images/categories/` |
| Fotos de coleções | `public/images/collections/` |

Os arquivos são TypeScript, mas a edição é como preencher uma ficha: cada produto é um
bloco entre `{` e `}`, com campos no formato `campo: valor,`. Textos ficam entre aspas
simples (`'assim'`), números ficam sem aspas (`189.9`).

---

## Importar do Wix e baixar as fotos

O arquivo `src/data/products.ts` foi gerado pelo script `scripts/import-wix-catalog.py` a
partir do CSV exportado do Wix. O script:

- limpa o HTML das descrições e remove frases que citavam outra loja;
- usa nome, descrição, preço, preço riscado e disponibilidade do CSV; não inventa medidas,
  cores ou datas;
- define a categoria e os destaques de cada produto pelas tabelas `CATEGORIAS` e `DESTAQUES`
  no início do script (o CSV não traz categorias);
- converte as fotos para WebP e as salva em `public/images/products/<slug>-<n>.webp`.

Rodar de novo **substitui** `src/data/products.ts`. Se você editou produtos à mão, refaça as
edições ou passe a editar só à mão.

```bash
cd vitta
# fotos direto do Wix (precisa de internet com acesso a static.wixstatic.com)
python3 scripts/import-wix-catalog.py scripts/catalogo-wix.csv --baixar-fotos

# ou: fotos já baixadas numa pasta (o nome de cada arquivo precisa conter o código da
# coluna "media" do CSV, ex.: 22be8c_832e9e3ab86645cba8e5a15ae857de3f~mv2.png)
python3 scripts/import-wix-catalog.py scripts/catalogo-wix.csv --pasta-fotos ~/Downloads/fotos-vitta
```

Mídias do CSV sem extensão (6 no total) são vídeos do Wix e são ignoradas.

## 1. Cadastrar um novo produto

Abra `src/data/products.ts`, copie um bloco inteiro (do `{` até o `},`), cole no fim da
lista — antes do `]` final — e troque os valores.

### Exemplo completo (todos os campos)

```ts
  {
    id: 'p-018',
    slug: 'vaso-garrafa-areia',
    name: 'Vaso Garrafa',
    description: 'Vaso alto de gargalo fino, em cerâmica com esmalte acetinado.',
    price: 259.9,
    compareAtPrice: 299.9,
    categoryId: 'vasos-e-ceramicas',
    images: [
      '/images/products/vaso-garrafa-areia-1.jpg',
      '/images/products/vaso-garrafa-areia-2.jpg',
    ],
    material: 'Cerâmica',
    color: { name: 'Areia', hex: '#D9CBB4' },
    dimensions: { heightCm: 42, diameterCm: 14, weightKg: 1.3 },
    stockStatus: 'in_stock',
    featured: true,
    bestSellerRank: 6,
    createdAt: '2026-11-02',
    tags: ['sala', 'aparador'],
  },
```

### Exemplo mínimo (só os campos obrigatórios)

```ts
  {
    id: 'p-019',
    slug: 'bandeja-espelhada',
    name: 'Bandeja espelhada',
    description: 'Bandeja retangular com fundo espelhado.',
    price: 149,
    categoryId: 'objetos-decorativos',
    images: [],
    stockStatus: 'in_stock',
  },
```

Campos ausentes simplesmente não aparecem na loja — nada de "undefined" ou espaços vazios.
Sem imagens (`images: []`), a loja mostra um marcador neutro "Imagem em breve".

### Regras dos campos

| Campo | Obrigatório | Regra |
|---|---|---|
| `id` | sim | Único e **permanente**. Não reutilize o id de um produto apagado (carrinhos salvos usam o id). Sugestão: `p-001`, `p-002`… |
| `slug` | sim | Endereço da página: `/produto/<slug>`. Só letras minúsculas sem acento, números e hífens. Único. |
| `name` | sim | Nome exibido. |
| `description` | sim | Texto da página do produto (pode ser `''`). |
| `price` | sim | Preço atual em reais, **com ponto** como separador decimal: `1299.9` (= R$ 1.299,90). |
| `compareAtPrice` | não | Preço "de", exibido riscado. Só aparece se for **maior** que `price`. |
| `categoryId` | sim | O `id` de uma categoria existente em `categories.ts`. |
| `images` | sim | Lista de caminhos. A primeira é a principal. Use `[]` se não houver fotos. |
| `material` | não | Texto livre, ex.: `'Linho'`. Alimenta o filtro "Material". |
| `color` | não | `{ name: 'Areia', hex: '#D9CBB4' }`. O `hex` (amostra de cor) é opcional. Alimenta o filtro "Cor". |
| `dimensions` | não | Ver item 6. |
| `stockStatus` | sim | Ver item 7. |
| `featured` | não | `true` para aparecer em "Em destaque". |
| `bestSellerRank` | não | Posição em "Mais vendidos" (1 = primeiro). Preencha **com dados reais de venda**. |
| `createdAt` | não | Data de cadastro `'AAAA-MM-DD'`. Ordena "Novidades". |
| `tags` | não | Palavras extras para busca e para "produtos relacionados". |
| `model3d` | não | Ver item 9. |
| `isDemo` | não | `true` marca o produto como demonstração (mostra um aviso na página). Não use em produtos reais. |

## 2. Alterar nome e descrição

Edite `name` e `description` do bloco do produto. Se quiser também mudar o endereço da
página, altere o `slug` — lembre que links antigos para o endereço anterior deixarão de
funcionar.

## 3. Modificar preços

- Preço normal: `price: 189.9`
- Colocar em promoção: mantenha o preço original em `compareAtPrice` e o novo em `price`:
  `price: 159.9, compareAtPrice: 189.9` → a loja mostra ~~R$ 189,90~~ R$ 159,90 e a etiqueta "−16%".
- Encerrar a promoção: apague a linha `compareAtPrice`.

Não use `R$`, vírgula ou ponto de milhar: `1299.9` está certo; `'1.299,90'` está errado.

O carrinho sempre recalcula com o preço atual do catálogo, então uma mudança de preço vale
imediatamente para quem já tinha o produto no carrinho.

## 4. Cadastrar uma categoria

Em `src/data/categories.ts`, copie um bloco e ajuste:

```ts
  {
    id: 'tapetes',
    slug: 'tapetes',
    name: 'Tapetes',
    description: 'Tapetes em fibras naturais.',
    image: '/images/categories/tapetes.jpg',
    order: 7,
  },
```

- `order` define a posição no menu e na página inicial (menor primeiro).
- `image` é opcional: sem ela, o atalho usa a primeira foto de um produto da categoria.
- Depois, use `categoryId: 'tapetes'` nos produtos dessa categoria.
- Uma categoria **sem produtos** não aparece no menu nem nos atalhos (evita páginas vazias).
- Antes de apagar uma categoria, mova os produtos dela para outra.

### Coleções

Em `src/data/collections.ts`, cada coleção lista os produtos pelo `id`, na ordem de exibição:

```ts
  {
    id: 'varanda',
    slug: 'varanda',
    name: 'Varanda',
    description: 'Peças para áreas externas cobertas.',
    image: '/images/collections/varanda.jpg',
    productIds: ['p-003', 'p-009', 'p-018'],
  },
```

## 5. Adicionar ou substituir imagens

1. Salve o arquivo em `public/images/products/` (ou `categories/`, `collections/`).
2. No cadastro, escreva o caminho **a partir de `public`, começando com `/`**:
   o arquivo `public/images/products/vaso-garrafa-areia-1.jpg` vira
   `'/images/products/vaso-garrafa-areia-1.jpg'`.
3. Para substituir uma foto, você pode sobrescrever o arquivo com o **mesmo nome** (nada
   mais precisa mudar) ou salvar um novo arquivo e atualizar o caminho no cadastro.

**Recomendações**

| Item | Recomendação |
|---|---|
| Formato | **WebP** (melhor) ou JPG. PNG só se precisar de transparência. |
| Proporção | **4:5 (vertical)** para produtos e categorias, ex.: 1200 × 1500 px. **3:2** para coleções, ex.: 1500 × 1000 px. Fotos em outra proporção são recortadas pelo centro. |
| Tamanho | Até ~300 KB por foto. Lado maior entre 1200 e 1600 px. |
| Fundo | Claro e uniforme, com o produto centralizado e margem ao redor. Use o mesmo enquadramento em todas as fotos. |
| Nome do arquivo | `<slug>-<número>.<ext>`, sem espaços e sem acentos: `vaso-garrafa-areia-1.webp`, `vaso-garrafa-areia-2.webp`. |

A segunda imagem aparece quando o cursor passa sobre o cartão do produto, então ela
funciona bem como foto de ambiente ou de detalhe.

## 6. Medidas, cores e materiais

```ts
    material: 'Madeira de reflorestamento',
    color: { name: 'Nogueira', hex: '#8C6A4A' },
    dimensions: { widthCm: 48, depthCm: 30, heightCm: 4, weightKg: 1.2 },
```

Campos de medida disponíveis (todos opcionais, em **centímetros** e peso em **quilos**):
`widthCm` (largura), `heightCm` (altura), `depthCm` (profundidade), `diameterCm` (diâmetro),
`weightKg` (peso). Informe só o que foi medido; os demais ficam de fora.

Os filtros de **cor** e **material** do catálogo são montados automaticamente com os
valores cadastrados. Escreva os nomes sempre do mesmo jeito (`'Cerâmica'` e `'ceramica'`
virariam duas opções diferentes). Um filtro só aparece quando há pelo menos duas opções.

## 7. Alterar a disponibilidade

```ts
    stockStatus: 'in_stock',
```

| Valor | Na loja |
|---|---|
| `'in_stock'` | "Disponível" — pode comprar |
| `'low_stock'` | "Últimas unidades" — pode comprar |
| `'preorder'` | "Sob encomenda" — botão "Encomendar" |
| `'out_of_stock'` | "Esgotado" — sem botão de compra; bloqueia o checkout se já estiver no carrinho |

## 8. Destacar produtos

- `featured: true` → seção **Em destaque** da página inicial (os 4 primeiros) e topo de "Todos os produtos".
  O primeiro destaque com foto também ilustra a abertura da página inicial.
- `bestSellerRank: 1` → seção **Mais vendidos** (em ordem crescente). Use apenas com dados reais.
  Enquanto nenhum produto tiver esse campo, a seção e o link do menu ficam ocultos.
- `createdAt: '2026-11-02'` → **Lançamentos/Novidades** mostram os mais recentes primeiro.
  A quantidade na página inicial é definida em `newArrivalsLimit` (`store-config.ts`).
  O CSV do Wix não traz datas: enquanto nenhum produto tiver `createdAt`, a seção fica oculta.

## 9. Mídia 3D (para o futuro)

A galeria já está preparada para modelos 3D, mas o visualizador interativo ainda não foi
instalado. Você pode cadastrar o modelo agora e liberá-lo depois:

```ts
    model3d: {
      src: '/models/vaso-garrafa-areia.glb',
      format: 'glb',                 // 'glb', 'gltf' ou 'usdz'
      poster: '/images/products/vaso-garrafa-areia-1.jpg',
      available: false,              // mude para true quando o visualizador for ativado
      viewer: { autoRotate: true, arEnabled: true, iosSrc: '/models/vaso-garrafa-areia.usdz' },
    },
```

- Guarde os arquivos em `public/models/`.
- Com `available: false`, nada muda na loja.
- Com `available: true`, a galeria ganha uma miniatura "3D", que hoje mostra a imagem
  `poster` com o aviso "Visualização 3D em breve". Para ativar o visualizador de verdade,
  basta trocar o conteúdo de `src/components/product/Model3DSlot.tsx` — o cadastro e a página
  não mudam.
- Prefira **GLB** (um único arquivo), otimizado para a web (até ~5 MB).

## 10. Conferir as alterações

```bash
cd vitta
npm install          # apenas na primeira vez
npm run dev          # abre a loja em http://localhost:5173 e atualiza a cada salvamento
npm run check:catalog
```

`npm run check:catalog` confere o cadastro e aponta, em português, problemas como id ou slug
repetido, categoria inexistente, preço inválido, data fora do formato ou coleção apontando
para produto inexistente. Durante o `npm run dev`, os mesmos avisos aparecem no console do
navegador (F12).

Antes de publicar, rode também `npm run build` — ele falha se algum campo estiver com o tipo
errado (por exemplo, preço entre aspas).

## 11. O que não precisa (nem deve) ser alterado para mudar só o catálogo

Para editar produtos, categorias, coleções e imagens, mexa **apenas** em:

- `src/data/` (produtos, categorias, coleções)
- `src/config/store-config.ts` (contatos e textos institucionais)
- `public/images/` (fotos) e `public/brand/` (logo)

Não é necessário alterar:

- `src/components/`, `src/pages/`, `src/routes.tsx` — interface e páginas
- `src/lib/`, `src/state/` — busca, filtros, carrinho e checkout
- `src/types/` — só mude se for criar um **campo novo** no produto
- `src/styles/index.css` — cores e tipografia da marca (design tokens)
- `package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js` — configuração do projeto

## Erros comuns

| Sintoma | Causa provável |
|---|---|
| Página em branco ou erro no `npm run dev` | Faltou uma vírgula entre campos, ou uma aspa ficou aberta. O terminal indica a linha. |
| Imagem aparece como "Imagem em breve" | Caminho errado: confira se começa com `/images/...` e se o nome do arquivo é idêntico (maiúsculas contam). |
| Produto não aparece na categoria | `categoryId` não corresponde ao `id` da categoria. |
| Preço riscado não aparece | `compareAtPrice` não é maior que `price`. |
| Filtro de cor ou material sumiu | Há menos de duas opções diferentes cadastradas. |
