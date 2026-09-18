import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

// Base card — dark elevated surface, medium radius, hairline border.
// Use `surface` bg (slightly above canvas) + ink-300 border for visual depth.
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-ink-300 bg-surface shadow-card',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 border-b border-ink-200 px-5 py-4', className)}>
      <div className="min-w-0">
        <h3 className="text-[14.5px] font-semibold text-ink-900">{title}</h3>
        {description && <p className="mt-0.5 text-[13px] leading-snug text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 border-t border-ink-200 px-5 py-3',
        className,
      )}
      {...props}
    />
  )
}
