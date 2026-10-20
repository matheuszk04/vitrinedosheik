import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Icon, type IconName } from './Icon'

interface EmptyStateProps {
  icon?: IconName
  title: string
  children?: ReactNode
  action?: ReactNode
  className?: string
  /** Use 'h1' quando o estado vazio for o conteúdo principal da página. */
  headingLevel?: 'h1' | 'h2'
}

export function EmptyState({ icon = 'search', title, children, action, className, headingLevel: Heading = 'h2' }: EmptyStateProps) {
  return (
    <div className={cx('flex flex-col items-center rounded-lg border border-dashed border-linen px-6 py-14 text-center', className)}>
      <span className="mb-5 grid size-12 place-items-center rounded-full bg-cream text-stone">
        <Icon name={icon} />
      </span>
      <Heading className="text-2xl">{title}</Heading>
      {children && <div className="mt-2 max-w-md text-stone">{children}</div>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  )
}
