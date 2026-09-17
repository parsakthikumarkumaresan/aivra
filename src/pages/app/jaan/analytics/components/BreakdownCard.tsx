import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/Tooltip'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { formatNumber } from '@/utils/format'

interface BreakdownCardProps<T> {
  title: string
  tooltip?: string
  count: number
  countLabel: string
  barColorClass?: string
  columns: DataTableColumn<T>[]
  rows: T[]
  keyExtractor: (row: T) => string
  emptyMessage: string
  footnote?: ReactNode
  actions?: ReactNode
}

export function BreakdownCard<T>({
  title,
  tooltip,
  count,
  countLabel,
  barColorClass = 'bg-info-500',
  columns,
  rows,
  keyExtractor,
  emptyMessage,
  footnote,
  actions,
}: BreakdownCardProps<T>) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[15px] font-semibold text-ink-900">{title}</h3>
          {tooltip && (
            <Tooltip content={tooltip}>
              <Info className="size-3.5 text-ink-400" />
            </Tooltip>
          )}
        </div>
        {actions}
      </div>
      <div className="mt-3">
        <span className="text-[24px] font-bold leading-none text-ink-900">{formatNumber(count)}</span>
        <span className="ml-1.5 text-[13px] text-ink-500">{countLabel}</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-ink-100">
        <div className={`h-full rounded-full ${barColorClass}`} style={{ width: count > 0 ? '100%' : '0%' }} />
      </div>
      <div className="mt-4">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-ink-400">{emptyMessage}</p>
        ) : (
          <DataTable columns={columns} data={rows} keyExtractor={keyExtractor} />
        )}
      </div>
      {footnote && <p className="mt-3 text-xs text-ink-400">{footnote}</p>}
    </Card>
  )
}
