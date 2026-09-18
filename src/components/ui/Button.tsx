import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const variantClasses: Record<ButtonVariant, string> = {
  // JEXA red primary — the most prominent CTA. Used sparingly.
  primary:
    'bg-brand-600 text-white shadow-xs hover:bg-brand-700 hover:shadow-glow-red active:brightness-90 disabled:bg-brand-200 disabled:text-brand-400 disabled:shadow-none',
  // Elevated dark surface button — secondary actions
  secondary:
    'bg-ink-200 text-ink-900 border border-ink-300 hover:bg-ink-300 hover:border-ink-400 active:brightness-95 disabled:text-ink-500 disabled:border-ink-200',
  // Subtle outline — tertiary actions, filter triggers
  outline:
    'border border-ink-300 bg-transparent text-ink-700 hover:border-ink-400 hover:text-ink-900 hover:bg-ink-100 active:bg-ink-200 disabled:text-ink-500 disabled:border-ink-200',
  // No border, no background — nav items, icon actions
  ghost:
    'text-ink-600 hover:bg-ink-100 hover:text-ink-900 active:bg-ink-200 disabled:text-ink-500',
  // Destructive — clearly dangerous action. Visually distinct from brand red CTA.
  danger:
    'bg-danger-500 text-white hover:bg-danger-600 active:brightness-90 disabled:bg-danger-100 disabled:text-danger-700',
  // Inline text link
  link: 'text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline px-0 h-auto',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-md',
  md: 'h-9 px-3.5 text-[13.5px] gap-2 rounded-lg',
  lg: 'h-10 px-5 text-[14px] gap-2 rounded-lg',
  icon: 'h-9 w-9 rounded-lg p-0',
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
        'group inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-150 ease-out',
        'disabled:cursor-not-allowed',
        // Subtle scale micro-interaction — enterprise feel without being flashy
        'hover:scale-[1.012] active:scale-[0.988] disabled:hover:scale-100',
        'focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2',
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
