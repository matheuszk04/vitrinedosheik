import { useState } from 'react'
import type { Category } from '../../types/catalog'
import type { Product } from '../../types/product'
import { cx } from '../../lib/cx'
import { formatPrice } from '../../lib/format'
import { MIN_FACET_OPTIONS, pricePresets, type CatalogFilters, type Facets } from '../../lib/filters'
import { Icon } from '../ui/Icon'

interface FilterPanelProps {
  idPrefix: string
  filters: CatalogFilters
  facets: Facets
  baseProducts: readonly Product[]
  categories: Category[]
  onChange: (patch: Partial<CatalogFilters>) => void
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function Section({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-line py-5 first:pt-0 last:border-b-0">
      <legend className="eyebrow float-left mb-3 w-full">{legend}</legend>
      <div className="clear-left">{children}</div>
    </fieldset>
  )
}

function Check({ id, label, count, checked, onChange, swatch }: { id: string; label: string; count?: number; checked: boolean; onChange: () => void; swatch?: string }) {
  return (
    <label htmlFor={id} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-sm text-sm text-ink hover:text-cocoa">
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="grid size-[1.125rem] shrink-0 place-items-center rounded-xs border border-linen bg-white/60 text-ivory transition-colors peer-checked:border-cocoa peer-checked:bg-cocoa peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cocoa"
      >
        {checked && <Icon name="check" className="size-3" strokeWidth={2.5} />}
      </span>
      {swatch !== undefined && (
        <span aria-hidden="true" className="size-4 shrink-0 rounded-full border border-ink/10" style={{ background: swatch || 'linear-gradient(135deg,#fff,#dde3e0)' }} />
      )}
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs tabular-nums text-stone">{count}</span>}
    </label>
  )
}

/** Filtros do catálogo. Cada grupo só aparece quando os dados permitem filtrar de verdade. */
export function FilterPanel({ idPrefix, filters, facets, baseProducts, categories, onChange }: FilterPanelProps) {
  const categoryCounts = new Map<string, number>()
  baseProducts.forEach((p) => categoryCounts.set(p.categoryId, (categoryCounts.get(p.categoryId) ?? 0) + 1))
  const visibleCategories = categories.filter((c) => categoryCounts.has(c.id))
  const presets = facets.price
    ? pricePresets.filter((p) => baseProducts.some((b) => (p.min === null || b.price >= p.min) && (p.max === null || b.price <= p.max)))
    : []
  const hasUnavailable = baseProducts.some((p) => p.stockStatus === 'out_of_stock')

  return (
    <div className="text-sm">
      {visibleCategories.length >= MIN_FACET_OPTIONS && (
        <Section legend="Categoria">
          {visibleCategories.map((c) => (
            <Check
              key={c.id}
              id={`${idPrefix}-cat-${c.id}`}
              label={c.name}
              count={categoryCounts.get(c.id)}
              checked={filters.categories.includes(c.id)}
              onChange={() => onChange({ categories: toggle(filters.categories, c.id) })}
            />
          ))}
        </Section>
      )}

      {facets.price && facets.price.min !== facets.price.max && (
        <Section legend="Preço">
          {presets.length >= MIN_FACET_OPTIONS && (
            <div className="mb-4 flex flex-wrap gap-2">
              {presets.map((p) => {
                const active = filters.minPrice === p.min && filters.maxPrice === p.max
                return (
                  <button
                    key={p.label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChange(active ? { minPrice: null, maxPrice: null } : { minPrice: p.min, maxPrice: p.max })}
                    className={cx(
                      'min-h-9 rounded-full border px-3 text-[0.8125rem] transition-colors',
                      active ? 'border-cocoa bg-cocoa text-ivory' : 'border-linen text-ink hover:border-cocoa',
                    )}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          )}
          <PriceRange
            key={`${filters.minPrice}-${filters.maxPrice}`}
            idPrefix={idPrefix}
            min={filters.minPrice}
            max={filters.maxPrice}
            bounds={facets.price}
            onApply={(minPrice, maxPrice) => onChange({ minPrice, maxPrice })}
          />
        </Section>
      )}

      {facets.colors.length >= MIN_FACET_OPTIONS && (
        <Section legend="Cor">
          {facets.colors.map((c) => (
            <Check
              key={c.name}
              id={`${idPrefix}-cor-${c.name}`}
              label={c.name}
              count={c.count}
              swatch={c.hex ?? ''}
              checked={filters.colors.includes(c.name)}
              onChange={() => onChange({ colors: toggle(filters.colors, c.name) })}
            />
          ))}
        </Section>
      )}

      {facets.materials.length >= MIN_FACET_OPTIONS && (
        <Section legend="Material">
          {facets.materials.map((m) => (
            <Check
              key={m.name}
              id={`${idPrefix}-mat-${m.name}`}
              label={m.name}
              count={m.count}
              checked={filters.materials.includes(m.name)}
              onChange={() => onChange({ materials: toggle(filters.materials, m.name) })}
            />
          ))}
        </Section>
      )}

      {hasUnavailable && (
        <Section legend="Disponibilidade">
          <Check
            id={`${idPrefix}-disponivel`}
            label="Ocultar esgotados"
            checked={filters.availableOnly}
            onChange={() => onChange({ availableOnly: !filters.availableOnly })}
          />
        </Section>
      )}
    </div>
  )
}

interface PriceRangeProps {
  idPrefix: string
  min: number | null
  max: number | null
  bounds: { min: number; max: number }
  onApply: (min: number | null, max: number | null) => void
}

function PriceRange({ idPrefix, min, max, bounds, onApply }: PriceRangeProps) {
  const [minText, setMinText] = useState(min === null ? '' : String(min))
  const [maxText, setMaxText] = useState(max === null ? '' : String(max))
  const [error, setError] = useState<string | null>(null)

  const parse = (text: string) => (text.trim() === '' ? null : Number(text.replace(',', '.')))

  const apply = (event: React.FormEvent) => {
    event.preventDefault()
    const a = parse(minText)
    const b = parse(maxText)
    if ((a !== null && (!Number.isFinite(a) || a < 0)) || (b !== null && (!Number.isFinite(b) || b < 0))) {
      setError('Informe valores numéricos positivos.')
      return
    }
    if (a !== null && b !== null && a > b) {
      setError('O valor mínimo deve ser menor que o máximo.')
      return
    }
    setError(null)
    onApply(a, b)
  }

  const input =
    'h-10 w-full rounded-sm border border-linen bg-white/60 pl-9 pr-2 text-sm tabular-nums focus:border-cocoa focus:outline-none'
  return (
    <form onSubmit={apply} noValidate>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor={`${idPrefix}-min`} className="mb-1 block text-xs text-stone">
            Mínimo
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone">R$</span>
            <input id={`${idPrefix}-min`} inputMode="decimal" value={minText} onChange={(e) => setMinText(e.target.value)} placeholder={String(Math.floor(bounds.min))} className={input} />
          </div>
        </div>
        <div className="flex-1">
          <label htmlFor={`${idPrefix}-max`} className="mb-1 block text-xs text-stone">
            Máximo
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone">R$</span>
            <input id={`${idPrefix}-max`} inputMode="decimal" value={maxText} onChange={(e) => setMaxText(e.target.value)} placeholder={String(Math.ceil(bounds.max))} className={input} />
          </div>
        </div>
        <button type="submit" className="h-10 rounded-sm border border-cocoa px-3 text-xs font-medium text-cocoa hover:bg-cocoa hover:text-ivory">
          Aplicar
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      ) : (
        <p className="mt-2 text-xs text-stone">
          De {formatPrice(bounds.min)} a {formatPrice(bounds.max)}
        </p>
      )}
    </form>
  )
}
