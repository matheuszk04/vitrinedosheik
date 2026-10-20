import type { Product } from '../types/product'
import { getCategoryById, createdTime } from './catalog'
import { normalizeText } from './format'

export type SortKey = 'relevance' | 'price-asc' | 'price-desc' | 'newest'

export interface CatalogFilters {
  q: string
  categories: string[]
  minPrice: number | null
  maxPrice: number | null
  colors: string[]
  materials: string[]
  availableOnly: boolean
  sort: SortKey
}

export const emptyFilters: CatalogFilters = {
  q: '',
  categories: [],
  minPrice: null,
  maxPrice: null,
  colors: [],
  materials: [],
  availableOnly: false,
  sort: 'relevance',
}

export const sortLabels: Record<SortKey, string> = {
  relevance: 'Recomendados',
  'price-asc': 'Menor preço',
  'price-desc': 'Maior preço',
  newest: 'Novidades',
}

function searchableText(product: Product): string {
  return normalizeText(
    [
      product.name,
      product.description,
      product.material,
      product.color?.name,
      getCategoryById(product.categoryId)?.name,
      ...(product.tags ?? []),
    ]
      .filter(Boolean)
      .join(' '),
  )
}

/** Todos os termos digitados precisam aparecer (em qualquer campo de texto). */
export function matchesSearch(product: Product, query: string): boolean {
  const terms = normalizeText(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const text = searchableText(product)
  return terms.every((term) => text.includes(term))
}

export function filterProducts(products: readonly Product[], filters: CatalogFilters): Product[] {
  const categories = new Set(filters.categories)
  const colors = new Set(filters.colors)
  const materials = new Set(filters.materials)
  return products.filter(
    (p) =>
      matchesSearch(p, filters.q) &&
      (categories.size === 0 || categories.has(p.categoryId)) &&
      (filters.minPrice === null || p.price >= filters.minPrice) &&
      (filters.maxPrice === null || p.price <= filters.maxPrice) &&
      (colors.size === 0 || (p.color !== undefined && colors.has(p.color.name))) &&
      (materials.size === 0 || (p.material !== undefined && materials.has(p.material))) &&
      (!filters.availableOnly || p.stockStatus !== 'out_of_stock'),
  )
}

/** Ordena sem alterar a lista original. Empates mantêm a ordem do cadastro. */
export function sortProducts(products: readonly Product[], sort: SortKey): Product[] {
  const indexed = products.map((p, i) => ({ p, i }))
  const compare: Record<SortKey, (a: Product, b: Product) => number> = {
    // Mantém a ordem da lista de origem (cada página define a sua).
    relevance: () => 0,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    newest: (a, b) => createdTime(b) - createdTime(a),
  }
  return indexed.sort((a, b) => compare[sort](a.p, b.p) || a.i - b.i).map(({ p }) => p)
}

export function applyFilters(products: readonly Product[], filters: CatalogFilters): Product[] {
  return sortProducts(filterProducts(products, filters), filters.sort)
}

export interface Facets {
  colors: Array<{ name: string; hex?: string; count: number }>
  materials: Array<{ name: string; count: number }>
  price: { min: number; max: number } | null
  hasDates: boolean
}

/** Valores disponíveis para cada filtro, calculados a partir dos produtos. */
export function computeFacets(products: readonly Product[]): Facets {
  const colors = new Map<string, { name: string; hex?: string; count: number }>()
  const materials = new Map<string, number>()
  for (const p of products) {
    if (p.color?.name) {
      const entry = colors.get(p.color.name) ?? { name: p.color.name, hex: p.color.hex, count: 0 }
      entry.count += 1
      entry.hex ??= p.color.hex
      colors.set(p.color.name, entry)
    }
    if (p.material) materials.set(p.material, (materials.get(p.material) ?? 0) + 1)
  }
  const prices = products.map((p) => p.price)
  return {
    colors: [...colors.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    materials: [...materials.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    price: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
    hasDates: products.some((p) => Number.isFinite(createdTime(p))),
  }
}

/** Um filtro só aparece quando oferece ao menos duas opções. */
export const MIN_FACET_OPTIONS = 2

/** Faixas rápidas de preço; só aparecem as que contêm produtos. */
export const pricePresets: Array<{ label: string; min: number | null; max: number | null }> = [
  { label: 'Até R$ 150', min: null, max: 150 },
  { label: 'R$ 150 a R$ 300', min: 150, max: 300 },
  { label: 'R$ 300 a R$ 500', min: 300, max: 500 },
  { label: 'Acima de R$ 500', min: 500, max: null },
]

// ---- Sincronização com a URL (?q=&categoria=&min=&max=&cor=&material=&disponivel=1&ordem=) ----

const sortKeys = Object.keys(sortLabels) as SortKey[]

function parsePrice(value: string | null): number | null {
  if (value === null || value.trim() === '') return null
  const n = Number(value.replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : null
}

export function filtersFromParams(params: URLSearchParams, defaultSort: SortKey = 'relevance'): CatalogFilters {
  const sort = params.get('ordem') as SortKey | null
  return {
    q: params.get('q') ?? '',
    categories: params.getAll('categoria'),
    minPrice: parsePrice(params.get('min')),
    maxPrice: parsePrice(params.get('max')),
    colors: params.getAll('cor'),
    materials: params.getAll('material'),
    availableOnly: params.get('disponivel') === '1',
    sort: sort && sortKeys.includes(sort) ? sort : defaultSort,
  }
}

export function filtersToParams(filters: CatalogFilters, defaultSort: SortKey = 'relevance'): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.q.trim()) params.set('q', filters.q.trim())
  filters.categories.forEach((c) => params.append('categoria', c))
  if (filters.minPrice !== null) params.set('min', String(filters.minPrice))
  if (filters.maxPrice !== null) params.set('max', String(filters.maxPrice))
  filters.colors.forEach((c) => params.append('cor', c))
  filters.materials.forEach((m) => params.append('material', m))
  if (filters.availableOnly) params.set('disponivel', '1')
  if (filters.sort !== defaultSort) params.set('ordem', filters.sort)
  return params
}

/** Quantidade de filtros ativos (a ordenação e a busca não contam). */
export function countActiveFilters(filters: CatalogFilters): number {
  return (
    filters.categories.length +
    filters.colors.length +
    filters.materials.length +
    (filters.minPrice !== null ? 1 : 0) +
    (filters.maxPrice !== null ? 1 : 0) +
    (filters.availableOnly ? 1 : 0)
  )
}
