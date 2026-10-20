import { useState } from 'react'
import { brand } from '../../config/brand'
import { asset } from '../../lib/asset'
import { cx } from '../../lib/cx'

interface LogoProps {
  variant?: 'horizontal' | 'symbol'
  /** Defina uma dimensão e deixe a outra automática, ex.: "h-8 w-auto" ou "w-40 h-auto". */
  className: string
}

/**
 * Logo oficial (arquivos em public/brand/). Se o arquivo não carregar,
 * exibe um substituto tipográfico provisório, identificado no código.
 */
export function Logo({ variant = 'horizontal', className }: LogoProps) {
  const [failed, setFailed] = useState(false)
  const file = brand.logo[variant]

  if (failed) {
    // FALLBACK TEMPORÁRIO: só aparece quando os arquivos da logo não estão disponíveis.
    return (
      <span className={cx('font-serif text-2xl font-semibold tracking-[0.2em] text-cocoa', className)} data-logo-fallback>
        {brand.name}
      </span>
    )
  }

  return (
    <picture>
      <source srcSet={asset(file.src)} type="image/webp" />
      <img
        src={asset(file.fallback)}
        width={file.width}
        height={file.height}
        alt={brand.name}
        decoding="async"
        onError={() => setFailed(true)}
        className={className}
      />
    </picture>
  )
}
