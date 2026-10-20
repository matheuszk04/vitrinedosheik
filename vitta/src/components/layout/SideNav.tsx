import { useState } from 'react'
import { NavLink } from 'react-router'
import { allCollections, getCategoriesWithProducts } from '../../lib/catalog'
import { cx } from '../../lib/cx'
import { Drawer } from '../ui/Drawer'
import { Icon } from '../ui/Icon'
import { Logo } from '../ui/Logo'

interface SideNavProps {
  open: boolean
  onClose: () => void
}

const primary = [
  { to: '/', label: 'Início', end: true },
  { to: '/produtos', label: 'Todos os produtos' },
  { to: '/novidades', label: 'Novidades' },
  { to: '/mais-vendidos', label: 'Mais vendidos' },
]

const secondary = [
  { to: '/sobre', label: 'Sobre a VITTA' },
  { to: '/contato', label: 'Contato' },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cx(
    'relative flex min-h-11 items-center rounded-sm px-3 transition-colors hover:bg-cream',
    isActive ? 'font-medium text-ink before:absolute before:inset-y-3 before:left-0 before:w-0.5 before:rounded-full before:bg-gold' : 'text-stone hover:text-ink',
  )

function Group({ label, children, defaultOpen }: { label: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen)
  const id = `grupo-${label.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')}`
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between rounded-sm px-3 text-left text-stone transition-colors hover:bg-cream hover:text-ink"
      >
        {label}
        <Icon name="chevron-down" className={cx('size-4 transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <div className={cx('grid transition-[grid-template-rows] duration-300 ease-soft', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <ul id={id} className="overflow-hidden pl-3" inert={!open}>
          {children}
        </ul>
      </div>
    </li>
  )
}

/** Menu lateral: links fixos + categorias e coleções lidas do catálogo. */
export function SideNav({ open, onClose }: SideNavProps) {
  const categories = getCategoriesWithProducts()
  return (
    <Drawer open={open} onClose={onClose} title="Menu" hideTitle header={<Logo className="h-6 w-auto" />}>
      <nav id="menu-lateral" aria-label="Menu principal" className="px-4 py-5 text-[0.9375rem]">
        <ul className="space-y-0.5">
          {primary.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={linkClass} onClick={onClose}>
                {item.label}
              </NavLink>
            </li>
          ))}
          <Group label="Categorias" defaultOpen>
            {categories.map((c) => (
              <li key={c.id}>
                <NavLink to={`/categorias/${c.slug}`} className={linkClass} onClick={onClose}>
                  {c.name}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink to="/categorias" end className={linkClass} onClick={onClose}>
                Ver todas as categorias
              </NavLink>
            </li>
          </Group>
          <Group label="Coleções">
            {allCollections.map((c) => (
              <li key={c.id}>
                <NavLink to={`/colecoes/${c.slug}`} className={linkClass} onClick={onClose}>
                  {c.name}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink to="/colecoes" end className={linkClass} onClick={onClose}>
                Ver todas as coleções
              </NavLink>
            </li>
          </Group>
        </ul>
        <hr className="my-5 border-line" />
        <ul className="space-y-0.5">
          {secondary.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={linkClass} onClick={onClose}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </Drawer>
  )
}
