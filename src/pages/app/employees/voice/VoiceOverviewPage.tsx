import { Link } from 'react-router-dom'
import { Mic, FlaskConical, Pause, Settings2, PhoneCall, Clock, CheckCircle2, PhoneMissed, Wrench, CalendarCheck, ChevronRight, Building2, Sparkles } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useEmployeeByType } from '@/hooks/useEmployees'
import { useCalls, useVoiceConfig } from '@/hooks/useVoice'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmployeeStatusBadge } from '@/components/ui/StatusBadge'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { CALL_OUTCOME_LABEL } from '@/types'
import type { CallIntent } from '@/types'
import { formatDuration, formatRelativeTime } from '@/utils/format'

const INTENT_LABEL: Record<CallIntent, string> = { faq: 'FAQ', booking: 'Booking', cancellation: 'Cancellation', status_lookup: 'Status Lookup', complaint: 'Complaint', unknown: 'Unknown' }

export default function VoiceOverviewPage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'AI Voice Employee' }])
  const employee = useEmployeeByType('voice')
  const config = useVoiceConfig()
  const calls = useCalls({})

  const data = calls.data ?? []
  const totalCalls = data.length
  const connectedMinutes = Math.round(data.reduce((sum, c) => sum + c.durationSeconds, 0) / 60)
  const resolvedCount = data.filter((c) => ['resolved', 'booked', 'cancelled'].includes(c.outcome)).length
  const resolutionRate = totalCalls ? Math.round((resolvedCount / totalCalls) * 100) : 0
  const escalations = data.filter((c) => c.escalated).length
  const actionsCompleted = data.reduce((sum, c) => sum + c.actionsTaken.length, 0)
  const bookings = data.filter((c) => c.outcome === 'booked').length

  const intentCounts = (Object.keys(INTENT_LABEL) as CallIntent[]).map((intent) => ({
    intent,
    count: data.filter((c) => c.intent === intent).length,
  }))
  const maxIntent = Math.max(1, ...intentCounts.map((i) => i.count))

  const recentEscalations = data.filter((c) => c.escalated).slice(0, 4)
  const todaysCalls = [...data].sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt)).slice(0, 6)

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Mic className="size-5" />}
        title={
          <span className="flex items-center gap-2.5">
            AI Voice Employee
            {employee.data && <EmployeeStatusBadge status={employee.data.status} />}
          </span>
        }
        description="Handles customer conversations, enquiries, bookings and support."
        meta={
          <>
            {config.data && (
              <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                <Building2 className="size-3.5" />
                {config.data.businessName} — {config.data.industry}
              </span>
            )}
            {employee.data && <span className="text-xs text-ink-400">Last active {formatRelativeTime(employee.data.lastActivityAt)}</span>}
          </>
        }
        actions={
          <>
            <Link to="/app/employees/voice/setup">
              <Button variant="outline" icon={<Settings2 className="size-4" />}>
                Configure
              </Button>
            </Link>
            <Link to="/app/employees/voice/simulator">
              <Button variant="outline" icon={<FlaskConical className="size-4" />}>
                Test Call
              </Button>
            </Link>
            <Button variant="ghost" icon={<Pause className="size-4" />}>
              Pause
            </Button>
          </>
        }
      />

      {calls.loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <KpiCard label="Calls" value={String(totalCalls)} icon={<PhoneCall className="size-4" />} tooltip="Total calls handled in the selected period." />
          <KpiCard label="Connected Minutes" value={String(connectedMinutes)} icon={<Clock className="size-4" />} tooltip="Total talk time across all calls." />
          <KpiCard label="Resolution Rate" value={`${resolutionRate}%`} icon={<CheckCircle2 className="size-4" />} tooltip="Calls resolved without requiring human escalation." />
          <KpiCard label="Escalations" value={String(escalations)} icon={<PhoneMissed className="size-4" />} tooltip="Calls handed off to a human agent." trendGood="down" />
          <KpiCard label="Actions Completed" value={String(actionsCompleted)} icon={<Wrench className="size-4" />} tooltip="Tool actions successfully executed, like bookings or cancellations." />
          <KpiCard label="Bookings" value={String(bookings)} icon={<CalendarCheck className="size-4" />} tooltip="Appointments or reservations booked via a call." />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Today's Calls"
            description="Most recent conversations"
            actions={
              <Link to="/app/inbox?tab=voice" className="flex items-center gap-1 text-[13px] font-medium text-brand-600 hover:text-brand-700">
                View inbox <ChevronRight className="size-3.5" />
              </Link>
            }
          />
          <div className="divide-y divide-ink-100">
            {calls.loading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              todaysCalls.map((c) => (
                <Link key={c.id} to={`/app/inbox/calls/${c.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ink-25">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <PhoneCall className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-ink-800">{c.callerName}</p>
                    <p className="truncate text-xs text-ink-500">{c.summary}</p>
                  </div>
                  <Badge tone={c.escalated ? 'danger' : 'neutral'}>{CALL_OUTCOME_LABEL[c.outcome]}</Badge>
                  <span className="w-14 shrink-0 text-right text-xs text-ink-400">{formatDuration(c.durationSeconds)}</span>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Intent Distribution" />
          <CardBody className="space-y-2.5">
            {intentCounts.map((i) => (
              <div key={i.intent} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs text-ink-500">{INTENT_LABEL[i.intent]}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-info-500" style={{ width: `${(i.count / maxIntent) * 100}%` }} />
                </div>
                <span className="w-5 shrink-0 text-right text-xs font-semibold text-ink-700">{i.count}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent Escalations" description="Calls handed off to a human" />
          <CardBody className="space-y-1 p-2">
            {recentEscalations.length === 0 ? (
              <p className="p-3 text-[13px] text-ink-500">No recent escalations.</p>
            ) : (
              recentEscalations.map((c) => (
                <Link key={c.id} to={`/app/inbox/calls/${c.id}`} className="block rounded-lg p-2.5 hover:bg-ink-50">
                  <p className="text-[13px] font-medium text-ink-800">{c.callerName}</p>
                  <p className="mt-0.5 text-xs text-ink-500">{c.escalationReason}</p>
                </Link>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Knowledge & Tool Health" />
          <CardBody className="space-y-2.5">
            {config.loading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              config.data?.tools.slice(0, 4).map((tool) => (
                <div key={tool.id} className="flex items-center justify-between text-[13px]">
                  <span className="text-ink-700">{tool.name}</span>
                  <Badge tone={tool.connected ? 'success' : 'neutral'} dot>
                    {tool.connected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="border-brand-100 bg-brand-50/40">
        <CardBody className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-600" />
          <p className="text-[13px] leading-relaxed text-ink-700">
            High-risk actions like refunds and cancellations above threshold always route through the{' '}
            <Link to="/app/approvals" className="font-semibold underline">
              Approvals queue
            </Link>
            .
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
