import { Check, Loader2, CloudOff } from 'lucide-react'
import { cn } from '@/utils/cn'

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function SaveStatus({ state, className }: { state: SaveState; className?: string }) {
  if (state === 'idle') return null
  const config = {
    saving: { icon: Loader2, label: 'Saving…', classes: 'text-ink-500', spin: true },
    saved: { icon: Check, label: 'Saved', classes: 'text-success-600', spin: false },
    error: { icon: CloudOff, label: 'Could not save — retrying', classes: 'text-danger-600', spin: false },
  }[state]
  const Icon = config.icon
  return (
    <span className={cn('flex items-center gap-1.5 text-xs font-medium', config.classes, className)}>
      <Icon className={cn('size-3.5', config.spin && 'animate-spin')} />
      {config.label}
    </span>
  )
}
