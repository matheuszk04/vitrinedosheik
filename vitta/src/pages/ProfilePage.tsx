import { PageMeta } from '../components/layout/PageMeta'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { ButtonLink } from '../components/ui/Button'
import { Icon, type IconName } from '../components/ui/Icon'

const areas: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: 'bag', title: 'Pedidos', text: 'Acompanhe compras e prazos de entrega.' },
  { icon: 'truck', title: 'Endereços', text: 'Guarde endereços para finalizar mais rápido.' },
  { icon: 'user', title: 'Dados pessoais', text: 'Atualize nome, e-mail e preferências de contato.' },
]

/** Página demonstrativa. Não há login, cadastro ou armazenamento de credenciais nesta versão. */
export function ProfilePage() {
  return (
    <div className="container-site pt-6 md:pt-8">
      <PageMeta title="Minha conta" />
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Minha conta' }]} />
      <header className="mt-6 max-w-prose md:mt-8">
        <p className="eyebrow mb-3">Área do cliente</p>
        <h1 className="text-display">Minha conta</h1>
        <p className="mt-3 text-stone">
          A área do cliente estará disponível em uma próxima versão da loja. Neste protótipo não há login nem cadastro, e
          nenhum dado pessoal é armazenado.
        </p>
      </header>

      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {areas.map((a) => (
          <li key={a.title} aria-disabled="true" className="rounded-lg border border-line p-6">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-full bg-cream text-cocoa">
                <Icon name={a.icon} className="size-[1.125rem]" />
              </span>
              <span className="rounded-full bg-sand px-2.5 py-1 text-[0.6875rem] uppercase tracking-[0.08em] text-stone">Em breve</span>
            </div>
            <h2 className="mt-5 font-sans text-base font-medium">{a.title}</h2>
            <p className="mt-1 text-sm text-stone">{a.text}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink to="/carrinho">Ver carrinho</ButtonLink>
        <ButtonLink to="/produtos" variant="secondary">
          Continuar navegando
        </ButtonLink>
      </div>
    </div>
  )
}
