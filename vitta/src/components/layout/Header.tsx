import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { useCart } from '../../state/cart-context'
import { cx } from '../../lib/cx'
import { Icon } from '../ui/Icon'
import { IconButton } from '../ui/IconButton'
import { Logo } from '../ui/Logo'
import { SearchPanel } from './SearchPanel'

interface HeaderProps {
  menuOpen: boolean
  onMenuToggle: () => void
}

export function Header({ menuOpen, onMenuToggle }: HeaderProps) {
  const { totalUnits } = useCart()
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  // Fecha a busca ao trocar de página.
  const [path, setPath] = useState(location.pathname)
  if (path !== location.pathname) {
    setPath(location.pathname)
    setSearchOpen(false)
  }

  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const iconLink = ({ isActive }: { isActive: boolean }) =>
    cx('relative grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-cream', isActive && 'bg-cream')

  return (
    <header
      className={cx(
        'sticky top-0 z-30 border-b bg-ivory/92 backdrop-blur-md transition-[border-color,box-shadow] duration-300',
        scrolled || searchOpen ? 'border-line shadow-[0_1px_0_rgb(43_36_28/0.02)]' : 'border-transparent',
      )}
    >
      <div className="container-site grid h-header grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="-ml-2.5 flex items-center gap-0.5">
          <IconButton
            icon="menu"
            label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="menu-lateral"
            onClick={onMenuToggle}
          />
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-expanded={searchOpen}
            className={cx(
              'flex h-11 items-center gap-2.5 rounded-full px-2.5 text-sm text-stone transition-colors hover:bg-cream hover:text-ink lg:min-w-48 lg:border lg:border-line lg:px-4',
              searchOpen && 'bg-cream text-ink',
            )}
          >
            <Icon name={searchOpen ? 'close' : 'search'} className="size-5 text-ink lg:size-4" />
            <span className="sr-only lg:not-sr-only">{searchOpen ? 'Fechar busca' : 'Buscar produtos'}</span>
          </button>
        </div>

        <Link to="/" className="flex items-center rounded-sm px-1" aria-label="VITTA — página inicial">
          <Logo className="h-6 w-auto sm:h-8" />
        </Link>

        <nav aria-label="Conta e carrinho" className="-mr-2.5 flex items-center justify-end gap-0.5">
          <NavLink to="/perfil" className={iconLink} aria-label="Minha conta" title="Minha conta">
            <Icon name="user" />
          </NavLink>
          <NavLink
            to="/carrinho"
            className={iconLink}
            aria-label={`Carrinho, ${totalUnits} ${totalUnits === 1 ? 'item' : 'itens'}`}
            title="Carrinho"
          >
            <Icon name="bag" />
            {totalUnits > 0 && (
              <span
                key={totalUnits}
                aria-hidden="true"
                data-testid="cart-count"
                className="absolute right-0.5 top-0.5 grid min-w-[1.125rem] animate-rise place-items-center rounded-full bg-cocoa px-1 text-[0.625rem] font-semibold leading-[1.125rem] text-ivory tabular-nums"
              >
                {totalUnits > 99 ? '99+' : totalUnits}
              </span>
            )}
          </NavLink>
        </nav>
      </div>
      <SearchPanel open={searchOpen} onClose={closeSearch} />
    </header>
  )
}
