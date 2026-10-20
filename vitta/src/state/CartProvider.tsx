import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { storeConfig } from '../config/store-config'
import { getProductById } from '../lib/catalog'
import { cartReducer, summarizeCart } from './cart'
import { CART_STORAGE_KEY, readCart, writeCart, parseStoredCart } from './cart-storage'
import { CartContext, type CartContextValue } from './cart-context'

const MAX = storeConfig.maxQuantityPerItem

function initialState(): { items: ReturnType<typeof readCart>; pruned: number } {
  const stored = readCart(MAX)
  const items = stored.filter((i) => getProductById(i.productId))
  return { items, pruned: stored.length - items.length }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(initialState)
  const [items, dispatch] = useReducer(cartReducer, initial.items)
  const fromOtherTab = useRef(false)

  useEffect(() => {
    if (fromOtherTab.current) {
      fromOtherTab.current = false
      return
    }
    writeCart(items)
  }, [items])

  // Mantém abas abertas da loja sincronizadas.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== CART_STORAGE_KEY) return
      fromOtherTab.current = true
      dispatch({ type: 'replace', items: parseStoredCart(event.newValue, MAX).filter((i) => getProductById(i.productId)) })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const addItem = useCallback(
    (productId: string, quantity = 1) => dispatch({ type: 'add', productId, quantity, max: MAX }),
    [],
  )
  const setQuantity = useCallback(
    (productId: string, quantity: number) => dispatch({ type: 'set', productId, quantity, max: MAX }),
    [],
  )
  const removeItem = useCallback((productId: string) => dispatch({ type: 'remove', productId }), [])
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])

  const value = useMemo<CartContextValue>(() => {
    const summary = summarizeCart(items, getProductById)
    return {
      ...summary,
      items,
      prunedCount: initial.pruned,
      addItem,
      setQuantity,
      removeItem,
      clear,
      getQuantity: (id) => items.find((i) => i.productId === id)?.quantity ?? 0,
    }
  }, [items, initial.pruned, addItem, setQuantity, removeItem, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
