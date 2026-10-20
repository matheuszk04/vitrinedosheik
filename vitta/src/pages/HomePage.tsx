import { Link } from 'react-router'
import { cx } from '../lib/cx'
import { storeConfig } from '../config/store-config'
import { PageMeta } from '../components/layout/PageMeta'
import { StoreInfo } from '../components/layout/StoreInfo'
import { CategoryTiles } from '../components/product/CategoryTiles'
import { CollectionCard } from '../components/product/CollectionCard'
import { ProductGrid } from '../components/product/ProductGrid'
import { ProductRail } from '../components/product/ProductRail'
import { ProductImage } from '../components/product/ProductImage'
import { ButtonLink } from '../components/ui/Button'
import { SectionHeader } from '../components/ui/SectionHeader'
import {
  allCollections,
  getBestSellers,
  getCategoriesWithProducts,
  getFeatured,
  getNewArrivals,
} from '../lib/catalog'

export function HomePage() {
  const newArrivals = getNewArrivals(storeConfig.newArrivalsLimit)
  const bestSellers = getBestSellers()
  const featured = getFeatured().slice(0, 8)
  const categories = getCategoriesWithProducts()
  // A abertura só ganha imagem quando há um destaque com foto.
  const spotlight = featured.find((p) => p.images[0])

  return (
    <>
      <PageMeta description={storeConfig.tagline} />

      {/* Destaque editorial compacto — não compete com o catálogo. */}
      <section aria-labelledby="boas-vindas" className="container-site pt-8 md:pt-12">
        <div className={cx('grid items-end gap-8 border-b border-line pb-10 md:gap-14 md:pb-12', spotlight && 'md:grid-cols-[1.3fr_1fr]')}>
          <div className="animate-rise">
            <p className="eyebrow mb-4">Decoração minimalista</p>
            <h1 id="boas-vindas" className="text-display">
              Peças simples para uma casa <em className="font-medium text-cocoa">com calma.</em>
            </h1>
            <p className="mt-5 max-w-md text-stone">
              Luminárias, vasos, esculturas e objetos escolhidos para dar personalidade à casa.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink to="/produtos" size="lg">
                Ver todos os produtos
              </ButtonLink>
              {newArrivals.length > 0 && (
                <ButtonLink to="/novidades" variant="secondary" size="lg">
                  Novidades
                </ButtonLink>
              )}
            </div>
          </div>
          {spotlight && (
            <Link
              to={`/produto/${spotlight.slug}`}
              className="group relative hidden aspect-[5/4] overflow-hidden rounded-lg bg-cream md:block md:max-h-80"
            >
              <ProductImage
                src={spotlight.images[0]}
                alt=""
                priority
                className="transition-transform duration-700 ease-soft group-hover:scale-[1.03]"
              />
              <span className="absolute bottom-3 left-3 rounded-sm bg-ivory/95 px-3 py-2 text-xs text-ink shadow-soft">
                <span className="eyebrow mr-2">Em destaque</span>
                {spotlight.name}
              </span>
            </Link>
          )}
        </div>
      </section>

      {categories.length > 0 && (
        <section aria-labelledby="categorias" className="container-site pt-10 md:pt-12">
          <SectionHeader id="categorias" title="Categorias" link={{ to: '/categorias', label: 'Ver todas' }} />
          <CategoryTiles categories={categories} label="Categorias" />
        </section>
      )}

      {/* Seções sem dados (sem datas de cadastro ou ranking de vendas) ficam ocultas. */}
      {newArrivals.length > 0 && (
        <section aria-labelledby="novidades" className="container-site pt-section">
          <SectionHeader id="novidades" eyebrow="Recém-chegados" title="Lançamentos" link={{ to: '/novidades', label: 'Ver novidades' }} />
          <ProductRail products={newArrivals} label="Lançamentos" priority />
        </section>
      )}

      {bestSellers.length > 0 && (
        <section aria-labelledby="mais-vendidos" className="container-site pt-section">
          <SectionHeader id="mais-vendidos" eyebrow="Os preferidos" title="Mais vendidos" link={{ to: '/mais-vendidos', label: 'Ver lista completa' }} />
          <ProductRail products={bestSellers} label="Mais vendidos" />
        </section>
      )}

      {featured.length > 0 && (
        <section aria-labelledby="destaques" className="container-site pt-section">
          <SectionHeader id="destaques" eyebrow="Seleção VITTA" title="Em destaque" link={{ to: '/produtos', label: 'Ver todos' }} />
          <ProductGrid products={featured} columns="four" label="Produtos em destaque" />
        </section>
      )}

      {allCollections.length > 0 && (
        <section aria-labelledby="colecoes" className="container-site pt-section">
          <SectionHeader
            id="colecoes"
            eyebrow="Ambientes"
            title="Coleções"
            description="Composições pensadas para funcionar juntas."
            link={{ to: '/colecoes', label: 'Ver coleções' }}
          />
          <ul className="grid gap-x-6 gap-y-10 md:grid-cols-3">
            {allCollections.map((c) => (
              <li key={c.id}>
                <CollectionCard collection={c} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="informacoes" className="container-site pt-section">
        <h2 id="informacoes" className="sr-only">
          Informações da loja
        </h2>
        <div className="rounded-lg border border-line bg-cream/50 px-6 py-8 md:px-10 md:py-10">
          <StoreInfo />
        </div>
      </section>
    </>
  )
}
