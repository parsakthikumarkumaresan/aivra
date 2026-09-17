import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PhoneCall, PhoneMissed, Clock, CheckCircle2, ArrowRightLeft, Percent, Gauge, ListChecks } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useVoiceAnalytics } from '@/hooks/useVoice'
import { useVoiceAgents } from '@/hooks/useVoiceAgentBuilder'
import { PageHeader } from '@/components/ui/PageHeader'
import { KpiCard } from '@/components/ui/KpiCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { AnalyticsFilterBar, DEFAULT_ANALYTICS_FILTERS } from './components/AnalyticsFilterBar'
import type { AnalyticsFilterState } from './components/AnalyticsFilterBar'
import { CallingFunnel } from './components/CallingFunnel'
import { CallsOverTimeChart } from './components/CallsOverTimeChart'
import { ConnectRateCard } from './components/ConnectRateCard'
import { BreakdownCard } from './components/BreakdownCard'
import { CallDurationCard } from './components/CallDurationCard'
import { DurationByStateTable } from './components/DurationByStateTable'
import { VoicemailCard } from './components/VoicemailCard'
import { InterventionTables } from './components/InterventionTables'
import { IntentDistributionCard } from './components/IntentDistributionCard'
import { formatNumber, formatPercent } from '@/utils/format'
import type { VoiceAnalyticsDateRange, VoiceAnalyticsDirection, VoiceDispositionRow, VoiceHowCallsEndedRow, VoiceOutcomeRow } from '@/types'

