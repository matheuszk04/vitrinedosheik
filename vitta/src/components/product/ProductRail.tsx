import { useCallback, useEffect, useRef, useState } from 'react'
import type { Product } from '../../types/product'
import { IconButton } from '../ui/IconButton'
import { ProductCard } from './ProductCard'

interface ProductRailProps {
  products: readonly Product[]
  label: string
  priority?: boolean
}

/**
 * Carrossel horizontal sem rolagem automática: arraste ou deslize no toque,
 * use as setas no desktop ou navegue com Tab entre os produtos.
 */
export function ProductRail({ products, label, priority }: ProductRailProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: true })

  const update = useCallback(() => {
    const el = listRef.current
    if (!el) return
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
  }, [])

  useEffect(() => {
    update()
    const el = listRef.current
    if (!el) return
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [update, products])

  const scroll = (direction: 1 | -1) => {
    const el = listRef.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: reduce ? 'auto' : 'smooth' })
  }

  const scrollable = !(edges.start && edges.end)

  return (
    <div className="relative">
      {scrollable && (
        <>
          <IconButton
            icon="chevron-left"
            label={`Anteriores em ${label}`}
            onClick={() => scroll(-1)}
            disabled={edges.start}
            className="absolute -left-5 top-[38%] z-10 hidden -translate-y-1/2 border border-line bg-ivory shadow-soft hover:bg-ivory disabled:hidden md:grid"
          />
          <IconButton
            icon="chevron-right"
            label={`Próximos em ${label}`}
            onClick={() => scroll(1)}
            disabled={edges.end}
            className="absolute -right-5 top-[38%] z-10 hidden -translate-y-1/2 border border-line bg-ivory shadow-soft hover:bg-ivory disabled:hidden md:grid"
          />
        </>
      )}
      <ul
        ref={listRef}
        onScroll={update}
        aria-label={label}
        className="scrollbar-none -mx-gutter flex snap-x snap-mandatory scroll-px-gutter gap-4 overflow-x-auto overscroll-x-contain px-gutter pb-2 sm:gap-6"
      >
        {products.map((product, i) => (
          <li key={product.id} className="relative w-[68%] shrink-0 snap-start sm:w-[42%] md:w-[30%] lg:w-[calc((100%-4.5rem)/4)]">
            <ProductCard product={product} priority={priority && i < 4} />
          </li>
        ))}
      </ul>
    </div>
  )
}
