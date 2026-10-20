import type { Product } from '../../types/product'
import { cx } from '../../lib/cx'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: readonly Product[]
  /** Quantos cartões iniciais carregam sem lazy loading. */
  priorityCount?: number
  /** default: 2/3/4 colunas · four: 2/4 colunas (fileira única no desktop) */
  columns?: 'default' | 'four'
  headingLevel?: 'h2' | 'h3'
  label?: string
}

export function ProductGrid({ products, priorityCount = 0, columns = 'default', headingLevel, label }: ProductGridProps) {
  return (
    <ul
      aria-label={label}
      className={cx(
        'grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:gap-y-12',
        columns === 'default' ? 'md:grid-cols-3 xl:grid-cols-4' : 'lg:grid-cols-4',
      )}
    >
      {products.map((product, i) => (
        <li key={product.id} className="flex">
          <ProductCard product={product} priority={i < priorityCount} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  )
}
