const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })
const longDate = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

/** Formata um valor em reais, ex.: 289.9 → "R$ 289,90". */
export function formatPrice(value: number): string {
  return currency.format(value)
}

export function formatNumber(value: number): string {
  return decimal.format(value)
}

/** Converte "AAAA-MM-DD" em Date (UTC). Retorna `null` se a data for inválida. */
export function parseISODate(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value: string | undefined): string | null {
  const date = parseISODate(value)
  return date ? longDate.format(date) : null
}

/** "1 item" / "3 itens" */
export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}

/** Minúsculas e sem acentos, para comparar textos de busca. */
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}
