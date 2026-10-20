import { storeConfig } from '../../config/store-config'

/** Título e descrição da página (o React 19 move estas tags para o <head>). */
export function PageMeta({ title, description }: { title?: string; description?: string }) {
  const full = title ? `${title} · ${storeConfig.name}` : `${storeConfig.name} — Decoração minimalista`
  return (
    <>
      <title>{full}</title>
      {description && <meta name="description" content={description} />}
    </>
  )
}
