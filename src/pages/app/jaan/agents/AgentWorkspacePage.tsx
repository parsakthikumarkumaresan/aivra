import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Bot, History, PhoneOff, Rocket, Send, Sparkles, FlaskConical } from 'lucide-react'
import { useVoiceAgent } from '@/hooks/useVoiceAgentBuilder'
import { useCalls } from '@/hooks/useVoice'
import { voiceAgentBuilderService } from '@/services/api'
import { useToast } from '@/hooks/useToast'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Tabs, PillTabs } from '@/components/ui/Tabs'
import { SaveStatus } from '@/components/ui/SaveStatus'
import type { SaveState } from '@/components/ui/SaveStatus'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Field'
import { Transcript } from '@/components/ui/Transcript'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { ReplayDrawer } from '@/components/internal/ReplayDrawer'
import type { SectionId as InternalSectionId, SectionProps } from '@/pages/internal/voiceAgents/BuilderTypes'
import type { VoiceAgent, VoiceAgentStatus, TranscriptTurn, Call, CallOutcome } from '@/types'
import { VOICE_AGENT_STATUS_LABEL } from '@/types'
import { nextId } from '@/services/mock/utils'
import { formatDateTime, formatDuration } from '@/utils/format'

const STATUS_TONE: Record<VoiceAgentStatus, BadgeTone> = { draft: 'neutral', testing: 'info', live: 'success', paused: 'warning' }
const OUTCOME_TONE: Record<CallOutcome, BadgeTone> = { resolved: 'success', booked: 'success', cancelled: 'neutral', escalated: 'warning', no_action: 'neutral', failed: 'danger' }

type JaanSectionId = InternalSectionId | 'jaan-advanced' | 'jaan-events'

function lazySection(factory: () => Promise<{ default: React.ComponentType<SectionProps> }>) {
  const Component = lazy(factory)
  return (props: SectionProps) => (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <Component {...props} />
    </Suspense>
  )
}

// Lazy-loaded — pulls in the livekit-client browser SDK (~145kB gzipped),
// which should only ever be fetched once someone actually opens the Test
// modal, not on every agent workspace page load.
const TestCallModal = lazy(() =>
  import('@/components/internal/TestCallModal').then((m) => ({ default: m.TestCallModal })),
)

const AGENT_SECTIONS: { id: JaanSectionId; label: string }[] = [
  { id: 'prompt', label: 'Behavior' },
  { id: 'transcription', label: 'Language & Turn' },
  { id: 'voice', label: 'Speech' },
  { id: 'context', label: 'Context' },
  { id: 'tools', label: 'Tools' },
  { id: 'library', label: 'Library' },
  { id: 'call-end', label: 'Call End' },
  { id: 'call-transfer', label: 'Call Transfer' },
  { id: 'analysis', label: 'Post-Call Analysis' },
  { id: 'jaan-events', label: 'Events & Webhook' },
  { id: 'jaan-advanced', label: 'Advanced' },
]

const SECTION_COMPONENTS: Record<JaanSectionId, ReturnType<typeof lazySection>> = {
  prompt: lazySection(() => import('@/pages/internal/voiceAgents/sections/PromptSection')),
  flow: lazySection(() => import('@/pages/internal/voiceAgents/sections/FlowSection')),
  context: lazySection(() => import('@/pages/internal/voiceAgents/sections/ContextSection')),
  library: lazySection(() => import('@/pages/internal/voiceAgents/sections/LibrarySection')),
  tools: lazySection(() => import('@/pages/internal/voiceAgents/sections/ToolsSection')),
  voice: lazySection(() => import('@/pages/internal/voiceAgents/sections/VoiceSection')),
  transcription: lazySection(() => import('@/pages/internal/voiceAgents/sections/TranscriptionSection')),
  'call-end': lazySection(() => import('@/pages/internal/voiceAgents/sections/CallEndSection')),
  'call-transfer': lazySection(() => import('@/pages/internal/voiceAgents/sections/CallTransferSection')),
  analysis: lazySection(() => import('@/pages/internal/voiceAgents/sections/AnalysisSection')),
  'call-actions': lazySection(() => import('@/pages/internal/voiceAgents/sections/CallActionsSection')),
  advanced: lazySection(() => import('@/pages/internal/voiceAgents/sections/AdvancedSection')),
  'jaan-advanced': lazySection(() => import('./sections/JaanAdvancedSection')),
  'jaan-events': lazySection(() => import('./sections/JaanEventsSection')),
}

