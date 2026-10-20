import type { Category } from '../types/catalog'

/**
 * Categorias da loja. Para adicionar uma, copie um bloco, troque `id`,
 * `slug`, `name` e a imagem. Veja docs/EDITAR-CATALOGO.md.
 */
export const categories: Category[] = [
  {
    id: 'vasos-e-ceramicas',
    slug: 'vasos-e-ceramicas',
    name: 'Vasos e cerâmicas',
    description: 'Peças de forma simples, para flores, ramos secos ou para ficarem sozinhas.',
    image: '/images/categories/vasos-e-ceramicas.svg',
    order: 1,
  },
  {
    id: 'iluminacao',
    slug: 'iluminacao',
    name: 'Iluminação',
    description: 'Luminárias e pendentes de luz suave, para ambientes acolhedores.',
    image: '/images/categories/iluminacao.svg',
    order: 2,
  },
  {
    id: 'texteis',
    slug: 'texteis',
    name: 'Têxteis',
    description: 'Almofadas e mantas em fibras naturais e tons neutros.',
    image: '/images/categories/texteis.svg',
    order: 3,
  },
  {
    id: 'objetos-decorativos',
    slug: 'objetos-decorativos',
    name: 'Objetos decorativos',
    description: 'Esculturas, velas e pequenos objetos que completam a composição.',
    image: '/images/categories/objetos-decorativos.svg',
    order: 4,
  },
  {
    id: 'mesa-posta',
    slug: 'mesa-posta',
    name: 'Mesa posta',
    description: 'Pratos, jarras e bandejas para receber com calma.',
    image: '/images/categories/mesa-posta.svg',
    order: 5,
  },
  {
    id: 'espelhos-e-quadros',
    slug: 'espelhos-e-quadros',
    name: 'Espelhos e quadros',
    description: 'Peças de parede que ampliam e dão ritmo ao ambiente.',
    image: '/images/categories/espelhos-e-quadros.svg',
    order: 6,
  },
]
