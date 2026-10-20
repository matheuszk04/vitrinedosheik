import type { Product } from '../types/product'
import { isPurchasable } from '../lib/product'

/** O carrinho guarda só referências e quantidades; preços vêm sempre do catálogo atual. */
export interface CartItem {
  productId: string
  quantity: number
}

export type CartAction =
  | { type: 'add'; productId: string; quantity: number; max: number }
  | { type: 'set'; productId: string; quantity: number; max: number }
  | { type: 'remove'; productId: string }
  | { type: 'clear' }
  | { type: 'replace'; items: CartItem[] }

export function clampQuantity(quantity: number, max: number): number {
  if (!Number.isFinite(quantity)) return 1
  return Math.min(Math.max(Math.floor(quantity), 1), max)
}

export function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const existing = items.find((i) => i.productId === action.productId)
      if (!existing) return [...items, { productId: action.productId, quantity: clampQuantity(action.quantity, action.max) }]
      return items.map((i) =>
        i.productId === action.productId ? { ...i, quantity: clampQuantity(i.quantity + action.quantity, action.max) } : i,
      )
    }
    case 'set':
      if (action.quantity < 1) return items.filter((i) => i.productId !== action.productId)
      return items.map((i) =>
        i.productId === action.productId ? { ...i, quantity: clampQuantity(action.quantity, action.max) } : i,
      )
    case 'remove':
      return items.filter((i) => i.productId !== action.productId)
    case 'clear':
      return []
    case 'replace':
      return action.items
  }
}

export interface CartLine {
  product: Product
  quantity: number
  unitPrice: number
  lineTotal: number
  purchasable: boolean
}

export interface CartSummary {
  lines: CartLine[]
  /** Ids guardados que não existem mais no catálogo. */
  missingIds: string[]
  /** Unidades de todos os produtos encontrados no catálogo. */
  totalUnits: number
  /** Soma apenas dos itens que podem ser comprados. */
  subtotal: number
  hasUnavailable: boolean
}

/** Cruza o carrinho com o catálogo atual e calcula os totais. */
export function summarizeCart(items: CartItem[], lookup: (id: string) => Product | undefined): CartSummary {
  const lines: CartLine[] = []
  const missingIds: string[] = []
  for (const item of items) {
    const product = lookup(item.productId)
    if (!product) {
      missingIds.push(item.productId)
      continue
    }
    const purchasable = isPurchasable(product)
    lines.push({
      product,
      quantity: item.quantity,
      unitPrice: product.price,
      lineTotal: roundMoney(product.price * item.quantity),
      purchasable,
    })
  }
  return {
    lines,
    missingIds,
    totalUnits: lines.reduce((sum, l) => sum + l.quantity, 0),
    subtotal: roundMoney(lines.filter((l) => l.purchasable).reduce((sum, l) => sum + l.lineTotal, 0)),
    hasUnavailable: lines.some((l) => !l.purchasable),
  }
}

/** Evita resíduos de ponto flutuante (ex.: 0.1 + 0.2). */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}
