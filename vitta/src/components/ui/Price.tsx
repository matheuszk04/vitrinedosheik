import type { Product } from '../../types/product'
import { cx } from '../../lib/cx'
import { formatPrice } from '../../lib/format'
import { isOnSale } from '../../lib/product'

interface PriceProps {
  product: Pick<Product, 'price' | 'compareAtPrice'>
  size?: 'sm' | 'lg'
  className?: string
}

export function Price({ product, size = 'sm', className }: PriceProps) {
  const sale = isOnSale(product)
  return (
    <p className={cx('flex flex-wrap items-baseline gap-x-2', className)}>
      {sale && (
        <span className="sr-only">Preço promocional:</span>
      )}
      <span className={cx('font-medium tabular-nums text-ink', size === 'lg' ? 'text-2xl' : 'text-[0.9375rem]')}>
        {formatPrice(product.price)}
      </span>
      {sale && (
        <>
          <span className="sr-only">Preço anterior:</span>
          <s className={cx('tabular-nums text-stone', size === 'lg' ? 'text-base' : 'text-[0.8125rem]')}>
            {formatPrice(product.compareAtPrice!)}
          </s>
        </>
      )}
    </p>
  )
}
