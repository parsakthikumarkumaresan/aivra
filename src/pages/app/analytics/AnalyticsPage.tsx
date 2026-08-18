import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart3, Users, MessagesSquare, CheckSquare, PhoneMissed, IndianRupee, ScanSearch, FlaskConical, CalendarClock, TrendingDown, PhoneCall, Clock, CheckCircle2, Wrench } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useActivityChart } from '@/hooks/useDashboard'
import { useCandidates, useJobs } from '@/hooks/useHr'
import { useCalls } from '@/hooks/useVoice'
import { PageHeader } from '@/components/ui/PageHeader'
import { PillTabs } from '@/components/ui/Tabs'
import { FilterBar, FilterSelect } from '@/components/ui/FilterBar'
import { KpiCard } from '@/components/ui/KpiCard'
import { ChartCard } from '@/components/ui/ChartCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { CANDIDATE_STAGE_LABEL } from '@/types'
import type { CallIntent, CandidateStage } from '@/types'
import { formatDate } from '@/utils/format'

const FUNNEL_STAGES: CandidateStage[] = ['uploaded', 'analyzed', 'hr_review', 'screening_approved', 'human_review', 'interview_scheduled', 'completed']
const INTENT_LABEL: Record<CallIntent, string> = { faq: 'FAQ', booking: 'Booking', cancellation: 'Cancellation', status_lookup: 'Status Lookup', complaint: 'Complaint', unknown: 'Unknown' }
const INTENT_COLORS = ['#6D3EF2', '#2137C9', '#178350', '#c8850c', '#d33d3d', '#9d9db3']

