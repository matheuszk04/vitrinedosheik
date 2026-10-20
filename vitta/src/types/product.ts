/**
 * Modelo de dados do catálogo VITTA.
 *
 * Estes tipos descrevem apenas dados — nenhum componente visual depende de
 * detalhes de armazenamento. Um back-end futuro pode devolver objetos com a
 * mesma forma sem que a interface precise mudar.
 */

/** Situação de disponibilidade exibida na loja. */
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder'

/** Medidas em centímetros (e peso em quilos). Preencha só o que for real. */
export interface ProductDimensions {
  widthCm?: number
  heightCm?: number
  depthCm?: number
  diameterCm?: number
  weightKg?: number
}

export interface ProductColor {
  /** Nome exibido e usado no filtro, ex.: "Terracota". */
  name: string
  /** Amostra visual opcional, ex.: "#B9785A". */
  hex?: string
}

/** Formatos de modelo 3D previstos para a futura visualização interativa. */
export type Model3DFormat = 'glb' | 'gltf' | 'usdz'

/**
 * Referência opcional a um modelo tridimensional do produto.
 * Ainda não há visualizador 3D: a galeria apenas reconhece o item e reserva
 * o espaço para ele. A ausência deste campo nunca afeta a página do produto.
 */
export interface ProductModel3D {
  /** Caminho do arquivo, ex.: "/models/vaso-anfora.glb". */
  src: string
  format: Model3DFormat
  /** Imagem estática exibida antes do carregamento do modelo. */
  poster?: string
  /** Só exibe a visualização 3D quando `true`. Permite cadastrar o arquivo antes de liberá-lo. */
  available: boolean
  /** Metadados opcionais para o visualizador (câmera, rotação, realidade aumentada). */
  viewer?: {
    cameraOrbit?: string
    autoRotate?: boolean
    arEnabled?: boolean
    /** Arquivo alternativo para Quick Look no iOS. */
    iosSrc?: string
  }
}

export interface Product {
  /** Identificador estável e único. Nunca reutilize o id de um produto removido. */
  id: string
  /** Endereço da página: /produto/<slug>. Apenas letras minúsculas, números e hífens. */
  slug: string
  name: string
  description: string
  /** Preço atual em reais, ex.: 289.9 */
  price: number
  /** Preço "de" (anterior), exibido riscado quando maior que `price`. */
  compareAtPrice?: number
  /** Referência ao `id` de uma categoria em categories.ts. */
  categoryId: string
  /** Caminhos de imagem a partir da pasta public, ex.: "/images/products/vaso-1.jpg". */
  images: string[]
  material?: string
  color?: ProductColor
  dimensions?: ProductDimensions
  stockStatus: StockStatus
  /** Aparece na seção "Em destaque" da página inicial. */
  featured?: boolean
  /**
   * Posição na lista de mais vendidos (1 = primeiro). Preencha a partir de
   * dados reais de venda; deixe vazio quando não houver.
   */
  bestSellerRank?: number
  /** Data de cadastro no formato AAAA-MM-DD. Usada em "Novidades". */
  createdAt?: string
  tags?: string[]
  model3d?: ProductModel3D
  /** Marca o produto como dado ilustrativo de demonstração. */
  isDemo?: boolean
}
