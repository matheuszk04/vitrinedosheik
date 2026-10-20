import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import { Icon, type IconName } from './Icon'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName
  /** Texto acessível obrigatório: o ícone sozinho não é lido por leitores de tela. */
  label: string
}

/** Botão só com ícone, com área de toque de 44px. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        'grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-cream disabled:opacity-40',
        className,
      )}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  )
})
