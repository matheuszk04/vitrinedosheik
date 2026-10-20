import { useEffect, useId, useRef, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { IconButton } from './IconButton'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  /** Oculta visualmente o título (continua acessível). */
  hideTitle?: boolean
  side?: 'left' | 'right'
  children: ReactNode
  footer?: ReactNode
  header?: ReactNode
  className?: string
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * Painel lateral modal: fecha com Escape, botão ou clique no fundo; prende o
 * foco enquanto aberto; devolve o foco ao elemento de origem ao fechar; e
 * bloqueia a rolagem da página só enquanto estiver aberto.
 */
export function Drawer({ open, onClose, title, hideTitle, side = 'left', children, footer, header, className }: DrawerProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null)
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      root.style.overflow = previousOverflow
      previous?.focus?.()
    }
  }, [open])

  return (
    <div className={cx('fixed inset-0 z-40', !open && 'pointer-events-none')} inert={!open} aria-hidden={!open}>
      <div
        className={cx(
          'absolute inset-0 bg-ink/30 backdrop-blur-[2px] transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
        data-testid="drawer-backdrop"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(
          'absolute inset-y-0 flex w-[min(var(--container-drawer),88vw)] flex-col bg-ivory shadow-panel duration-300 ease-soft',
          side === 'left' ? 'left-0' : 'right-0',
          // A visibilidade muda na hora ao abrir (o foco precisa entrar no painel) e só depois da animação ao fechar.
          open
            ? 'visible translate-x-0 transition-transform'
            : cx('invisible transition-[transform,visibility]', side === 'left' ? '-translate-x-full' : 'translate-x-full'),
          className,
        )}
      >
        <div className="flex h-header shrink-0 items-center justify-between gap-4 border-b border-line px-5">
          {header ?? <span />}
          <h2 id={titleId} className={cx('text-xl', hideTitle && 'sr-only')}>
            {title}
          </h2>
          <IconButton ref={closeRef} icon="close" label="Fechar" onClick={onClose} className="-mr-2" />
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="shrink-0 border-t border-line p-5">{footer}</div>}
      </div>
    </div>
  )
}
