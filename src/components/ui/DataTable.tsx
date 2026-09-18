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
      <div className={cn('overflow-hidden rounded-xl border border-ink-300 bg-surface', className)}>
        <SkeletonTable cols={columns.length} />
      </div>
    )
  }

  if (data.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>
  }

  return (
    <div className={cn('overflow-x-auto rounded-xl border border-ink-300 bg-surface', className)}>
      <table className="w-full min-w-max border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-b border-ink-200 bg-ink-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500',
                  col.headerClassName,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'row-fade-in border-b border-ink-200 last:border-0 transition-colors duration-100',
                onRowClick && 'cursor-pointer hover:bg-ink-100',
                rowClassName?.(row),
              )}
              style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3 align-middle text-ink-700', col.className)}>
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
