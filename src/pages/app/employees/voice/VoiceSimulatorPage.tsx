import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Play,
  Square,
  RotateCcw,
  Mic,
  MicOff,
  Bot,
  User,
  Loader2,
  Wrench,
  UserCheck,
  Target,
  BookOpen,
  Gauge,
  Timer,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { voiceService } from '@/services/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PillTabs } from '@/components/ui/Tabs'
import type { SimulatorResult, SimulatorScenario, VoiceState } from '@/types'
import { SIMULATOR_SCENARIO_LABEL } from '@/types'
import { cn } from '@/utils/cn'
import { formatDuration } from '@/utils/format'

const SCENARIOS = Object.keys(SIMULATOR_SCENARIO_LABEL) as SimulatorScenario[]

const STATE_CONFIG: Record<VoiceState, { label: string; color: string }> = {
  idle: { label: 'Ready to start', color: 'bg-ink-300' },
  listening: { label: 'Listening', color: 'bg-success-500 animate-pulse' },
  thinking: { label: 'Thinking', color: 'bg-brand-500 animate-pulse' },
  speaking: { label: 'AI Speaking', color: 'bg-brand-500 animate-pulse' },
  tool_call: { label: 'Calling Tool', color: 'bg-info-500 animate-pulse' },
  human_handoff: { label: 'Human Handoff', color: 'bg-warning-500' },
}

const INTENT_LABEL: Record<SimulatorScenario, string> = {
  faq: 'Knowledge Q&A',
  booking: 'Appointment Booking',
  cancellation: 'Order Cancellation',
  unknown_question: 'Unrecognized Intent',
  api_failure: 'Order Status Lookup',
  human_escalation: 'Explicit Human Request',
}

const TOOL_STEP_CONFIG: Partial<Record<SimulatorScenario, { index: number; tool: string; success: boolean }>> = {
  booking: { index: 3, tool: 'Book Store Appointment', success: true },
  cancellation: { index: 1, tool: 'Cancel Order', success: true },
  api_failure: { index: 1, tool: 'Check Order Status', success: false },
}

