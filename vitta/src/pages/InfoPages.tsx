import { PageMeta } from '../components/layout/PageMeta'
import { StoreInfo } from '../components/layout/StoreInfo'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { ButtonLink } from '../components/ui/Button'
import { Logo } from '../components/ui/Logo'
import { storeConfig } from '../config/store-config'

export function AboutPage() {
  return (
    <div className="container-site pt-6 md:pt-8">
      <PageMeta title="Sobre a VITTA" />
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Sobre a VITTA' }]} />
      <div className="mt-8 grid gap-12 md:mt-12 md:grid-cols-[1fr_1.2fr] md:gap-16">
        <div className="flex items-center justify-center rounded-lg bg-cream p-12 md:p-16">
          <Logo variant="symbol" className="h-auto w-40 max-w-full md:w-56" />
        </div>
        <div className="max-w-prose self-center">
          <p className="eyebrow mb-3">Sobre</p>
          <h1 className="text-display">A VITTA</h1>
          <div className="mt-6 space-y-4 text-stone">
            <p>{storeConfig.tagline}</p>
            {/* PROVISÓRIO — substitua pelo texto institucional oficial da marca. */}
            <p>
              Este espaço é reservado para a história da VITTA, sua curadoria e seus valores. O texto definitivo será
              publicado quando for fornecido pela marca.
            </p>
          </div>
          <ButtonLink to="/produtos" className="mt-8">
            Conhecer os produtos
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}

export function ContactPage() {
  const { contact } = storeConfig
  const rows: Array<{ label: string; value: string | null; href?: string }> = [
    { label: 'E-mail', value: contact.email, href: contact.email ? `mailto:${contact.email}` : undefined },
    { label: 'Telefone', value: contact.phone, href: contact.phone ? `tel:${contact.phone.replace(/\D/g, '')}` : undefined },
    { label: 'WhatsApp', value: contact.whatsapp },
    { label: 'Horário de atendimento', value: contact.hours },
    { label: 'Endereço', value: contact.address },
  ]
  return (
    <div className="container-site pt-6 md:pt-8">
      <PageMeta title="Contato" />
      <Breadcrumbs items={[{ label: 'Início', to: '/' }, { label: 'Contato' }]} />
      <header className="mt-6 max-w-prose md:mt-8">
        <h1 className="text-display">Contato</h1>
        <p className="mt-3 text-stone">Os canais oficiais de atendimento serão publicados aqui.</p>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="canais">
          <h2 id="canais" className="text-2xl">
            Canais de atendimento
          </h2>
          <dl className="mt-5 divide-y divide-line border-y border-line text-sm">
            {rows.map((r) => (
              <div key={r.label} className="flex justify-between gap-6 py-3.5">
                <dt className="text-stone">{r.label}</dt>
                <dd className="text-right">
                  {r.value ? (
                    r.href ? (
                      <a href={r.href} className="text-ink underline underline-offset-4">
                        {r.value}
                      </a>
                    ) : (
                      <span className="text-ink">{r.value}</span>
                    )
                  ) : (
                    <span className="text-stone">A definir</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="entrega" aria-labelledby="entrega-titulo" className="scroll-mt-28">
          <h2 id="entrega-titulo" className="text-2xl">
            Entrega e devoluções
          </h2>
          <div className="mt-5">
            <StoreInfo compact />
          </div>
        </section>
      </div>
    </div>
  )
}
