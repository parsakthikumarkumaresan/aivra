import { Link } from 'react-router-dom'
import { Users, Building2, CheckCircle2, TrendingUp, FileText, ScanSearch, Mic2, Clock } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { adminHrBusinessService } from '@/services/api'
import { PageHeader, KpiCard, Badge, Card, CardHeader, DataTable, EmptyState, ErrorState } from '@/components/ui'
import type { BadgeTone } from '@/components/ui/Badge'
import { formatCurrency, formatDateTime } from '@/utils/format'

const STATUS_TONE: Record<string, BadgeTone> = { active: 'success', suspended: 'danger' }

// JEXA Admin — HR AI business overview ("AI Employees → HR AI"). Uses
// HR-specific metrics only — never borrows Jaan's voice/credits/telephony
// usage model. Candidates/Jobs/Interviews are HR's real usage signal.
export default function AdminHrBusinessPage() {
  const overview = useAsync(() => adminHrBusinessService.getOverview(), [])

  if (overview.error) {
    return <ErrorState description={overview.error.message} onRetry={overview.refetch} />
  }

  const data = overview.data

  return (
    <div className="space-y-6">
      <PageHeader
        title="HR AI"
        description="HR / Recruitment AI Employee — business overview. Real customer, revenue and usage data."
        actions={
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand-600/10 text-brand-600">
            <Users className="size-5" />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Customers" value={String(data?.customerCount ?? '—')} icon={<Building2 className="size-4" />} />
        <KpiCard label="Active Customers" value={String(data?.activeCustomers ?? '—')} icon={<CheckCircle2 className="size-4" />} />
        <KpiCard label="MRR" value={data ? formatCurrency(data.mrr) : '—'} icon={<TrendingUp className="size-4" />} tooltip="Active self-service subscriptions, monthly-normalized." />
        <KpiCard label="Candidates Processed" value={data ? data.candidatesTotal.toLocaleString() : '—'} icon={<ScanSearch className="size-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="Jobs Posted" value={data ? data.jobsTotal.toLocaleString() : '—'} icon={<FileText className="size-4" />} />
        <KpiCard label="Interviews Conducted" value={data ? data.interviewsTotal.toLocaleString() : '—'} icon={<Mic2 className="size-4" />} />
      </div>

      <Card>
        <CardHeader title="Customer Adoption" description="Every customer with an active HR AI subscription." />
        <DataTable
          columns={[
            {
              key: 'customer',
              header: 'Customer',
              render: (row) => (
                <Link to={`/admin/customers/${row.organizationId}`} className="font-medium text-ink-900 hover:text-brand-600">
                  {row.organizationName}
                </Link>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => <Badge tone={STATUS_TONE[row.status] ?? 'neutral'} dot>{row.status}</Badge>,
            },
            {
              key: 'plan',
              header: 'Plan',
              render: (row) => <span className="text-ink-700">{row.planName ?? '—'}</span>,
            },
            {
              key: 'candidates',
              header: 'Candidates',
              render: (row) => <span className="text-ink-700">{row.candidatesCount.toLocaleString()}</span>,
            },
            {
              key: 'jobs',
              header: 'Jobs',
              render: (row) => <span className="text-ink-700">{row.jobsCount.toLocaleString()}</span>,
            },
            {
              key: 'lastActivity',
              header: 'Last Activity',
              render: (row) => (
                <span className="flex items-center gap-1 text-ink-500">
                  <Clock className="size-3.5" />
                  {row.lastActivityAt ? formatDateTime(row.lastActivityAt) : 'No activity yet'}
                </span>
              ),
            },
          ]}
          data={data?.customers ?? []}
          keyExtractor={(row) => row.organizationId}
          loading={overview.loading}
          emptyState={
            <EmptyState icon={<Building2 className="size-5" />} title="No HR AI customers yet" />
          }
        />
      </Card>
    </div>
  )
}
