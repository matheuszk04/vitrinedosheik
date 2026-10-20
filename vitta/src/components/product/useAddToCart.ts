import { useCallback } from 'react'
import type { Product } from '../../types/product'
import { storeConfig } from '../../config/store-config'
import { isPurchasable } from '../../lib/product'
import { useCart } from '../../state/cart-context'
import { useToast } from '../../state/toast-context'

/** Adiciona ao carrinho respeitando o limite por item e confirma com um aviso. */
export function useAddToCart() {
  const { addItem, getQuantity } = useCart()
  const { notify } = useToast()

  return useCallback(
    (product: Product, quantity = 1): number => {
      if (!isPurchasable(product)) return 0
      const room = storeConfig.maxQuantityPerItem - getQuantity(product.id)
      const added = Math.max(0, Math.min(quantity, room))
      if (added === 0) {
        notify(`Limite de ${storeConfig.maxQuantityPerItem} unidades de ${product.name} atingido.`, {
          label: 'Ver carrinho',
          to: '/carrinho',
        })
        return 0
      }
      addItem(product.id, added)
      notify(`${added > 1 ? `${added} unidades de ` : ''}${product.name} ${added > 1 ? 'adicionadas' : 'adicionado'} ao carrinho.`, {
        label: 'Ver carrinho',
        to: '/carrinho',
      })
      return added
    },
    [addItem, getQuantity, notify],
  )
}
