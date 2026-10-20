import { createContext, useContext } from 'react'

export interface Toast {
  id: number
  message: string
  action?: { label: string; to: string }
}

export interface ToastContextValue {
  notify: (message: string, action?: Toast['action']) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast precisa estar dentro de <ToastProvider>.')
  return value
}
