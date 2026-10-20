import type { Collection } from '../types/catalog'

/**
 * Coleções editoriais (ambientes). Referenciam produtos pelo `id`.
 * Conteúdo de DEMONSTRAÇÃO — substitua pelas coleções reais.
 */
export const collections: Collection[] = [
  {
    id: 'terra',
    slug: 'terra',
    name: 'Terra',
    description: 'Cerâmica, fibras e pedra em tons de argila. Uma composição quente para salas e aparadores.',
    image: '/images/collections/terra.svg',
    productIds: ['p-001', 'p-003', 'p-014', 'p-005'],
  },
  {
    id: 'linho-e-luz',
    slug: 'linho-e-luz',
    name: 'Linho e luz',
    description: 'Texturas leves e luz difusa para quartos e cantos de leitura.',
    image: '/images/collections/linho-e-luz.svg',
    productIds: ['p-004', 'p-007', 'p-008', 'p-006'],
  },
  {
    id: 'mesa-de-domingo',
    slug: 'mesa-de-domingo',
    name: 'Mesa de domingo',
    description: 'Peças para uma mesa posta sem pressa, do café ao jantar.',
    image: '/images/collections/mesa-de-domingo.svg',
    productIds: ['p-010', 'p-011', 'p-009', 'p-016'],
  },
]
