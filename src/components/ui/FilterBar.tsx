import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

export function FilterBar({ children, onClear, hasActiveFilters, className }: { children: ReactNode; onClear?: () => void; hasActiveFilters?: boolean; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2.5', className)}>
      {children}
      {hasActiveFilters && onClear && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-700"
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

export function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-[13px] text-ink-700">
      <span className="font-medium text-ink-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent pr-1 text-ink-800 focus:outline-none"
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

export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700">
      {label}
      <button onClick={onRemove} aria-label={`Remove ${label} filter`}>
        <X className="size-3" />
      </button>
    </span>
  )
}
