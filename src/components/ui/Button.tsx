import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white shadow-xs hover:bg-brand-700 hover:shadow-glow-red active:brightness-90 disabled:bg-brand-300 disabled:text-ink-500',
  secondary: 'bg-ink-100 text-ink-900 border border-ink-300 hover:bg-ink-200 hover:border-ink-400 active:brightness-90 disabled:text-ink-500',
  outline: 'border border-ink-300 bg-transparent text-ink-800 hover:border-brand-600 hover:text-ink-900 active:bg-ink-100 disabled:text-ink-500',
  ghost: 'text-ink-700 hover:bg-ink-100 hover:text-ink-900 active:bg-ink-200 disabled:text-ink-500',
  danger: 'bg-danger-500 text-white hover:bg-danger-600 active:brightness-90 disabled:bg-danger-50',
  link: 'text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline px-0',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-md',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-lg',
  icon: 'h-9 w-9 rounded-lg',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'group inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:hover:scale-100',
        'hover:scale-[1.015] active:scale-[0.985]',
        'focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  )
}
