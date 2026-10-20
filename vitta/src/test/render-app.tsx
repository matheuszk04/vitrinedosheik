import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '../routes'
import { CartProvider } from '../state/CartProvider'

/** Renderiza a aplicação inteira em memória, a partir de um endereço. */
export function renderApp(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()
  const utils = render(
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>,
  )
  return { ...utils, user, router }
}
