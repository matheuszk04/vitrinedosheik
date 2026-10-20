import type { RouteObject } from 'react-router'
import { Layout } from './components/layout/Layout'
import { RouteError } from './pages/RouteError'
import { CartPage } from './pages/CartPage'
import {
  BestSellersPage,
  CategoriesPage,
  CategoryPage,
  CollectionPage,
  CollectionsPage,
  NewArrivalsPage,
  ProductsPage,
} from './pages/CatalogPages'
import { CheckoutPage } from './pages/CheckoutPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { HomePage } from './pages/HomePage'
import { AboutPage, ContactPage } from './pages/InfoPages'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProductPage } from './pages/ProductPage'
import { ProfilePage } from './pages/ProfilePage'
import { ToastProvider } from './state/ToastProvider'

/** Mapa de rotas da loja (endereços em português). */
export const routes: RouteObject[] = [
  {
    element: (
      <ToastProvider>
        <Layout />
      </ToastProvider>
    ),
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'produtos', element: <ProductsPage /> },
      { path: 'novidades', element: <NewArrivalsPage /> },
      { path: 'mais-vendidos', element: <BestSellersPage /> },
      { path: 'categorias', element: <CategoriesPage /> },
      { path: 'categorias/:slug', element: <CategoryPage /> },
      { path: 'colecoes', element: <CollectionsPage /> },
      { path: 'colecoes/:slug', element: <CollectionPage /> },
      { path: 'produto/:slug', element: <ProductPage /> },
      { path: 'carrinho', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'checkout/confirmacao', element: <ConfirmationPage /> },
      { path: 'perfil', element: <ProfilePage /> },
      { path: 'sobre', element: <AboutPage /> },
      { path: 'contato', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

