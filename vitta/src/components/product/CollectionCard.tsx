import { Link } from 'react-router'
import type { Collection } from '../../types/catalog'
import { getCollectionProducts } from '../../lib/catalog'
import { pluralize } from '../../lib/format'
import { ProductImage } from './ProductImage'

export function CollectionCard({ collection, headingLevel: Heading = 'h3' }: { collection: Collection; headingLevel?: 'h2' | 'h3' }) {
  const count = getCollectionProducts(collection).length
  return (
    <article className="group relative">
      <div className="aspect-[3/2] overflow-hidden rounded-md bg-cream">
        <ProductImage src={collection.image} alt="" className="transition-transform duration-700 ease-soft group-hover:scale-[1.03]" />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <Heading className="text-2xl">
          <Link to={`/colecoes/${collection.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-md focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-cocoa">
            {collection.name}
          </Link>
        </Heading>
        <span className="shrink-0 text-xs text-stone">{pluralize(count, 'peça', 'peças')}</span>
      </div>
      <p className="mt-1 text-sm text-stone">{collection.description}</p>
    </article>
  )
}
