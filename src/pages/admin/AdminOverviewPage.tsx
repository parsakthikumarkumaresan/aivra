import { Link } from 'react-router-dom'
import { Building2, CheckCircle2, Wallet, TrendingUp } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { adminBusinessService } from '@/services/api'
import { PageHeader, KpiCard, Card, CardHeader, CardBody, EmptyState, ErrorState } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format'

// JEXA Admin Overview — the founder/CEO home page (Admin Console business
// restructure). Every number is a real cross-tenant aggregate
// (app/organizations/api/admin_business.py) — no fabricated metrics.
// Deliberately restrained: 4 primary KPIs, not a wall of cards.
export default function AdminOverviewPage() {
  const overview = useAsync(() => adminBusinessService.getOverview(), [])

  if (overview.loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="JEXA Business Overview" description="Loading…" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }
  if (overview.error || !overview.data) {
    return <ErrorState description={overview.error?.message} onRetry={overview.refetch} />
  }

  const data = overview.data
  const adoption = data.aiEmployeeAdoption
  const maxGrowth = Math.max(1, ...data.customerGrowth.map((p) => p.newCustomers))
  const maxRevenue = Math.max(
    1,
    ...data.revenueTrend.map((p) => p.subscriptionRevenue + p.rechargeRevenue),
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="JEXA Business Overview"
        description="The state of the JEXA business — real data only, updated live."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Customers" value={data.totalCustomers.toLocaleString()} icon={<Building2 className="size-4" />} />
        <KpiCard label="Active Customers" value={data.activeCustomers.toLocaleString()} icon={<CheckCircle2 className="size-4" />} />
        <KpiCard label="MRR" value={formatCurrency(data.mrr, data.mrrCurrency)} icon={<TrendingUp className="size-4" />} tooltip="Active HR AI self-service subscriptions, monthly-normalized. Jaan is quote-based, not shown in MRR." />
        <KpiCard label="Total Revenue" value={formatCurrency(data.totalRevenue, data.mrrCurrency)} icon={<Wallet className="size-4" />} tooltip="Paid JEXA subscription invoices + paid Jaan Voice Credit recharges, all time." />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Revenue Trend" description="Paid subscription + recharge revenue, by month." />
          <CardBody>
            {data.revenueTrend.length === 0 ? (
              <EmptyState compact icon={<TrendingUp className="size-5" />} title="No revenue recorded yet" />
            ) : (
              <div className="flex h-36 items-end gap-2">
                {data.revenueTrend.map((point) => {
                  const total = point.subscriptionRevenue + point.rechargeRevenue
                  return (
                    <div key={point.month} className="group relative flex-1">
                      <div className="w-full rounded-t bg-brand-600/70 transition-colors group-hover:bg-brand-600" style={{ height: `${Math.max(4, (total / maxRevenue) * 100)}%` }} />
                      <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink-900 px-2 py-1 text-[11px] text-ink-25 group-hover:block">
                        {formatDate(point.month, 'MMM yyyy')}: {formatCurrency(total, data.mrrCurrency)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Customer Growth" description="New customers per day, last 90 days." />
          <CardBody>
            {data.customerGrowth.length === 0 ? (
              <EmptyState compact icon={<Building2 className="size-5" />} title="No new customers in this window" />
            ) : (
              <div className="flex h-36 items-end gap-1">
                {data.customerGrowth.map((point) => (
                  <div key={point.day} className="group relative flex-1">
                    <div className="w-full rounded-t bg-brand-600/70 transition-colors group-hover:bg-brand-600" style={{ height: `${Math.max(4, (point.newCustomers / maxGrowth) * 100)}%` }} />
                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink-900 px-2 py-1 text-[11px] text-ink-25 group-hover:block">
                      {formatDate(point.day)}: {point.newCustomers} new
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="AI Employee Adoption" description="Real EmployeeProvision data — never inferred." />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <AdoptionTile label="Jaan" value={adoption.jaanCustomers} href="/admin/ai-employees/jaan" />
          <AdoptionTile label="HR AI" value={adoption.hrCustomers} href="/admin/ai-employees/hr" />
          <AdoptionTile label="Both" value={adoption.bothCustomers} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Recent Business Activity" description="Real events — quotes, credit adjustments, agent publishes, new customers." />
        {data.recentActivity.length === 0 ? (
          <CardBody>
            <EmptyState compact icon={<TrendingUp className="size-5" />} title="No recent activity" />
          </CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {data.recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-[13px] font-medium text-ink-800">{item.label}</p>
                  {item.organizationName && (
                    <p className="text-xs text-ink-500">{item.organizationName}</p>
                  )}
                </div>
                <span className="text-xs text-ink-400">{formatDateTime(item.occurredAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function AdoptionTile({ label, value, href }: { label: string; value: number; href?: string }) {
  const content = (
    <div className="rounded-lg border border-ink-200 p-4 transition-colors hover:border-brand-600/50">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink-900">{value.toLocaleString()}</p>
      <p className="text-xs text-ink-500">customer{value === 1 ? '' : 's'}</p>
    </div>
  )
  return href ? <Link to={href}>{content}</Link> : content
}
