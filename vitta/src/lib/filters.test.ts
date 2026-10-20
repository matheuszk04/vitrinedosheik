import { describe, expect, it } from 'vitest'
import type { Product } from '../types/product'
import {
  applyFilters,
  computeFacets,
  countActiveFilters,
  emptyFilters,
  filtersFromParams,
  filtersToParams,
  matchesSearch,
  sortProducts,
  type CatalogFilters,
} from './filters'

const make = (over: Partial<Product>): Product => ({
  id: over.id ?? 'id',
  slug: over.slug ?? over.id ?? 'slug',
  name: 'Produto',
  description: '',
  price: 100,
  categoryId: 'vasos-e-ceramicas',
  images: [],
  stockStatus: 'in_stock',
  ...over,
})

const list: Product[] = [
  make({ id: 'a', name: 'Vaso Ânfora', price: 289.9, material: 'Cerâmica', color: { name: 'Terracota' }, createdAt: '2026-09-28' }),
  make({ id: 'b', name: 'Luminária Lume', price: 449, categoryId: 'iluminacao', material: 'Linho', color: { name: 'Bege' }, createdAt: '2026-10-10' }),
  make({ id: 'c', name: 'Pratos Cru', price: 99, categoryId: 'mesa-posta', material: 'Cerâmica', stockStatus: 'out_of_stock', createdAt: '2026-01-01' }),
  make({ id: 'd', name: 'Caixa sem data', price: 150, categoryId: 'objetos-decorativos', tags: ['presente'] }),
]

const f = (patch: Partial<CatalogFilters>): CatalogFilters => ({ ...emptyFilters, ...patch })
const ids = (ps: Product[]) => ps.map((p) => p.id)

describe('busca', () => {
  it('ignora acentos e maiúsculas e exige todos os termos', () => {
    expect(matchesSearch(list[0]!, 'anfora')).toBe(true)
    expect(matchesSearch(list[0]!, 'VASO cerâmica')).toBe(true)
    expect(matchesSearch(list[0]!, 'vaso linho')).toBe(false)
  })

  it('procura também em categoria, cor e etiquetas', () => {
    expect(ids(applyFilters(list, f({ q: 'iluminação' })))).toEqual(['b'])
    expect(ids(applyFilters(list, f({ q: 'terracota' })))).toEqual(['a'])
    expect(ids(applyFilters(list, f({ q: 'presente' })))).toEqual(['d'])
  })
})

describe('filtros', () => {
  it('filtra por categoria, faixa de preço, cor, material e disponibilidade', () => {
    expect(ids(applyFilters(list, f({ categories: ['iluminacao', 'mesa-posta'] })))).toEqual(['b', 'c'])
    expect(ids(applyFilters(list, f({ minPrice: 100, maxPrice: 300 })))).toEqual(['a', 'd'])
    expect(ids(applyFilters(list, f({ colors: ['Bege'] })))).toEqual(['b'])
    expect(ids(applyFilters(list, f({ materials: ['Cerâmica'] })))).toEqual(['a', 'c'])
    expect(ids(applyFilters(list, f({ availableOnly: true })))).toEqual(['a', 'b', 'd'])
  })

  it('combina filtros com E lógico', () => {
    expect(ids(applyFilters(list, f({ materials: ['Cerâmica'], availableOnly: true })))).toEqual(['a'])
  })

  it('conta filtros ativos', () => {
    expect(countActiveFilters(f({ categories: ['x', 'y'], minPrice: 1, availableOnly: true, q: 'abc' }))).toBe(4)
  })
})

describe('ordenação', () => {
  it('ordena por preço nos dois sentidos', () => {
    expect(ids(sortProducts(list, 'price-asc'))).toEqual(['c', 'd', 'a', 'b'])
    expect(ids(sortProducts(list, 'price-desc'))).toEqual(['b', 'a', 'd', 'c'])
  })

  it('ordena por novidade deixando produtos sem data por último', () => {
    expect(ids(sortProducts(list, 'newest'))).toEqual(['b', 'a', 'c', 'd'])
  })

  it('"recomendados" preserva a ordem de origem e não altera a lista original', () => {
    const copy = [...list]
    expect(ids(sortProducts(list, 'relevance'))).toEqual(['a', 'b', 'c', 'd'])
    sortProducts(list, 'price-asc')
    expect(list).toEqual(copy)
  })
})

describe('facetas', () => {
  it('lista cores e materiais existentes e a faixa de preço', () => {
    const facets = computeFacets(list)
    expect(facets.colors.map((c) => c.name)).toEqual(['Bege', 'Terracota'])
    expect(facets.materials).toEqual([
      { name: 'Cerâmica', count: 2 },
      { name: 'Linho', count: 1 },
    ])
    expect(facets.price).toEqual({ min: 99, max: 449 })
    expect(facets.hasDates).toBe(true)
  })

  it('lida com lista vazia', () => {
    expect(computeFacets([])).toEqual({ colors: [], materials: [], price: null, hasDates: false })
  })
})

describe('URL', () => {
  it('converte filtros para parâmetros e de volta', () => {
    const filters = f({ q: 'vaso', categories: ['a', 'b'], minPrice: 10, maxPrice: 200, colors: ['Bege'], materials: ['Linho'], availableOnly: true, sort: 'price-desc' })
    expect(filtersFromParams(filtersToParams(filters))).toEqual(filters)
  })

  it('ignora valores inválidos e respeita a ordenação padrão da página', () => {
    const parsed = filtersFromParams(new URLSearchParams('min=abc&max=-3&ordem=qualquer'), 'newest')
    expect(parsed.minPrice).toBeNull()
    expect(parsed.maxPrice).toBeNull()
    expect(parsed.sort).toBe('newest')
    expect(filtersToParams(f({ sort: 'newest' }), 'newest').toString()).toBe('')
  })
})
