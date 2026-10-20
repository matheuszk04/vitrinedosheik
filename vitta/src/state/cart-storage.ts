import type { CartItem } from './cart'

/**
 * Persistência do carrinho no localStorage do navegador.
 * É uma conveniência do protótipo: não é um pedido, não é seguro e não é
 * compartilhado entre dispositivos.
 */
export const CART_STORAGE_KEY = 'vitta:cart'
export const CART_STORAGE_VERSION = 1

interface StoredCartV1 {
  version: 1
  items: CartItem[]
  updatedAt: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Aceita apenas itens bem formados, unifica repetidos e limita as quantidades. */
export function sanitizeItems(raw: unknown, max: number): CartItem[] {
  if (!Array.isArray(raw)) return []
  const merged = new Map<string, number>()
  for (const entry of raw) {
    if (!isRecord(entry)) continue
    // Formato antigo hipotético { id, qty } é aceito para facilitar migrações.
    const id = entry.productId ?? entry.id
    const qty = entry.quantity ?? entry.qty
    if (typeof id !== 'string' || id.trim() === '') continue
    if (typeof qty !== 'number' || !Number.isFinite(qty) || qty < 1) continue
    merged.set(id, Math.min((merged.get(id) ?? 0) + Math.floor(qty), max))
  }
  return [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity }))
}

/** Lê e migra os dados guardados. Qualquer formato inválido resulta em carrinho vazio. */
export function parseStoredCart(json: string | null, max: number): CartItem[] {
  if (!json) return []
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    return []
  }
  if (Array.isArray(data)) return sanitizeItems(data, max) // versão 0: lista solta
  if (isRecord(data) && data.version === CART_STORAGE_VERSION) return sanitizeItems(data.items, max)
  return []
}

export function serializeCart(items: CartItem[]): string {
  const payload: StoredCartV1 = { version: CART_STORAGE_VERSION, items, updatedAt: new Date().toISOString() }
  return JSON.stringify(payload)
}

/** Acesso protegido: o navegador pode bloquear o armazenamento (modo privado, cota cheia). */
export function readCart(max: number): CartItem[] {
  try {
    return parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY), max)
  } catch {
    return []
  }
}

export function writeCart(items: CartItem[]): void {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, serializeCart(items))
  } catch {
    // Sem armazenamento disponível: o carrinho continua funcionando na sessão atual.
  }
}
