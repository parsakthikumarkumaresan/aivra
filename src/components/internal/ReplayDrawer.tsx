import { useState } from 'react'
import { ArrowLeft, Clock, PhoneCall, Wrench } from 'lucide-react'
import { useReplayConversation, useReplayConversations } from '@/hooks/useVoiceAgentBuilder'
import { Drawer } from '@/components/ui/Drawer'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Transcript } from '@/components/ui/Transcript'
import { Timeline } from '@/components/ui/Timeline'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { formatDateTime, formatDuration } from '@/utils/format'

const OUTCOME_TONE: Record<string, BadgeTone> = { resolved: 'success', booked: 'success', escalated: 'warning', failed: 'danger' }
const OUTCOME_LABEL: Record<string, string> = { resolved: 'Resolved', booked: 'Booked', escalated: 'Escalated', failed: 'Failed' }

interface ReplayDrawerProps {
  open: boolean
  onClose: () => void
  agentId: string
}

export function ReplayDrawer({ open, onClose, agentId }: ReplayDrawerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const list = useReplayConversations(agentId)
  const detail = useReplayConversation(selectedId ?? '')

  function handleClose() {
    setSelectedId(null)
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={selectedId ? `Conversation #${selectedId.replace('replay_', '')}` : 'Replay'}
      description={selectedId ? undefined : 'Historical conversations for this agent'}
      width="600px"
    >
      {!selectedId ? (
        list.loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (list.data ?? []).length === 0 ? (
          <EmptyState compact icon={<PhoneCall className="size-6" />} title="No conversations yet" description="Calls handled by this agent will appear here for replay." />
        ) : (
          <div className="space-y-2.5">
            {list.data?.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-ink-200 p-3.5 text-left hover:border-brand-300 hover:bg-brand-50/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold text-ink-900">{c.customerName}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
                    <Clock className="size-3" />
                    {formatDuration(c.durationSeconds)} · {formatDateTime(c.startedAt)}
                  </p>
                </div>
                <Badge tone={OUTCOME_TONE[c.outcome]}>{OUTCOME_LABEL[c.outcome]}</Badge>
              </button>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-ink-800">
            <ArrowLeft className="size-3.5" />
            Back to conversations
          </button>

          {detail.loading || !detail.data ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-ink-900">{detail.data.customerName}</p>
                  <p className="text-xs text-ink-500">{formatDuration(detail.data.durationSeconds)} · {formatDateTime(detail.data.startedAt)}</p>
                </div>
                <Badge tone={OUTCOME_TONE[detail.data.outcome]} className="ml-auto">{OUTCOME_LABEL[detail.data.outcome]}</Badge>
              </div>

              <Card>
                <CardHeader title="Transcript" />
                <CardBody className="max-h-72 overflow-y-auto">
                  <Transcript turns={detail.data.transcript} />
                </CardBody>
              </Card>

              {detail.data.toolCalls.length > 0 && (
                <Card>
                  <CardHeader title="Tool Calls" />
                  <CardBody className="space-y-2.5">
                    {detail.data.toolCalls.map((t) => (
                      <div key={t.id} className="rounded-lg border border-ink-200 p-3">
                        <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-900"><Wrench className="size-3.5 text-ink-400" />{t.name}</p>
                        <p className="mt-1 font-mono text-[11px] text-ink-500">→ {t.input}</p>
                        <p className="font-mono text-[11px] text-ink-500">← {t.output}</p>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              )}

              {detail.data.knowledgeRetrieved.length > 0 && (
                <Card>
                  <CardHeader title="Knowledge Retrieval" />
                  <CardBody className="flex flex-wrap gap-1.5">
                    {detail.data.knowledgeRetrieved.map((k) => <Badge key={k} tone="brand">{k}</Badge>)}
                  </CardBody>
                </Card>
              )}

              <Card>
                <CardHeader title="Timeline" />
                <CardBody>
                  <Timeline entries={detail.data.timeline.map((t) => ({ id: t.id, title: t.label, timestamp: formatDateTime(t.timestamp) }))} />
                </CardBody>
              </Card>
            </>
          )}
        </div>
      )}
    </Drawer>
  )
}
