import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  icon?: ReactNode
  meta?: ReactNode
  className?: string
}

// Enterprise page header — strong title, muted description, right-aligned actions.
// Icon container uses a neutral ink bg instead of brand-50 so red is reserved
// for primary actions, not decoration.
export function PageHeader({ title, description, actions, icon, meta, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="flex min-w-0 items-start gap-3.5">
        {icon && (
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink-200 text-ink-600">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-[20px] font-bold tracking-tight text-ink-900">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-500">{description}</p>
          )}
          {meta && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">{meta}</div>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
