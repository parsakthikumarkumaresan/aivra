import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Phone, Clock, Calendar, FlagTriangleRight, CheckCircle2 } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useCall } from '@/hooks/useVoice'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { AudioPlayer } from '@/components/ui/AudioPlayer'
import { Transcript } from '@/components/ui/Transcript'
import { Timeline } from '@/components/ui/Timeline'
import type { TimelineEntry } from '@/components/ui/Timeline'
import { ToolExecutionCard } from '@/components/employees/voice/ToolExecutionCard'
import { CALL_OUTCOME_LABEL } from '@/types'
import { formatDate, formatDateTime, formatDuration } from '@/utils/format'

export default function CallDetailPage() {
  const { id = '' } = useParams()
  const call = useCall(id)
  useSetBreadcrumbs([{ label: 'Inbox', href: '/app/inbox' }, { label: call.data?.callerName ?? '…' }], [call.data?.callerName])

  if (call.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }
  if (call.error || !call.data) {
    return <ErrorState title="Could not load call" onRetry={call.refetch} />
  }

  const c = call.data
  const timelineEntries: TimelineEntry[] = [
    { id: 'tl1', title: 'Call started', timestamp: formatDateTime(c.startedAt), iconTone: 'neutral' },
    ...c.toolsUsed.map(
      (t, i): TimelineEntry => ({
        id: `tl_tool_${i}`,
        title: `Tool called: ${t.toolName}`,
        description: t.result,
        timestamp: formatDateTime(t.timestamp),
        iconTone: t.status === 'success' ? 'success' : 'danger',
      }),
    ),
    ...(c.escalated ? [{ id: 'tl_esc', title: 'Escalated to human agent', description: c.escalationReason, timestamp: formatDateTime(c.startedAt), iconTone: 'warning' as const }] : []),
    { id: 'tl_end', title: `Call ended — ${CALL_OUTCOME_LABEL[c.outcome]}`, timestamp: formatDate(c.startedAt), iconTone: c.outcome === 'failed' ? 'danger' : 'success' as const },
  ]

  return (
    <div className="space-y-5">
      <Link to="/app/inbox" className="flex items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" />
        Back to inbox
      </Link>

      <PageHeader
        icon={<Phone className="size-5" />}
        title={c.callerName}
        description={c.callerNumber}
        meta={
          <>
            <span className="flex items-center gap-1.5 text-xs text-ink-500"><Calendar className="size-3.5" />{formatDateTime(c.startedAt)}</span>
            <span className="flex items-center gap-1.5 text-xs text-ink-500"><Clock className="size-3.5" />{formatDuration(c.durationSeconds)}</span>
          </>
        }
        actions={
          <Badge tone={c.escalated ? 'danger' : 'success'} dot>
            {CALL_OUTCOME_LABEL[c.outcome]}
          </Badge>
        }
      />

      {c.escalated && c.escalationReason && (
        <div className="flex items-start gap-2.5 rounded-xl border border-warning-100 bg-warning-50 px-4 py-3 text-[13px] text-warning-700">
          <FlagTriangleRight className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">Why this call was escalated</p>
            <p className="mt-0.5">{c.escalationReason}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {c.recordingAvailable && <AudioPlayer durationSeconds={c.durationSeconds} />}

          <Card>
            <CardHeader title="AI Summary" />
            <CardBody>
              <p className="text-[13.5px] leading-relaxed text-ink-700">{c.summary}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Transcript" />
            <CardBody className="max-h-96 overflow-y-auto">
              <Transcript turns={c.transcript} emptyLabel="Transcript not available for this call." />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Actions Taken" />
            <CardBody className="space-y-2">
              {c.actionsTaken.length === 0 ? (
                <p className="text-[13px] text-ink-500">No actions were taken during this call.</p>
              ) : (
                c.actionsTaken.map((action, i) => (
                  <p key={i} className="flex items-start gap-2 text-[13px] text-ink-700">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success-600" />
                    {action}
                  </p>
                ))
              )}
            </CardBody>
          </Card>

          {c.toolsUsed.length > 0 && (
            <Card>
              <CardHeader title="Tools Used" />
              <CardBody className="space-y-2.5">
                {c.toolsUsed.map((t) => (
                  <ToolExecutionCard key={t.id} execution={t} />
                ))}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Timeline" />
            <CardBody>
              <Timeline entries={timelineEntries} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
