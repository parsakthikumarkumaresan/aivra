import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info'

// Enterprise status badge color system:
// - neutral: muted gray — default/inactive
// - brand:   JEXA red tint — brand-specific states (Enterprise feature, etc.)
// - success: muted green — active / connected / live
// - warning: muted amber — pending / needs action
// - danger:  muted red — failed / error (distinct from brand — more muted)
// - info:    muted blue — informational states
const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-ink-200 text-ink-600',
  brand:   'bg-brand-100 text-brand-800',
  success: 'bg-success-100 text-success-600',
  warning: 'bg-warning-100 text-warning-600',
  danger:  'bg-danger-100 text-danger-600',
  info:    'bg-info-100 text-info-600',
}

const dotClasses: Record<BadgeTone, string> = {
  neutral: 'bg-ink-500',
  brand:   'bg-brand-600',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger:  'bg-danger-500',
  info:    'bg-info-500',
}

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  dot?: boolean
  icon?: ReactNode
  className?: string
  style?: CSSProperties
}

export function Badge({ tone = 'neutral', children, dot = false, icon, className, style }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11.5px] font-medium leading-none',
        toneClasses[tone],
        className,
      )}
      style={style}
    >
      {dot && (
        <span
          className={cn(
            'size-1.5 shrink-0 rounded-full',
            tone === 'success' && 'status-dot-live',
            dotClasses[tone],
          )}
          aria-hidden
        />
      )}
      {icon}
      {children}
    </span>
  )
}
