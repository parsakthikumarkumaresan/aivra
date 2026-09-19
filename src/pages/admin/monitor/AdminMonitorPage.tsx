import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Gauge, PhoneCall, Clock, CheckCircle2, XCircle, Repeat, Info } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { adminOrganizationsService, adminCallsService } from '@/services/api'
import type { AdminOrganizationSummary } from '@/services/api'
import { PageHeader, Card, CardHeader, CardBody, EmptyState, ErrorState } from '@/components/ui'
import { CustomerSelector } from '@/components/admin/CustomerSelector'
import { Select } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import type { VoiceAnalyticsResponse } from '@/types'

// JEXA Admin — Monitor & QA (Phase 12).
//
// Metrics below are 100% real — the exact same SQL-aggregated engine
// (VoiceAnalyticsService) the customer-facing /analytics/voice route uses,
// just scoped to an admin-chosen organization.
//
// Runs, Reviews, and Alerts are NOT shown here: there is no backend
// simulation/QA-scoring/alerting pipeline yet (even the customer-facing
// Simulations/Monitor pages for those are still mock-backed today). Per
// the "no fabricated data" requirement, this page states that gap
// honestly instead of shipping fake widgets.
export default function AdminMonitorPage() {
  const [params] = useSearchParams()
  const deepLinkOrgId = params.get('org')

  const [selected, setSelected] = useState<AdminOrganizationSummary | null>(null)
  const [dateRange, setDateRange] = useState('30d')
  const deepLinked = useAsync(
    () => (deepLinkOrgId ? adminOrganizationsService.get(deepLinkOrgId) : Promise.resolve(null)),
    [deepLinkOrgId],
  )
  useEffect(() => {
    if (deepLinked.data) setSelected(deepLinked.data)
  }, [deepLinked.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitor & QA"
        description="Real Jaan Voice metrics for a chosen customer. Runs, Reviews and Alerts aren't shown — no backend pipeline exists for those yet (see note below)."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <CustomerSelector value={selected} onChange={setSelected} className="max-w-md" />
        {selected && (
          <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="max-w-[160px]">
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </Select>
        )}
      </div>

      {!selected ? (
        <EmptyState icon={<Gauge className="size-5" />} title="Select a customer" description="Search for a customer above to view their Jaan Voice metrics." compact />
      ) : (
        <OrganizationMetrics organizationId={selected.id} dateRange={dateRange} />
      )}

      <Card>
        <CardHeader title="Runs, Reviews & Alerts" />
        <CardBody className="flex items-start gap-3">
          <Info className="mt-0.5 size-4 shrink-0 text-ink-400" />
          <p className="text-[13px] leading-relaxed text-ink-500">
            These require a simulation-execution engine, a QA scoring model, and a failure/anomaly
            alerting pipeline — none of which exist in the backend yet (the customer-facing
            Simulations and Monitor pages for these are also still mock-backed). Building them is a
            new feature, not an admin view over existing data, so nothing is shown here rather than
            fabricating scores or alerts.
          </p>
        </CardBody>
      </Card>
    </div>
  )
}

function OrganizationMetrics({ organizationId, dateRange }: { organizationId: string; dateRange: string }) {
  const analytics = useAsync(
    () => adminCallsService.getOrganizationAnalytics(organizationId, { dateRange }),
    [organizationId, dateRange],
  )

  if (analytics.loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }
  if (analytics.error || !analytics.data) {
    return <ErrorState description={analytics.error?.message} onRetry={analytics.refetch} />
  }

  return <MetricsBody data={analytics.data} />
}

function MetricsBody({ data }: { data: VoiceAnalyticsResponse }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric icon={<PhoneCall className="size-5" />} label="Total Calls" value={data.summary.totalCalls.toLocaleString()} />
        <Metric icon={<CheckCircle2 className="size-5" />} label="Connected" value={data.summary.connectedCalls.toLocaleString()} tone="success" />
        <Metric icon={<XCircle className="size-5" />} label="Missed" value={data.summary.missedCalls.toLocaleString()} tone="danger" />
        <Metric icon={<Clock className="size-5" />} label="Voice Minutes" value={data.summary.voiceMinutes.toLocaleString()} />
        <Metric icon={<Clock className="size-5" />} label="Avg Duration" value={`${Math.round(data.summary.averageDurationSeconds)}s`} />
        <Metric icon={<CheckCircle2 className="size-5" />} label="Success Rate" value={`${data.summary.successRate}%`} />
        <Metric icon={<CheckCircle2 className="size-5" />} label="Completion Rate" value={`${data.summary.completionRate}%`} />
        <Metric icon={<Repeat className="size-5" />} label="Transfer Rate" value={`${data.summary.transferRate}%`} />
      </div>

      <Card>
        <CardHeader title="Funnel" description="Attempted → Dialled → Connected → Human Answered → Engaged." />
        {data.funnel.length === 0 ? (
          <CardBody><EmptyState compact icon={<PhoneCall className="size-5" />} title="No calls in this window" /></CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {data.funnel.map((stage) => (
              <div key={stage.key} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-[13px] font-medium text-ink-800">{stage.label}</p>
                  <p className="text-xs text-ink-500">{stage.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-ink-900">{stage.count.toLocaleString()}</p>
                  <p className="text-xs text-ink-500">{stage.pctOfAttempted}% of attempted</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Disposition" description="Why calls didn't connect." />
          {data.disposition.length === 0 ? (
            <CardBody><EmptyState compact icon={<PhoneCall className="size-5" />} title="No disposition data" /></CardBody>
          ) : (
            <div className="divide-y divide-ink-100">
              {data.disposition.map((row) => (
                <div key={row.reason} className="flex items-center justify-between px-5 py-3">
                  <span className="text-[13px] text-ink-800">{row.label}</span>
                  <span className="text-[13px] text-ink-600">{row.calls} · {row.pctOfAttempted}%</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Outcomes" description="What happened on answered calls." />
          {data.outcomes.length === 0 ? (
            <CardBody><EmptyState compact icon={<CheckCircle2 className="size-5" />} title="No outcome data" /></CardBody>
          ) : (
            <div className="divide-y divide-ink-100">
              {data.outcomes.map((row) => (
                <div key={row.outcome} className="flex items-center justify-between px-5 py-3">
                  <span className="text-[13px] capitalize text-ink-800">{row.outcome.replace('_', ' ')}</span>
                  <span className="text-[13px] text-ink-600">{row.calls} · {row.pctOfAnswered}%</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Intent Distribution" />
        {data.intentDistribution.length === 0 ? (
          <CardBody><EmptyState compact icon={<Gauge className="size-5" />} title="No intent data" /></CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {data.intentDistribution.map((row) => (
              <div key={row.intent} className="flex items-center justify-between px-5 py-3">
                <span className="text-[13px] capitalize text-ink-800">{row.intent.replace('_', ' ')}</span>
                <span className="text-[13px] text-ink-600">{row.calls} · {row.pct}%</span>
              </div>
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
