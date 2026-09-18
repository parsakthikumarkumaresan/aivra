import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface TabItem {
  value: string
  label: string
  count?: number
  icon?: ReactNode
}

interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}

// Underline tab strip — clean border-bottom with JEXA red active indicator.
// The active tab gets a 2px bottom border in brand-600 (red).
// Inactive tabs are muted and fade to a clean hover state.
export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div
      className={cn('flex items-center gap-0.5 overflow-x-auto border-b border-ink-200', className)}
      role="tablist"
    >
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 text-[13px] font-medium transition-colors duration-150',
              active
                ? 'text-ink-900'
                : 'text-ink-500 hover:text-ink-700',
            )}
          >
            {item.icon}
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
                  active ? 'bg-brand-100 text-brand-700' : 'bg-ink-200 text-ink-500',
                )}
              >
                {item.count}
              </span>
            )}
            {/* Active indicator: 2px JEXA red line at bottom — controlled, not aggressive */}
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600" />
            )}
          </button>
        )
      })}
    </div>
  )
}

interface PillTabsProps {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}

// Pill tabs — for compact switchers within cards/sections.
// Active pill gets JEXA red background; inactive are dark ghost.
export function PillTabs({ items, value, onChange, className }: PillTabsProps) {
  return (
    <div
      className={cn('inline-flex items-center gap-1 rounded-lg bg-ink-100 p-1', className)}
      role="tablist"
    >
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-[13px] font-medium transition-all duration-150',
              active
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-ink-500 hover:text-ink-800',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
