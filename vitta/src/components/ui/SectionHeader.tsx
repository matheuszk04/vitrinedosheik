import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Icon } from './Icon'

interface SectionHeaderProps {
  id?: string
  eyebrow?: string
  title: string
  description?: ReactNode
  link?: { to: string; label: string }
}

export function SectionHeader({ id, eyebrow, title, description, link }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 md:mb-8">
      <div className="max-w-prose">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 id={id} className="text-title">
          {title}
        </h2>
        {description && <p className="mt-2 text-stone">{description}</p>}
      </div>
      {link && (
        <Link
          to={link.to}
          className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-cocoa underline decoration-linen underline-offset-[6px] hover:decoration-cocoa"
        >
          {link.label}
          <Icon name="arrow-right" className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
