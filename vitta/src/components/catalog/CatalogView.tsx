import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import type { Product } from '../../types/product'
import { allCategories, getCategoryById } from '../../lib/catalog'
import { formatPrice, pluralize } from '../../lib/format'
import {
  applyFilters,
  computeFacets,
  countActiveFilters,
  emptyFilters,
  filtersFromParams,
  filtersToParams,
  sortLabels,
  type CatalogFilters,
  type SortKey,
} from '../../lib/filters'
import { Breadcrumbs, type Crumb } from '../ui/Breadcrumbs'
import { Button } from '../ui/Button'
import { Drawer } from '../ui/Drawer'
import { EmptyState } from '../ui/EmptyState'
import { Icon } from '../ui/Icon'
import { ProductGrid } from '../product/ProductGrid'
import { FilterPanel } from './FilterPanel'

const PAGE_SIZE = 24

interface CatalogViewProps {
  title: string
  eyebrow?: string
  description?: ReactNode
  breadcrumbs: Crumb[]
  /** Lista de origem desta página, já na ordem "Recomendados". */
  products: readonly Product[]
  defaultSort?: SortKey
  /** Esconde o filtro de categoria (ex.: dentro de uma categoria). */
  hideCategoryFilter?: boolean
}

/**
 * Catálogo com busca, filtros, ordenação e paginação incremental. O estado
 * fica na URL — o endereço pode ser compartilhado e o botão voltar funciona.
 */
