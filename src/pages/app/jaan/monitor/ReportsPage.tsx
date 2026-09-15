import { FileBarChart, Plus, Download, CalendarClock } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useReports } from '@/hooks/useJaan'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Report } from '@/types'
import { formatDateTime } from '@/utils/format'

export default function ReportsPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Monitor & QA' }, { label: 'Reports' }])
  const reports = useReports()

  const columns: DataTableColumn<Report>[] = [
    { key: 'name', header: 'Report', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'type', header: 'Type', render: (r) => <span className="text-[13px] capitalize text-ink-600">{r.type}</span> },
    { key: 'range', header: 'Date Range', render: (r) => <span className="text-[13px] text-ink-600">{r.dateRangeLabel}</span> },
    { key: 'generated', header: 'Generated', render: (r) => <span className="text-[13px] text-ink-500">{formatDateTime(r.generatedAt)}</span> },
    { key: 'scheduled', header: 'Scheduled', render: (r) => r.scheduled ? <Badge tone="info" dot icon={<CalendarClock className="size-3" />}>Recurring</Badge> : <span className="text-[13px] text-ink-400">One-off</span> },
    { key: 'actions', header: '', className: 'text-right', render: () => <div className="flex justify-end"><Button size="sm" variant="outline" icon={<Download className="size-3.5" />}>Download</Button></div> },
  ]

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-6">
      <PageHeader title="Reports" description="Export call, agent, campaign, cost and quality reports as PDF or CSV." actions={<Button icon={<Plus className="size-3.5" />}>Generate Report</Button>} />
      <DataTable
        columns={columns}
        data={reports.data ?? []}
        keyExtractor={(r) => r.id}
        loading={reports.loading}
        emptyState={<EmptyState icon={<FileBarChart className="size-6" />} title="No reports yet" description="Generate a report to export calls, agent performance or cost data." action={<Button icon={<Plus className="size-4" />}>Generate Report</Button>} />}
      />
    </div>
  )
}
