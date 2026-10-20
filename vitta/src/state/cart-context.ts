import { createContext, useContext } from 'react'
import type { CartItem, CartSummary } from './cart'

export interface CartContextValue extends CartSummary {
  items: CartItem[]
  /** Quantidade de itens descartados ao abrir a loja por não existirem mais no catálogo. */
  prunedCount: number
  addItem: (productId: string, quantity?: number) => void
  setQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clear: () => void
  getQuantity: (productId: string) => number
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart precisa estar dentro de <CartProvider>.')
  return value
}
