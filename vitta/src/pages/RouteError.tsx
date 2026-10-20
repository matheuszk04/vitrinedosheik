import { isRouteErrorResponse, useRouteError } from 'react-router'

/** Última proteção: um erro inesperado mostra uma página legível em vez de tela branca. */
export function RouteError() {
  const error = useRouteError()
  const status = isRouteErrorResponse(error) ? error.status : null
  if (import.meta.env.DEV) console.error(error)
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow mb-3">{status ?? 'Erro'}</p>
      <h1 className="text-title">Algo não saiu como esperado</h1>
      <p className="mt-3 text-stone">Recarregue a página ou volte ao início.</p>
      <a href={import.meta.env.BASE_URL} className="mt-6 text-sm font-medium text-cocoa underline underline-offset-4">
        Ir para o início
      </a>
    </main>
  )
}
