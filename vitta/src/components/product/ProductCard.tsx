import { Link } from 'react-router'
import type { Product } from '../../types/product'
import { getCategoryById } from '../../lib/catalog'
import { cx } from '../../lib/cx'
import { discountPercent, isPurchasable, stockLabels } from '../../lib/product'
import { Icon } from '../ui/Icon'
import { Price } from '../ui/Price'
import { Tag } from '../ui/StockBadge'
import { ProductImage } from './ProductImage'
import { useAddToCart } from './useAddToCart'

interface ProductCardProps {
  product: Product
  priority?: boolean
  /** Nível do título, para manter a hierarquia correta em cada seção. */
  headingLevel?: 'h2' | 'h3'
}

export function ProductCard({ product, priority, headingLevel: Heading = 'h3' }: ProductCardProps) {
  const addToCart = useAddToCart()
  const category = getCategoryById(product.categoryId)
  const discount = discountPercent(product)
  const purchasable = isPurchasable(product)
  const href = `/produto/${product.slug}`
  const [first, second] = product.images

  const badge =
    product.stockStatus === 'out_of_stock' || product.stockStatus === 'preorder'
      ? { text: stockLabels[product.stockStatus], tone: 'muted' as const }
      : discount
        ? { text: `−${discount}%`, tone: 'accent' as const }
        : product.stockStatus === 'low_stock'
          ? { text: stockLabels.low_stock, tone: 'neutral' as const }
          : null

  return (
    <article className="group relative flex w-full flex-col" data-testid="product-card">
      <div className="relative overflow-hidden rounded-md bg-cream">
        <div className="aspect-[4/5]">
          <ProductImage
            src={first}
            alt=""
            priority={priority}
            className={cx(
              'transition-transform duration-700 ease-soft group-hover:scale-[1.03]',
              !purchasable && 'opacity-80 grayscale-[30%]',
            )}
          />
          {second && (
            <span className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <ProductImage src={second} alt="" />
            </span>
          )}
        </div>
        {badge && (
          <div className="pointer-events-none absolute left-3 top-3">
            <Tag tone={badge.tone}>{badge.text}</Tag>
          </div>
        )}
        {purchasable && (
          <button
            type="button"
            onClick={() => addToCart(product)}
            aria-label={`Adicionar ${product.name} ao carrinho`}
            title="Adicionar ao carrinho"
            className="absolute bottom-3 right-3 z-10 grid size-11 place-items-center rounded-full bg-ivory/95 text-ink shadow-soft transition-[opacity,transform,background-color] duration-300 hover:bg-cocoa hover:text-ivory focus-visible:opacity-100 sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100"
          >
            <Icon name="plus" className="size-[1.125rem]" />
          </button>
        )}
      </div>
      <div className="mt-3.5 flex flex-1 flex-col gap-1">
        {category && <p className="eyebrow">{category.name}</p>}
        <Heading className="font-sans text-[0.9375rem] font-normal leading-snug text-ink">
          <Link to={href} className="after:absolute after:inset-0 after:content-[''] hover:underline hover:decoration-linen hover:underline-offset-4 focus-visible:outline-none focus-visible:after:rounded-md focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-cocoa">
            {product.name}
          </Link>
        </Heading>
        <Price product={product} />
      </div>
    </article>
  )
}
