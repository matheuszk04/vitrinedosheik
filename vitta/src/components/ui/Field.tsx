import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { cx } from '../../lib/cx'

const control =
  'block w-full rounded-sm border bg-white/60 px-3.5 text-[0.9375rem] text-ink placeholder:text-stone/70 transition-colors hover:border-taupe focus:border-cocoa focus:bg-white focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cocoa'

interface FieldShellProps {
  id: string
  label: string
  error?: string
  hint?: string
  optional?: boolean
  className?: string
  children: ReactNode
}

function FieldShell({ id, label, error, hint, optional, className, children }: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-[0.8125rem] font-medium text-ink">
        {label}
        {optional && <span className="font-normal text-stone">Opcional</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-stone">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string
  label: string
  error?: string
  hint?: string
  optional?: boolean
  wrapperClassName?: string
}

export function TextField({ id, label, error, hint, optional, wrapperClassName, className, ...rest }: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional} className={wrapperClassName}>
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        required={!optional}
        className={cx(control, 'h-11', error ? 'border-danger' : 'border-linen', className)}
        {...rest}
      />
    </FieldShell>
  )
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id: string
  label: string
  error?: string
  hint?: string
  wrapperClassName?: string
  children: ReactNode
}

export function SelectField({ id, label, error, hint, wrapperClassName, className, children, ...rest }: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={wrapperClassName}>
      <select
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cx(control, 'h-11 appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9', error ? 'border-danger' : 'border-linen', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234d4030' stroke-width='1.5'%3E%3Cpath d='M6 9.5l6 6 6-6'/%3E%3C/svg%3E\")",
        }}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  )
}

