import { CheckCircle2, XCircle, Loader2, Wrench } from 'lucide-react'
import type { ToolExecution } from '@/types'
import { cn } from '@/utils/cn'

const STATUS_CONFIG = {
  success: { icon: CheckCircle2, classes: 'text-success-600 bg-success-50 border-success-100' },
  failed: { icon: XCircle, classes: 'text-danger-600 bg-danger-50 border-danger-100' },
  pending: { icon: Loader2, classes: 'text-ink-500 bg-ink-50 border-ink-100' },
}

export function ToolExecutionCard({ execution }: { execution: ToolExecution }) {
  const config = STATUS_CONFIG[execution.status]
  const Icon = config.icon
  return (
    <div className={cn('rounded-lg border p-3', config.classes)}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-ink-900">
          <Wrench className="size-3.5 text-ink-400" />
          {execution.toolName}
        </span>
        <Icon className={cn('size-4', execution.status === 'pending' && 'animate-spin')} />
      </div>
      <p className="mt-1.5 text-xs text-ink-600">
        <span className="font-medium text-ink-500">Input:</span> {execution.input}
      </p>
      <p className="mt-0.5 text-xs text-ink-600">
        <span className="font-medium text-ink-500">Result:</span> {execution.result}
      </p>
      <p className="mt-1 text-[11px] text-ink-400">{execution.latencyMs}ms</p>
    </div>
  )
}
