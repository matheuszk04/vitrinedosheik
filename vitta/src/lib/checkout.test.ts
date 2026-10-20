import { describe, expect, it } from 'vitest'
import { createDemoReference, emptyCheckoutForm, formatCep, formatPhone, validateCheckout, type CheckoutForm } from './checkout'

const valid: CheckoutForm = {
  name: 'Ana Souza',
  email: 'ana@exemplo.com',
  phone: '(11) 98765-4321',
  cep: '01310-100',
  street: 'Rua Exemplo',
  number: '100',
  complement: '',
  district: 'Centro',
  city: 'São Paulo',
  state: 'SP',
  acknowledge: true,
}

describe('checkout demonstrativo', () => {
  it('aceita um formulário completo (complemento é opcional)', () => {
    expect(validateCheckout(valid)).toEqual({})
  })

  it('exige todos os campos obrigatórios e a confirmação de simulação', () => {
    const errors = validateCheckout(emptyCheckoutForm)
    expect(Object.keys(errors).sort()).toEqual(
      ['acknowledge', 'cep', 'city', 'district', 'email', 'name', 'number', 'phone', 'state', 'street'].sort(),
    )
  })

  it('valida formatos de nome, e-mail, telefone, CEP e UF', () => {
    const errors = validateCheckout({ ...valid, name: 'Ana', email: 'ana@', phone: '1234', cep: '123', state: 'XX' })
    expect(errors.name).toMatch(/sobrenome/)
    expect(errors.email).toMatch(/válido/)
    expect(errors.phone).toMatch(/DDD/)
    expect(errors.cep).toMatch(/8 dígitos/)
    expect(errors.state).toMatch(/estado/)
  })

  it('aplica máscaras de CEP e telefone', () => {
    expect(formatCep('01310100')).toBe('01310-100')
    expect(formatCep('abc0131')).toBe('0131')
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321')
    expect(formatPhone('1133334444')).toBe('(11) 3333-4444')
  })

  it('gera referência claramente fictícia', () => {
    expect(createDemoReference(() => 0)).toBe('DEMO-AAAAAA')
    expect(createDemoReference()).toMatch(/^DEMO-[A-Z2-9]{6}$/)
  })
})
