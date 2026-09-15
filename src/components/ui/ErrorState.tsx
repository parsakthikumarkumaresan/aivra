import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/utils/cn'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  variant?: 'error' | 'network'
  className?: string
  compact?: boolean
}

export function ErrorState({
  title,
  description,
  onRetry,
  variant = 'error',
  className,
  compact,
}: ErrorStateProps) {
  const Icon = variant === 'network' ? WifiOff : AlertTriangle
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-danger-100 bg-danger-50 text-center',
        compact ? 'px-6 py-8' : 'px-6 py-14',
        className,
      )}
      role="alert"
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-danger-100 text-danger-600">
        <Icon className="size-6" />
      </div>
      <h3 className="text-[15px] font-semibold text-ink-900">
        {title ?? (variant === 'network' ? 'Network connection lost' : 'Something went wrong')}
      </h3>
      <p className="mt-1.5 max-w-md text-sm text-ink-600">
        {description ?? 'We could not complete this request. Your data is safe — try again.'}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" icon={<RefreshCw className="size-3.5" />} onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}

export function PermissionDeniedState({ requiredRole }: { requiredRole?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-ink-200 bg-surface px-6 py-14 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-ink-100 text-ink-500">
        <AlertTriangle className="size-6" />
      </div>
      <h3 className="text-[15px] font-semibold text-ink-900">You don't have access to this page</h3>
      <p className="mt-1.5 max-w-md text-sm text-ink-500">
        {requiredRole ? `This area requires ${requiredRole} permissions.` : 'Ask an organization admin to grant you access.'}
      </p>
    </div>
  )
}
