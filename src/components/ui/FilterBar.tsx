import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

// FilterBar — container for search + filter controls.
// Keeps controls compact without dominating the page.
export function FilterBar({
  children,
  onClear,
  hasActiveFilters,
  className,
}: {
  children: ReactNode
  onClear?: () => void
  hasActiveFilters?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {children}
      {hasActiveFilters && onClear && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-ink-500 transition-colors duration-150 hover:bg-ink-200 hover:text-ink-700"
        >
          <X className="size-3.5" />
          Clear filters
        </button>
      )}
    </div>
  )
}

interface FilterSelectProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

// Compact filter select — label + native select inline, bordered pill.
export function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-ink-300 bg-surface px-2.5 py-1.5 text-[13px] text-ink-700 transition-colors duration-150 hover:border-ink-400">
      <span className="font-medium text-ink-500">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent pr-1 text-ink-800 focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

// Active filter chip — compact pill for visible active filters.
// Uses brand-100/brand-700 to signal "this filter is applied (brand-associated)".
export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-brand-100 px-2.5 py-1 text-[12px] font-medium text-brand-800">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="rounded text-brand-600 transition-colors hover:text-brand-900"
      >
        <X className="size-3" />
      </button>
    </span>
  )
}
