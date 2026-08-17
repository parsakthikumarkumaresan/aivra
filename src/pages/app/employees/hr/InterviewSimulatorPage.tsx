import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Bot, User, Loader2, CircleDot, Square, ListChecks, Target, Wrench, CheckCircle2, Circle, ArrowLeft } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useAsync } from '@/hooks/useAsync'
import { hrService } from '@/services/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDuration } from '@/utils/format'
import { useCandidate, useRubric } from '@/hooks/useHr'

type VoiceState = 'idle' | 'ai_speaking' | 'listening' | 'thinking' | 'ended'

const STATE_LABEL: Record<VoiceState, string> = {
  idle: 'Ready to start',
  ai_speaking: 'AI Interviewer speaking',
  listening: 'Listening to candidate',
  thinking: 'Evaluating response',
  ended: 'Interview ended',
}

export default function InterviewSimulatorPage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'AI HR Employee', href: '/app/employees/hr' }, { label: 'AI Interview' }])
  const [params] = useSearchParams()
  const interviewId = params.get('interview') ?? 'int_1'
  const interview = useAsync(() => hrService.getInterviewById(interviewId), [interviewId])
  const candidate = useCandidate(interview.data?.candidateId ?? '')
  const rubric = useRubric(interview.data?.jobId ?? '')

  const [state, setState] = useState<VoiceState>('idle')
  const [turnIndex, setTurnIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<number | null>(null)
  const advanceRef = useRef<number | null>(null)

  useEffect(() => {
    if (state === 'idle' || state === 'ended') return
    timerRef.current = window.setInterval(() => setElapsed((e) => e + 1), 1000)
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
    setState('ai_speaking')
    setTurnIndex(1)
    scheduleNext(1)
  }

  function scheduleNext(nextIndex: number) {
    const transcript = interview.data?.transcript ?? []
    if (nextIndex >= transcript.length) {
      advanceRef.current = window.setTimeout(() => setState('listening'), 1400)
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

  function endInterview() {
    if (advanceRef.current) window.clearTimeout(advanceRef.current)
    if (timerRef.current) window.clearInterval(timerRef.current)
    setState('ended')
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

  return (
    <div className="space-y-5">
      <Link to={candidate.data ? `/app/employees/hr/candidates/${candidate.data.id}` : '/app/employees/hr/candidates'} className="flex items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" />
        Back to candidate
      </Link>

      <PageHeader
        title="AI Interview Simulator"
        description={candidate.data ? `Live structured interview with ${candidate.data.name}` : 'Live structured interview'}
        actions={
          state === 'idle' ? (
            <Button icon={<CircleDot className="size-4" />} onClick={start}>
              Start Interview
            </Button>
          ) : state === 'ended' ? (
            <Badge tone="neutral">Ended</Badge>
          ) : (
            <Button variant="danger" icon={<Square className="size-4" />} onClick={endInterview}>
              End Interview
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className={`flex size-2.5 items-center justify-center rounded-full ${state === 'idle' ? 'bg-ink-300' : state === 'ended' ? 'bg-ink-400' : 'bg-success-500 animate-pulse'}`} />
                <span className="text-[13px] font-medium text-ink-700">{STATE_LABEL[state]}</span>
                {(state === 'thinking' || state === 'ai_speaking') && <Loader2 className="size-3.5 animate-spin text-brand-500" />}
              </div>
              <span className="font-mono text-[13px] text-ink-500">{formatDuration(elapsed)} / {formatDuration(interview.data.durationMinutes * 60)}</span>
            </div>
            <CardBody className="max-h-[480px] space-y-4 overflow-y-auto">
              {visibleTranscript.length === 0 ? (
                <p className="py-16 text-center text-[13px] text-ink-400">Press "Start Interview" to begin the structured AI interview.</p>
              ) : (
                visibleTranscript.map((t) => (
                  <div key={t.id} className={`flex items-start gap-2.5 ${t.speaker === 'candidate' ? 'flex-row-reverse' : ''}`}>
                    <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${t.speaker === 'ai' ? 'bg-brand-100 text-brand-600' : 'bg-ink-100 text-ink-600'}`}>
                      {t.speaker === 'ai' ? <Bot className="size-3.5" /> : <User className="size-3.5" />}
                    </span>
                    <span className={`inline-block max-w-[75%] rounded-xl px-3.5 py-2 text-[13px] leading-relaxed ${t.speaker === 'ai' ? 'bg-ink-100 text-ink-800' : 'bg-brand-600 text-white'}`}>
                      {t.text}
                    </span>
                  </div>
                ))
              )}
              {(state === 'thinking' || state === 'listening') && visibleTranscript.length > 0 && (
                <div className="flex items-center gap-1.5 pl-9 text-ink-400">
                  <span className="size-1.5 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.2s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.1s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-ink-300" />
                </div>
              )}
              {state === 'ended' && (
                <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 text-center">
                  <p className="text-[13.5px] font-semibold text-ink-900">Interview ended</p>
                  <p className="mt-1 text-[13px] text-ink-600">The transcript and evidence have been saved to the candidate's profile for human review.</p>
                  {candidate.data && (
                    <Link to={`/app/employees/hr/candidates/${candidate.data.id}`}>
                      <Button size="sm" className="mt-3">View Candidate Profile</Button>
                    </Link>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Interview Objective" />
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
