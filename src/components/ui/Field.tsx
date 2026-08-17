import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export function Label({ className, required, children, ...props }: LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn('mb-1.5 block text-[13px] font-medium text-ink-800', className)} {...props}>
      {children}
      {required && <span className="ml-0.5 text-danger-600">*</span>}
    </label>
  )
}

export function HelpText({ children, error }: { children: ReactNode; error?: boolean }) {
  return (
    <p className={cn('mt-1.5 flex items-center gap-1 text-xs', error ? 'text-danger-600' : 'text-ink-500')}>
      {error && <AlertCircle className="size-3.5 shrink-0" />}
      {children}
    </p>
  )
}

const fieldBase =
  'w-full rounded-lg border bg-white px-3 text-sm text-ink-900 placeholder:text-ink-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:bg-ink-50 disabled:text-ink-400'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, error, icon, ...props }, ref) {
  if (icon) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">{icon}</span>
        <input
          ref={ref}
          className={cn(fieldBase, 'h-9 pl-9', error ? 'border-danger-400 focus:ring-danger-500/30' : 'border-ink-200 focus:border-brand-500', className)}
          {...props}
        />
      </div>
    )
  }
  return (
    <input
      ref={ref}
      className={cn(fieldBase, 'h-9', error ? 'border-danger-400 focus:ring-danger-500/30' : 'border-ink-200 focus:border-brand-500', className)}
      {...props}
    />
  )
})

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, error, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(fieldBase, 'min-h-24 py-2', error ? 'border-danger-400 focus:ring-danger-500/30' : 'border-ink-200 focus:border-brand-500', className)}
      {...props}
    />
  )
})

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ className, error, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(fieldBase, 'h-9 appearance-none pr-9', error ? 'border-danger-400 focus:ring-danger-500/30' : 'border-ink-200 focus:border-brand-500', className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
    </div>
  )
})

export function Switch({ checked, onChange, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5.5 w-10 shrink-0 items-center rounded-full transition-colors duration-150 disabled:opacity-50',
        checked ? 'bg-brand-600' : 'bg-ink-200',
      )}
    >
      <span
        className={cn(
          'inline-block size-4 transform rounded-full bg-white shadow-xs transition-transform duration-150',
          checked ? 'translate-x-5' : 'translate-x-1',
        )}
      />
    </button>
  )
}

export function Checkbox({ checked, onChange, disabled, label, id }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label?: ReactNode; id?: string }) {
  return (
    <label htmlFor={id} className={cn('inline-flex items-center gap-2 text-sm text-ink-800', disabled && 'opacity-50')}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-ink-300 text-brand-600 focus:ring-2 focus:ring-brand-500/30"
      />
      {label}
    </label>
  )
}
