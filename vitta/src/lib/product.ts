import type { Product, ProductDimensions, StockStatus } from '../types/product'
import { formatNumber } from './format'

export const stockLabels: Record<StockStatus, string> = {
  in_stock: 'Disponível',
  low_stock: 'Últimas unidades',
  out_of_stock: 'Esgotado',
  preorder: 'Sob encomenda',
}

export function isPurchasable(product: Pick<Product, 'stockStatus'>): boolean {
  return product.stockStatus !== 'out_of_stock'
}

/** Verdadeiro quando há preço anterior válido e maior que o atual. */
export function isOnSale(product: Pick<Product, 'price' | 'compareAtPrice'>): boolean {
  return typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price
}

export function discountPercent(product: Pick<Product, 'price' | 'compareAtPrice'>): number | null {
  if (!isOnSale(product)) return null
  return Math.round((1 - product.price / product.compareAtPrice!) * 100)
}

const dimensionLabels: Array<[keyof ProductDimensions, string, string]> = [
  ['widthCm', 'Largura', 'cm'],
  ['heightCm', 'Altura', 'cm'],
  ['depthCm', 'Profundidade', 'cm'],
  ['diameterCm', 'Diâmetro', 'cm'],
  ['weightKg', 'Peso', 'kg'],
]

/** Lista apenas as medidas preenchidas, já formatadas. */
export function describeDimensions(dimensions: ProductDimensions | undefined): Array<{ label: string; value: string }> {
  if (!dimensions) return []
  return dimensionLabels.flatMap(([key, label, unit]) => {
    const value = dimensions[key]
    return typeof value === 'number' && Number.isFinite(value) && value > 0
      ? [{ label, value: `${formatNumber(value)} ${unit}` }]
      : []
  })
}

export type ProductMedia =
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'model3d'; src: string; format: string; poster?: string; alt: string }

/**
 * Itens da galeria do produto. Hoje são imagens; quando `model3d.available`
 * for verdadeiro, o modelo entra como item adicional sem alterar o restante.
 */
export function getProductMedia(product: Product): ProductMedia[] {
  const images: ProductMedia[] = product.images
    .filter((src) => typeof src === 'string' && src.trim() !== '')
    .map((src, index) => ({
      kind: 'image',
      src,
      alt: index === 0 ? product.name : `${product.name} — imagem ${index + 1}`,
    }))
  if (product.model3d?.available) {
    images.push({
      kind: 'model3d',
      src: product.model3d.src,
      format: product.model3d.format,
      poster: product.model3d.poster ?? product.images[0],
      alt: `${product.name} — modelo 3D`,
    })
  }
  return images
}
