# VITTA — loja de decoração (protótipo)

Protótipo funcional de e-commerce de decoração minimalista: catálogo com busca e filtros,
página de produto, carrinho persistente no navegador e checkout **simulado**.
Roda localmente, sem back-end e sem serviços externos.

> O catálogo tem os 20 produtos importados do Wix, **ainda sem fotos**. O checkout é
> simulado: nenhuma compra, cobrança ou pedido real acontece. Veja [Limitações](#limitações).

## Executar

Requer **Node.js 22.22 ou superior** (exigência do React Router 8 e do Vitest 5).

```bash
cd vitta
npm install
npm run dev        # http://localhost:5173
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com recarga automática |
| `npm run build` | Checagem de tipos + build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run typecheck` | Só a checagem de tipos (TypeScript) |
| `npm run lint` | ESLint |
| `npm test` | Testes unitários e de integração (Vitest + Testing Library) |
| `npm run check:catalog` | Valida os dados do catálogo |
| `npm run test:e2e` | Testes de navegador (Playwright) em desktop e celular. Na primeira vez: `npx playwright install chromium` |

## Editar produtos, categorias e imagens

Guia completo em **[docs/EDITAR-CATALOGO.md](docs/EDITAR-CATALOGO.md)**.

- Produtos: `src/data/products.ts`
- Categorias: `src/data/categories.ts`
- Coleções: `src/data/collections.ts`
- Contatos, redes sociais, textos de entrega/trocas e aviso de protótipo: `src/config/store-config.ts`
- Imagens: `public/images/{products,categories,collections}/`
- Logo: `public/brand/` — caminhos em `src/config/brand.ts`. Os arquivos originais enviados
  estão em `brand-src/`; `brand-src/prepare-logo.py` recorta e remove o fundo sem redesenhar a marca.

## Stack e decisões

| Escolha | Por quê |
|---|---|
| **React 19 + TypeScript** | Componentes reutilizáveis e um modelo de dados tipado: erros de cadastro aparecem no build. |
| **Vite** | Build rápido e simples para uma loja sem servidor. Next.js foi descartado nesta fase porque não há back-end, SSR ou SEO dinâmico a justificar a complexidade; a migração continua possível, já que páginas e dados são independentes do roteador. |
| **React Router** | Rotas reais e compartilháveis (`/produto/<slug>`, `/categorias/<slug>`, filtros na URL). |
| **Tailwind CSS v4** | Design tokens declarados uma única vez em `src/styles/index.css` (`@theme`) e usados como classes em toda a interface. |
| **Context + `useReducer`** | Estado do carrinho centralizado sem biblioteca extra; o reducer é puro e testado isoladamente. |
| **Fontes locais (Fontsource)** | Inter e Cormorant Garamond empacotadas no build: nada depende de serviços externos. |
| **Vitest, Testing Library, Playwright** | Unidade, integração e navegador real (desktop e celular). |

Ícones são SVGs próprios (`src/components/ui/Icon.tsx`), sem dependência adicional.

## Estrutura

```
vitta/
├── brand-src/                 logos originais + script de preparo
├── docs/EDITAR-CATALOGO.md    guia de edição do catálogo
├── e2e/                       testes Playwright
├── scripts/                   importador do catálogo do Wix + CSV original
├── public/
│   ├── brand/                 logo oficial (horizontal, símbolo, favicons)
│   └── images/                products/ categories/ collections/
└── src/
    ├── config/                brand.ts, store-config.ts
    ├── data/                  products.ts, categories.ts, collections.ts  ← catálogo
    ├── types/                 product.ts, catalog.ts                      ← modelo de dados
    ├── lib/                   catálogo, busca/filtros, formatação, checkout, validação
    ├── state/                 carrinho (reducer, persistência, provider) e avisos
    ├── components/
    │   ├── layout/            cabeçalho, busca, menu lateral, rodapé
    │   ├── ui/                botões, campos, drawer, ícones, logo…
    │   ├── product/           cartão, grade, carrossel, galeria, slot 3D
    │   ├── catalog/           visão do catálogo e painel de filtros
    │   └── cart/              resumo do pedido
    ├── pages/                 uma página por rota
    ├── routes.tsx             mapa de rotas
    └── styles/index.css       design tokens e estilos base
```

### Rotas

`/` · `/produtos` · `/novidades` · `/mais-vendidos` · `/categorias` · `/categorias/:slug` ·
`/colecoes` · `/colecoes/:slug` · `/produto/:slug` · `/carrinho` · `/checkout` ·
`/checkout/confirmacao` · `/perfil` · `/sobre` · `/contato` · qualquer outra → página 404.

### Pontos de extensão

- **Back-end / API:** os componentes acessam o catálogo apenas por `src/lib/catalog.ts`.
  Trocar os arquivos de dados por uma API significa mudar esse módulo.
- **Pedidos reais:** `src/pages/CheckoutPage.tsx` monta um objeto de simulação em `onSubmit`;
  é ali que entraria a chamada ao servidor e ao gateway de pagamento.
- **Contas de cliente:** `/perfil` é apenas ilustrativo. Não há login nem armazenamento de credenciais.
- **3D:** `Product.model3d` + `src/components/product/Model3DSlot.tsx`.
- **Publicação em subpasta:** use `vite build --base=/caminho/`. Imagens e rotas respeitam a
  base automaticamente (`src/lib/asset.ts`). O servidor precisa redirecionar rotas
  desconhecidas para `index.html` (aplicação de página única).

## Limitações

- Fotos dos produtos ainda não importadas (veja `docs/EDITAR-CATALOGO.md`). Não há medidas,
  cores, datas de cadastro nem ranking de vendas no CSV; coleções ainda não foram cadastradas.
- Checkout **simulado**: sem pagamento, sem frete, sem pedido, sem e-mail. A referência
  exibida (`DEMO-XXXXXX`) é fictícia.
- O carrinho fica no `localStorage` **deste navegador**: não é seguro, não sincroniza entre
  dispositivos e não reserva estoque.
- Contatos, redes sociais e políticas de entrega e trocas estão como **provisórios** em `store-config.ts`.
- Sem visualizador 3D (apenas a estrutura preparada).
- Sem back-end, painel administrativo, autenticação ou SEO com renderização no servidor.

## Próximos passos para uma loja real

1. Importar as fotos dos produtos e completar medidas e materiais.
2. Preencher contatos, redes sociais e as políticas de entrega e trocas.
3. Levar o catálogo para um CMS ou banco de dados com painel administrativo e expor uma API.
4. Criar pedidos e estoque no servidor; integrar um gateway de pagamento (Pix e cartão) e o cálculo de frete.
5. Adicionar contas de cliente com um provedor de autenticação.
6. Avaliar Next.js ou pré-renderização para SEO (metadados por produto, sitemap, dados estruturados).
7. Adicionar analytics com consentimento (LGPD), políticas de privacidade e termos de uso.
8. Ativar o visualizador 3D (ex.: `<model-viewer>` carregado sob demanda) para os produtos com modelo.