const SAMPLE_CONTEXT: Record<string, string> = { customer_name: 'Priya', customer_id: 'CUST-88213', customer_type: 'premium' }
function renderTemplate(text: string) {
  return text.replace(/\$\{(\w+)\}/g, (_, key) => SAMPLE_CONTEXT[key] ?? key)
}

function SimulatePanel({ agent }: { agent: VoiceAgent }) {
  const [turns, setTurns] = useState<TranscriptTurn[]>([{ id: nextId('sim'), speaker: 'ai', text: renderTemplate(agent.promptConfig.introMessage), timestamp: new Date().toISOString() }])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  async function send() {
    if (!input.trim() || sending) return
    setSending(true)
    const text = input
    setInput('')
    const result = await voiceAgentBuilderService.sendTestMessage(agent.id, text)
    setTurns((prev) => [...prev, result.userTurn, result.agentTurn])
    setSending(false)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="min-h-[420px]">
        <CardHeader title="Simulate a call" description="Type what a caller would say — Jaan responds using this agent's live configuration." />
        <CardBody>
          <div className="min-h-[300px] rounded-xl border border-ink-200 bg-ink-25 p-4">
            <Transcript turns={turns} />
            {sending && (
              <div className="mt-3 flex items-center gap-2 text-xs text-ink-400">
                <Bot className="size-3.5 animate-pulse" /> Jaan is thinking…
              </div>
            )}
          </div>
        </CardBody>
      </Card>
      <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); send() }}>
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type what the caller would say…" icon={<Sparkles className="size-4" />} />
        <Button type="submit" size="icon" icon={<Send className="size-4" />} disabled={!input.trim()} loading={sending} aria-label="Send" />
        <Button type="button" variant="outline" size="icon" icon={<PhoneOff className="size-4" />} aria-label="End call" />
      </form>
    </div>
  )
}

function AgentLogsPanel({ agentName }: { agentName: string }) {
  const calls = useCalls({})
  const columns: DataTableColumn<Call>[] = [
    { key: 'caller', header: 'Caller', render: (c) => <span className="font-medium text-ink-900">{c.callerName}</span> },
    { key: 'time', header: 'Time', render: (c) => <span className="text-[13px] text-ink-500">{formatDateTime(c.startedAt)}</span> },
    { key: 'duration', header: 'Duration', render: (c) => <span className="text-[13px] text-ink-600">{formatDuration(c.durationSeconds)}</span> },
    { key: 'outcome', header: 'Outcome', render: (c) => <Badge tone={OUTCOME_TONE[c.outcome]} dot>{c.outcome.replace('_', ' ')}</Badge> },
  ]
  return (
    <div>
      <p className="mb-3 text-[12.5px] text-ink-500">Conversations handled by {agentName}.</p>
      <DataTable columns={columns} data={calls.data ?? []} keyExtractor={(c) => c.id} loading={calls.loading} />
    </div>
  )
}

