import { createBrowserRouter, createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from './routes'
import { CartProvider } from './state/CartProvider'

// VITE_ROUTER=memory: navegação interna sem depender do endereço da página
// (usado na versão de apresentação, hospedada dentro de outra página).
const router =
  import.meta.env.VITE_ROUTER === 'memory'
    ? createMemoryRouter(routes)
    : createBrowserRouter(routes, { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' })

export function App() {
  return (
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  )
}
