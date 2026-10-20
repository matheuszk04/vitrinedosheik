import { createBrowserRouter, RouterProvider } from 'react-router'
import { routes } from './routes'
import { CartProvider } from './state/CartProvider'

const router = createBrowserRouter(routes, { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' })

export function App() {
  return (
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  )
}