export function CatalogView({ title, eyebrow, description, breadcrumbs, products, defaultSort = 'relevance', hideCategoryFilter }: CatalogViewProps) {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => filtersFromParams(params, defaultSort), [params, defaultSort])
  const facets = useMemo(() => computeFacets(products), [products])
  const results = useMemo(() => applyFilters(products, filters), [products, filters])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [searchText, setSearchText] = useState(filters.q)
  // Último termo enviado pela própria caixa de busca à URL.
  const [pushedQ, setPushedQ] = useState(filters.q)

  // Volta à primeira "página" quando os filtros mudam.
  const key = params.toString()
  const [prevKey, setPrevKey] = useState(key)
  const [prevQ, setPrevQ] = useState(filters.q)
  if (key !== prevKey) {
    setPrevKey(key)
    setVisible(PAGE_SIZE)
  }
  // A busca mudou por fora (voltar, link, busca do cabeçalho): reflete no campo.
  if (filters.q !== prevQ) {
    setPrevQ(filters.q)
    if (filters.q !== pushedQ) setSearchText(filters.q)
  }

  const update = (patch: Partial<CatalogFilters>, replace = false) => {
    setParams(filtersToParams({ ...filters, ...patch }, defaultSort), { replace, preventScrollReset: true })
  }

  // Busca em tempo real com pequeno atraso, sem poluir o histórico.
  useEffect(() => {
    if (searchText.trim() === filters.q) return
    const t = window.setTimeout(() => {
      setPushedQ(searchText.trim())
      setParams(filtersToParams({ ...filters, q: searchText }, defaultSort), { replace: true, preventScrollReset: true })
    }, 250)
    return () => window.clearTimeout(t)
  }, [searchText, filters, setParams, defaultSort])

  const categories = hideCategoryFilter ? [] : [...allCategories]
  const activeCount = countActiveFilters({ ...filters, categories: hideCategoryFilter ? [] : filters.categories })
  const sortOptions = (Object.keys(sortLabels) as SortKey[]).filter((k) => k !== 'newest' || facets.hasDates)
  const clearAll = () => {
    setSearchText('')
    setParams(filtersToParams({ ...emptyFilters, sort: filters.sort }, defaultSort), { preventScrollReset: true })
  }

  const chips: Array<{ label: string; remove: () => void }> = [
    ...(hideCategoryFilter ? [] : filters.categories).map((id) => ({
      label: getCategoryById(id)?.name ?? id,
      remove: () => update({ categories: filters.categories.filter((c) => c !== id) }),
    })),
    ...(filters.minPrice !== null || filters.maxPrice !== null
      ? [
          {
            label:
              filters.minPrice !== null && filters.maxPrice !== null
                ? `${formatPrice(filters.minPrice)} a ${formatPrice(filters.maxPrice)}`
                : filters.minPrice !== null
                  ? `A partir de ${formatPrice(filters.minPrice)}`
                  : `Até ${formatPrice(filters.maxPrice!)}`,
            remove: () => update({ minPrice: null, maxPrice: null }),
          },
        ]
      : []),
    ...filters.colors.map((c) => ({ label: c, remove: () => update({ colors: filters.colors.filter((x) => x !== c) }) })),
    ...filters.materials.map((m) => ({ label: m, remove: () => update({ materials: filters.materials.filter((x) => x !== m) }) })),
    ...(filters.availableOnly ? [{ label: 'Sem esgotados', remove: () => update({ availableOnly: false }) }] : []),
  ]

  const panel = (prefix: string) => (
    <FilterPanel idPrefix={prefix} filters={filters} facets={facets} baseProducts={products} categories={categories} onChange={(patch) => update(patch)} />
  )

  return (
    <div className="container-site pt-6 md:pt-8">
      <Breadcrumbs items={breadcrumbs} />
      <header className="mt-6 max-w-prose md:mt-8">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="text-display">{title}</h1>
        {description && <p className="mt-3 text-stone">{description}</p>}
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[15rem_1fr] xl:gap-14">
        <aside aria-label="Filtros" className="hidden lg:block">
          <div className="sticky top-[calc(var(--spacing-header)+1.5rem)]">
            <h2 className="sr-only">Filtros</h2>
            {panel('f')}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-line pb-4">
            <div className="relative min-w-0 flex-1 basis-56">
              <label htmlFor="busca-catalogo" className="sr-only">
                Buscar no catálogo
              </label>
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone" />
              <input
                id="busca-catalogo"
                type="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Buscar neste catálogo"
                className="h-11 w-full rounded-sm border border-linen bg-white/60 pl-9 pr-3 text-sm focus:border-cocoa focus:outline-none"
              />
            </div>
            <Button variant="secondary" className="lg:hidden" onClick={() => setFiltersOpen(true)} aria-haspopup="dialog">
              <Icon name="sliders" className="size-4" />
              Filtros{activeCount > 0 && <span className="tabular-nums">({activeCount})</span>}
            </Button>
            <div className="flex items-center gap-2">
              <label htmlFor="ordenar" className="text-sm text-stone">
                Ordenar
              </label>
              <select
                id="ordenar"
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value as SortKey })}
                className="h-11 rounded-sm border border-linen bg-white/60 px-3 text-sm text-ink focus:border-cocoa focus:outline-none"
              >
                {sortOptions.map((k) => (
                  <option key={k} value={k}>
                    {sortLabels[k]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 py-4">
            <p className="mr-2 text-sm text-stone" aria-live="polite" data-testid="result-count">
              {pluralize(results.length, 'produto', 'produtos')}
              {filters.q && (
                <>
                  {' '}
                  para “<span className="text-ink">{filters.q}</span>”
                </>
              )}
            </p>
            {chips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.remove}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-sand px-3 text-xs text-ink transition-colors hover:bg-linen"
                aria-label={`Remover filtro ${chip.label}`}
              >
                {chip.label}
                <Icon name="close" className="size-3" />
              </button>
            ))}
            {(chips.length > 0 || filters.q) && (
              <button type="button" onClick={clearAll} className="min-h-8 px-1 text-xs font-medium text-cocoa underline underline-offset-4">
                Limpar filtros
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <EmptyState
              title="Nenhum produto encontrado"
              action={
                <Button variant="secondary" onClick={clearAll}>
                  Limpar busca e filtros
                </Button>
              }
            >
              {products.length === 0
                ? 'Ainda não há produtos cadastrados nesta seção.'
                : 'Tente outros termos ou remova alguns filtros.'}
            </EmptyState>
          ) : (
            <>
              <ProductGrid products={results.slice(0, visible)} priorityCount={4} headingLevel="h2" label={title} columns="default" />
              {results.length > visible && (
                <div className="mt-12 flex flex-col items-center gap-3">
                  <p className="text-xs text-stone">
                    Exibindo {visible} de {results.length}
                  </p>
                  <Button variant="secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    Mostrar mais produtos
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filtros"
        side="right"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={clearAll} disabled={activeCount === 0}>
              Limpar
            </Button>
            <Button className="flex-[2]" onClick={() => setFiltersOpen(false)}>
              Ver {pluralize(results.length, 'produto', 'produtos')}
            </Button>
          </div>
        }
      >
        <div className="p-5">{panel('m')}</div>
      </Drawer>
    </div>
  )
}
