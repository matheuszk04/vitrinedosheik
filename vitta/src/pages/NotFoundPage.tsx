import { PageMeta } from '../components/layout/PageMeta'
import { ButtonLink } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'

export function NotFoundPage({ message = 'O endereço pode ter mudado ou não existe mais.' }: { message?: string }) {
  return (
    <div className="container-site py-section">
      <PageMeta title="Página não encontrada" />
      <EmptyState
        icon="alert"
        headingLevel="h1"
        title="Página não encontrada"
        action={
          <>
            <ButtonLink to="/produtos">Ver produtos</ButtonLink>
            <ButtonLink to="/" variant="secondary">
              Ir para o início
            </ButtonLink>
          </>
        }
      >
        {message}
      </EmptyState>
    </div>
  )
}
