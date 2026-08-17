import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { formatRelativeTime } from '@/utils/format'

const TONE_CLASSES = {
  neutral: 'bg-ink-100 text-ink-600',
  brand: 'bg-brand-100 text-brand-600',
  success: 'bg-success-100 text-success-600',
  warning: 'bg-warning-100 text-warning-600',
  danger: 'bg-danger-100 text-danger-600',
}

interface ActivityItemProps {
  icon: ReactNode
  tone?: keyof typeof TONE_CLASSES
  title: ReactNode
  description?: ReactNode
  timestamp: string
  onClick?: () => void
  className?: string
}

export function ActivityItem({ icon, tone = 'neutral', title, description, timestamp, onClick, className }: ActivityItemProps) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors duration-150',
        onClick && 'hover:bg-ink-50',
        className,
      )}
    >
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', TONE_CLASSES[tone])}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium leading-snug text-ink-800">{title}</p>
        {description && <p className="mt-0.5 text-xs text-ink-500">{description}</p>}
      </div>
      <span className="shrink-0 whitespace-nowrap text-xs text-ink-400">{formatRelativeTime(timestamp)}</span>
    </Comp>
  )
}
