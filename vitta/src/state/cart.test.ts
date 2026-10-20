import { describe, expect, it } from 'vitest'
import type { Product } from '../types/product'
import { cartReducer, summarizeCart, type CartItem } from './cart'
import { CART_STORAGE_KEY, parseStoredCart, readCart, serializeCart, writeCart } from './cart-storage'

const p = (id: string, price: number, stockStatus: Product['stockStatus'] = 'in_stock'): Product => ({
  id, slug: id, name: id, description: '', price, categoryId: 'c', images: [], stockStatus,
})
const catalog = new Map([['a', p('a', 289.9)], ['b', p('b', 0.1)], ['c', p('c', 50, 'out_of_stock')]])
const lookup = (id: string) => catalog.get(id)

describe('cartReducer', () => {
  it('adiciona, soma quantidades e respeita o limite', () => {
    let items: CartItem[] = []
    items = cartReducer(items, { type: 'add', productId: 'a', quantity: 1, max: 10 })
    items = cartReducer(items, { type: 'add', productId: 'a', quantity: 2, max: 10 })
    expect(items).toEqual([{ productId: 'a', quantity: 3 }])
    items = cartReducer(items, { type: 'add', productId: 'a', quantity: 50, max: 10 })
    expect(items[0]!.quantity).toBe(10)
  })

  it('altera quantidade, remove ao zerar e limpa', () => {
    let items: CartItem[] = [{ productId: 'a', quantity: 2 }, { productId: 'b', quantity: 1 }]
    items = cartReducer(items, { type: 'set', productId: 'a', quantity: 5, max: 10 })
    expect(items[0]!.quantity).toBe(5)
    items = cartReducer(items, { type: 'set', productId: 'a', quantity: 0, max: 10 })
    expect(items).toEqual([{ productId: 'b', quantity: 1 }])
    items = cartReducer(items, { type: 'remove', productId: 'b' })
    expect(items).toEqual([])
    expect(cartReducer([{ productId: 'a', quantity: 1 }], { type: 'clear' })).toEqual([])
  })
})

describe('summarizeCart', () => {
  it('calcula subtotais e total sem erro de ponto flutuante', () => {
    const s = summarizeCart([{ productId: 'a', quantity: 3 }, { productId: 'b', quantity: 3 }], lookup)
    expect(s.lines.map((l) => l.lineTotal)).toEqual([869.7, 0.3])
    expect(s.subtotal).toBe(870)
    expect(s.totalUnits).toBe(6)
  })

  it('ignora produtos removidos do catálogo e não soma itens esgotados', () => {
    const s = summarizeCart([{ productId: 'a', quantity: 1 }, { productId: 'sumiu', quantity: 2 }, { productId: 'c', quantity: 1 }], lookup)
    expect(s.missingIds).toEqual(['sumiu'])
    expect(s.subtotal).toBe(289.9)
    expect(s.totalUnits).toBe(2)
    expect(s.hasUnavailable).toBe(true)
  })
})

describe('armazenamento do carrinho', () => {
  it('ida e volta pelo formato versionado', () => {
    const items = [{ productId: 'a', quantity: 2 }]
    expect(parseStoredCart(serializeCart(items), 10)).toEqual(items)
  })

  it('descarta JSON inválido, versões desconhecidas e itens mal formados', () => {
    expect(parseStoredCart('{quebrado', 10)).toEqual([])
    expect(parseStoredCart(JSON.stringify({ version: 99, items: [{ productId: 'a', quantity: 1 }] }), 10)).toEqual([])
    expect(parseStoredCart(JSON.stringify({ version: 1, items: 'x' }), 10)).toEqual([])
    const messy = { version: 1, items: [null, { productId: '', quantity: 1 }, { productId: 'a', quantity: -1 }, { productId: 'b', quantity: 'dois' }, { productId: 'a', quantity: 2.7 }] }
    expect(parseStoredCart(JSON.stringify(messy), 10)).toEqual([{ productId: 'a', quantity: 2 }])
  })

  it('migra o formato antigo (lista solta), unifica repetidos e limita quantidades', () => {
    const legacy = [{ id: 'a', qty: 4 }, { id: 'a', qty: 9 }, { productId: 'b', quantity: 1 }]
    expect(parseStoredCart(JSON.stringify(legacy), 10)).toEqual([{ productId: 'a', quantity: 10 }, { productId: 'b', quantity: 1 }])
  })

  it('grava e lê do localStorage', () => {
    writeCart([{ productId: 'a', quantity: 1 }])
    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!).version).toBe(1)
    expect(readCart(10)).toEqual([{ productId: 'a', quantity: 1 }])
  })
})
