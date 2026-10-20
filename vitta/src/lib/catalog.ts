import { categories as categoryData } from '../data/categories'
import { collections as collectionData } from '../data/collections'
import { products as productData } from '../data/products'
import type { Category, Collection } from '../types/catalog'
import type { Product } from '../types/product'
import { parseISODate } from './format'

/**
 * Ponto único de acesso ao catálogo. Componentes nunca importam os arquivos
 * de dados diretamente: quando houver um back-end, só este módulo muda.
 */
export const allProducts: readonly Product[] = productData
export const allCategories: readonly Category[] = [...categoryData].sort((a, b) => a.order - b.order)
export const allCollections: readonly Collection[] = collectionData

const productsById = new Map(allProducts.map((p) => [p.id, p]))
const productsBySlug = new Map(allProducts.map((p) => [p.slug, p]))
const categoriesById = new Map(allCategories.map((c) => [c.id, c]))

export function getProductById(id: string): Product | undefined {
  return productsById.get(id)
}

export function getProductBySlug(slug: string): Product | undefined {
  return productsBySlug.get(slug)
}

export function getCategoryById(id: string): Category | undefined {
  return categoriesById.get(id)
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return allCategories.find((c) => c.slug === slug)
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return allCollections.find((c) => c.slug === slug)
}

export function getCollectionProducts(collection: Collection): Product[] {
  return collection.productIds.flatMap((id) => {
    const product = productsById.get(id)
    return product ? [product] : []
  })
}

export function getCategoryProducts(categoryId: string, products: readonly Product[] = allProducts): Product[] {
  return products.filter((p) => p.categoryId === categoryId)
}

/** Imagem do atalho da categoria; sem imagem própria, usa a primeira foto de um produto dela. */
export function getCategoryImage(category: Category): string | undefined {
  return category.image ?? allProducts.find((p) => p.categoryId === category.id && p.images[0])?.images[0]
}

/** Categorias que têm ao menos um produto. */
export function getCategoriesWithProducts(products: readonly Product[] = allProducts): Category[] {
  const used = new Set(products.map((p) => p.categoryId))
  return allCategories.filter((c) => used.has(c.id))
}

export function createdTime(product: Product): number {
  return parseISODate(product.createdAt)?.getTime() ?? Number.NEGATIVE_INFINITY
}

/** Mais recentes primeiro; ignora produtos sem data de cadastro. */
export function getNewArrivals(limit: number, products: readonly Product[] = allProducts): Product[] {
  return products
    .filter((p) => parseISODate(p.createdAt))
    .sort((a, b) => createdTime(b) - createdTime(a))
    .slice(0, limit)
}

/** Apenas produtos com `bestSellerRank` informado, em ordem de posição. */
export function getBestSellers(products: readonly Product[] = allProducts): Product[] {
  return products
    .filter((p) => typeof p.bestSellerRank === 'number')
    .sort((a, b) => a.bestSellerRank! - b.bestSellerRank!)
}

export function getFeatured(products: readonly Product[] = allProducts): Product[] {
  return products.filter((p) => p.featured)
}

/** Mesma categoria primeiro, depois produtos que compartilham etiquetas ou material. */
export function getRelatedProducts(product: Product, limit = 4, products: readonly Product[] = allProducts): Product[] {
  const tags = new Set(product.tags ?? [])
  const score = (p: Product) =>
    (p.categoryId === product.categoryId ? 4 : 0) +
    (p.tags ?? []).filter((t) => tags.has(t)).length * 2 +
    (product.material && p.material === product.material ? 1 : 0)
  return products
    .filter((p) => p.id !== product.id)
    .map((p) => ({ p, s: score(p) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ p }) => p)
}
