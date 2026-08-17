import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { SkeletonTable } from './Skeleton'

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyState?: ReactNode
  className?: string
  rowClassName?: (row: T) => string
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  loading,
  emptyState,
  className,
  rowClassName,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn('overflow-hidden rounded-xl border border-ink-200 bg-white', className)}>
        <SkeletonTable cols={columns.length} />
      </div>
    )
  }

  if (data.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>
  }

  return (
    <div className={cn('overflow-x-auto rounded-xl border border-ink-200 bg-white', className)}>
      <table className="w-full min-w-max border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-ink-100 bg-ink-25">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn('px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500', col.headerClassName)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'border-b border-ink-100 last:border-0 transition-colors duration-150',
                onRowClick && 'cursor-pointer hover:bg-brand-50/40',
                rowClassName?.(row),
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-5 py-3.5 align-middle text-ink-700', col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
