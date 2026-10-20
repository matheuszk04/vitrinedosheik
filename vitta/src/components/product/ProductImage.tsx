import { useState } from 'react'
import { brand } from '../../config/brand'
import { asset } from '../../lib/asset'
import { cx } from '../../lib/cx'

interface ProductImageProps {
  src: string | undefined
  alt: string
  /** Primeira dobra: carrega imediatamente. Demais imagens usam lazy loading. */
  priority?: boolean
  className?: string
  sizes?: string
}

/**
 * Imagem de produto em moldura de proporção fixa (definida pelo contêiner).
 * Mostra um fundo neutro enquanto carrega e um marcador discreto quando a
 * imagem não existe ou falha — o layout nunca colapsa.
 */
export function ProductImage({ src, alt, priority = false, className }: ProductImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(src ? 'loading' : 'error')
  const [prevSrc, setPrevSrc] = useState(src)
  if (src !== prevSrc) {
    setPrevSrc(src)
    setStatus(src ? 'loading' : 'error')
  }

  if (!src || status === 'error') {
    return (
      <div
        role="img"
        aria-label={`${alt} — imagem indisponível`}
        className={cx('flex size-full flex-col items-center justify-center gap-3 bg-cream text-stone', className)}
      >
        <img src={asset(brand.logo.symbol.fallback)} alt="" className="w-1/4 max-w-16 opacity-20" />
        <span className="text-[0.6875rem] uppercase tracking-eyebrow">Imagem em breve</span>
      </div>
    )
  }

  return (
    <img
      src={asset(src)}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onLoad={() => setStatus('loaded')}
      onError={() => setStatus('error')}
      className={cx(
        'size-full bg-cream object-cover transition-opacity duration-500',
        status === 'loaded' ? 'opacity-100' : 'opacity-0',
        className,
      )}
    />
  )
}
