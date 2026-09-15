import { FlaskConical, Plus } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useEvaluationRuns } from '@/hooks/useJaan'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import type { EvaluationRun, EvaluationRunStatus } from '@/types'
import { formatDateTime } from '@/utils/format'

const STATUS_TONE: Record<EvaluationRunStatus, BadgeTone> = { queued: 'neutral', running: 'info', completed: 'success', failed: 'danger' }

export default function RunsPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Monitor & QA' }, { label: 'Runs' }])
  const runs = useEvaluationRuns()

  const columns: DataTableColumn<EvaluationRun>[] = [
    { key: 'id', header: 'Run ID', render: (r) => <span className="font-mono text-[12.5px] text-ink-700">{r.id}</span> },
    { key: 'agent', header: 'Agent', render: (r) => <span className="text-[13px] text-ink-700">{r.agentName}</span> },
    { key: 'dataset', header: 'Dataset', render: (r) => <span className="text-[13px] text-ink-600">{r.datasetName}</span> },
    { key: 'started', header: 'Started', render: (r) => <span className="text-[13px] text-ink-500">{formatDateTime(r.startedAt)}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={STATUS_TONE[r.status]} dot>{r.status}</Badge> },
    { key: 'success', header: 'Success', render: (r) => <span className="text-[13px] text-ink-600">{r.successRate ? `${r.successRate}%` : '—'}</span> },
    { key: 'score', header: 'Score', render: (r) => <span className="text-[13px] font-medium text-ink-800">{r.score ?? '—'}</span> },
    { key: 'latency', header: 'Latency', render: (r) => <span className="text-[13px] text-ink-600">{r.avgLatencyMs ? `${r.avgLatencyMs}ms` : '—'}</span> },
    { key: 'cost', header: 'Cost', render: (r) => <span className="text-[13px] text-ink-600">{r.cost ? `₹${r.cost.toFixed(2)}` : '—'}</span> },
  ]

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 p-6">
      <PageHeader title="Runs" description="Evaluation runs against test datasets — regression-checked before you publish." actions={<Button icon={<Plus className="size-3.5" />}>New Run</Button>} />
      <DataTable
        columns={columns}
        data={runs.data ?? []}
        keyExtractor={(r) => r.id}
        loading={runs.loading}
        emptyState={<EmptyState icon={<FlaskConical className="size-6" />} title="No evaluation runs yet" description="Run your agent against a test dataset to catch regressions before they reach customers." action={<Button icon={<Plus className="size-4" />}>New Run</Button>} />}
      />
    </div>
  )
}
