export interface Category {
  /** Identificador estável, referenciado por `Product.categoryId`. */
  id: string
  /** Endereço da página: /categorias/<slug>. */
  slug: string
  name: string
  description?: string
  /** Imagem do atalho visual, a partir da pasta public. */
  image?: string
  /** Ordem de exibição (menor primeiro). */
  order: number
}

export interface Collection {
  id: string
  /** Endereço da página: /colecoes/<slug>. */
  slug: string
  name: string
  description: string
  image?: string
  /** Ids dos produtos da coleção, na ordem de exibição. */
  productIds: string[]
}
