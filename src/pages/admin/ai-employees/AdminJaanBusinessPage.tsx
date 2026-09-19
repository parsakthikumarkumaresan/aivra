import { Link } from 'react-router-dom'
import {
  Mic,
  Building2,
  CheckCircle2,
  Wallet,
  PhoneCall,
  Clock,
  Bot,
  Radio,
  Rocket,
  ShieldCheck,
  LifeBuoy,
} from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { adminJaanBusinessService } from '@/services/api'
import { PageHeader, KpiCard, Badge, Card, CardHeader, CardBody, DataTable, EmptyState, ErrorState, Button } from '@/components/ui'
import type { BadgeTone } from '@/components/ui/Badge'
import { formatCurrency, formatDateTime } from '@/utils/format'

const STATUS_TONE: Record<string, BadgeTone> = { active: 'success', suspended: 'danger' }

const QUICK_LINKS = [
  { label: 'Agents', href: '/admin/agents', icon: Bot },
  { label: 'Calls', href: '/admin/calls', icon: PhoneCall },
  { label: 'Monitor & QA', href: '/admin/monitor', icon: ShieldCheck },
  { label: 'Usage & Credits', href: '/admin/credits', icon: Wallet },
  { label: 'Telephony', href: '/admin/telephony', icon: Radio },
  { label: 'Deployments', href: '/admin/deployments', icon: Rocket },
  { label: 'Escalated Calls', href: '/admin/support', icon: LifeBuoy },
]

// JEXA Admin — Jaan business overview ("AI Employees → Jaan"). Answers
// business questions (customers, revenue, usage, adoption) rather than
// just listing technical agents — those stay reachable via Quick Links.
export default function AdminJaanBusinessPage() {
  const overview = useAsync(() => adminJaanBusinessService.getOverview(), [])

  if (overview.error) {
    return <ErrorState description={overview.error.message} onRetry={overview.refetch} />
  }

  const data = overview.data

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jaan"
        description="Voice AI Employee — business overview. Real customer, revenue and usage data."
        actions={
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand-600/10 text-brand-600">
            <Mic className="size-5" />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Customers" value={String(data?.customerCount ?? '—')} icon={<Building2 className="size-4" />} />
        <KpiCard label="Active Customers" value={String(data?.activeCustomers ?? '—')} icon={<CheckCircle2 className="size-4" />} />
        <KpiCard label="Recharge Revenue" value={data ? formatCurrency(data.revenue) : '—'} icon={<Wallet className="size-4" />} tooltip="Paid Jaan Voice Credit recharges, all time." />
        <KpiCard label="Total Calls" value={data ? data.totalCalls.toLocaleString() : '—'} icon={<PhoneCall className="size-4" />} />
      </div>

      <Card>
        <CardHeader title="Operational & Technical" description="Agent workspace, call history, telephony infrastructure and deployment tooling." />
        <CardBody className="flex flex-wrap gap-2.5">
          {QUICK_LINKS.map((link) => (
            <Link key={link.label} to={link.href}>
              <Button variant="outline" size="sm" icon={<link.icon className="size-3.5" />}>{link.label}</Button>
            </Link>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Customer Adoption" description="Every customer with an active Jaan subscription." />
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
              key: 'balance',
              header: 'Credit Balance',
              render: (row) => <span className="text-ink-700">{row.creditBalanceMinutes.toLocaleString()} min</span>,
            },
            {
              key: 'used',
              header: 'Used',
              render: (row) => <span className="text-ink-700">{row.usedMinutes.toLocaleString()} min</span>,
            },
            {
              key: 'revenue',
              header: 'Revenue',
              render: (row) => <span className="text-ink-700">{formatCurrency(row.revenue)}</span>,
            },
            {
              key: 'lastActivity',
              header: 'Last Call',
              render: (row) => (
                <span className="flex items-center gap-1 text-ink-500">
                  <Clock className="size-3.5" />
                  {row.lastCallAt ? formatDateTime(row.lastCallAt) : 'No calls yet'}
                </span>
              ),
            },
          ]}
          data={data?.customers ?? []}
          keyExtractor={(row) => row.organizationId}
          loading={overview.loading}
          emptyState={
            <EmptyState icon={<Building2 className="size-5" />} title="No Jaan customers yet" />
          }
        />
      </Card>
    </div>
  )
}
