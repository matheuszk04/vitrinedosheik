import { cx } from '../../lib/cx'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-medium transition-[background-color,color,border-color,box-shadow,transform] select-none disabled:pointer-events-none disabled:opacity-45 active:translate-y-px'

const variants: Record<ButtonVariant, string> = {
  primary: 'rounded-sm bg-cocoa text-ivory hover:bg-cocoa-hover shadow-[inset_0_-1px_0_rgb(0_0_0/0.15)]',
  secondary: 'rounded-sm border border-linen bg-transparent text-ink hover:border-cocoa hover:bg-cream',
  ghost: 'rounded-sm text-ink hover:bg-cream',
  link: 'text-cocoa underline decoration-linen underline-offset-[6px] hover:decoration-cocoa',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3.5 text-[0.8125rem]',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-12 px-7 text-[0.9375rem] tracking-[0.01em]',
}

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string): string {
  return cx(base, variants[variant], variant !== 'link' && sizes[size], className)
}
