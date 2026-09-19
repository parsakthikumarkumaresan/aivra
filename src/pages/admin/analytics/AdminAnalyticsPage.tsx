import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Bot, PhoneCall, Clock, CheckCircle2, XCircle, Users, Mic } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { adminBusinessService, adminCallsService } from '@/services/api'
import type { AdminAnalytics } from '@/services/api'
import { PageHeader, Card, CardBody, CardHeader, ErrorState, EmptyState } from '@/components/ui'
import { Select } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/utils/format'

// JEXA Admin Analytics — company-wide, not Jaan-only. "Product" section
// covers real AI Employee adoption across both products; "Usage" below it
// is the real, honest platform-wide Jaan Voice rollup (every number a
// direct aggregate, no QA scoring, no provider cost surfaced, no
// fabricated trend). HR-specific usage analytics beyond adoption counts
// aren't computed yet — see the HR AI business page for what is real.
export default function AdminAnalyticsPage() {
  const [windowDays, setWindowDays] = useState(30)
  const analytics = useAsync(() => adminCallsService.getAnalytics(windowDays), [windowDays])
  const landing = useAsync(() => adminBusinessService.getAiEmployeesLanding(), [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Company-wide product adoption and Jaan Voice usage — real aggregates only."
      />

      <Card>
        <CardHeader title="Product Adoption" description="Real customer counts per AI Employee (app.ai_employees.provisioning)." />
        {landing.loading ? (
          <CardBody><Skeleton className="h-16 w-full" /></CardBody>
        ) : landing.error || !landing.data ? (
          <CardBody><ErrorState description={landing.error?.message} onRetry={landing.refetch} /></CardBody>
        ) : (
          <div className="grid grid-cols-1 divide-y divide-ink-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {landing.data.employees.map((e) => (
              <Link key={e.code} to={`/admin/ai-employees/${e.code === 'voice' ? 'jaan' : e.code}`} className="flex items-center gap-3 p-5 transition-colors hover:bg-ink-50">
                {e.code === 'voice' ? <Mic className="size-5 text-brand-600" /> : <Users className="size-5 text-brand-600" />}
                <div>
                  <p className="text-[13px] font-medium text-ink-800">{e.name}</p>
                  <p className="text-lg font-bold text-ink-900">{e.customerCount.toLocaleString()} customers</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <PageHeader
        title="Jaan Voice Usage"
        description="Platform-wide, real — no fabricated data."
        actions={
          <Select value={String(windowDays)} onChange={(e) => setWindowDays(Number(e.target.value))} className="max-w-[160px]">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </Select>
        }
      />

      {analytics.loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : analytics.error || !analytics.data ? (
        <ErrorState description={analytics.error?.message} onRetry={analytics.refetch} />
      ) : (
        <AnalyticsBody data={analytics.data} />
      )}
    </div>
  )
}

function AnalyticsBody({ data }: { data: AdminAnalytics }) {
  const maxTrendCalls = Math.max(1, ...data.usageTrend.map((p) => p.calls))

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric icon={<Building2 className="size-5" />} label="Total Customers" value={data.totalCustomers.toLocaleString()} />
        <Metric icon={<Bot className="size-5" />} label="Active Jaan Agents" value={data.activeJaanAgents.toLocaleString()} />
        <Metric icon={<PhoneCall className="size-5" />} label="Total Calls" value={data.totalCalls.toLocaleString()} />
        <Metric icon={<Clock className="size-5" />} label="Total Voice Minutes" value={data.totalVoiceMinutes.toLocaleString()} />
        <Metric icon={<Clock className="size-5" />} label="Avg Call Duration" value={`${Math.round(data.averageDurationSeconds)}s`} />
        <Metric icon={<CheckCircle2 className="size-5" />} label="Successful Calls" value={data.completedCalls.toLocaleString()} tone="success" />
        <Metric icon={<XCircle className="size-5" />} label="Failed Calls" value={data.failedCalls.toLocaleString()} tone="danger" />
        <Metric icon={<CheckCircle2 className="size-5" />} label="Success Rate" value={`${data.successRate}%`} />
      </div>

      <Card>
        <CardHeader title="Usage Trend" description={`Calls per day over the last ${data.windowDays} days, across every customer.`} />
        <CardBody>
          {data.usageTrend.length === 0 ? (
            <EmptyState compact icon={<PhoneCall className="size-5" />} title="No calls in this window" />
          ) : (
            <div className="flex h-40 items-end gap-1">
              {data.usageTrend.map((point) => (
                <div key={point.day} className="group relative flex-1">
                  <div
                    className="w-full rounded-t bg-brand-600/70 transition-colors group-hover:bg-brand-600"
                    style={{ height: `${Math.max(4, (point.calls / maxTrendCalls) * 100)}%` }}
                  />
                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink-900 px-2 py-1 text-[11px] text-ink-25 group-hover:block">
                    {formatDate(point.day)}: {point.calls} calls
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Top Customers by Call Volume" description={`Within the last ${data.windowDays} days.`} />
        {data.customerUsage.length === 0 ? (
          <CardBody>
            <EmptyState compact icon={<Building2 className="size-5" />} title="No usage in this window" />
          </CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {data.customerUsage.map((row) => (
              <Link
                key={row.organizationId}
                to={`/admin/customers/${row.organizationId}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-ink-50"
              >
                <span className="text-[13px] font-medium text-ink-800">{row.organizationName}</span>
                <span className="text-[13px] text-ink-600">{row.calls.toLocaleString()} calls</span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}

function Metric({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone?: 'success' | 'danger'
}) {
  const toneClass =
    tone === 'success' ? 'bg-emerald-500/10 text-emerald-500' : tone === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-ink-100 text-ink-600'
  return (
    <Card>
      <CardBody className="flex items-center gap-3 p-4">
        <div className={`flex size-10 items-center justify-center rounded-lg ${toneClass}`}>{icon}</div>
        <div>
          <p className="text-[11.5px] font-medium text-ink-500">{label}</p>
          <p className="text-xl font-bold text-ink-900">{value}</p>
        </div>
      </CardBody>
    </Card>
  )
}
