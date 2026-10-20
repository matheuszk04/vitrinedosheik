import type { Category, Collection } from '../types/catalog'
import type { Product } from '../types/product'
import { parseISODate } from './format'

export interface CatalogIssue {
  level: 'error' | 'warning'
  message: string
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const STOCK = new Set(['in_stock', 'low_stock', 'out_of_stock', 'preorder'])
const MODEL_FORMATS = new Set(['glb', 'gltf', 'usdz'])

function duplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const dup = new Set<string>()
  for (const v of values) (seen.has(v) ? dup : seen).add(v)
  return [...dup]
}

/**
 * Confere a coerência do catálogo: ids e slugs repetidos, referências
 * quebradas, preços inválidos e datas fora do formato. Executado nos testes
 * (npm test) e avisado no console durante o desenvolvimento.
 */
export function validateCatalog(products: Product[], categories: Category[], collections: Collection[]): CatalogIssue[] {
  const issues: CatalogIssue[] = []
  const error = (message: string) => issues.push({ level: 'error', message })
  const warn = (message: string) => issues.push({ level: 'warning', message })

  duplicates(products.map((p) => p.id)).forEach((id) => error(`Produto: id repetido "${id}".`))
  duplicates(products.map((p) => p.slug)).forEach((s) => error(`Produto: slug repetido "${s}".`))
  duplicates(categories.map((c) => c.id)).forEach((id) => error(`Categoria: id repetido "${id}".`))
  duplicates(categories.map((c) => c.slug)).forEach((s) => error(`Categoria: slug repetido "${s}".`))
  duplicates(collections.map((c) => c.id)).forEach((id) => error(`Coleção: id repetido "${id}".`))
  duplicates(collections.map((c) => c.slug)).forEach((s) => error(`Coleção: slug repetido "${s}".`))

  const categoryIds = new Set(categories.map((c) => c.id))
  const productIds = new Set(products.map((p) => p.id))

  for (const p of products) {
    const ref = `Produto "${p.id}"`
    if (!p.id?.trim()) error(`${ref}: id vazio.`)
    if (!p.name?.trim()) error(`${ref}: nome vazio.`)
    if (!SLUG.test(p.slug)) error(`${ref}: slug "${p.slug}" deve ter só letras minúsculas, números e hífens.`)
    if (!categoryIds.has(p.categoryId)) error(`${ref}: categoria "${p.categoryId}" não existe em categories.ts.`)
    if (typeof p.price !== 'number' || !Number.isFinite(p.price) || p.price <= 0)
      error(`${ref}: preço inválido (${String(p.price)}). Use um número, ex.: 189.9.`)
    if (p.compareAtPrice !== undefined && !(p.compareAtPrice > p.price))
      warn(`${ref}: compareAtPrice deve ser maior que price; o preço anterior não será exibido.`)
    if (!STOCK.has(p.stockStatus)) error(`${ref}: stockStatus "${p.stockStatus}" inválido.`)
    if (!Array.isArray(p.images)) error(`${ref}: images deve ser uma lista (use [] se não houver fotos).`)
    else {
      if (p.images.length === 0) warn(`${ref}: sem imagens; será exibido um marcador neutro.`)
      p.images.forEach((src) => {
        if (!src.startsWith('/')) warn(`${ref}: imagem "${src}" deve começar com "/" (caminho a partir de public/).`)
      })
    }
    if (p.createdAt !== undefined && !parseISODate(p.createdAt))
      error(`${ref}: createdAt "${p.createdAt}" deve estar no formato AAAA-MM-DD.`)
    if (p.bestSellerRank !== undefined && !(Number.isInteger(p.bestSellerRank) && p.bestSellerRank > 0))
      error(`${ref}: bestSellerRank deve ser um número inteiro maior que zero.`)
    if (p.model3d) {
      if (!MODEL_FORMATS.has(p.model3d.format)) error(`${ref}: formato 3D "${p.model3d.format}" não suportado.`)
      if (!p.model3d.src?.trim()) error(`${ref}: model3d.src vazio.`)
    }
  }

  for (const c of collections) {
    if (!SLUG.test(c.slug)) error(`Coleção "${c.id}": slug "${c.slug}" inválido.`)
    c.productIds.forEach((id) => {
      if (!productIds.has(id)) error(`Coleção "${c.id}": produto "${id}" não existe em products.ts.`)
    })
  }

  for (const c of categories) {
    if (!SLUG.test(c.slug)) error(`Categoria "${c.id}": slug "${c.slug}" inválido.`)
  }

  return issues
}
