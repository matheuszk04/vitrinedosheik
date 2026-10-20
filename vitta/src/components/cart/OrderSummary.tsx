import type { ReactNode } from 'react'
import type { CartLine } from '../../state/cart'
import { formatPrice, pluralize } from '../../lib/format'

interface OrderSummaryProps {
  lines: CartLine[]
  totalUnits: number
  subtotal: number
  showLines?: boolean
  children?: ReactNode
}

export function OrderSummary({ lines, totalUnits, subtotal, showLines, children }: OrderSummaryProps) {
  return (
    <section aria-labelledby="resumo" className="rounded-lg border border-line bg-cream/50 p-6">
      <h2 id="resumo" className="text-2xl">
        Resumo
      </h2>
      {showLines && (
        <ul className="mt-5 space-y-3 border-b border-line pb-5 text-sm">
          {lines.map((l) => (
            <li key={l.product.id} className="flex justify-between gap-4">
              <span className="text-ink">
                {l.product.name} <span className="text-stone">× {l.quantity}</span>
                {!l.purchasable && <span className="block text-xs text-danger">Indisponível — não incluído</span>}
              </span>
              <span className="shrink-0 tabular-nums text-ink">{formatPrice(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
      )}
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-stone">Itens</dt>
          <dd className="tabular-nums" data-testid="summary-units">{pluralize(totalUnits, 'unidade', 'unidades')}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-stone">Subtotal</dt>
          <dd className="tabular-nums" data-testid="summary-subtotal">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-stone">Entrega</dt>
          <dd className="text-stone">A definir</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-4 text-base">
          <dt className="font-medium text-ink">Total</dt>
          <dd className="font-medium tabular-nums text-ink" data-testid="summary-total">{formatPrice(subtotal)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-stone">Valor sem entrega. Nesta demonstração não há cálculo de frete.</p>
      {children && <div className="mt-6">{children}</div>}
    </section>
  )
}
