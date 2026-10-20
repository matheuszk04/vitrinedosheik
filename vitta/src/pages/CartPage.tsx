import { Link } from 'react-router'
import { storeConfig } from '../config/store-config'
import { OrderSummary } from '../components/cart/OrderSummary'
import { PageMeta } from '../components/layout/PageMeta'
import { ProductImage } from '../components/product/ProductImage'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { ButtonLink } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/ui/Icon'
import { QuantityStepper } from '../components/ui/QuantityStepper'
import { formatPrice } from '../lib/format'
import { stockLabels } from '../lib/product'
import { useCart } from '../state/cart-context'

export function CartPage() {
  const { lines, totalUnits, subtotal, hasUnavailable, setQuantity, removeItem, prunedCount } = useCart()

  return (
    <div className="container-site pt-6 md:pt-8">
      <PageMeta title="Carrinho" />
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Carrinho' }]} />
      <h1 className="mt-6 text-display md:mt-8">Carrinho</h1>

      {prunedCount > 0 && (
        <p role="status" className="mt-6 flex items-center gap-2 rounded-md bg-warning-soft px-4 py-3 text-sm text-warning">
          <Icon name="info" className="size-4 shrink-0" />
          {prunedCount === 1 ? 'Um item salvo' : `${prunedCount} itens salvos`} no carrinho não estão mais no catálogo e foram removidos.
        </p>
      )}

      {lines.length === 0 ? (
        <EmptyState
          icon="bag"
          className="mt-10"
          title="Seu carrinho está vazio"
          action={<ButtonLink to="/produtos">Explorar produtos</ButtonLink>}
        >
          Os produtos que você adicionar ficam guardados neste navegador.
        </EmptyState>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
          <section aria-labelledby="itens">
            <h2 id="itens" className="sr-only">
              Itens no carrinho
            </h2>
            <ul className="divide-y divide-line border-y border-line">
              {lines.map(({ product, quantity, unitPrice, lineTotal, purchasable }) => (
                <li key={product.id} className="grid grid-cols-[5.5rem_1fr] gap-4 py-6 sm:grid-cols-[7rem_1fr] sm:gap-6" data-testid="cart-line">
                  <Link to={`/produto/${product.slug}`} className="block aspect-[4/5] overflow-hidden rounded-md bg-cream" tabIndex={-1} aria-hidden="true">
                    <ProductImage src={product.images[0]} alt="" />
                  </Link>
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-sans text-[0.9375rem] font-normal text-ink">
                        <Link to={`/produto/${product.slug}`} className="hover:underline hover:underline-offset-4">
                          {product.name}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm tabular-nums text-stone">{formatPrice(unitPrice)} cada</p>
                      {!purchasable && (
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-danger">
                          <Icon name="alert" className="size-3.5" />
                          {stockLabels[product.stockStatus]} — remova para continuar
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <QuantityStepper
                          size="sm"
                          value={quantity}
                          max={storeConfig.maxQuantityPerItem}
                          onChange={(q) => setQuantity(product.id, q)}
                          label={product.name}
                          disabled={!purchasable}
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(product.id)}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-sm px-2 text-xs text-stone hover:bg-cream hover:text-ink"
                          aria-label={`Remover ${product.name} do carrinho`}
                        >
                          <Icon name="trash" className="size-4" />
                          Remover
                        </button>
                      </div>
                    </div>
                    <p className="text-[0.9375rem] font-medium tabular-nums text-ink sm:text-right" data-testid="line-total">
                      <span className="sr-only">Subtotal do item: </span>
                      {formatPrice(lineTotal)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/produtos" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-cocoa underline decoration-linen underline-offset-4 hover:decoration-cocoa">
              <Icon name="chevron-left" className="size-4" />
              Continuar comprando
            </Link>
          </section>

          <div className="lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)] lg:self-start">
            <OrderSummary lines={lines} totalUnits={totalUnits} subtotal={subtotal}>
              {hasUnavailable ? (
                <p className="text-sm text-danger">Remova os itens indisponíveis para continuar.</p>
              ) : (
                <ButtonLink to="/checkout" size="lg" className="w-full">
                  Continuar para o checkout
                </ButtonLink>
              )}
              <p className="mt-3 text-center text-xs text-stone">Checkout demonstrativo — nenhuma cobrança é feita.</p>
            </OrderSummary>
          </div>
        </div>
      )}
    </div>
  )
}
