import { cx } from '../../lib/cx'
import { Icon } from './Icon'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max: number
  /** Nome do produto, para rótulos acessíveis específicos. */
  label: string
  size?: 'sm' | 'md'
  disabled?: boolean
}

export function QuantityStepper({ value, onChange, min = 1, max, label, size = 'md', disabled }: QuantityStepperProps) {
  const button = cx(
    'grid place-items-center text-ink transition-colors hover:bg-cream disabled:opacity-35 disabled:hover:bg-transparent',
    size === 'md' ? 'size-11' : 'size-9',
  )
  return (
    <div
      role="group"
      aria-label={`Quantidade de ${label}`}
      className={cx('inline-flex items-center rounded-sm border border-linen bg-ivory', disabled && 'opacity-50')}
    >
      <button
        type="button"
        className={button}
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
        aria-label={`Diminuir quantidade de ${label}`}
      >
        <Icon name="minus" className="size-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        aria-label={`Quantidade de ${label}`}
        onChange={(e) => {
          const next = Number(e.target.value)
          if (Number.isFinite(next) && next >= min) onChange(Math.min(next, max))
        }}
        className={cx(
          'w-10 appearance-none bg-transparent text-center tabular-nums text-ink outline-none [-moz-appearance:textfield] focus-visible:bg-cream [&::-webkit-inner-spin-button]:appearance-none',
          size === 'md' ? 'h-11' : 'h-9 text-sm',
        )}
      />
      <button
        type="button"
        className={button}
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label={`Aumentar quantidade de ${label}`}
      >
        <Icon name="plus" className="size-4" />
      </button>
    </div>
  )
}
