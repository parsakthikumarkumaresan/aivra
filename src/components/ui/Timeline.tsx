import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface TimelineEntry {
  id: string
  icon?: ReactNode
  iconTone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger'
  title: ReactNode
  description?: ReactNode
  timestamp: string
}

const TONE_CLASSES = {
  neutral: 'bg-ink-100 text-ink-600',
  brand: 'bg-brand-100 text-brand-600',
  success: 'bg-success-100 text-success-600',
  warning: 'bg-warning-100 text-warning-600',
  danger: 'bg-danger-100 text-danger-600',
}

export function Timeline({ entries, className }: { entries: TimelineEntry[]; className?: string }) {
  return (
    <ol className={cn('relative', className)}>
      {entries.map((entry, index) => (
        <li key={entry.id} className="relative flex gap-3.5 pb-6 last:pb-0">
          {index < entries.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-1.75rem)] w-px bg-ink-200" />}
          <span className={cn('z-10 flex size-8 shrink-0 items-center justify-center rounded-full', TONE_CLASSES[entry.iconTone ?? 'neutral'])}>
            {entry.icon ?? <span className="size-2 rounded-full bg-current" />}
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-ink-800">{entry.title}</p>
              <span className="shrink-0 text-xs text-ink-400">{entry.timestamp}</span>
            </div>
            {entry.description && <p className="mt-0.5 text-[13px] text-ink-500">{entry.description}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}
