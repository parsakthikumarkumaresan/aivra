import { FlaskConical, Plus } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useSimulations } from '@/hooks/useJaan'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Simulation, SimulationStatus } from '@/types'
import { formatDateTime } from '@/utils/format'

const STATUS_TONE: Record<SimulationStatus, BadgeTone> = { queued: 'neutral', running: 'info', passed: 'success', needs_review: 'warning', failed: 'danger' }

export default function SimulationsPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Simulations' }])
  const simulations = useSimulations()

  const columns: DataTableColumn<Simulation>[] = [
    { key: 'scenario', header: 'Scenario', render: (s) => (
      <span>
        <span className="block text-[13px] font-semibold text-ink-900">{s.scenarioName}</span>
        <span className="block text-[11.5px] text-ink-500">{s.agentName}</span>
      </span>
    ) },
    { key: 'testUser', header: 'Test User', render: (s) => <span className="text-[13px] text-ink-600">{s.testUser}</span> },
    { key: 'status', header: 'Status', render: (s) => <Badge tone={STATUS_TONE[s.status]} dot>{s.status.replace('_', ' ')}</Badge> },
    { key: 'score', header: 'Score', render: (s) => <span className="text-[13px] font-medium text-ink-800">{s.score ?? '—'}</span> },
    { key: 'latency', header: 'Latency', render: (s) => <span className="text-[13px] text-ink-600">{s.latencyMs ? `${s.latencyMs}ms` : '—'}</span> },
    { key: 'started', header: 'Started', render: (s) => <span className="text-[13px] text-ink-500">{formatDateTime(s.startedAt)}</span> },
  ]

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 p-6">
      <PageHeader
        title={<span className="flex items-center gap-2">Simulations <Badge tone="brand">Enterprise</Badge></span>}
        description="Test agents against real-world scenarios in an isolated environment — nothing here touches production."
        actions={<Button icon={<Plus className="size-3.5" />}>New Simulation</Button>}
      />
      <DataTable
        columns={columns}
        data={simulations.data ?? []}
        keyExtractor={(s) => s.id}
        loading={simulations.loading}
        emptyState={<EmptyState icon={<FlaskConical className="size-6" />} title="No simulations yet" description="Test how your agent handles tricky scenarios before they happen with a real customer." action={<Button icon={<Plus className="size-4" />}>New Simulation</Button>} />}
      />
    </div>
  )
}