export default function VoiceSimulatorPage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'AI Voice Employee', href: '/app/employees/voice' }, { label: 'Simulator' }])
  const [scenario, setScenario] = useState<SimulatorScenario>('faq')
  const [scenarioData, setScenarioData] = useState<SimulatorResult | null>(null)
  const [loadingScenario, setLoadingScenario] = useState(false)

  const [state, setState] = useState<VoiceState>('idle')
  const [turnIndex, setTurnIndex] = useState(0)
  const [muted, setMuted] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [ended, setEnded] = useState(false)
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [toolOutcome, setToolOutcome] = useState<'success' | 'failed' | null>(null)
  const [mobileView, setMobileView] = useState<'conversation' | 'debug'>('conversation')
  const timerRef = useRef<number | null>(null)
  const advanceRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      if (advanceRef.current) window.clearTimeout(advanceRef.current)
    }
  }, [])

  function reset() {
    if (timerRef.current) window.clearInterval(timerRef.current)
    if (advanceRef.current) window.clearTimeout(advanceRef.current)
    setState('idle')
    setTurnIndex(0)
    setElapsed(0)
    setEnded(false)
    setSelectedTool(null)
    setToolOutcome(null)
    setScenarioData(null)
  }

  function changeScenario(next: SimulatorScenario) {
    setScenario(next)
    reset()
  }

  async function start() {
    reset()
    setLoadingScenario(true)
    const data = await voiceService.runScenario(scenario)
    setLoadingScenario(false)
    setScenarioData(data)
    setState('listening')
    timerRef.current = window.setInterval(() => setElapsed((e) => e + 1), 1000)
    playTurns(data.transcript, 0)
  }

  function playTurns(transcript: SimulatorResult['transcript'], index: number) {
    if (index >= transcript.length) {
      const isFailure = scenario === 'api_failure'
      const isEscalation = scenario === 'human_escalation' || scenario === 'unknown_question' || isFailure
      advanceRef.current = window.setTimeout(
        () => {
          if (isEscalation) setState('human_handoff')
          if (timerRef.current) window.clearInterval(timerRef.current)
          setEnded(true)
        },
        800,
      )
      return
    }
    const turn = transcript[index]
    const toolStep = TOOL_STEP_CONFIG[scenario]
    const isToolStep = toolStep?.index === index
    advanceRef.current = window.setTimeout(
      () => {
        if (isToolStep && toolStep) {
          setState('tool_call')
          setSelectedTool(toolStep.tool)
          setToolOutcome(toolStep.success ? 'success' : 'failed')
          advanceRef.current = window.setTimeout(() => {
            setTurnIndex(index + 1)
            setState(turn.speaker === 'ai' ? 'speaking' : 'listening')
            playTurns(transcript, index + 1)
          }, 1400)
          return
        }
        setState(turn.speaker === 'ai' ? 'thinking' : 'listening')
        advanceRef.current = window.setTimeout(() => {
          setTurnIndex(index + 1)
          setState(turn.speaker === 'ai' ? 'speaking' : 'listening')
          playTurns(transcript, index + 1)
        }, turn.speaker === 'ai' ? 900 : 1600)
      },
      index === 0 ? 400 : 200,
    )
  }

  function stop() {
    reset()
  }

  const visibleTranscript = (scenarioData?.transcript ?? []).slice(0, turnIndex + (state === 'idle' ? 0 : 1))
  const stateInfo = STATE_CONFIG[state]

  return (
    <div className="space-y-5">
      <Link to="/app/employees/voice" className="flex items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" />
        Back to AI Voice Employee
      </Link>

      <PageHeader
        title="Voice Simulator"
        description="Test the AI Voice Employee in your browser before it ever takes a real call."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={scenario}
              onChange={(e) => changeScenario(e.target.value as SimulatorScenario)}
              disabled={state !== 'idle' && !ended}
              className="h-9 rounded-lg border border-ink-200 bg-white px-3 text-[13px] font-medium text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              {SCENARIOS.map((s) => (
                <option key={s} value={s}>
                  Scenario: {SIMULATOR_SCENARIO_LABEL[s]}
                </option>
              ))}
            </select>
            {state === 'idle' && !ended ? (
              <Button icon={<Play className="size-4" />} onClick={start} loading={loadingScenario}>
                Start
              </Button>
            ) : (
              <>
                <Button variant="outline" icon={muted ? <MicOff className="size-4" /> : <Mic className="size-4" />} onClick={() => setMuted((m) => !m)}>
                  {muted ? 'Unmute' : 'Mute'}
                </Button>
                <Button variant="outline" icon={<RotateCcw className="size-4" />} onClick={reset}>
                  Restart
                </Button>
                {!ended && (
                  <Button variant="danger" icon={<Square className="size-4" />} onClick={stop}>
                    Stop
                  </Button>
                )}
              </>
            )}
          </div>
        }
      />

      <PillTabs
        items={[
          { value: 'conversation', label: 'Conversation' },
          { value: 'debug', label: 'Debug Panel' },
        ]}
        value={mobileView}
        onChange={(v) => setMobileView(v as 'conversation' | 'debug')}
        className="md:hidden"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className={cn('lg:col-span-2', mobileView !== 'conversation' && 'hidden md:block')}>
          <Card>
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className={cn('size-2.5 rounded-full', stateInfo.color)} />
                <span className="text-[13px] font-medium text-ink-700">{stateInfo.label}</span>
                {(state === 'thinking' || state === 'tool_call') && <Loader2 className="size-3.5 animate-spin text-brand-500" />}
                {muted && <Badge tone="danger">Muted</Badge>}
              </div>
              <span className="font-mono text-[13px] text-ink-500">{formatDuration(elapsed)}</span>
            </div>
            <CardBody className="max-h-[480px] space-y-4 overflow-y-auto">
              {visibleTranscript.length === 0 ? (
                <p className="py-16 text-center text-[13px] text-ink-400">Choose a scenario and press "Start" to simulate an incoming call.</p>
              ) : (
                visibleTranscript.map((t) => (
                  <div key={t.id} className={cn('flex items-start gap-2.5', t.speaker === 'customer' && 'flex-row-reverse')}>
                    <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full', t.speaker === 'ai' ? 'bg-brand-100 text-brand-600' : 'bg-ink-100 text-ink-600')}>
                      {t.speaker === 'ai' ? <Bot className="size-3.5" /> : <User className="size-3.5" />}
                    </span>
                    <span className={cn('inline-block max-w-[75%] rounded-xl px-3.5 py-2 text-[13px] leading-relaxed', t.speaker === 'ai' ? 'bg-ink-100 text-ink-800' : 'bg-brand-600 text-white')}>
                      {t.text}
                    </span>
                  </div>
                ))
              )}
              {state === 'tool_call' && (
                <div className="ml-9 flex items-center gap-2 rounded-lg border border-info-100 bg-info-50 px-3 py-2 text-xs text-info-700">
                  <Wrench className="size-3.5" />
                  Calling "{selectedTool}"…
                </div>
              )}
              {state === 'human_handoff' && (
                <div className="flex items-center gap-2 rounded-lg border border-warning-100 bg-warning-50 px-3 py-2.5 text-[13px] text-warning-700">
                  <UserCheck className="size-4" />
                  Call handed off to a human agent.
                </div>
              )}
              {ended && scenarioData && (
                <div className={cn('rounded-xl border p-4 text-center', scenarioData.outcome === 'pass' ? 'border-success-100 bg-success-50' : 'border-warning-100 bg-warning-50')}>
                  <p className={cn('flex items-center justify-center gap-2 text-[13.5px] font-semibold', scenarioData.outcome === 'pass' ? 'text-success-700' : 'text-warning-700')}>
                    {scenarioData.outcome === 'pass' ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
                    {scenarioData.outcome === 'pass' ? 'Scenario Passed' : 'Needs Review'}
                  </p>
                  {scenarioData.failedStep && <p className="mt-1.5 text-[13px] text-ink-700">{scenarioData.failedStep}</p>}
                  {scenarioData.configurationSuggestion && (
                    <p className="mt-2 rounded-lg bg-white/60 px-3 py-2 text-[12.5px] text-ink-600">Suggestion: {scenarioData.configurationSuggestion}</p>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className={cn('space-y-4', mobileView !== 'debug' && 'hidden md:block')}>
          <Card>
            <CardHeader title="Debug & Evidence" />
            <CardBody className="space-y-3">
              <DebugRow icon={<Target className="size-3.5" />} label="Intent" value={ended || state !== 'idle' ? INTENT_LABEL[scenario] : '—'} />
              <DebugRow icon={<BookOpen className="size-3.5" />} label="Retrieved Knowledge" value={ended || state !== 'idle' ? 'Product Catalog 2026, Store Hours' : '—'} />
              <DebugRow icon={<Wrench className="size-3.5" />} label="Selected Tool" value={selectedTool ?? 'None'} />
              <DebugRow
                icon={<Gauge className="size-3.5" />}
                label="Tool Result"
                value={
                  state === 'tool_call'
                    ? 'Pending…'
                    : toolOutcome === 'failed'
                      ? (scenarioData?.toolResult ?? 'Failed')
                      : toolOutcome === 'success'
                        ? 'Success'
                        : '—'
                }
                tone={toolOutcome === 'failed' ? 'danger' : toolOutcome === 'success' ? 'success' : undefined}
              />
              <DebugRow icon={<Timer className="size-3.5" />} label="Latency" value={ended ? '640ms avg' : '—'} />
              <DebugRow icon={<Timer className="size-3.5" />} label="Session Duration" value={formatDuration(elapsed)} />
              <DebugRow
                icon={<ShieldAlert className="size-3.5" />}
                label="Guardrail State"
                value={state === 'human_handoff' ? 'Escalation Triggered' : 'Normal'}
                tone={state === 'human_handoff' ? 'danger' : 'success'}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Scenario Library" />
            <CardBody className="space-y-1.5">
              {SCENARIOS.map((s) => (
                <button
                  key={s}
                  onClick={() => changeScenario(s)}
                  disabled={state !== 'idle' && !ended}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors duration-150',
                    scenario === s ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50',
                  )}
                >
                  {SIMULATOR_SCENARIO_LABEL[s]}
                </button>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DebugRow({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone?: 'success' | 'danger' }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-[13px] text-ink-500">
        {icon}
        {label}
      </span>
      <span className={cn('text-right text-[13px] font-medium', tone === 'danger' ? 'text-danger-600' : tone === 'success' ? 'text-success-600' : 'text-ink-800')}>{value}</span>
    </div>
  )
}
