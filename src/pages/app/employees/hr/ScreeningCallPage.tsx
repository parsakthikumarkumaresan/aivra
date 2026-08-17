import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Bot, User, Loader2, PhoneCall, PhoneOff, ListChecks, Target, Wrench, CheckCircle2, Circle, ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useCandidate, useInterview, useRubric } from '@/hooks/useHr'
import { hrService } from '@/services/api'
import { useToast } from '@/hooks/useToast'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDuration } from '@/utils/format'

type CallState = 'idle' | 'preparing' | 'calling' | 'connected' | 'ai_speaking' | 'listening' | 'thinking' | 'ended' | 'failed'

const STATE_LABEL: Record<CallState, string> = {
  idle: 'Ready to call',
  preparing: 'Preparing Call',
  calling: 'Calling…',
  connected: 'Connected',
  ai_speaking: 'AI Speaking',
  listening: 'Listening to candidate',
  thinking: 'Evaluating response',
  ended: 'Call Completed',
  failed: 'Call Failed',
}

export default function ScreeningCallPage() {
  const { candidateId = '' } = useParams()
  const { show } = useToast()
  const isDemo = candidateId === 'cand_demo'

  const candidate = useCandidate(candidateId)
  const interview = useInterview(candidateId)
  const rubric = useRubric(interview.data?.jobId ?? '')

  useSetBreadcrumbs(
    [
      { label: 'AI Employees', href: '/app/employees' },
      { label: 'AI HR Employee', href: '/app/employees/hr' },
      { label: 'Screenings', href: '/app/employees/hr/screenings' },
      { label: isDemo ? 'Preview' : candidate.data?.name ?? '…' },
    ],
    [candidate.data?.name, isDemo],
  )

  const [state, setState] = useState<CallState>('idle')
  const [turnIndex, setTurnIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [completing, setCompleting] = useState(false)
  const timerRef = useRef<number | null>(null)
  const advanceRef = useRef<number | null>(null)

  useEffect(() => {
    if (interview.data?.status === 'failed') setState('failed')
  }, [interview.data?.status])

  // The call was just initiated from the candidate page or the Screenings list —
  // begin placing it automatically instead of requiring a second click.
  useEffect(() => {
    if (interview.data?.status === 'preparing' && state === 'idle') start()
  }, [interview.data?.status])

  useEffect(() => {
    if (!['idle', 'ended', 'failed'].includes(state)) {
      timerRef.current = window.setInterval(() => setElapsed((e) => e + 1), 1000)
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [state])

  useEffect(() => {
    return () => {
      if (advanceRef.current) window.clearTimeout(advanceRef.current)
    }
  }, [])

  function start() {
    setState('preparing')
    advanceRef.current = window.setTimeout(() => {
      setState('calling')
      advanceRef.current = window.setTimeout(() => {
        setState('connected')
        advanceRef.current = window.setTimeout(() => {
          setState('ai_speaking')
          setTurnIndex(1)
          scheduleNext(1)
        }, 700)
      }, 1400)
    }, 800)
  }

  function scheduleNext(nextIndex: number) {
    const transcript = interview.data?.transcript ?? []
    if (nextIndex >= transcript.length) {
      advanceRef.current = window.setTimeout(async () => {
        if (timerRef.current) window.clearInterval(timerRef.current)
        setCompleting(true)
        await hrService.completeScreeningCall(candidateId)
        setCompleting(false)
        setState('ended')
        candidate.refetch()
        interview.refetch()
      }, 1400)
      return
    }
    const nextSpeaker = transcript[nextIndex].speaker
    advanceRef.current = window.setTimeout(
      () => {
        setState(nextSpeaker === 'ai' ? 'thinking' : 'listening')
        advanceRef.current = window.setTimeout(() => {
          setState(nextSpeaker === 'ai' ? 'ai_speaking' : 'listening')
          setTurnIndex(nextIndex + 1)
          scheduleNext(nextIndex + 1)
        }, 900)
      },
      nextSpeaker === 'candidate' ? 2200 : 1600,
    )
  }

  function endCallEarly() {
    if (advanceRef.current) window.clearTimeout(advanceRef.current)
    if (timerRef.current) window.clearInterval(timerRef.current)
    setState('ended')
  }

  async function retry() {
    show({ tone: 'info', title: 'Retrying screening call…' })
    await hrService.startScreeningCall(candidateId)
    await interview.refetch()
    setState('idle')
    setTurnIndex(0)
    setElapsed(0)
  }

  if (interview.loading || !interview.data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const visibleTranscript = interview.data.transcript.slice(0, turnIndex)
  const answeredCount = interview.data.questions.filter((q) => q.answered).length
  const backHref = isDemo ? '/app/employees/hr/configuration/testing' : candidate.data ? `/app/employees/hr/candidates/${candidate.data.id}` : '/app/employees/hr/screenings'

  return (
    <div className="space-y-5">
      <Link to={backHref} className="flex items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" />
        {isDemo ? 'Back to Testing & Preview' : 'Back to candidate'}
      </Link>

      <PageHeader
        title={isDemo ? 'AI Screening Call — Preview' : 'AI Screening Call'}
        description={
          isDemo
            ? 'Sample call for configuration testing — no real candidate is contacted.'
            : candidate.data
              ? `Live AI screening call with ${candidate.data.name}${candidate.data.phone ? ` · ${candidate.data.phone}` : ''}`
              : 'Live AI screening call'
        }
        actions={
          state === 'idle' ? (
            <Button icon={<PhoneCall className="size-4" />} onClick={start}>
              Start Screening Call
            </Button>
          ) : state === 'ended' || state === 'failed' ? (
            <Badge tone={state === 'failed' ? 'danger' : 'neutral'}>{STATE_LABEL[state]}</Badge>
          ) : (
            <Button variant="danger" icon={<PhoneOff className="size-4" />} onClick={endCallEarly}>
              End Call
            </Button>
          )
        }
      />

      {isDemo && (
        <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-[13px] text-brand-800">
          This is a configuration preview. Real candidates are only called after HR approves them for AI screening.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span
                  className={`flex size-2.5 items-center justify-center rounded-full ${
                    state === 'idle' ? 'bg-ink-300' : state === 'ended' ? 'bg-ink-400' : state === 'failed' ? 'bg-danger-500' : 'bg-success-500 animate-pulse'
                  }`}
                />
                <span className="text-[13px] font-medium text-ink-700">{STATE_LABEL[state]}</span>
                {['preparing', 'calling', 'thinking', 'ai_speaking'].includes(state) && <Loader2 className="size-3.5 animate-spin text-brand-500" />}
              </div>
              <span className="font-mono text-[13px] text-ink-500">
                {formatDuration(elapsed)} / {formatDuration(interview.data.durationMinutes * 60)}
              </span>
            </div>
            <CardBody className="max-h-[480px] space-y-4 overflow-y-auto">
              {state === 'failed' ? (
                <EmptyState
                  icon={<AlertTriangle className="size-6" />}
                  title="Call could not connect"
                  description="The AI Voice Employee was unable to reach this candidate after multiple attempts."
                  action={
                    !isDemo ? (
                      <Button icon={<RefreshCw className="size-4" />} onClick={retry}>
                        Retry Call
                      </Button>
                    ) : undefined
                  }
                />
              ) : state === 'idle' ? (
                <p className="py-16 text-center text-[13px] text-ink-400">Press "Start Screening Call" to place the AI screening call.</p>
              ) : ['preparing', 'calling', 'connected'].includes(state) && visibleTranscript.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <PhoneCall className="size-8 animate-pulse text-brand-500" />
                  <p className="mt-3 text-[13px] font-medium text-ink-700">{STATE_LABEL[state]}</p>
                </div>
              ) : (
                <>
                  {visibleTranscript.map((t) => (
                    <div key={t.id} className={`flex items-start gap-2.5 ${t.speaker === 'candidate' ? 'flex-row-reverse' : ''}`}>
                      <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${t.speaker === 'ai' ? 'bg-brand-100 text-brand-600' : 'bg-ink-100 text-ink-600'}`}>
                        {t.speaker === 'ai' ? <Bot className="size-3.5" /> : <User className="size-3.5" />}
                      </span>
                      <span className={`inline-block max-w-[75%] rounded-xl px-3.5 py-2 text-[13px] leading-relaxed ${t.speaker === 'ai' ? 'bg-ink-100 text-ink-800' : 'bg-brand-600 text-white'}`}>
                        {t.text}
                      </span>
                    </div>
                  ))}
                  {(state === 'thinking' || state === 'listening') && visibleTranscript.length > 0 && (
                    <div className="flex items-center gap-1.5 pl-9 text-ink-400">
                      <span className="size-1.5 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.2s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.1s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-ink-300" />
                    </div>
                  )}
                  {completing && (
                    <div className="flex items-center justify-center gap-2 py-4 text-[13px] text-ink-500">
                      <Loader2 className="size-3.5 animate-spin" />
                      Generating screening report…
                    </div>
                  )}
                  {state === 'ended' && !completing && (
                    <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 text-center">
                      <p className="text-[13.5px] font-semibold text-ink-900">Screening call completed</p>
                      <p className="mt-1 text-[13px] text-ink-600">
                        {isDemo
                          ? 'This was a preview — no candidate record was affected.'
                          : 'The transcript and evidence have been saved. This candidate now needs human review.'}
                      </p>
                      {!isDemo && candidate.data && (
                        <Link to={`/app/employees/hr/candidates/${candidate.data.id}`}>
                          <Button size="sm" className="mt-3">View Screening Report</Button>
                        </Link>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Screening Objective" />
            <CardBody className="space-y-2.5">
              <div className="flex items-center gap-2 text-[13px] text-ink-700">
                <Target className="size-3.5 text-brand-600" />
                {interview.data.template}
              </div>
              <p className="text-xs text-ink-500">{interview.data.durationMinutes} min · {interview.data.language}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Question Progress" description={`${answeredCount} of ${interview.data.questions.length} answered`} />
            <CardBody className="space-y-2.5">
              {interview.data.questions.map((q) => (
                <div key={q.id} className="flex items-start gap-2.5">
                  {q.answered ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-600" /> : <Circle className="mt-0.5 size-4 shrink-0 text-ink-300" />}
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{q.category}</p>
                    <p className="text-[13px] text-ink-700">{q.prompt}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Evaluation Criteria" />
            <CardBody className="space-y-2">
              {rubric.loading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                rubric.data?.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-[13px]">
                    <span className="text-ink-700">{c.label}</span>
                    <span className="text-ink-400">{c.weight}%</span>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Tool & Event Status" />
            <CardBody className="space-y-2">
              <ToolStatusRow icon={<ListChecks className="size-3.5" />} label="Rubric loaded" status="Ready" />
              <ToolStatusRow icon={<Wrench className="size-3.5" />} label="Resume parser" status="Ready" />
              <ToolStatusRow icon={<Target className="size-3.5" />} label="Scoring engine" status={state === 'idle' ? 'Idle' : 'Active'} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ToolStatusRow({ icon, label, status }: { icon: React.ReactNode; label: string; status: string }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="flex items-center gap-2 text-ink-700">
        {icon}
        {label}
      </span>
      <Badge tone={status === 'Ready' || status === 'Active' ? 'success' : 'neutral'}>{status}</Badge>
    </div>
  )
}
