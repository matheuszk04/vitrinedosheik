import type { StockStatus } from '../../types/product'
import { cx } from '../../lib/cx'
import { stockLabels } from '../../lib/product'

const dot: Record<StockStatus, string> = {
  in_stock: 'bg-success',
  low_stock: 'bg-warning',
  out_of_stock: 'bg-taupe',
  preorder: 'bg-gold',
}

export function StockStatusText({ status, className }: { status: StockStatus; className?: string }) {
  return (
    <p className={cx('inline-flex items-center gap-2 text-[0.8125rem] text-stone', className)}>
      <span aria-hidden="true" className={cx('size-1.5 rounded-full', dot[status])} />
      {stockLabels[status]}
    </p>
  )
}

export function Tag({ children, tone = 'neutral' }: { children: string; tone?: 'neutral' | 'accent' | 'muted' }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-xs px-2 py-1 text-[0.6875rem] font-medium uppercase leading-none tracking-[0.08em]',
        tone === 'neutral' && 'bg-ivory/90 text-ink',
        tone === 'accent' && 'bg-cocoa text-ivory',
        tone === 'muted' && 'bg-sand text-stone',
      )}
    >
      {children}
    </span>
  )
}
