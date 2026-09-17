import { Card, CardHeader } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { formatNumber, formatPercent } from '@/utils/format'
import type { VoiceDurationByStateRow } from '@/types'

interface DurationByStateTableProps {
  rows: VoiceDurationByStateRow[]
}

export function DurationByStateTable({ rows }: DurationByStateTableProps) {
  const columns: DataTableColumn<VoiceDurationByStateRow>[] = [
    { key: 'state', header: 'State', render: (r) => <span className="font-medium text-ink-900">{r.label}</span> },
    { key: 'calls', header: 'Calls', render: (r) => formatNumber(r.calls) },
    { key: 'pctOfConnected', header: '% of connected', render: (r) => formatPercent(r.pctOfConnected, 1) },
    {
      key: 'avgSeconds',
      header: 'Avg',
      render: (r) => (r.notEnoughData ? <span className="text-ink-400">Not enough data</span> : `${Math.round(r.avgSeconds)}s`),
    },
    {
      key: 'totalSeconds',
      header: 'Duration',
      render: (r) => (r.notEnoughData ? <span className="text-ink-400">—</span> : `${Math.round(r.totalSeconds)}s`),
    },
    { key: 'pctOfDuration', header: '% of duration', render: (r) => (r.notEnoughData ? <span className="text-ink-400">—</span> : formatPercent(r.pctOfDuration, 1)) },
  ]

  return (
    <Card>
      <CardHeader title="Duration by call state" description="Time spent connected, broken down by what happened during the call." />
      <DataTable
        columns={columns}
        data={rows}
        keyExtractor={(r) => r.state}
        emptyState={<div className="px-5 py-8 text-center text-[13px] text-ink-400">No connected calls in this range.</div>}
      />
      {rows.some((r) => r.notEnoughData) && (
        <div className="border-t border-ink-100 px-5 py-3">
          <Badge tone="neutral">Some states require call-state timestamps this deployment doesn't persist yet</Badge>
        </div>
      )}
    </Card>
  )
}
