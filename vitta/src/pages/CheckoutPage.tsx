import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { OrderSummary } from '../components/cart/OrderSummary'
import { PageMeta } from '../components/layout/PageMeta'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Button, ButtonLink } from '../components/ui/Button'
import { SelectField, TextField } from '../components/ui/Field'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/ui/Icon'
import {
  BRAZIL_STATES,
  checkoutFieldOrder,
  createDemoReference,
  emptyCheckoutForm,
  formatCep,
  formatPhone,
  saveSimulation,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutForm,
} from '../lib/checkout'
import { useCart } from '../state/cart-context'

const fieldLabels: Record<keyof CheckoutForm, string> = {
  name: 'Nome completo',
  email: 'E-mail',
  phone: 'Telefone',
  cep: 'CEP',
  street: 'Endereço',
  number: 'Número',
  complement: 'Complemento',
  district: 'Bairro',
  city: 'Cidade',
  state: 'Estado',
  acknowledge: 'Confirmação de simulação',
}

export function CheckoutPage() {
  const { lines, totalUnits, subtotal, hasUnavailable, clear } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState<CheckoutForm>(emptyCheckoutForm)
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)

  if (lines.length === 0) {
    return (
      <div className="container-site py-section">
        <PageMeta title="Checkout" />
        <EmptyState icon="bag" headingLevel="h1" title="Não há itens para finalizar" action={<ButtonLink to="/produtos">Explorar produtos</ButtonLink>}>
          Adicione produtos ao carrinho para ver o checkout demonstrativo.
        </EmptyState>
      </div>
    )
  }

  const set = <K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) => {
    const next = { ...form, [key]: value }
    setForm(next)
    // Depois da primeira tentativa, os erros se atualizam enquanto a pessoa corrige.
    if (submitted) setErrors(validateCheckout(next))
  }

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    const found = validateCheckout(form)
    setErrors(found)
    const keys = checkoutFieldOrder.filter((k) => found[k])
    if (keys.length > 0 || hasUnavailable) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    const purchasable = lines.filter((l) => l.purchasable)
    const simulation = {
      reference: createDemoReference(),
      createdAt: new Date().toISOString(),
      firstName: form.name.trim().split(/\s+/)[0] ?? '',
      email: form.email.trim(),
      units: purchasable.reduce((s, l) => s + l.quantity, 0),
      subtotal,
      lines: purchasable.map((l) => ({ name: l.product.name, quantity: l.quantity, lineTotal: l.lineTotal })),
    }
    saveSimulation(simulation)
    clear()
    navigate('/checkout/confirmacao', { state: simulation, replace: true })
  }

  const errorKeys = checkoutFieldOrder.filter((k) => errors[k])
  const field = (key: keyof Omit<CheckoutForm, 'acknowledge'>) => ({
    id: key,
    label: fieldLabels[key],
    value: form[key],
    error: errors[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(key, e.target.value),
  })

  return (
    <div className="container-site pt-6 md:pt-8">
      <PageMeta title="Checkout" />
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Carrinho', to: '/carrinho' }, { label: 'Checkout' }]} />
      <h1 className="mt-6 text-display md:mt-8">Checkout</h1>
      <p className="mt-3 flex max-w-prose items-start gap-2 text-sm text-stone">
        <Icon name="info" className="mt-0.5 size-4 shrink-0" />
        Demonstração: os dados abaixo não são enviados a lugar nenhum e nenhum pagamento é solicitado.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
        <form onSubmit={onSubmit} noValidate aria-describedby={errorKeys.length ? 'erros-checkout' : undefined}>
          <div ref={summaryRef} tabIndex={-1} className="focus:outline-none">
            {errorKeys.length > 0 && (
              <div id="erros-checkout" role="alert" className="mb-8 rounded-md border border-danger/30 bg-danger-soft px-5 py-4 text-sm">
                <p className="font-medium text-danger">
                  {errorKeys.length === 1 ? 'Corrija 1 campo para continuar:' : `Corrija ${errorKeys.length} campos para continuar:`}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-ink">
                  {errorKeys.map((k) => (
                    <li key={k}>
                      <a href={`#${k}`} className="underline underline-offset-4" onClick={(e) => { e.preventDefault(); document.getElementById(k)?.focus() }}>
                        {fieldLabels[k]}: {errors[k]}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <fieldset>
            <legend className="mb-5 font-serif text-2xl text-ink">Contato</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField {...field('name')} autoComplete="name" wrapperClassName="sm:col-span-2" />
              <TextField {...field('email')} type="email" autoComplete="email" inputMode="email" />
              <TextField {...field('phone')} type="tel" autoComplete="tel-national" inputMode="tel" placeholder="(00) 00000-0000" onChange={(e) => set('phone', formatPhone(e.target.value))} />
            </div>
          </fieldset>

          <fieldset className="mt-10">
            <legend className="mb-5 font-serif text-2xl text-ink">Endereço de entrega</legend>
            <div className="grid gap-5 sm:grid-cols-6">
              <TextField {...field('cep')} autoComplete="postal-code" inputMode="numeric" placeholder="00000-000" wrapperClassName="sm:col-span-2" onChange={(e) => set('cep', formatCep(e.target.value))} />
              <TextField {...field('street')} autoComplete="address-line1" wrapperClassName="sm:col-span-4" />
              <TextField {...field('number')} wrapperClassName="sm:col-span-2" />
              <TextField {...field('complement')} optional autoComplete="address-line2" wrapperClassName="sm:col-span-4" />
              <TextField {...field('district')} wrapperClassName="sm:col-span-3" />
              <TextField {...field('city')} autoComplete="address-level2" wrapperClassName="sm:col-span-2" />
              <SelectField id="state" label={fieldLabels.state} value={form.state} error={errors.state} autoComplete="address-level1" onChange={(e) => set('state', e.target.value)} wrapperClassName="sm:col-span-1">
                <option value="">UF</option>
                {BRAZIL_STATES.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </SelectField>
            </div>
          </fieldset>

          <fieldset className="mt-10">
            <legend className="mb-3 font-serif text-2xl text-ink">Pagamento</legend>
            <p className="rounded-md border border-dashed border-linen px-5 py-4 text-sm text-stone">
              Esta etapa não existe no protótipo. Nenhum dado de cartão, Pix ou boleto é solicitado.
            </p>
          </fieldset>

          <div className="mt-8">
            <label htmlFor="acknowledge" className="flex cursor-pointer items-start gap-3 text-sm text-ink">
              <input
                id="acknowledge"
                name="acknowledge"
                type="checkbox"
                checked={form.acknowledge}
                onChange={(e) => set('acknowledge', e.target.checked)}
                aria-invalid={errors.acknowledge ? true : undefined}
                aria-describedby={errors.acknowledge ? 'acknowledge-error' : undefined}
                className="mt-0.5 size-[1.125rem] shrink-0 accent-cocoa"
              />
              Entendo que esta é uma simulação: nenhum pedido será criado e nenhuma cobrança será feita.
            </label>
            {errors.acknowledge && (
              <p id="acknowledge-error" className="mt-1.5 pl-8 text-xs font-medium text-danger">
                {errors.acknowledge}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" className="mt-8 w-full sm:w-auto" disabled={hasUnavailable}>
            Simular pedido
          </Button>
          {hasUnavailable && <p className="mt-3 text-sm text-danger">Há itens indisponíveis no carrinho. Remova-os para continuar.</p>}
        </form>

        <div className="lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)] lg:self-start">
          <OrderSummary lines={lines} totalUnits={totalUnits} subtotal={subtotal} showLines />
        </div>
      </div>
    </div>
  )
}
