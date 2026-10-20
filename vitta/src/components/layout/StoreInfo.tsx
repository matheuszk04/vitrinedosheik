import { Link } from 'react-router'
import { storeConfig } from '../../config/store-config'
import { Icon, type IconName } from '../ui/Icon'

const items: Array<{ icon: IconName; title: string; text: string; link?: { to: string; label: string } }> = [
  { icon: 'truck', title: 'Entrega', text: storeConfig.policies.shipping },
  { icon: 'return', title: 'Trocas e devoluções', text: storeConfig.policies.returns },
  {
    icon: 'chat',
    title: 'Atendimento',
    text: 'Dúvidas sobre medidas, materiais ou composição de ambientes.',
    link: { to: '/contato', label: 'Falar com a VITTA' },
  },
]

/** Informações de serviço lidas de store-config.ts (sem promessas não confirmadas). */
export function StoreInfo({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={compact ? 'space-y-5' : 'grid gap-8 md:grid-cols-3 md:gap-10'}>
      {items.map((item) => (
        <li key={item.title} className="flex gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-cocoa">
            <Icon name={item.icon} className="size-[1.125rem]" />
          </span>
          <div>
            <h3 className="font-sans text-sm font-medium text-ink">{item.title}</h3>
            <p className="mt-1 text-sm text-stone">{item.text}</p>
            {item.link && (
              <Link to={item.link.to} className="mt-1.5 inline-block text-sm font-medium text-cocoa underline decoration-linen underline-offset-4 hover:decoration-cocoa">
                {item.link.label}
              </Link>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
