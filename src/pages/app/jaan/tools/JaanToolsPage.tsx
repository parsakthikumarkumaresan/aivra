import { useMemo, useState } from 'react'
import { Wrench, Plus, FlaskConical, Ban, CheckCircle2 } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useVoiceAgents } from '@/hooks/useVoiceAgentBuilder'
import { useToast } from '@/hooks/useToast'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterBar, FilterSelect } from '@/components/ui/FilterBar'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import type { VoiceAgentTool } from '@/types'

interface ToolRow extends VoiceAgentTool {
  agentName: string
  agentId: string
}

export default function JaanToolsPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Tools' }])
  const agents = useVoiceAgents()
  const { show } = useToast()
  const [search, setSearch] = useState('')
  const [agentFilter, setAgentFilter] = useState('all')

  const rows: ToolRow[] = useMemo(
    () => (agents.data ?? []).flatMap((a) => a.tools.map((t) => ({ ...t, agentName: a.name, agentId: a.id }))),
    [agents.data],
  )

  const filtered = rows.filter((r) => {
    if (agentFilter !== 'all' && r.agentId !== agentFilter) return false
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const columns: DataTableColumn<ToolRow>[] = [
    { key: 'name', header: 'Tool', render: (t) => (
      <span className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Wrench className="size-4" /></span>
        <span>
          <span className="block text-[13px] font-semibold text-ink-900">{t.name}</span>
          <span className="block text-[11.5px] text-ink-500">{t.description}</span>
        </span>
      </span>
    ) },
    { key: 'agent', header: 'Agent', render: (t) => <span className="text-[13px] text-ink-600">{t.agentName}</span> },
    { key: 'method', header: 'Method', render: (t) => <span className="font-mono text-[12px] text-ink-600">{t.method}</span> },
    { key: 'auth', header: 'Auth', render: (t) => <span className="text-[13px] text-ink-600">{t.authType}</span> },
    { key: 'status', header: 'Status', render: (t) => <Badge tone={t.enabled ? 'success' : 'neutral'} dot>{t.enabled ? 'Enabled' : 'Disabled'}</Badge> },
    {
      key: 'actions', header: '', className: 'text-right', render: (t) => (
        <div className="flex justify-end gap-1.5">
          <Button size="sm" variant="outline" icon={<FlaskConical className="size-3.5" />} onClick={() => show({ tone: 'info', title: 'Testing tool…', description: t.name })}>Test</Button>
          <Button size="sm" variant="ghost" icon={t.enabled ? <Ban className="size-3.5" /> : <CheckCircle2 className="size-3.5" />} onClick={() => show({ tone: 'success', title: t.enabled ? 'Tool disabled' : 'Tool enabled' })} />
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-6">
      <PageHeader
        title="Tools"
        description="Actions Jaan agents can execute during a call — lookups, bookings, CRM updates and more."
        actions={<Button icon={<Plus className="size-3.5" />}>Create Tool</Button>}
      />

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search tools…" containerClassName="w-64" />
        <FilterSelect
          label="Agent"
          value={agentFilter}
          options={[{ value: 'all', label: 'All Agents' }, ...(agents.data ?? []).map((a) => ({ value: a.id, label: a.name }))]}
          onChange={setAgentFilter}
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(t) => `${t.agentId}_${t.id}`}
        loading={agents.loading}
        emptyState={
          <EmptyState
            icon={<Wrench className="size-6" />}
            title="No tools yet"
            description="Give Jaan the ability to take action by connecting your first tool."
            action={<Button icon={<Plus className="size-4" />}>Create Tool</Button>}
          />
        }
      />
    </div>
  )
}
