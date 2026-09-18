import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus, Info } from 'lucide-react'
import { Tooltip } from './Tooltip'
import { useReveal } from '@/hooks/useReveal'
import { useCountUp } from '@/hooks/useCountUp'
import { cn } from '@/utils/cn'

interface KpiCardProps {
  label: string
  value: string
  icon?: ReactNode
  trend?: { direction: 'up' | 'down' | 'flat'; value: string }
  trendGood?: 'up' | 'down' // which direction counts as positive
  tooltip?: string
  className?: string
}

export function KpiCard({ label, value, icon, trend, trendGood = 'up', tooltip, className }: KpiCardProps) {
  const isPositive = trend && (trend.direction === trendGood || trend.direction === 'flat')
  const { ref, visible } = useReveal<HTMLDivElement>(0.4)
  const displayValue = useCountUp(value, { start: visible })
  return (
    <div
      ref={ref}
      className={cn(
        'reveal rounded-xl border border-ink-300 bg-surface p-5 shadow-card',
        visible && 'reveal-visible',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[12.5px] font-medium uppercase tracking-wide text-ink-500">
          {label}
          {tooltip && (
            <Tooltip content={tooltip}>
              <Info className="size-3.5 cursor-help text-ink-400" />
            </Tooltip>
          )}
        </span>
        {icon && (
          <span className="flex size-7 items-center justify-center rounded-lg bg-ink-200 text-ink-500">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="text-[28px] font-semibold leading-none tracking-tight text-ink-900 tabular-nums">
          {displayValue}
        </span>
        {trend && (
          <span
            className={cn(
              'mb-0.5 flex items-center gap-0.5 text-[12px] font-semibold',
              trend.direction === 'flat'
                ? 'text-ink-400'
                : isPositive
                  ? 'text-success-600'
                  : 'text-danger-600',
            )}
          >
            {trend.direction === 'up' && <ArrowUpRight className="size-3.5" />}
            {trend.direction === 'down' && <ArrowDownRight className="size-3.5" />}
            {trend.direction === 'flat' && <Minus className="size-3.5" />}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  )
}