// Every number on this page comes from GET /analytics/voice
// (app/ai_employees/voice/api/analytics_routes.py), scoped server-side to
// the logged-in user's own organization and, when set, to one
// server-validated agent. Sections the backend cannot compute honestly yet
// (e.g. voicemail detection, some duration-by-state timing) render a
// labeled "not enough data" / empty state instead of a fabricated number —
// see each section component for the specific caveat.
export default function JaanAnalyticsPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Analytics' }])
  const [params, setParams] = useSearchParams()
  const agentsQuery = useVoiceAgents()

  const filters: AnalyticsFilterState = {
    direction: (params.get('direction') as AnalyticsFilterState['direction']) || DEFAULT_ANALYTICS_FILTERS.direction,
    dateRange: (params.get('dateRange') as VoiceAnalyticsDateRange) || DEFAULT_ANALYTICS_FILTERS.dateRange,
    agentId: params.get('agentId') || DEFAULT_ANALYTICS_FILTERS.agentId,
    startDate: params.get('startDate') || DEFAULT_ANALYTICS_FILTERS.startDate,
    endDate: params.get('endDate') || DEFAULT_ANALYTICS_FILTERS.endDate,
  }

  const analytics = useVoiceAnalytics({
    dateRange: filters.dateRange,
    agentId: filters.agentId !== 'all' ? filters.agentId : undefined,
    direction: filters.direction !== 'all' ? (filters.direction as VoiceAnalyticsDirection) : undefined,
    startDate: filters.dateRange === 'custom' && filters.startDate ? filters.startDate : undefined,
    endDate: filters.dateRange === 'custom' && filters.endDate ? filters.endDate : undefined,
  })

  const handleFilterChange = (patch: Partial<AnalyticsFilterState>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(patch)) {
      if (!value || value === 'all' || value === DEFAULT_ANALYTICS_FILTERS[key as keyof AnalyticsFilterState]) next.delete(key)
      else next.set(key, value)
    }
    setParams(next, { replace: true })
  }

  const handleClear = () => setParams(new URLSearchParams(), { replace: true })

  const dispositionColumns = useMemo(
    () => [
      { key: 'label', header: 'End reason', render: (r: VoiceDispositionRow) => <span className="font-medium text-ink-900">{r.label}</span> },
      { key: 'calls', header: 'Calls', render: (r: VoiceDispositionRow) => formatNumber(r.calls) },
      { key: 'pctOfAttempted', header: '% of attempted', render: (r: VoiceDispositionRow) => formatPercent(r.pctOfAttempted, 1) },
    ],
    [],
  )

  const howEndedColumns = useMemo(
    () => [
      { key: 'label', header: 'End reason', render: (r: VoiceHowCallsEndedRow) => <span className="font-medium text-ink-900">{r.label}</span> },
      { key: 'calls', header: 'Calls', render: (r: VoiceHowCallsEndedRow) => formatNumber(r.calls) },
      { key: 'pctOfConnected', header: '% of connected', render: (r: VoiceHowCallsEndedRow) => formatPercent(r.pctOfConnected, 1) },
    ],
    [],
  )

  const outcomesColumns = useMemo(
    () => [
      { key: 'outcome', header: 'Outcome', render: (r: VoiceOutcomeRow) => <span className="font-medium capitalize text-ink-900">{r.outcome.replace(/_/g, ' ')}</span> },
      { key: 'calls', header: 'Calls', render: (r: VoiceOutcomeRow) => formatNumber(r.calls) },
      { key: 'pctOfAnswered', header: '% of answered', render: (r: VoiceOutcomeRow) => formatPercent(r.pctOfAnswered, 1) },
      { key: 'avgTalkTimeSeconds', header: 'Avg talk time', render: (r: VoiceOutcomeRow) => `${Math.round(r.avgTalkTimeSeconds)}s` },
    ],
    [],
  )

  if (analytics.loading) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-5 p-6">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    )
  }

  if (analytics.error) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-5 p-6">
        <PageHeader title="Analytics" description="Performance across your organization's Jaan voice agents." />
        <ErrorState title="Could not load analytics" onRetry={analytics.refetch} />
      </div>
    )
  }

  const data = analytics.data
  if (!data) return null

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-6">
      <PageHeader title="Analytics" description="Performance across your organization's Jaan voice agents." />

      <AnalyticsFilterBar filters={filters} onChange={handleFilterChange} onClear={handleClear} onRefresh={analytics.refetch} agents={agentsQuery.data ?? []} />

      {data.summary.totalCalls === 0 ? (
        <EmptyState
          icon={<PhoneCall className="size-6" />}
          title="No calls in this range"
          description="Once your agents handle real calls matching these filters, their performance will show up here."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8">
            <KpiCard label="Calls" value={formatNumber(data.summary.totalCalls)} icon={<PhoneCall className="size-4" />} />
            <KpiCard label="Connected" value={formatNumber(data.summary.connectedCalls)} icon={<CheckCircle2 className="size-4" />} />
            <KpiCard label="Missed" value={formatNumber(data.summary.missedCalls)} icon={<PhoneMissed className="size-4" />} trendGood="down" />
            <KpiCard label="Voice Minutes" value={formatNumber(Math.round(data.summary.voiceMinutes))} icon={<Clock className="size-4" />} />
            <KpiCard label="Avg Duration" value={`${Math.round(data.summary.averageDurationSeconds)}s`} icon={<Gauge className="size-4" />} />
            <KpiCard label="Success Rate" value={formatPercent(data.summary.successRate, 0)} icon={<Percent className="size-4" />} tooltip="Resolved or booked, as a share of human-answered calls." />
            <KpiCard label="Completion Rate" value={formatPercent(data.summary.completionRate, 0)} icon={<ListChecks className="size-4" />} tooltip="Human-answered calls that didn't end in 'no action', as a share of human-answered calls." />
            <KpiCard label="Transfer Rate" value={formatPercent(data.summary.transferRate, 0)} icon={<ArrowRightLeft className="size-4" />} trendGood="down" tooltip="Escalated to a human, as a share of human-answered calls." />
          </div>

          <CallingFunnel stages={data.funnel} />

          <CallsOverTimeChart points={data.callsOverTime} bucket={data.meta.bucket} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ConnectRateCard data={data.connectRate} />
            <BreakdownCard
              title="Disposition"
              tooltip="Every attempt, up to connection. Connected calls as one row; unconnected calls grouped by end reason."
              count={data.summary.totalCalls}
              countLabel="calls attempted"
              barColorClass="bg-warning-500"
              columns={dispositionColumns}
              rows={data.disposition}
              keyExtractor={(r) => r.reason}
              emptyMessage="No calls in this range."
            />
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-ink-900">What happened on connected calls</h3>
            <p className="text-[13px] text-ink-500">Starts at connected and breaks down inside it. Nothing unconnected appears here.</p>
            <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <CallDurationCard stats={data.callDuration} />
              <DurationByStateTable rows={data.durationByState} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <BreakdownCard
              title="How calls ended"
              count={data.summary.connectedCalls}
              countLabel="calls connected"
              barColorClass="bg-info-500"
              columns={howEndedColumns}
              rows={data.howCallsEnded}
              keyExtractor={(r) => r.reason}
              emptyMessage="No connected calls in this range."
            />
            <VoicemailCard stats={data.voicemail} />
          </div>

          <BreakdownCard
            title="Outcomes"
            count={data.callDuration.humanAnsweredCalls}
            countLabel="human-answered calls"
            barColorClass="bg-info-500"
            columns={outcomesColumns}
            rows={data.outcomes}
            keyExtractor={(r) => r.outcome}
            emptyMessage="No human-answered calls in this range."
          />

          <InterventionTables data={data.whereToIntervene} />

          <IntentDistributionCard rows={data.intentDistribution} />
        </>
      )}
    </div>
  )
}
