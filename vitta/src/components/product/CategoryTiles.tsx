import { Link } from 'react-router'
import type { Category } from '../../types/catalog'
import { getCategoryImage } from '../../lib/catalog'
import { cx } from '../../lib/cx'

// Colunas no desktop conforme a quantidade de categorias (até 6), sem sobrar espaço vazio.
const desktopColumns = ['', 'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4', 'lg:grid-cols-5', 'lg:grid-cols-6']
import { ProductImage } from './ProductImage'

/** Atalhos visuais para categorias; rolam horizontalmente no celular. */
export function CategoryTiles({ categories, label }: { categories: Category[]; label: string }) {
  return (
    <ul
      aria-label={label}
      className={cx(
        'scrollbar-none -mx-gutter flex snap-x gap-3 overflow-x-auto px-gutter pb-1 sm:gap-4 lg:mx-0 lg:grid lg:overflow-visible lg:px-0',
        desktopColumns[Math.min(categories.length, 6)],
      )}
    >
      {categories.map((c) => (
        <li key={c.id} className="w-[38%] shrink-0 snap-start sm:w-[24%] lg:w-auto">
          <Link to={`/categorias/${c.slug}`} className="group block">
            <span className={cx('block overflow-hidden rounded-md bg-cream', categories.length <= 4 ? 'aspect-[4/3]' : 'aspect-[4/5]')}>
              <ProductImage
                src={getCategoryImage(c)}
                alt=""
                className="transition-transform duration-700 ease-soft group-hover:scale-[1.04]"
              />
            </span>
            <span className="mt-2.5 block text-sm text-ink group-hover:underline group-hover:decoration-linen group-hover:underline-offset-4">
              {c.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