export default function AgentWorkspacePage() {
  const { id = '' } = useParams()
  const agentQuery = useVoiceAgent(id)
  const { show } = useToast()
  const [params, setParams] = useSearchParams()
  const mode = (['agent', 'flow', 'simulate', 'logs'].includes(params.get('tab') ?? '') ? params.get('tab') : 'agent') as 'agent' | 'flow' | 'simulate' | 'logs'
  const activeSection = (AGENT_SECTIONS.some((s) => s.id === params.get('section')) ? params.get('section') : 'prompt') as JaanSectionId

  const [draft, setDraft] = useState<VoiceAgent | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [replayOpen, setReplayOpen] = useState(false)
  const [testCallOpen, setTestCallOpen] = useState(false)
  const seededFor = useRef<string | null>(null)

  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Agents', href: '/app/jaan/agents' }, { label: draft?.name ?? '…' }])

  useEffect(() => {
    if (agentQuery.data && seededFor.current !== agentQuery.data.id) {
      seededFor.current = agentQuery.data.id
      setDraft(agentQuery.data)
      setDirty(false)
      setSaveState('idle')
    }
  }, [agentQuery.data])

  useEffect(() => {
    if (params.get('test') === '1') {
      setTestCallOpen(true)
      const p = new URLSearchParams(params)
      p.delete('test')
      setParams(p, { replace: true })
    }
  }, [params, setParams])

  const patch = useCallback<SectionProps['patch']>((key, value) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev))
    setDirty(true)
    setSaveState('idle')
  }, [])

  function setMode(next: string) {
    const p = new URLSearchParams(params)
    p.set('tab', next)
    setParams(p, { replace: true })
  }
  function setSection(next: string) {
    const p = new URLSearchParams(params)
    p.set('section', next)
    setParams(p, { replace: true })
  }

  async function handleSave() {
    if (!draft) return
    setSaveState('saving')
    const saved = await voiceAgentBuilderService.updateVoiceAgent(draft.id, draft)
    setDraft(saved)
    setDirty(false)
    setSaveState('saved')
    show({ tone: 'success', title: 'Agent saved', description: `Version ${saved.version} — ${draft.name}` })
  }

  async function handlePublish() {
    if (!draft) return
    const saved = await voiceAgentBuilderService.updateVoiceAgent(draft.id, { ...draft, status: 'live' })
    setDraft(saved)
    setDirty(false)
    setSaveState('saved')
    show({ tone: 'success', title: 'Agent published', description: `${saved.name} is now live and taking calls.` })
  }

  if (agentQuery.loading || !draft) {
    return (
      <div className="p-6">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="mt-4 h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (agentQuery.error || !agentQuery.data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <ErrorState title="Could not load this agent" onRetry={agentQuery.refetch} />
      </div>
    )
  }

  const SectionComponent = SECTION_COMPONENTS[activeSection]

  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-30 border-b border-ink-200 bg-surface-elevated">
        <div className="flex flex-wrap items-center gap-4 px-5 py-3">
          <Link to="/app/jaan/agents" className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-800" aria-label="Back to agents">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Bot className="size-4.5" /></span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[14.5px] font-semibold text-ink-900">{draft.name}</p>
                <Badge tone={STATUS_TONE[draft.status]} dot>{VOICE_AGENT_STATUS_LABEL[draft.status]}</Badge>
              </div>
              <p className="text-[12px] text-ink-500">
                v{draft.version} · {draft.environment} · Updated {formatDateTime(draft.lastUpdatedAt)} · <span className="font-mono">{draft.id}</span>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {dirty && saveState !== 'saving' && <span className="hidden text-xs font-medium text-warning-600 sm:inline">Unsaved changes</span>}
            <SaveStatus state={saveState} className="hidden sm:flex" />
            <Button variant="outline" size="sm" icon={<History className="size-3.5" />} onClick={() => setReplayOpen(true)}>Replay</Button>
            <Button variant="outline" size="sm" icon={<FlaskConical className="size-3.5" />} onClick={() => setTestCallOpen(true)}>Test</Button>
            <Button size="sm" onClick={handleSave} loading={saveState === 'saving'} disabled={!dirty}>Save</Button>
            <Button size="sm" variant="danger" icon={<Rocket className="size-3.5" />} onClick={handlePublish}>Publish</Button>
          </div>
        </div>
        <div className="px-5 pb-3">
          <PillTabs
            items={[
              { value: 'agent', label: 'Agent' },
              { value: 'flow', label: 'Flow' },
              { value: 'simulate', label: 'Simulate' },
              { value: 'logs', label: 'Logs' },
            ]}
            value={mode}
            onChange={setMode}
          />
        </div>
        {mode === 'agent' && (
          <div className="px-5">
            <Tabs items={AGENT_SECTIONS.map((s) => ({ value: s.id, label: s.label }))} value={activeSection} onChange={setSection} />
          </div>
        )}
      </div>

      <div className="mx-auto max-w-[1200px] px-5 py-6">
        {mode === 'agent' && <SectionComponent agent={draft} patch={patch} />}
        {mode === 'flow' && <SECTION_COMPONENTS.flow agent={draft} patch={patch} />}
        {mode === 'simulate' && <SimulatePanel agent={draft} />}
        {mode === 'logs' && <AgentLogsPanel agentName={draft.name} />}
      </div>

      <ReplayDrawer open={replayOpen} onClose={() => setReplayOpen(false)} agentId={draft.id} />
      {testCallOpen && (
        <Suspense fallback={null}>
          <TestCallModal open={testCallOpen} onClose={() => setTestCallOpen(false)} agent={draft} />
        </Suspense>
      )}
    </div>
  )
}
