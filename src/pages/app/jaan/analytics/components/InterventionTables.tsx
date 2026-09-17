import { Card, CardHeader } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { formatNumber, formatPercent } from '@/utils/format'
import type { VoiceAgentInterventionRow, VoiceCallerNumberRow, VoiceInterventionResponse } from '@/types'

const numberColumns: DataTableColumn<VoiceCallerNumberRow>[] = [
  { key: 'number', header: 'Number', render: (r) => <span className="font-mono text-ink-900">{r.number}</span> },
  { key: 'attempted', header: 'Attempted', render: (r) => formatNumber(r.attempted) },
  { key: 'connectRate', header: 'Connect rate', render: (r) => formatPercent(r.connectRate, 1) },
  { key: 'avgDurationSeconds', header: 'Avg duration', render: (r) => `${Math.round(r.avgDurationSeconds)}s` },
]

const agentColumns: DataTableColumn<VoiceAgentInterventionRow>[] = [
  { key: 'agentName', header: 'Agent', render: (r) => <span className="font-medium text-ink-900">{r.agentName}</span> },
  { key: 'attempted', header: 'Attempted', render: (r) => formatNumber(r.attempted) },
  { key: 'humanAnswered', header: 'Human answered', render: (r) => formatNumber(r.humanAnswered) },
  { key: 'engaged', header: 'Engaged', render: (r) => formatNumber(r.engaged) },
  {
    key: 'engagedRate',
    header: 'Engaged rate',
    render: (r) => <span className={r.engagedRate < 20 ? 'font-semibold text-danger-600' : ''}>{formatPercent(r.engagedRate, 1)}</span>,
  },
  { key: 'avgDurationSeconds', header: 'Avg duration', render: (r) => `${Math.round(r.avgDurationSeconds)}s` },
]

interface InterventionTablesProps {
  data: VoiceInterventionResponse
}

export function InterventionTables({ data }: InterventionTablesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-ink-900">Where to intervene</h3>
          <p className="text-[13px] text-ink-500">Numbers affect reachability. Agents affect the conversation.</p>
        </div>
        <Badge tone="neutral">
          {data.byAgent.length} agent{data.byAgent.length === 1 ? '' : 's'} · {data.byCallerNumber.length} number{data.byCallerNumber.length === 1 ? '' : 's'}
        </Badge>
      </div>

      <Card>
        <CardHeader title="By caller number" />
        <DataTable
          columns={numberColumns}
          data={data.byCallerNumber}
          keyExtractor={(r) => r.number}
          emptyState={<div className="px-5 py-8 text-center text-[13px] text-ink-400">No calls in this range.</div>}
        />
      </Card>

      <Card>
        <CardHeader title="By agent" description="Engaged rate is of human-answered calls, not attempted." />
        <DataTable
          columns={agentColumns}
          data={data.byAgent}
          keyExtractor={(r) => r.agentId}
          emptyState={<div className="px-5 py-8 text-center text-[13px] text-ink-400">No calls in this range.</div>}
        />
      </Card>
    </div>
  )
}
