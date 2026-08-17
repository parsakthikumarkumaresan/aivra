import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PhoneCall, Users, Inbox as InboxIcon, ArrowLeft, ExternalLink, MessageSquareText, CheckCircle2, UserCog, FlagTriangleRight } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useConversations } from '@/hooks/useInbox'
import { useCalls } from '@/hooks/useVoice'
import { PageHeader } from '@/components/ui/PageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Transcript } from '@/components/ui/Transcript'
import { Textarea } from '@/components/ui/Field'
import { cn } from '@/utils/cn'
import { formatRelativeTime } from '@/utils/format'

type InboxTabValue = 'all' | 'needs_attention' | 'voice' | 'hr' | 'escalations'

interface InboxRow {
  id: string
  kind: 'call' | 'conversation'
  employeeType: 'voice' | 'hr'
  title: string
  subtitle: string
  timestamp: string
  tone: BadgeTone
  statusLabel: string
  needsAttention: boolean
  escalated: boolean
  href?: string
}

export default function InboxPage() {
  useSetBreadcrumbs([{ label: 'Inbox' }])
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as InboxTabValue) ?? 'all'
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const conversations = useConversations()
  const calls = useCalls({})

  const rows: InboxRow[] = useMemo(() => {
    const callRows: InboxRow[] = (calls.data ?? []).map((c) => ({
      id: c.id,
      kind: 'call',
      employeeType: 'voice',
      title: c.callerName,
      subtitle: c.summary,
      timestamp: c.startedAt,
      tone: c.escalated ? 'danger' : 'neutral',
      statusLabel: c.escalated ? 'Escalated' : 'Handled',
      needsAttention: c.escalated,
      escalated: c.escalated,
      href: `/app/inbox/calls/${c.id}`,
    }))
    const conversationRows: InboxRow[] = (conversations.data ?? []).map((c) => ({
      id: c.id,
      kind: 'conversation',
      employeeType: 'hr',
      title: c.participantName,
      subtitle: c.subject,
      timestamp: c.updatedAt,
      tone: c.status === 'waiting' ? 'warning' : c.status === 'escalated' ? 'danger' : c.status === 'resolved' ? 'success' : 'neutral',
      statusLabel: c.status === 'waiting' ? 'Waiting' : c.status === 'escalated' ? 'Escalated' : c.status === 'resolved' ? 'Resolved' : 'Open',
      needsAttention: c.status === 'waiting' || c.status === 'escalated' || Boolean(c.escalationReason),
      escalated: Boolean(c.escalationReason),
    }))
    return [...callRows, ...conversationRows].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
  }, [calls.data, conversations.data])

  const filtered = rows.filter((r) => {
    if (tab === 'needs_attention') return r.needsAttention
    if (tab === 'voice') return r.employeeType === 'voice'
    if (tab === 'hr') return r.employeeType === 'hr'
    if (tab === 'escalations') return r.escalated
    return true
  })

  const loading = calls.loading || conversations.loading
  const selectedConversation = conversations.data?.find((c) => c.id === selectedId)
  const selectedRow = rows.find((r) => r.id === selectedId)

  function selectRow(row: InboxRow) {
    if (row.kind === 'call') {
      navigate(row.href!)
    } else {
      setSelectedId(row.id)
    }
  }

  function setTab(next: string) {
    const p = new URLSearchParams(params)
    if (next === 'all') p.delete('tab')
    else p.set('tab', next)
    setParams(p, { replace: true })
    setSelectedId(null)
  }

  return (
    <div className="space-y-5">
      <PageHeader icon={<InboxIcon className="size-5" />} title="Inbox" description="Everything that needs a human look — candidates, calls and system events." />

      <Tabs
        items={[
          { value: 'all', label: 'All', count: rows.length },
          { value: 'needs_attention', label: 'Needs Attention', count: rows.filter((r) => r.needsAttention).length },
          { value: 'voice', label: 'Voice', count: rows.filter((r) => r.employeeType === 'voice').length },
          { value: 'hr', label: 'HR', count: rows.filter((r) => r.employeeType === 'hr').length },
          { value: 'escalations', label: 'Escalations', count: rows.filter((r) => r.escalated).length },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className={cn('rounded-xl border border-ink-200 bg-white lg:col-span-2', selectedId && 'hidden lg:block')}>
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<InboxIcon className="size-6" />} title="Nothing here" description="No items match this filter right now." />
          ) : (
            <div className="max-h-[70vh] divide-y divide-ink-100 overflow-y-auto">
              {filtered.map((row) => (
                <button
                  key={row.id}
                  onClick={() => selectRow(row)}
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-ink-25',
                    selectedId === row.id && 'bg-brand-50/60',
                  )}
                >
                  <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', row.employeeType === 'voice' ? 'bg-info-100 text-info-600' : 'bg-brand-100 text-brand-600')}>
                    {row.employeeType === 'voice' ? <PhoneCall className="size-3.5" /> : <Users className="size-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13.5px] font-semibold text-ink-900">{row.title}</p>
                      <span className="shrink-0 text-xs text-ink-400">{formatRelativeTime(row.timestamp)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-500">{row.subtitle}</p>
                    <Badge tone={row.tone} className="mt-1.5" dot>
                      {row.statusLabel}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={cn('lg:col-span-3', !selectedId && 'hidden lg:flex')}>
          {!selectedId || !selectedConversation ? (
            <div className="hidden h-full min-h-[300px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-25 text-center lg:flex">
              <MessageSquareText className="size-6 text-ink-300" />
              <p className="mt-3 text-[13px] text-ink-500">Select a conversation to view details</p>
            </div>
          ) : (
            <div className="rounded-xl border border-ink-200 bg-white">
              <div className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedId(null)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 lg:hidden">
                    <ArrowLeft className="size-4" />
                  </button>
                  <Avatar name={selectedConversation.participantName} size="sm" />
                  <div>
                    <p className="text-[13.5px] font-semibold text-ink-900">{selectedConversation.participantName}</p>
                    <p className="text-xs text-ink-500">{selectedConversation.subject}</p>
                  </div>
                </div>
                {selectedRow && (
                  <Badge tone={selectedRow.tone} dot>
                    {selectedRow.statusLabel}
                  </Badge>
                )}
              </div>

              <div className="space-y-4 p-5">
                {selectedConversation.escalationReason && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-warning-100 bg-warning-50 px-3.5 py-3 text-[13px] text-warning-700">
                    <FlagTriangleRight className="mt-0.5 size-4 shrink-0" />
                    <div>
                      <p className="font-semibold">Why this needs a human</p>
                      <p className="mt-0.5">{selectedConversation.escalationReason}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-1.5 text-[13px] font-semibold text-ink-800">AI Summary</p>
                  <p className="text-[13px] leading-relaxed text-ink-600">{selectedConversation.aiSummary}</p>
                </div>

                {selectedConversation.context.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedConversation.context.map((c) => (
                      <span key={c.label} className="rounded-full bg-ink-100 px-2.5 py-1 text-xs text-ink-600">
                        <span className="font-medium text-ink-500">{c.label}:</span> {c.value}
                      </span>
                    ))}
                  </div>
                )}

                {selectedConversation.transcript.length > 0 && (
                  <div>
                    <p className="mb-2 text-[13px] font-semibold text-ink-800">Transcript</p>
                    <div className="max-h-64 overflow-y-auto rounded-lg bg-ink-25 p-3.5">
                      <Transcript turns={selectedConversation.transcript} />
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-1.5 text-[13px] font-semibold text-ink-800">Add a note</p>
                  <Textarea placeholder="Leave a note for the team…" className="min-h-20" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-ink-100 px-5 py-4">
                <Button size="sm" icon={<UserCog className="size-3.5" />}>
                  Take Over
                </Button>
                <Button size="sm" variant="outline" icon={<CheckCircle2 className="size-3.5" />}>
                  Resolve
                </Button>
                <Button size="sm" variant="outline" icon={<FlagTriangleRight className="size-3.5" />}>
                  Escalate
                </Button>
                <Link to={selectedConversation.sourceRecordHref} className="ml-auto">
                  <Button size="sm" variant="ghost" iconRight={<ExternalLink className="size-3.5" />}>
                    {selectedConversation.sourceRecordLabel}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
