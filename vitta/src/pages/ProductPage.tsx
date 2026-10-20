import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { storeConfig } from '../config/store-config'
import { PageMeta } from '../components/layout/PageMeta'
import { StoreInfo } from '../components/layout/StoreInfo'
import { ProductGallery } from '../components/product/ProductGallery'
import { ProductGrid } from '../components/product/ProductGrid'
import { useAddToCart } from '../components/product/useAddToCart'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { Price } from '../components/ui/Price'
import { QuantityStepper } from '../components/ui/QuantityStepper'
import { StockStatusText, Tag } from '../components/ui/StockBadge'
import { SectionHeader } from '../components/ui/SectionHeader'
import { getCategoryById, getProductBySlug, getRelatedProducts } from '../lib/catalog'
import { describeDimensions, discountPercent, isPurchasable } from '../lib/product'
import { useCart } from '../state/cart-context'
import type { Product } from '../types/product'
import { NotFoundPage } from './NotFoundPage'

export function ProductPage() {
  const { slug = '' } = useParams()
  const product = getProductBySlug(slug)
  if (!product) return <NotFoundPage message="Este produto não existe ou foi removido do catálogo." />
  // `key` reinicia quantidade e galeria ao navegar entre produtos.
  return <ProductDetail key={product.id} product={product} />
}

function ProductDetail({ product }: { product: Product }) {
  const category = getCategoryById(product.categoryId)
  const related = getRelatedProducts(product, 4)
  const purchasable = isPurchasable(product)
  const discount = discountPercent(product)
  const dimensions = describeDimensions(product.dimensions)
  const addToCart = useAddToCart()
  const { getQuantity } = useCart()
  const inCart = getQuantity(product.id)
  const room = Math.max(storeConfig.maxQuantityPerItem - inCart, 0)
  const [quantity, setQuantity] = useState(1)
  const [confirmation, setConfirmation] = useState<string | null>(null)

  const details: Array<{ label: string; value: React.ReactNode }> = [
    ...(category ? [{ label: 'Categoria', value: <Link to={`/categorias/${category.slug}`} className="underline decoration-linen underline-offset-4 hover:decoration-cocoa">{category.name}</Link> }] : []),
    ...(product.material ? [{ label: 'Material', value: product.material }] : []),
    ...(product.color
      ? [
          {
            label: 'Cor',
            value: (
              <span className="inline-flex items-center gap-2">
                {product.color.hex && <span aria-hidden="true" className="size-3.5 rounded-full border border-ink/10" style={{ background: product.color.hex }} />}
                {product.color.name}
              </span>
            ),
          },
        ]
      : []),
    ...dimensions,
  ]

  const handleAdd = () => {
    const added = addToCart(product, Math.min(quantity, room))
    if (added > 0) {
      setConfirmation(`${added} ${added === 1 ? 'unidade adicionada' : 'unidades adicionadas'} ao carrinho.`)
      setQuantity(1)
    }
  }

  return (
    <div className="container-site pt-6 md:pt-8">
      <PageMeta title={product.name} description={product.description} />
      <Breadcrumbs
        items={[
          { label: 'Início', to: '/' },
          ...(category ? [{ label: category.name, to: `/categorias/${category.slug}` }] : [{ label: 'Produtos', to: '/produtos' }]),
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-8 md:mt-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-10 lg:grid-cols-[minmax(0,40rem)_minmax(0,1fr)] lg:gap-16">
        <ProductGallery product={product} />

        <div className="md:sticky md:top-[calc(var(--spacing-header)+1.5rem)] md:self-start">
          {category && <p className="eyebrow mb-3">{category.name}</p>}
          <h1 className="text-title md:text-[2.75rem] md:leading-[1.05]">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Price product={product} size="lg" />
            {discount && <Tag tone="accent">{`−${discount}%`}</Tag>}
          </div>
          <StockStatusText status={product.stockStatus} className="mt-3" />

          <p className="mt-6 text-stone">{product.description}</p>

          <div className="mt-8 border-t border-line pt-6">
            {purchasable ? (
              <>
                <div className="flex flex-wrap items-stretch gap-3">
                  <QuantityStepper
                    value={Math.min(quantity, Math.max(room, 1))}
                    onChange={setQuantity}
                    max={Math.max(room, 1)}
                    label={product.name}
                    disabled={room === 0}
                  />
                  <Button size="lg" className="flex-1" onClick={handleAdd} disabled={room === 0}>
                    <Icon name="bag" className="size-[1.125rem]" />
                    {product.stockStatus === 'preorder' ? 'Encomendar' : 'Adicionar ao carrinho'}
                  </Button>
                </div>
                <div aria-live="polite" className="min-h-6">
                  {confirmation && (
                    <p className="mt-3 flex animate-rise items-center gap-2 text-sm text-success">
                      <Icon name="check" className="size-4" />
                      {confirmation}
                      <Link to="/carrinho" className="font-medium text-cocoa underline underline-offset-4">
                        Ver carrinho
                      </Link>
                    </p>
                  )}
                  {!confirmation && room === 0 && (
                    <p className="mt-3 text-sm text-stone">
                      Você já tem o limite de {storeConfig.maxQuantityPerItem} unidades no carrinho.
                    </p>
                  )}
                </div>
                {product.stockStatus === 'preorder' && (
                  <p className="text-xs text-stone">Produto sob encomenda: o prazo será informado no atendimento.</p>
                )}
              </>
            ) : (
              <div className="rounded-md bg-cream px-4 py-4 text-sm text-stone">
                Produto esgotado no momento. <Link to="/contato" className="font-medium text-cocoa underline underline-offset-4">Fale conosco</Link> para saber sobre reposição.
              </div>
            )}
          </div>

          {details.length > 0 && (
            <section aria-labelledby="detalhes" className="mt-8">
              <h2 id="detalhes" className="eyebrow mb-3 font-sans">
                Detalhes
              </h2>
              <dl className="divide-y divide-line border-y border-line text-sm">
                {details.map((d) => (
                  <div key={d.label} className="flex justify-between gap-6 py-3">
                    <dt className="text-stone">{d.label}</dt>
                    <dd className="text-right text-ink">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {product.isDemo && (
            <p className="mt-6 flex gap-2 rounded-md border border-line px-4 py-3 text-xs text-stone">
              <Icon name="info" className="size-4 shrink-0" />
              Produto de demonstração: nome, preço, medidas e imagens são ilustrativos.
            </p>
          )}

          <div className="mt-8">
            <StoreInfo compact />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="relacionados" className="pt-section">
          <SectionHeader id="relacionados" title="Você também pode gostar" />
          <ProductGrid products={related} columns="four" label="Produtos relacionados" />
        </section>
      )}
    </div>
  )
}
