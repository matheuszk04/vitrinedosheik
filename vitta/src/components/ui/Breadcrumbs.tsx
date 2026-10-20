import { Link } from 'react-router'
import { Icon } from './Icon'

export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="text-[0.8125rem] text-stone">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <Icon name="chevron-right" className="size-3 text-taupe" />}
            {item.to ? (
              <Link to={item.to} className="hover:text-ink hover:underline hover:underline-offset-4">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
