import { categories } from '../data/categories'
import { collections } from '../data/collections'
import { products } from '../data/products'
import { validateCatalog } from './validate-catalog'

/** Em desenvolvimento, lista no console os problemas encontrados no catálogo. */
export function reportCatalogIssues(): void {
  const issues = validateCatalog(products, categories, collections)
  const errors = issues.filter((i) => i.level === 'error')
  if (errors.length) console.error(`[VITTA] Catálogo com ${errors.length} erro(s):\n- ${errors.map((e) => e.message).join('\n- ')}`)
  const warnings = issues.filter((i) => i.level === 'warning')
  if (warnings.length) console.info(`[VITTA] Avisos do catálogo:\n- ${warnings.map((w) => w.message).join('\n- ')}`)
}
