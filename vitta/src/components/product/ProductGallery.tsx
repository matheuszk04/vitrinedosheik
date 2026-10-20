import { useState } from 'react'
import type { Product } from '../../types/product'
import { cx } from '../../lib/cx'
import { getProductMedia } from '../../lib/product'
import { Icon } from '../ui/Icon'
import { IconButton } from '../ui/IconButton'
import { Model3DSlot } from './Model3DSlot'
import { ProductImage } from './ProductImage'

/**
 * Galeria do produto. Trabalha com uma lista genérica de mídias (imagens e,
 * no futuro, modelos 3D), então novos tipos entram sem mudar a página.
 */
export function ProductGallery({ product }: { product: Product }) {
  const media = getProductMedia(product)
  const [index, setIndex] = useState(0)
  const current = media[Math.min(index, media.length - 1)]
  const many = media.length > 1

  const go = (delta: number) => setIndex((i) => (i + delta + media.length) % media.length)

  return (
    <div className="flex flex-col gap-3 md:flex-row-reverse md:gap-4">
      <div
        className="relative aspect-[4/5] flex-1 overflow-hidden rounded-lg bg-cream"
        role="group"
        aria-roledescription="galeria"
        aria-label={`Imagens de ${product.name}`}
        onKeyDown={(e) => {
          if (!many) return
          if (e.key === 'ArrowRight') go(1)
          if (e.key === 'ArrowLeft') go(-1)
        }}
      >
        {!current ? (
          <ProductImage src={undefined} alt={product.name} />
        ) : current.kind === 'image' ? (
          <ProductImage key={current.src} src={current.src} alt={current.alt} priority={index === 0} className="animate-fade-in" />
        ) : (
          <Model3DSlot src={current.src} format={current.format} poster={current.poster} alt={current.alt} />
        )}
        {many && (
          <>
            <IconButton icon="chevron-left" label="Imagem anterior" onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-ivory/85 shadow-soft hover:bg-ivory" />
            <IconButton icon="chevron-right" label="Próxima imagem" onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-ivory/85 shadow-soft hover:bg-ivory" />
            <p className="absolute bottom-3 right-3 rounded-full bg-ivory/90 px-2.5 py-1 text-xs tabular-nums text-ink" aria-live="polite">
              {index + 1} / {media.length}
            </p>
          </>
        )}
      </div>

      {many && (
        <ul className="scrollbar-none flex gap-2 overflow-x-auto md:w-20 md:flex-col md:overflow-visible" aria-label="Miniaturas">
          {media.map((m, i) => (
            <li key={`${m.kind}-${m.src}`} className="w-16 shrink-0 md:w-full">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={m.kind === 'model3d' ? 'Ver modelo 3D' : `Ver imagem ${i + 1} de ${media.length}`}
                aria-current={i === index ? 'true' : undefined}
                className={cx(
                  'relative block aspect-[4/5] w-full overflow-hidden rounded-sm border bg-cream transition-[border-color,opacity]',
                  i === index ? 'border-cocoa' : 'border-transparent opacity-70 hover:opacity-100',
                )}
              >
                {m.kind === 'image' ? (
                  <ProductImage src={m.src} alt="" />
                ) : (
                  <span className="grid size-full place-items-center text-cocoa">
                    <Icon name="cube" />
                    <span className="sr-only">3D</span>
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
