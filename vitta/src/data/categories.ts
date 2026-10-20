import type { Category } from '../types/catalog'

/**
 * Categorias da loja. Para adicionar uma, copie um bloco, troque `id`,
 * `slug` e `name`. Sem `image`, o atalho usa a primeira foto de um produto
 * da categoria. Veja docs/EDITAR-CATALOGO.md.
 */
export const categories: Category[] = [
  {
    id: 'iluminacao',
    slug: 'iluminacao',
    name: 'Iluminação',
    description: 'Luminárias e lanternas para uma luz acolhedora.',
    order: 1,
  },
  {
    id: 'vasos-e-plantas',
    slug: 'vasos-e-plantas',
    name: 'Vasos e plantas',
    description: 'Vasos, terrários e peças para trazer o verde para dentro de casa.',
    order: 2,
  },
  {
    id: 'esculturas',
    slug: 'esculturas',
    name: 'Esculturas',
    description: 'Estátuas e esculturas para estantes, aparadores e mesas.',
    order: 3,
  },
  {
    id: 'objetos-decorativos',
    slug: 'objetos-decorativos',
    name: 'Objetos decorativos',
    description: 'Relógios, pêndulos, globos e outros objetos que completam o ambiente.',
    order: 4,
  },
]