export default function AnalyticsPage() {
  useSetBreadcrumbs([{ label: 'Analytics' }])
  const [params] = useSearchParams()
  const initialTab = params.get('tab')
  const [view, setView] = useState<'general' | 'hr' | 'voice'>(initialTab === 'hr' || initialTab === 'voice' ? initialTab : 'general')
  const [outcomeFilter, setOutcomeFilter] = useState('all')

  const chart = useActivityChart()
  const candidates = useCandidates({})
  const jobs = useJobs()
  const calls = useCalls({})

  const callData = calls.data ?? []
  const candidateData = candidates.data ?? []

  const funnelCounts = useMemo(
    () => FUNNEL_STAGES.map((stage) => ({ stage: CANDIDATE_STAGE_LABEL[stage], count: candidateData.filter((c) => c.stage === stage).length })),
    [candidateData],
  )

  const intentDistribution = useMemo(
    () => (Object.keys(INTENT_LABEL) as CallIntent[]).map((intent) => ({ name: INTENT_LABEL[intent], value: callData.filter((c) => c.intent === intent).length })).filter((d) => d.value > 0),
    [callData],
  )

  const totalCalls = callData.length
  const escalationRate = totalCalls ? Math.round((callData.filter((c) => c.escalated).length / totalCalls) * 100) : 0
  const resolutionRate = totalCalls ? Math.round((callData.filter((c) => ['resolved', 'booked', 'cancelled'].includes(c.outcome)).length / totalCalls) * 100) : 0
  const connectedMinutes = Math.round(callData.reduce((sum, c) => sum + c.durationSeconds, 0) / 60)
  const failures = callData.filter((c) => c.outcome === 'failed').length
  const actionsCompleted = callData.reduce((sum, c) => sum + c.actionsTaken.length, 0)

  const screenedCount = candidateData.filter((c) => c.overallScore !== null).length
  const interviewCompleted = candidateData.filter((c) => ['screening_completed', 'human_review', 'interview_approved', 'interview_scheduled', 'completed'].includes(c.stage)).length
  const scheduledInterviews = candidateData.filter((c) => c.stage === 'interview_scheduled').length
  const conversionRate = candidateData.length ? Math.round((candidateData.filter((c) => c.stage === 'completed').length / candidateData.length) * 100) : 0

  return (
    <div className="space-y-5">
      <PageHeader icon={<BarChart3 className="size-5" />} title="Analytics" description="Performance across every AI Employee in your workforce." />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PillTabs
          items={[
            { value: 'general', label: 'General' },
            { value: 'hr', label: 'HR' },
            { value: 'voice', label: 'Voice' },
          ]}
          value={view}
          onChange={(v) => setView(v as 'general' | 'hr' | 'voice')}
        />
        <FilterBar>
          <FilterSelect
            label="Range"
            value={chart.range}
            options={[{ value: '7d', label: '7 Days' }, { value: '30d', label: '30 Days' }]}
            onChange={(v) => chart.setRange(v as '7d' | '30d')}
          />
          {view === 'voice' && (
            <FilterSelect
              label="Outcome"
              value={outcomeFilter}
              options={[{ value: 'all', label: 'All Outcomes' }, { value: 'resolved', label: 'Resolved' }, { value: 'escalated', label: 'Escalated' }, { value: 'failed', label: 'Failed' }]}
              onChange={setOutcomeFilter}
            />
          )}
        </FilterBar>
      </div>

      {view === 'general' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <KpiCard label="Active Employees" value="2" icon={<Users className="size-4" />} tooltip="AI Employees currently active." />
            <KpiCard label="Conversations" value={String(totalCalls + candidateData.length)} icon={<MessagesSquare className="size-4" />} tooltip="Total calls and candidate interactions across employees." />
            <KpiCard label="Tasks Completed" value="1,248" icon={<CheckSquare className="size-4" />} tooltip="Screenings, interviews, calls and bookings completed." trend={{ direction: 'up', value: '+12.4%' }} />
            <KpiCard label="Resolution Rate" value={`${resolutionRate}%`} icon={<CheckCircle2 className="size-4" />} tooltip="Share of conversations resolved without escalation." />
            <KpiCard label="Escalations" value={String(callData.filter((c) => c.escalated).length)} icon={<PhoneMissed className="size-4" />} tooltip="Conversations handed off to a human." trendGood="down" />
            <KpiCard label="Estimated Cost" value="$186" icon={<IndianRupee className="size-4" />} tooltip="Estimated compute and telephony cost for the selected period." trendGood="down" />
          </div>

          <ChartCard title="Employee Activity" description="Tasks completed and conversations handled across your workforce">
            <div className="h-72">
              {chart.loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart.data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="genFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6D3EF2" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#6D3EF2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#eeeef3" />
                    <XAxis dataKey="date" tickFormatter={(v: string) => formatDate(v, chart.range === '7d' ? 'EEE' : 'MMM d')} tick={{ fontSize: 11, fill: '#9d9db3' }} axisLine={false} tickLine={false} interval={chart.range === '30d' ? 4 : 0} />
                    <YAxis tick={{ fontSize: 11, fill: '#9d9db3' }} axisLine={false} tickLine={false} width={40} />
                    <RTooltip labelFormatter={(v) => (typeof v === 'string' ? formatDate(v, 'MMM d, yyyy') : v)} contentStyle={{ borderRadius: 10, border: '1px solid #e0e0e9', fontSize: 12.5 }} />
                    <Area type="monotone" dataKey="value" name="Tasks Completed" stroke="#6D3EF2" strokeWidth={2.25} fill="url(#genFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>
        </div>
      )}

      {view === 'hr' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <KpiCard label="Candidates" value={String(candidateData.length)} icon={<Users className="size-4" />} tooltip="Total candidates across all jobs." />
            <KpiCard label="Screened" value={String(screenedCount)} icon={<ScanSearch className="size-4" />} tooltip="Candidates whose resumes have been evaluated." />
            <KpiCard label="Interview Completion" value={String(interviewCompleted)} icon={<FlaskConical className="size-4" />} tooltip="Candidates who reached or completed an AI or human interview." />
            <KpiCard label="Scheduled Interviews" value={String(scheduledInterviews)} icon={<CalendarClock className="size-4" />} tooltip="Candidates with a human interview currently scheduled." />
            <KpiCard label="Funnel Conversion" value={`${conversionRate}%`} icon={<TrendingDown className="size-4" />} tooltip="Share of all candidates who reached Selected." />
            <KpiCard label="Time to Screen" value="4.2 hrs" icon={<Clock className="size-4" />} tooltip="Average time from application to AI screening completion." trendGood="down" />
          </div>

          <ChartCard title="Candidate Funnel" description="Candidates by pipeline stage across all jobs">
            <div className="h-72">
              {candidates.loading || jobs.loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelCounts} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#eeeef3" />
                    <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#9d9db3' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9d9db3' }} axisLine={false} tickLine={false} width={30} />
                    <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e0e0e9', fontSize: 12.5 }} />
                    <Bar dataKey="count" name="Candidates" fill="#6D3EF2" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>
        </div>
      )}

      {view === 'voice' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <KpiCard label="Calls" value={String(totalCalls)} icon={<PhoneCall className="size-4" />} tooltip="Total calls handled." />
            <KpiCard label="Connected Minutes" value={String(connectedMinutes)} icon={<Clock className="size-4" />} tooltip="Total talk time across all calls." />
            <KpiCard label="Resolution Rate" value={`${resolutionRate}%`} icon={<CheckCircle2 className="size-4" />} tooltip="Calls resolved without human escalation." />
            <KpiCard label="Escalation Rate" value={`${escalationRate}%`} icon={<PhoneMissed className="size-4" />} tooltip="Share of calls handed off to a human." trendGood="down" />
            <KpiCard label="Actions Completed" value={String(actionsCompleted)} icon={<Wrench className="size-4" />} tooltip="Tool actions successfully executed during calls." />
            <KpiCard label="Failures" value={String(failures)} icon={<TrendingDown className="size-4" />} tooltip="Calls that ended without resolving the customer's request." trendGood="down" />
          </div>

          <ChartCard title="Intent Distribution" description="What customers are calling about">
            <div className="h-72">
              {calls.loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={intentDistribution} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                      {intentDistribution.map((_, i) => (
                        <Cell key={i} fill={INTENT_COLORS[i % INTENT_COLORS.length]} />
                      ))}
                    </Pie>
                    <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #e0e0e9', fontSize: 12.5 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
              {intentDistribution.map((d, i) => (
                <span key={d.name} className="flex items-center gap-1.5 text-xs text-ink-600">
                  <span className="size-2 rounded-full" style={{ backgroundColor: INTENT_COLORS[i % INTENT_COLORS.length] }} />
                  {d.name} ({d.value})
                </span>
              ))}
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  )
}
