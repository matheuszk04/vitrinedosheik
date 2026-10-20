/**
 * Regras do checkout DEMONSTRATIVO. Nenhum dado de pagamento é coletado e
 * nada é enviado a servidores: os dados servem só para ilustrar o fluxo.
 */

export interface CheckoutForm {
  name: string
  email: string
  phone: string
  cep: string
  street: string
  number: string
  complement: string
  district: string
  city: string
  state: string
  acknowledge: boolean
}

export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>

export const emptyCheckoutForm: CheckoutForm = {
  name: '',
  email: '',
  phone: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
  acknowledge: false,
}

export const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const

const digits = (value: string) => value.replace(/\D/g, '')

export function formatCep(value: string): string {
  const d = digits(value).slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

export function formatPhone(value: string): string {
  const d = digits(value).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Ordem dos campos, usada para focar o primeiro erro. */
export const checkoutFieldOrder: Array<keyof CheckoutForm> = [
  'name', 'email', 'phone', 'cep', 'street', 'number', 'complement', 'district', 'city', 'state', 'acknowledge',
]

export function validateCheckout(form: CheckoutForm): CheckoutErrors {
  const errors: CheckoutErrors = {}
  const required = (key: keyof CheckoutForm, message: string) => {
    if (typeof form[key] === 'string' && (form[key] as string).trim() === '') errors[key] = message
  }

  required('name', 'Informe seu nome completo.')
  if (!errors.name && form.name.trim().split(/\s+/).length < 2) errors.name = 'Informe nome e sobrenome.'

  required('email', 'Informe seu e-mail.')
  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
    errors.email = 'Informe um e-mail válido, como nome@exemplo.com.'

  required('phone', 'Informe um telefone para contato.')
  if (!errors.phone && ![10, 11].includes(digits(form.phone).length))
    errors.phone = 'O telefone deve ter DDD e 8 ou 9 dígitos.'

  required('cep', 'Informe o CEP.')
  if (!errors.cep && digits(form.cep).length !== 8) errors.cep = 'O CEP deve ter 8 dígitos.'

  required('street', 'Informe a rua ou avenida.')
  required('number', 'Informe o número (ou "s/n").')
  required('district', 'Informe o bairro.')
  required('city', 'Informe a cidade.')
  if (!BRAZIL_STATES.includes(form.state as (typeof BRAZIL_STATES)[number])) errors.state = 'Selecione o estado.'
  if (!form.acknowledge) errors.acknowledge = 'Confirme que entendeu que esta é uma simulação.'

  return errors
}

/** Identificador FICTÍCIO apenas para a tela de confirmação da demonstração. */
export function createDemoReference(random: () => number = Math.random): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = ''
  for (let i = 0; i < 6; i += 1) id += chars[Math.floor(random() * chars.length)]
  return `DEMO-${id}`
}

export interface DemoSimulation {
  reference: string
  createdAt: string
  firstName: string
  email: string
  units: number
  subtotal: number
  lines: Array<{ name: string; quantity: number; lineTotal: number }>
}

export const SIMULATION_STORAGE_KEY = 'vitta:last-simulation'

export function saveSimulation(sim: DemoSimulation): void {
  try {
    window.sessionStorage.setItem(SIMULATION_STORAGE_KEY, JSON.stringify(sim))
  } catch {
    // Sem armazenamento: a confirmação ainda recebe os dados pela navegação.
  }
}

export function readSimulation(): DemoSimulation | null {
  try {
    const raw = window.sessionStorage.getItem(SIMULATION_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as DemoSimulation
    return typeof data?.reference === 'string' && Array.isArray(data.lines) ? data : null
  } catch {
    return null
  }
}
