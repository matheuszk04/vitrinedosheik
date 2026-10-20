import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Icon } from '../components/ui/Icon'
import { ToastContext, type Toast } from './toast-context'

const DURATION = 4500

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const counter = useRef(0)

  const dismiss = useCallback(() => setToast(null), [])

  const notify = useCallback((message: string, action?: Toast['action']) => {
    counter.current += 1
    setToast({ id: counter.current, message, action })
  }, [])

  useEffect(() => {
    if (!toast) return
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(dismiss, DURATION)
    return () => window.clearTimeout(timer.current)
  }, [toast, dismiss])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-6 sm:justify-end sm:px-6"
      >
        {toast && (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-sm animate-rise items-center gap-3 rounded-md bg-ink px-4 py-3 text-sm text-ivory shadow-raised"
          >
            <Icon name="check" className="size-4 shrink-0 text-gold" />
            <p className="flex-1">{toast.message}</p>
            {toast.action && (
              <Link
                to={toast.action.to}
                onClick={dismiss}
                className="shrink-0 font-medium underline decoration-gold underline-offset-4 hover:decoration-ivory"
              >
                {toast.action.label}
              </Link>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="-mr-1 grid size-8 shrink-0 place-items-center rounded-sm text-ivory/70 hover:text-ivory"
              aria-label="Fechar aviso"
            >
              <Icon name="close" className="size-4" />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}
