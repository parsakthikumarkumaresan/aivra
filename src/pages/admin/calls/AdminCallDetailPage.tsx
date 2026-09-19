import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FileAudio, MessageSquare, Wrench } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { adminCallsService } from '@/services/api'
import { PageHeader, Badge, Card, CardHeader, CardBody, ErrorState, EmptyState } from '@/components/ui'
import type { BadgeTone } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDateTime } from '@/utils/format'

const STATUS_TONE: Record<string, BadgeTone> = {
  in_progress: 'info',
  completed: 'success',
  failed: 'danger',
}

// Call detail (Phase 9) — real transcript, tool usage, and post-call
// analysis, all read directly off Transcript/ToolExecution/CallAnalysis
// rows. Recording is surfaced only as the real recording_available flag
// (no playback URL exists yet, even on the customer-facing call view —
// never fabricated here either).
export default function AdminCallDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const detail = useAsync(() => adminCallsService.get(id!), [id])

  if (detail.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }
  if (detail.error || !detail.data) {
    return <ErrorState title="Call not found" onRetry={detail.refetch} />
  }

  const call = detail.data

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/admin/calls')}
        className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-800"
      >
        <ArrowLeft className="size-3.5" /> Back to Calls
      </button>

      <PageHeader
        title={call.id}
        description={`${call.organizationName} · ${call.agentName} · ${call.callerNumber ?? 'Unknown number'}`}
        actions={
          <Badge tone={STATUS_TONE[call.status] ?? 'neutral'} dot>
            {call.status.replace('_', ' ')}
          </Badge>
        }
      />

      <Card>
        <CardHeader title="Call Metadata" />
        <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Direction" value={call.direction} capitalize />
          <Field label="Duration" value={`${Math.round(call.durationSeconds / 60)} min`} />
          <Field label="Started" value={formatDateTime(call.startedAt)} />
          <Field label="Ended" value={call.endedAt ? formatDateTime(call.endedAt) : 'In progress'} />
          <Field label="Outcome" value={call.outcome ? call.outcome.replace('_', ' ') : 'Unknown'} capitalize />
          <Field label="End Reason" value={call.endReason ?? 'Unknown'} />
          <Field label="Escalated" value={call.escalated ? call.escalationReason ?? 'Yes' : 'No'} />
          <Field
            label="Recording"
            value={
              <span className="flex items-center gap-1.5">
                <FileAudio className="size-3.5" />
                {call.recordingAvailable ? 'Available' : 'Not available'}
              </span>
            }
          />
        </CardBody>
      </Card>

      {call.analysis && (
        <Card>
          <CardHeader
            title="Post-Call Analysis"
            description="Structured, schema-validated analysis — never model-generated free text."
          />
          <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Intent" value={call.analysis.intentDetected ?? '—'} />
            <Field label="Sentiment" value={call.analysis.sentiment ?? '—'} capitalize />
            <Field label="Resolution" value={call.analysis.resolutionStatus ?? '—'} capitalize />
            <Field label="Topics" value={call.analysis.keyTopics.length > 0 ? call.analysis.keyTopics.join(', ') : '—'} />
          </CardBody>
          {call.analysis.summary && (
            <CardBody className="border-t border-ink-100 pt-3">
              <p className="text-[13px] leading-relaxed text-ink-700">{call.analysis.summary}</p>
            </CardBody>
          )}
        </Card>
      )}

      <Card>
        <CardHeader title="Tool Usage" />
        {call.toolsUsed.length === 0 ? (
          <CardBody>
            <EmptyState compact icon={<Wrench className="size-5" />} title="No tools called during this call" />
          </CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {call.toolsUsed.map((tool) => (
              <div key={tool.id} className="flex items-center justify-between px-5 py-3">
                <span className="text-[13px] font-medium text-ink-800">{tool.toolName}</span>
                <div className="flex items-center gap-3 text-xs text-ink-500">
                  <span>{tool.durationMs}ms</span>
                  <Badge tone={tool.status === 'success' ? 'success' : 'danger'}>{tool.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Transcript" />
        {call.transcript.length === 0 ? (
          <CardBody>
            <EmptyState compact icon={<MessageSquare className="size-5" />} title="No transcript available" />
          </CardBody>
        ) : (
          <CardBody className="space-y-3">
            {call.transcript.map((turn) => (
              <div key={turn.id} className="flex gap-3">
                <span className="w-16 shrink-0 text-xs text-ink-400">{turn.timestamp}</span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 capitalize">
                    {turn.speaker}
                  </p>
                  <p className="text-[13px] text-ink-800">{turn.text}</p>
                </div>
              </div>
            ))}
          </CardBody>
        )}
      </Card>
    </div>
  )
}

function Field({ label, value, capitalize }: { label: string; value: React.ReactNode; capitalize?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</p>
      <p className={`mt-1 text-[13px] text-ink-800 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  )
}
