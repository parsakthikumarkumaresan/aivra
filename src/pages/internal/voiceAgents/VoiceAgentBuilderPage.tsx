import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, FlaskConical, History, Mic } from 'lucide-react'
import { useVoiceAgent } from '@/hooks/useVoiceAgentBuilder'
import { voiceAgentBuilderService } from '@/services/api'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { SaveStatus } from '@/components/ui/SaveStatus'
import type { SaveState } from '@/components/ui/SaveStatus'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { BuilderGuidePanel } from '@/components/internal/BuilderGuidePanel'
import { TestAgentDrawer } from '@/components/internal/TestAgentDrawer'
import { ReplayDrawer } from '@/components/internal/ReplayDrawer'
import { BUILDER_SECTIONS, getSectionMeta } from './builderConfig'
import type { SectionId, SectionProps } from './BuilderTypes'
import type { VoiceAgent, VoiceAgentStatus } from '@/types'
import { VOICE_AGENT_STATUS_LABEL } from '@/types'
import { formatDateTime } from '@/utils/format'

const STATUS_TONE: Record<VoiceAgentStatus, BadgeTone> = { draft: 'neutral', testing: 'info', live: 'success', paused: 'warning' }

function lazySection(factory: () => Promise<{ default: React.ComponentType<SectionProps> }>) {
  const Component = lazy(factory)
  return (props: SectionProps) => (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <Component {...props} />
    </Suspense>
  )
}

const SECTION_COMPONENTS: Record<SectionId, ReturnType<typeof lazySection>> = {
  prompt: lazySection(() => import('./sections/PromptSection')),
  flow: lazySection(() => import('./sections/FlowSection')),
  context: lazySection(() => import('./sections/ContextSection')),
  library: lazySection(() => import('./sections/LibrarySection')),
  tools: lazySection(() => import('./sections/ToolsSection')),
  voice: lazySection(() => import('./sections/VoiceSection')),
  transcription: lazySection(() => import('./sections/TranscriptionSection')),
  'call-end': lazySection(() => import('./sections/CallEndSection')),
  'call-transfer': lazySection(() => import('./sections/CallTransferSection')),
  analysis: lazySection(() => import('./sections/AnalysisSection')),
  'call-actions': lazySection(() => import('./sections/CallActionsSection')),
  advanced: lazySection(() => import('./sections/AdvancedSection')),
}

export default function VoiceAgentBuilderPage() {
  const { id = '' } = useParams()
  const agentQuery = useVoiceAgent(id)
  const { show } = useToast()
  const [params, setParams] = useSearchParams()
  const activeSection = (BUILDER_SECTIONS.some((s) => s.id === params.get('section')) ? params.get('section') : 'prompt') as SectionId

  const [draft, setDraft] = useState<VoiceAgent | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [testOpen, setTestOpen] = useState(false)
  const [replayOpen, setReplayOpen] = useState(false)
  const seededFor = useRef<string | null>(null)

  useEffect(() => {
    if (agentQuery.data && seededFor.current !== agentQuery.data.id) {
      seededFor.current = agentQuery.data.id
      setDraft(agentQuery.data)
      setDirty(false)
      setSaveState('idle')
    }
  }, [agentQuery.data])

  const patch = useCallback<SectionProps['patch']>((key, value) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev))
    setDirty(true)
    setSaveState('idle')
  }, [])

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

  if (agentQuery.loading || !draft) {
    return (
      <div className="min-h-screen bg-ink-25 p-6">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="mt-4 h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (agentQuery.error || !agentQuery.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-25 p-6">
        <ErrorState title="Could not load this voice agent" onRetry={agentQuery.refetch} />
      </div>
    )
  }

  const meta = getSectionMeta(activeSection)
  const SectionComponent = SECTION_COMPONENTS[activeSection]

  return (
    <div className="min-h-screen bg-ink-25">
      {/* Builder header */}
      <div className="sticky top-0 z-30 border-b border-ink-200 bg-white">
        <div className="flex flex-wrap items-center gap-4 px-5 py-3">
          <Link to="/internal/voice-agents" className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-800" aria-label="Back to agents">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Mic className="size-4.5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[14.5px] font-semibold text-ink-900">{draft.name}</p>
                <Badge tone={STATUS_TONE[draft.status]} dot>{VOICE_AGENT_STATUS_LABEL[draft.status]}</Badge>
              </div>
              <p className="text-[12px] text-ink-500">
                Voice Agent · {draft.industry} · v{draft.version} · {draft.environment} · Updated {formatDateTime(draft.lastUpdatedAt)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {dirty && saveState !== 'saving' && <span className="hidden text-xs font-medium text-warning-600 sm:inline">Unsaved changes</span>}
            <SaveStatus state={saveState} className="hidden sm:flex" />
            <Button variant="outline" size="sm" icon={<FlaskConical className="size-3.5" />} onClick={() => setTestOpen(true)}>
              Test
            </Button>
            <Button variant="outline" size="sm" icon={<History className="size-3.5" />} onClick={() => setReplayOpen(true)}>
              Replay
            </Button>
            <Button size="sm" onClick={handleSave} loading={saveState === 'saving'} disabled={!dirty}>
              Save
            </Button>
          </div>
        </div>
        <div className="px-5">
          <Tabs
            items={BUILDER_SECTIONS.map((s) => ({ value: s.id, label: s.label }))}
            value={activeSection}
            onChange={setSection}
          />
        </div>
      </div>

      {/* Section content */}
      <div className="mx-auto max-w-[1400px] px-5 py-6">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_280px]">
          <div className="min-w-0">
            <SectionComponent agent={draft} patch={patch} />
          </div>
          <BuilderGuidePanel section={meta} />
        </div>
      </div>

      <TestAgentDrawer open={testOpen} onClose={() => setTestOpen(false)} agent={draft} />
      <ReplayDrawer open={replayOpen} onClose={() => setReplayOpen(false)} agentId={draft.id} />
    </div>
  )
}
