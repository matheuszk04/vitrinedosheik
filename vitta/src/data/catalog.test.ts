import { describe, expect, it } from 'vitest'
import { validateCatalog } from '../lib/validate-catalog'
import type { Product } from '../types/product'
import { categories } from './categories'
import { collections } from './collections'
import { products } from './products'

/**
 * Rode `npm run check:catalog` depois de editar os arquivos de dados.
 * Este teste falha se houver ids repetidos, categorias inexistentes,
 * preços inválidos ou referências quebradas.
 */
describe('catálogo cadastrado', () => {
  it('não tem erros de cadastro', () => {
    const errors = validateCatalog(products, categories, collections).filter((i) => i.level === 'error')
    expect(errors.map((e) => e.message)).toEqual([])
  })

  it('tem dados suficientes para demonstrar todas as funcionalidades', () => {
    expect(products.length).toBeGreaterThan(8)
    expect(products.some((p) => p.images.length === 0)).toBe(true)
    expect(products.some((p) => p.stockStatus === 'out_of_stock')).toBe(true)
    expect(products.some((p) => p.compareAtPrice && p.compareAtPrice > p.price)).toBe(true)
  })
})

describe('validateCatalog', () => {
  const base: Product = {
    id: 'x-1',
    slug: 'produto-x',
    name: 'Produto X',
    description: '',
    price: 10,
    categoryId: categories[0]!.id,
    images: ['/images/x.jpg'],
    stockStatus: 'in_stock',
  }

  it('aponta ids e slugs repetidos', () => {
    const issues = validateCatalog([base, { ...base }], categories, [])
    expect(issues.some((i) => i.message.includes('id repetido'))).toBe(true)
    expect(issues.some((i) => i.message.includes('slug repetido'))).toBe(true)
  })

  it('aponta categoria inexistente, preço inválido, slug e data mal formatados', () => {
    const bad = { ...base, categoryId: 'nao-existe', price: Number.NaN, slug: 'Com Espaço', createdAt: '20/10/2026' }
    const messages = validateCatalog([bad], categories, []).map((i) => i.message).join('\n')
    expect(messages).toContain('não existe em categories.ts')
    expect(messages).toContain('preço inválido')
    expect(messages).toContain('slug "Com Espaço"')
    expect(messages).toContain('AAAA-MM-DD')
  })

  it('aponta coleção que referencia produto inexistente', () => {
    const issues = validateCatalog([base], categories, [{ id: 'c', slug: 'c', name: 'C', description: '', productIds: ['fantasma'] }])
    expect(issues.some((i) => i.message.includes('"fantasma"'))).toBe(true)
  })

  it('avisa (sem erro) sobre produto sem imagens e preço anterior menor que o atual', () => {
    const issues = validateCatalog([{ ...base, images: [], compareAtPrice: 5 }], categories, [])
    expect(issues.filter((i) => i.level === 'error')).toEqual([])
    expect(issues.filter((i) => i.level === 'warning')).toHaveLength(2)
  })
})
