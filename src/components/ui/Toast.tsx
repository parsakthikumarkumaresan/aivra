import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { ToastTone } from '@/hooks/useToast'

const TONE_CONFIG: Record<ToastTone, { icon: typeof CheckCircle2; classes: string; iconClasses: string }> = {
  success: { icon: CheckCircle2, classes: 'border-success-100', iconClasses: 'text-success-600' },
  error: { icon: AlertCircle, classes: 'border-danger-100', iconClasses: 'text-danger-600' },
  warning: { icon: AlertTriangle, classes: 'border-warning-100', iconClasses: 'text-warning-600' },
  info: { icon: Info, classes: 'border-info-100', iconClasses: 'text-info-600' },
}

export interface ToastItemProps {
  id: string
  title: string
  description?: string
  tone: ToastTone
  onDismiss: (id: string) => void
}

export function ToastItem({ id, title, description, tone, onDismiss }: ToastItemProps) {
  const { icon: Icon, classes, iconClasses } = TONE_CONFIG[tone]
  return (
    <div
      role="status"
      className={cn(
        'toast-enter flex w-80 items-start gap-3 rounded-xl border bg-surface-elevated p-3.5 shadow-elevated',
        classes,
      )}
    >
      <Icon className={cn('mt-0.5 size-4.5 shrink-0', iconClasses)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        {description && <p className="mt-0.5 text-[13px] text-ink-500">{description}</p>}
      </div>
      <button onClick={() => onDismiss(id)} aria-label="Dismiss" className="text-ink-400 hover:text-ink-600">
        <X className="size-4" />
      </button>
    </div>
  )
}
