import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { allProducts } from '../../lib/catalog'
import { matchesSearch } from '../../lib/filters'
import { cx } from '../../lib/cx'
import { formatPrice } from '../../lib/format'
import { Icon } from '../ui/Icon'
import { ProductImage } from '../product/ProductImage'

const SUGGESTIONS = 5

interface SearchPanelProps {
  open: boolean
  onClose: () => void
}

/** Busca que se abre abaixo do cabeçalho, com sugestões enquanto se digita. */
export function SearchPanel({ open, onClose }: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const resultsId = useId()

  const results = useMemo(
    () => (query.trim().length >= 2 ? allProducts.filter((p) => matchesSearch(p, query)) : []),
    [query],
  )

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const q = query.trim()
    navigate(q ? `/produtos?q=${encodeURIComponent(q)}` : '/produtos')
    setQuery('')
    onClose()
  }

  return (
    <div
      inert={!open}
      className={cx(
        'absolute inset-x-0 top-full border-b border-line bg-ivory shadow-soft duration-200',
        // Ao abrir, a visibilidade muda na hora (para o campo poder receber foco); ao fechar, espera a animação.
        open ? 'visible translate-y-0 opacity-100 transition-[opacity,transform]' : 'invisible -translate-y-2 opacity-0 transition-[opacity,transform,visibility]',
      )}
    >
      <div className="container-site py-5">
        <form role="search" onSubmit={submit} className="relative mx-auto max-w-2xl">
          <label htmlFor="busca-global" className="sr-only">
            Buscar produtos
          </label>
          <Icon name="search" className="pointer-events-none absolute left-0 top-1/2 size-5 -translate-y-1/2 text-stone" />
          <input
            ref={inputRef}
            id="busca-global"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar vasos, luminárias, linho…"
            autoComplete="off"
            aria-describedby={resultsId}
            className="h-12 w-full border-b border-linen bg-transparent pl-8 pr-24 font-serif text-xl text-ink placeholder:text-stone/60 focus:border-cocoa focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="submit"
            className="absolute right-0 top-1/2 -translate-y-1/2 px-2 py-2 text-sm font-medium text-cocoa underline decoration-linen underline-offset-4 hover:decoration-cocoa"
          >
            Buscar
          </button>
        </form>

        <div id={resultsId} className="mx-auto max-w-2xl">
          <p className="sr-only" aria-live="polite">
            {query.trim().length >= 2 ? `${results.length} produtos encontrados` : ''}
          </p>
          {query.trim().length >= 2 && (
            <div className="pt-4">
              {results.length === 0 ? (
                <p className="py-2 text-sm text-stone">Nenhum produto encontrado para “{query.trim()}”.</p>
              ) : (
                <ul aria-label="Sugestões de produtos" className="divide-y divide-line">
                  {results.slice(0, SUGGESTIONS).map((p) => (
                    <li key={p.id}>
                      <Link
                        to={`/produto/${p.slug}`}
                        onClick={() => {
                          setQuery('')
                          onClose()
                        }}
                        className="flex items-center gap-4 rounded-sm py-2.5 hover:bg-cream"
                      >
                        <span className="aspect-[4/5] w-11 shrink-0 overflow-hidden rounded-xs bg-cream">
                          <ProductImage src={p.images[0]} alt="" />
                        </span>
                        <span className="flex-1 text-sm text-ink">{p.name}</span>
                        <span className="text-sm tabular-nums text-stone">{formatPrice(p.price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {results.length > SUGGESTIONS && (
                <button type="button" onClick={submit} className="mt-3 text-sm font-medium text-cocoa underline underline-offset-4">
                  Ver todos os {results.length} resultados
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
