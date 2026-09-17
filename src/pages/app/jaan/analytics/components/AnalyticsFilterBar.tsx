import { RefreshCw } from 'lucide-react'
import { FilterBar, FilterSelect, FilterChip } from '@/components/ui/FilterBar'
import { PillTabs } from '@/components/ui/Tabs'
import type { VoiceAgent, VoiceAnalyticsDateRange, VoiceAnalyticsDirection } from '@/types'

const DATE_RANGE_OPTIONS: { value: VoiceAnalyticsDateRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom range' },
]

const DATE_RANGE_LABEL = Object.fromEntries(DATE_RANGE_OPTIONS.map((o) => [o.value, o.label]))

export interface AnalyticsFilterState {
  direction: 'all' | VoiceAnalyticsDirection
  dateRange: VoiceAnalyticsDateRange
  agentId: string
  startDate: string
  endDate: string
}

export const DEFAULT_ANALYTICS_FILTERS: AnalyticsFilterState = {
  direction: 'all',
  dateRange: 'today',
  agentId: 'all',
  startDate: '',
  endDate: '',
}

interface AnalyticsFilterBarProps {
  filters: AnalyticsFilterState
  onChange: (patch: Partial<AnalyticsFilterState>) => void
  onClear: () => void
  onRefresh: () => void
  agents: VoiceAgent[]
}

export function AnalyticsFilterBar({ filters, onChange, onClear, onRefresh, agents }: AnalyticsFilterBarProps) {
  const agentName = agents.find((a) => a.id === filters.agentId)?.name
  const chips: { key: keyof AnalyticsFilterState; label: string }[] = []
  if (filters.dateRange !== 'today') chips.push({ key: 'dateRange', label: `Date: ${DATE_RANGE_LABEL[filters.dateRange]}` })
  if (filters.agentId !== 'all') chips.push({ key: 'agentId', label: `Agent: ${agentName ?? filters.agentId}` })
  if (filters.direction !== 'all') chips.push({ key: 'direction', label: `Type: ${filters.direction === 'inbound' ? 'Inbound' : 'Outbound'}` })

  const hasActiveFilters = chips.length > 0

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PillTabs
          items={[
            { value: 'all', label: 'All calls' },
            { value: 'outbound', label: 'Outbound' },
            { value: 'inbound', label: 'Inbound' },
          ]}
          value={filters.direction}
          onChange={(v) => onChange({ direction: v as AnalyticsFilterState['direction'] })}
        />
        <FilterBar>
          <FilterSelect label="Date" value={filters.dateRange} options={DATE_RANGE_OPTIONS} onChange={(v) => onChange({ dateRange: v as VoiceAnalyticsDateRange })} />
          <FilterSelect
            label="Agent"
            value={filters.agentId}
            options={[{ value: 'all', label: 'All agents' }, ...agents.map((a) => ({ value: a.id, label: a.name }))]}
            onChange={(v) => onChange({ agentId: v })}
          />
          <button
            onClick={onRefresh}
            aria-label="Refresh analytics"
            className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-surface px-2.5 py-1.5 text-[13px] font-medium text-ink-600 hover:bg-ink-100"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </FilterBar>
      </div>

      {filters.dateRange === 'custom' && (
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-surface px-2.5 py-1.5 text-[13px] text-ink-700">
            <span className="font-medium text-ink-500">From</span>
            <input type="date" value={filters.startDate} onChange={(e) => onChange({ startDate: e.target.value })} className="bg-transparent text-ink-800 focus:outline-none" />
          </label>
          <label className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-surface px-2.5 py-1.5 text-[13px] text-ink-700">
            <span className="font-medium text-ink-500">To</span>
            <input type="date" value={filters.endDate} onChange={(e) => onChange({ endDate: e.target.value })} className="bg-transparent text-ink-800 focus:outline-none" />
          </label>
        </div>
      )}

      {hasActiveFilters && (
        <FilterBar hasActiveFilters onClear={onClear}>
          {chips.map((c) => (
            <FilterChip key={c.key} label={c.label} onRemove={() => onChange({ [c.key]: DEFAULT_ANALYTICS_FILTERS[c.key] } as Partial<AnalyticsFilterState>)} />
          ))}
        </FilterBar>
      )}
    </div>
  )
}
