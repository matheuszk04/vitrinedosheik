import { Link, useParams } from 'react-router'
import { CatalogView } from '../components/catalog/CatalogView'
import { PageMeta } from '../components/layout/PageMeta'
import { CollectionCard } from '../components/product/CollectionCard'
import { ProductGrid } from '../components/product/ProductGrid'
import { ProductImage } from '../components/product/ProductImage'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { EmptyState } from '../components/ui/EmptyState'
import {
  allCollections,
  allProducts,
  getBestSellers,
  getCategoriesWithProducts,
  getCategoryBySlug,
  getCategoryProducts,
  getCollectionBySlug,
  getCollectionProducts,
  getFeatured,
  getNewArrivals,
} from '../lib/catalog'
import { pluralize } from '../lib/format'
import { NotFoundPage } from './NotFoundPage'

const home = { label: 'Início', to: '/' }

export function ProductsPage() {
  // "Recomendados": destaques primeiro, depois a ordem do cadastro.
  const featured = getFeatured()
  const ordered = [...featured, ...allProducts.filter((p) => !p.featured)]
  return (
    <>
      <PageMeta title="Todos os produtos" description="Catálogo completo de decoração da VITTA." />
      <CatalogView title="Todos os produtos" breadcrumbs={[home, { label: 'Produtos' }]} products={ordered} />
    </>
  )
}

export function NewArrivalsPage() {
  const products = getNewArrivals(Number.POSITIVE_INFINITY)
  return (
    <>
      <PageMeta title="Novidades" description="Os produtos cadastrados mais recentemente na VITTA." />
      <CatalogView
        title="Novidades"
        eyebrow="Recém-chegados"
        description="Do mais recente ao mais antigo."
        breadcrumbs={[home, { label: 'Novidades' }]}
        products={products}
        defaultSort="newest"
      />
    </>
  )
}

export function BestSellersPage() {
  return (
    <>
      <PageMeta title="Mais vendidos" />
      <CatalogView
        title="Mais vendidos"
        eyebrow="Os preferidos"
        description="Ordem definida pela loja a partir do histórico de vendas."
        breadcrumbs={[home, { label: 'Mais vendidos' }]}
        products={getBestSellers()}
      />
    </>
  )
}

export function CategoryPage() {
  const { slug = '' } = useParams()
  const category = getCategoryBySlug(slug)
  if (!category) return <NotFoundPage message="Esta categoria não existe ou foi removida." />
  return (
    <>
      <PageMeta title={category.name} description={category.description} />
      <CatalogView
        key={category.id}
        title={category.name}
        eyebrow="Categoria"
        description={category.description}
        breadcrumbs={[home, { label: 'Categorias', to: '/categorias' }, { label: category.name }]}
        products={getCategoryProducts(category.id)}
        hideCategoryFilter
      />
    </>
  )
}

export function CategoriesPage() {
  const categories = getCategoriesWithProducts()
  return (
    <div className="container-site pt-6 md:pt-8">
      <PageMeta title="Categorias" />
      <Breadcrumbs items={[home, { label: 'Categorias' }]} />
      <h1 className="mt-6 text-display md:mt-8">Categorias</h1>
      {categories.length === 0 ? (
        <EmptyState className="mt-10" title="Nenhuma categoria com produtos" />
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
          {categories.map((c) => (
            <li key={c.id}>
              <Link to={`/categorias/${c.slug}`} className="group block">
                <span className="block aspect-[4/3] overflow-hidden rounded-md bg-cream">
                  <ProductImage src={c.image} alt="" className="transition-transform duration-700 ease-soft group-hover:scale-[1.03]" />
                </span>
                <span className="mt-4 flex items-baseline justify-between gap-3">
                  <span className="font-serif text-2xl text-ink">{c.name}</span>
                  <span className="text-xs text-stone">{pluralize(getCategoryProducts(c.id).length, 'produto', 'produtos')}</span>
                </span>
                {c.description && <span className="mt-1 block text-sm text-stone">{c.description}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function CollectionsPage() {
  return (
    <div className="container-site pt-6 md:pt-8">
      <PageMeta title="Coleções" />
      <Breadcrumbs items={[home, { label: 'Coleções' }]} />
      <header className="mt-6 max-w-prose md:mt-8">
        <h1 className="text-display">Coleções</h1>
        <p className="mt-3 text-stone">Composições de ambientes com peças que funcionam juntas.</p>
      </header>
      {allCollections.length === 0 ? (
        <EmptyState className="mt-10" title="Coleções em breve" />
      ) : (
        <ul className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
          {allCollections.map((c) => (
            <li key={c.id}>
              <CollectionCard collection={c} headingLevel="h2" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function CollectionPage() {
  const { slug = '' } = useParams()
  const collection = getCollectionBySlug(slug)
  if (!collection) return <NotFoundPage message="Esta coleção não existe ou foi removida." />
  const products = getCollectionProducts(collection)
  return (
    <div className="container-site pt-6 md:pt-8">
      <PageMeta title={collection.name} description={collection.description} />
      <Breadcrumbs items={[home, { label: 'Coleções', to: '/colecoes' }, { label: collection.name }]} />
      <header className="mt-6 grid items-end gap-8 md:mt-8 md:grid-cols-2">
        <div>
          <p className="eyebrow mb-3">Coleção</p>
          <h1 className="text-display">{collection.name}</h1>
          <p className="mt-3 max-w-prose text-stone">{collection.description}</p>
        </div>
        {collection.image && (
          <div className="aspect-[3/2] overflow-hidden rounded-lg bg-cream">
            <ProductImage src={collection.image} alt="" priority />
          </div>
        )}
      </header>
      <div className="mt-12">
        {products.length ? (
          <ProductGrid products={products} headingLevel="h2" label={`Produtos da coleção ${collection.name}`} />
        ) : (
          <EmptyState title="Coleção sem produtos">Os produtos desta coleção ainda não foram cadastrados.</EmptyState>
        )}
      </div>
    </div>
  )
}
