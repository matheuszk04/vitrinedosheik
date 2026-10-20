import { describe, expect, it, vi } from 'vitest'
import type { Product } from '../types/product'
import { describeDimensions, discountPercent, getProductMedia, isOnSale, isPurchasable } from './product'
import { formatDate, formatPrice } from './format'
import { getBestSellers, getNewArrivals, getRelatedProducts, getProductBySlug } from './catalog'

vi.mock('../data/products', () => import('../test/fixtures/products'))
vi.mock('../data/categories', () => import('../test/fixtures/categories'))
vi.mock('../data/collections', () => import('../test/fixtures/collections'))

const product: Product = {
  id: 't',
  slug: 't',
  name: 'Teste',
  description: '',
  price: 80,
  categoryId: 'texteis',
  images: ['/a.jpg', '', '/b.jpg'],
  stockStatus: 'in_stock',
}

describe('formatação', () => {
  it('usa reais no padrão pt-BR', () => {
    expect(formatPrice(1289.9).replace(/\s/g, ' ')).toBe('R$ 1.289,90')
    expect(formatDate('2026-10-05')).toBe('5 de outubro de 2026')
    expect(formatDate('ontem')).toBeNull()
  })
})

describe('produto', () => {
  it('mostra apenas as medidas preenchidas', () => {
    expect(describeDimensions(undefined)).toEqual([])
    expect(describeDimensions({ heightCm: 38, diameterCm: 24.5, widthCm: undefined, weightKg: 0 })).toEqual([
      { label: 'Altura', value: '38 cm' },
      { label: 'Diâmetro', value: '24,5 cm' },
    ])
  })

  it('calcula promoção só quando o preço anterior é maior', () => {
    expect(isOnSale(product)).toBe(false)
    expect(discountPercent({ price: 80, compareAtPrice: 100 })).toBe(20)
    expect(discountPercent({ price: 80, compareAtPrice: 60 })).toBeNull()
  })

  it('produto esgotado não pode ser comprado', () => {
    expect(isPurchasable({ stockStatus: 'out_of_stock' })).toBe(false)
    expect(isPurchasable({ stockStatus: 'preorder' })).toBe(true)
  })

  it('monta a galeria ignorando caminhos vazios e incluindo o 3D somente quando liberado', () => {
    expect(getProductMedia(product).map((m) => m.kind)).toEqual(['image', 'image'])
    const hidden = { ...product, model3d: { src: '/m.glb', format: 'glb' as const, available: false } }
    expect(getProductMedia(hidden)).toHaveLength(2)
    const with3d = { ...product, model3d: { src: '/m.glb', format: 'glb' as const, available: true } }
    const media = getProductMedia(with3d)
    expect(media.at(-1)).toMatchObject({ kind: 'model3d', src: '/m.glb', poster: '/a.jpg' })
  })
})

describe('consultas do catálogo', () => {
  it('novidades vêm da mais recente para a mais antiga', () => {
    const dates = getNewArrivals(50).map((p) => p.createdAt!)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  it('mais vendidos seguem a posição informada', () => {
    const ranks = getBestSellers().map((p) => p.bestSellerRank)
    expect(ranks).toEqual([...ranks].sort((a, b) => a! - b!))
  })

  it('relacionados não incluem o próprio produto', () => {
    const p = getProductBySlug('vaso-anfora-terracota')!
    const related = getRelatedProducts(p)
    expect(related.length).toBeGreaterThan(0)
    expect(related.some((r) => r.id === p.id)).toBe(false)
    expect(related[0]!.categoryId).toBe(p.categoryId)
  })
})
