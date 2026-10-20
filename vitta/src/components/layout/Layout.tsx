import { useCallback, useState } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { storeConfig } from '../../config/store-config'
import { Footer } from './Footer'
import { Header } from './Header'
import { SideNav } from './SideNav'

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  // Fecha o menu ao navegar (inclusive pelo botão voltar).
  const [path, setPath] = useState(location.pathname)
  if (path !== location.pathname) {
    setPath(location.pathname)
    setMenuOpen(false)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-sm bg-cocoa px-4 py-2 text-ivory focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>
      {storeConfig.demoMode && (
        <p className="bg-cocoa px-4 py-2 text-center text-xs tracking-[0.02em] text-ivory/90">
          Protótipo VITTA — o checkout é uma simulação. Nenhuma compra é realizada.
        </p>
      )}
      <Header menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((v) => !v)} />
      <SideNav open={menuOpen} onClose={closeMenu} />
      <main id="conteudo" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
