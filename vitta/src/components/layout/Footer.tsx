import { Link } from 'react-router'
import { footerNavigation, storeConfig } from '../../config/store-config'
import { allCollections } from '../../lib/catalog'
import { Logo } from '../ui/Logo'

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="eyebrow mb-4 font-sans">{title}</h2>
      {children}
    </div>
  )
}

const pending = <span className="text-stone/80">A definir</span>

export function Footer() {
  const { contact, social, policies } = storeConfig
  return (
    <footer className="mt-section border-t border-line bg-cream/60">
      <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-12">
        <div className="max-w-xs">
          <Logo className="h-8 w-auto" />
          <p className="mt-5 text-sm text-stone">{storeConfig.tagline}</p>
        </div>

        <Column title="A VITTA">
          <ul className="space-y-2.5 text-sm">
            {footerNavigation.institutional.filter((l) => l.to !== '/colecoes' || allCollections.length > 0).map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-ink hover:underline hover:underline-offset-4">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </Column>

        <Column title="Atendimento">
          <ul className="space-y-2.5 text-sm">
            {footerNavigation.help.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-ink hover:underline hover:underline-offset-4">
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-1 text-stone">E-mail: {contact.email ? <a href={`mailto:${contact.email}`} className="text-ink underline underline-offset-4">{contact.email}</a> : pending}</li>
          </ul>
        </Column>

        <Column title="Entrega e devoluções">
          <div className="space-y-2.5 text-sm text-stone">
            <p>{policies.shipping}</p>
            <p>{policies.returns}</p>
          </div>
          <h2 className="eyebrow mb-3 mt-7 font-sans">Redes sociais</h2>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {social.map((s) => (
              <li key={s.label}>
                {s.href ? (
                  <a href={s.href} target="_blank" rel="noreferrer" className="text-ink hover:underline hover:underline-offset-4">
                    {s.label}
                  </a>
                ) : (
                  <span className="text-stone" title="Perfil oficial ainda não informado">
                    {s.label} <span className="text-xs">(em breve)</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Column>
      </div>
      <div className="border-t border-line">
        <div className="container-site flex flex-col gap-2 py-6 text-xs text-stone sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {storeConfig.name}. Todos os direitos reservados.</p>
          {storeConfig.demoMode && <p>Protótipo — checkout simulado; contatos e políticas provisórios.</p>}
        </div>
      </div>
    </footer>
  )
}
