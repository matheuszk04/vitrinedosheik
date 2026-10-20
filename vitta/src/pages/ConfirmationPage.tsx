import { useLocation } from 'react-router'
import { PageMeta } from '../components/layout/PageMeta'
import { ButtonLink } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/ui/Icon'
import { readSimulation, type DemoSimulation } from '../lib/checkout'
import { formatPrice, pluralize } from '../lib/format'

export function ConfirmationPage() {
  const location = useLocation()
  const simulation = (location.state as DemoSimulation | null) ?? readSimulation()

  if (!simulation) {
    return (
      <div className="container-site py-section">
        <PageMeta title="Simulação" />
        <EmptyState icon="info" headingLevel="h1" title="Nenhuma simulação recente" action={<ButtonLink to="/produtos">Ver produtos</ButtonLink>}>
          Finalize o checkout demonstrativo para ver esta tela.
        </EmptyState>
      </div>
    )
  }

  return (
    <div className="container-site max-w-2xl pt-12 md:pt-16">
      <PageMeta title="Simulação concluída" />
      <div className="text-center">
        <span className="mx-auto mb-6 grid size-14 place-items-center rounded-full bg-success-soft text-success">
          <Icon name="check" className="size-6" />
        </span>
        <p className="eyebrow mb-3">Demonstração</p>
        <h1 className="text-display">Simulação concluída{simulation.firstName ? `, ${simulation.firstName}` : ''}.</h1>
        <p className="mx-auto mt-4 max-w-md text-stone">
          Este foi um checkout de demonstração. <strong className="font-medium text-ink">Nenhum pedido foi criado</strong>, nenhuma
          cobrança foi feita, nenhum estoque foi reservado e nenhum e-mail foi enviado.
        </p>
      </div>

      <section aria-labelledby="resumo-simulacao" className="mt-10 rounded-lg border border-line bg-cream/50 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="resumo-simulacao" className="text-2xl">
            Resumo simulado
          </h2>
          <p className="text-xs text-stone">
            Referência fictícia: <span className="font-mono text-ink" data-testid="demo-reference">{simulation.reference}</span>
          </p>
        </div>
        <ul className="mt-5 space-y-2 border-b border-line pb-5 text-sm">
          {simulation.lines.map((l) => (
            <li key={l.name} className="flex justify-between gap-4">
              <span>
                {l.name} <span className="text-stone">× {l.quantity}</span>
              </span>
              <span className="tabular-nums">{formatPrice(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between text-base font-medium">
          <span>Total ({pluralize(simulation.units, 'unidade', 'unidades')})</span>
          <span className="tabular-nums">{formatPrice(simulation.subtotal)}</span>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/produtos">Continuar navegando</ButtonLink>
        <ButtonLink to="/" variant="secondary">
          Ir para o início
        </ButtonLink>
      </div>
    </div>
  )
}
