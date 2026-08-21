import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Bot, User, Loader2, PhoneCall, ArrowLeft, AlertTriangle, RefreshCw, Save, Sparkles, ChevronDown, ChevronUp, CalendarClock } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useCandidate, useInterview, useScreeningPrompt } from '@/hooks/useHr'
import { hrService } from '@/services/api'
import { useToast } from '@/hooks/useToast'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Textarea } from '@/components/ui/Field'
import { ScheduleInterviewModal } from '@/components/employees/hr/ScheduleInterviewModal'
import type { InterviewStatus, ScreeningResultSummary } from '@/types'

const STATUS_LABEL: Record<InterviewStatus, string> = {
  not_started: 'Not Started',
  preparing: 'Preparing Call',
  calling: 'Calling…',
  connected: 'Connected',
  in_progress: 'AI Screening in Progress',
  completed: 'Completed',
  failed: 'Call Failed',
  human_requested: 'Human Requested',
  expired: 'Expired',
}

const STATUS_TONE: Record<InterviewStatus, BadgeTone> = {
  not_started: 'neutral',
  preparing: 'info',
  calling: 'info',
  connected: 'info',
  in_progress: 'info',
  completed: 'success',
  failed: 'danger',
  human_requested: 'warning',
  expired: 'neutral',
}

// Live view polls the real screening endpoint rather than simulating
// progress locally — this is the only source of transcript/status truth
// while a call is active (spec: never fake speaking/listening state).
const POLL_INTERVAL_MS = 2500
const LIVE_STATUSES: InterviewStatus[] = ['preparing', 'calling', 'connected', 'in_progress']

const RECOMMENDATION_LABEL: Record<ScreeningResultSummary['recommendation'], string> = {
  proceed: 'Recommended for HR Review',
  hold: 'Hold',
  reject: 'Not Recommended',
  candidate_unavailable: 'Candidate Unavailable',
}

const RECOMMENDATION_TONE: Record<ScreeningResultSummary['recommendation'], BadgeTone> = {
  proceed: 'success',
  hold: 'warning',
  reject: 'danger',
  candidate_unavailable: 'neutral',
}

export default function ScreeningCallPage() {
  const { candidateId = '' } = useParams()
  const { show } = useToast()

  const candidate = useCandidate(candidateId)
  const interview = useInterview(candidateId)
  const prompt = useScreeningPrompt(candidateId)

  useSetBreadcrumbs(
    [
      { label: 'AI Employees', href: '/app/employees' },
      { label: 'Aivra Hr', href: '/app/employees/hr' },
      { label: 'Screenings', href: '/app/employees/hr/screenings' },
      { label: candidate.data?.name ?? '…' },
    ],
    [candidate.data?.name],
  )

  const [promptDraft, setPromptDraft] = useState('')
  const [savingPrompt, setSavingPrompt] = useState(false)
  const [starting, setStarting] = useState(false)
  const [showPromptHistory, setShowPromptHistory] = useState(false)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)

  useEffect(() => {
    if (prompt.data) setPromptDraft(prompt.data.promptText)
  }, [prompt.data?.promptText])

  // Poll for real transcript/status updates while the call is actually live.
  useEffect(() => {
    const status = interview.data?.status
    if (!status || !LIVE_STATUSES.includes(status)) return
    const id = window.setInterval(() => interview.refetch(), POLL_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [interview.data?.status])

  async function savePrompt() {
    setSavingPrompt(true)
    try {
      await hrService.updateScreeningPrompt(candidateId, promptDraft)
      await prompt.refetch()
      show({ tone: 'success', title: 'Screening prompt saved' })
    } catch {
      show({ tone: 'error', title: 'Could not save prompt' })
    } finally {
      setSavingPrompt(false)
    }
  }

  // Retry always reuses whatever prompt is currently saved (never
  // regenerates or discards an HR edit) — the prompt is saved via
  // savePrompt() above before this ever runs, so this call alone is enough.
  async function startCall() {
    setStarting(true)
    try {
      await hrService.startScreeningCall(candidateId)
      show({ tone: 'info', title: `Calling ${candidate.data?.name ?? 'candidate'}…` })
      await interview.refetch()
    } catch (err) {
      show({ tone: 'error', title: 'Could not start the screening call', description: err instanceof Error ? err.message : undefined })
    } finally {
      setStarting(false)
    }
  }

  if (interview.loading || prompt.loading || !candidate.data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const status: InterviewStatus = interview.data?.status ?? 'not_started'
  const notStarted = status === 'not_started'
  const failed = status === 'failed'
  const completed = status === 'completed'
  const live = LIVE_STATUSES.includes(status)
  const result = interview.data?.screeningResult
  const candidateUnavailable = completed && result?.recommendation === 'candidate_unavailable'
  // "Call Again" is available for ANY completed screening, not just a
  // candidate-unavailable outcome — HR may want to update the prompt and
  // ask something else, follow up on a gap, or re-screen after editing the
  // JD. The prompt stays editable in all of these non-live states so HR
  // can change what's asked before placing a new call.
  const canCallAgain = notStarted || failed || completed
  const showEditablePrompt = canCallAgain
  const promptBlank = !promptDraft.trim()
  const backHref = `/app/employees/hr/candidates/${candidateId}`

  return (
    <div className="space-y-5">
      <Link to={backHref} className="flex items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" />
        Back to candidate
      </Link>

      <PageHeader
        title="AI Screening Call"
        description={`AI voice screening for ${candidate.data.name}${candidate.data.phone ? ` · ${candidate.data.phone}` : ''}`}
        actions={
          <div className="flex flex-col items-end gap-2">
            {notStarted ? (
              <Button icon={<PhoneCall className="size-4" />} onClick={startCall} loading={starting} disabled={promptBlank}>
                Start Screening
              </Button>
            ) : failed ? (
              <Button icon={<RefreshCw className="size-4" />} onClick={startCall} loading={starting} disabled={promptBlank}>
                Retry Call
              </Button>
            ) : completed ? (
              <Button icon={<PhoneCall className="size-4" />} onClick={startCall} loading={starting} disabled={promptBlank}>
                Call Again
              </Button>
            ) : (
              <Badge tone={STATUS_TONE[status]} dot>{STATUS_LABEL[status]}</Badge>
            )}
            {/* Available regardless of call status — HR can move straight to
                a human interview even if some AI screening details are
                missing or the call hasn't finished. */}
            <Button variant="outline" size="sm" icon={<CalendarClock className="size-3.5" />} onClick={() => setScheduleModalOpen(true)}>
              Schedule Interview
            </Button>
          </div>
        }
      />

      {failed && (
        <div className="flex items-start gap-2.5 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-[13px] text-danger-700">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            <span className="font-semibold">Call Failed.</span> {interview.data?.failureReason || 'The screening call could not be completed.'}
          </span>
        </div>
      )}

      {candidateUnavailable && (
        <div className="flex items-start gap-2.5 rounded-xl border border-warning-100 bg-warning-50 px-4 py-3 text-[13px] text-warning-700">
          <PhoneCall className="mt-0.5 size-4 shrink-0" />
          <span>
            <span className="font-semibold">Candidate was unavailable last time.</span> No screening details were collected — review/edit the prompt below and call again when convenient.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {showEditablePrompt && (
            <Card>
              <CardHeader
                title="AI Screening Prompt"
                description={
                  completed
                    ? "Edit what to ask before calling again — e.g. follow up on a gap, or ask something new."
                    : "Auto-generated from the job description and this candidate's resume — review and edit before starting the call."
                }
              />
              <CardBody className="space-y-3">
                {prompt.error ? (
                  <div className="flex items-start gap-2.5 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-[13px] text-danger-700">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <span>
                      Prompt generation failed: {prompt.error.message || 'unknown error'}. Starting the call is disabled until a
                      real, grounded prompt is generated — retry by reloading this page.
                    </span>
                  </div>
                ) : (
                  <>
                    <Textarea
                      value={promptDraft}
                      onChange={(e) => setPromptDraft(e.target.value)}
                      rows={16}
                      className="font-mono text-[12.5px] leading-relaxed"
                    />
                    <div className="flex items-center justify-between">
                      <p className="flex items-center gap-1.5 text-xs text-ink-400">
                        <Sparkles className="size-3.5" />
                        {prompt.data?.promptEditedAt ? 'Edited by HR' : 'Auto-generated'}
                      </p>
                      <Button size="sm" variant="outline" icon={<Save className="size-3.5" />} onClick={savePrompt} loading={savingPrompt} disabled={promptBlank}>
                        Save Prompt
                      </Button>
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          )}

          {!showEditablePrompt && promptDraft && (
            <Card>
              <button
                type="button"
                onClick={() => setShowPromptHistory((v) => !v)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left"
              >
                <span className="text-[13px] font-medium text-ink-700">Screening prompt used for this call</span>
                {showPromptHistory ? <ChevronUp className="size-4 text-ink-400" /> : <ChevronDown className="size-4 text-ink-400" />}
              </button>
              {showPromptHistory && (
                <CardBody className="border-t border-ink-100">
                  <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-ink-600">{promptDraft}</pre>
                </CardBody>
              )}
            </Card>
          )}

          <Card>
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span
                  className={`flex size-2.5 items-center justify-center rounded-full ${
                    notStarted ? 'bg-ink-300' : failed ? 'bg-danger-500' : completed ? 'bg-ink-400' : 'bg-success-500 animate-pulse'
                  }`}
                />
                <span className="text-[13px] font-medium text-ink-700">{STATUS_LABEL[status]}</span>
                {live && <Loader2 className="size-3.5 animate-spin text-brand-500" />}
              </div>
            </div>
            <CardBody className="max-h-[480px] space-y-4 overflow-y-auto">
              {failed ? (
                (interview.data?.transcript.length ?? 0) > 0 ? (
                  // A call can fail (e.g. result-generation error) after a
                  // real conversation happened — never hide a captured
                  // transcript just because the outcome was a failure.
                  interview.data?.transcript.map((t) => (
                    <TranscriptBubble key={t.id} speaker={t.speaker} text={t.text} />
                  ))
                ) : (
                  <EmptyState
                    icon={<AlertTriangle className="size-6" />}
                    title="Call could not connect"
                    description={interview.data?.failureReason || 'The AI Voice Employee was unable to reach this candidate.'}
                  />
                )
              ) : notStarted ? (
                <p className="py-16 text-center text-[13px] text-ink-400">Review the screening prompt, then press "Start Screening" to place the call.</p>
              ) : (interview.data?.transcript.length ?? 0) === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <PhoneCall className="size-8 animate-pulse text-brand-500" />
                  <p className="mt-3 text-[13px] font-medium text-ink-700">{STATUS_LABEL[status]}</p>
                  <p className="mt-1 text-xs text-ink-400">Waiting for the conversation to begin…</p>
                </div>
              ) : (
                <>
                  {interview.data?.transcript.map((t) => (
                    <TranscriptBubble key={t.id} speaker={t.speaker} text={t.text} />
                  ))}
                  {completed && (
                    <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 text-center">
                      <p className="text-[13.5px] font-semibold text-ink-900">Screening call completed</p>
                      <p className="mt-1 text-[13px] text-ink-600">The transcript and evidence have been saved. This candidate now needs human review.</p>
                    </div>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          {result && (
            <Card>
              <CardHeader title="Screening Summary" description="Advisory only — human review required." />
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-ink-500">Overall Screening</span>
                  <Badge tone={RECOMMENDATION_TONE[result.recommendation]}>{RECOMMENDATION_LABEL[result.recommendation]}</Badge>
                </div>
                {result.recommendationRationale && (
                  <p className="border-t border-ink-100 pt-2.5 text-[13px] leading-relaxed text-ink-700">{result.recommendationRationale}</p>
                )}
                <div className="space-y-1.5 border-t border-ink-100 pt-2.5 text-[13px]">
                  <Row label="Introduction" value={result.introduction} />
                  <Row label="Current Role" value={result.currentRole} />
                  <Row label="Experience" value={result.totalExperience} />
                  <Row label="Relevant Experience" value={result.relevantExperience} />
                </div>
                <div className="space-y-1.5 border-t border-ink-100 pt-2.5 text-[13px]">
                  <Row label="Current CTC" value={result.currentCtc} />
                  <Row label="Expected CTC" value={result.expectedCtc} />
                </div>
                <div className="space-y-1.5 border-t border-ink-100 pt-2.5 text-[13px]">
                  <Row
                    label="Availability"
                    value={result.immediateAvailability === true ? 'Immediate Joiner' : result.immediateAvailability === false ? 'Not immediate' : undefined}
                  />
                  <Row label="Notice Period" value={result.noticePeriod} />
                  <Row label="Interview Availability" value={result.interviewAvailability} />
                </div>
                <div className="space-y-1.5 border-t border-ink-100 pt-2.5 text-[13px]">
                  <Row label="Candidate Interest" value={result.candidateInterest} />
                </div>
                {result.keyObservations.length > 0 && (
                  <div className="space-y-1 border-t border-ink-100 pt-2.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Key Observations</p>
                    {result.keyObservations.map((o, i) => (
                      <p key={i} className="text-[13px] text-ink-700">{o}</p>
                    ))}
                  </div>
                )}
                {result.candidateQuestions.length > 0 && (
                  <div className="space-y-1.5 border-t border-ink-100 pt-2.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Candidate Questions</p>
                    {result.candidateQuestions.map((q, i) => (
                      <p key={i} className="text-[13px] text-ink-700">{q}</p>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {interview.data?.report && (
            <Card>
              <CardHeader title="JD-Specific Evidence" />
              <CardBody className="space-y-2.5">
                {interview.data.report.criterionEvidence.length === 0 ? (
                  <p className="text-[13px] text-ink-500">No JD-specific evidence captured.</p>
                ) : (
                  interview.data.report.criterionEvidence.map((e) => (
                    <div key={e.criterionId} className="space-y-0.5">
                      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{e.criterionLabel}</p>
                      <p className="text-[13px] text-ink-700">{e.evidence}</p>
                    </div>
                  ))
                )}
                {interview.data.report.gaps.length > 0 && (
                  <div className="border-t border-ink-100 pt-2.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Gaps</p>
                    {interview.data.report.gaps.map((g, i) => (
                      <p key={i} className="text-[13px] text-ink-700">{g}</p>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <ScheduleInterviewModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        candidateId={candidateId}
        candidateName={candidate.data.name}
        candidateEmail={candidate.data.email}
        onScheduled={() => interview.refetch()}
      />
    </div>
  )
}

function TranscriptBubble({ speaker, text }: { speaker: 'ai' | 'candidate' | 'customer' | 'system'; text: string }) {
  return (
    <div className={`flex items-start gap-2.5 ${speaker === 'candidate' ? 'flex-row-reverse' : ''}`}>
      <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${speaker === 'ai' ? 'bg-brand-100 text-brand-600' : 'bg-ink-100 text-ink-600'}`}>
        {speaker === 'ai' ? <Bot className="size-3.5" /> : <User className="size-3.5" />}
      </span>
      <span className={`inline-block max-w-[75%] rounded-xl px-3.5 py-2 text-[13px] leading-relaxed ${speaker === 'ai' ? 'bg-ink-100 text-ink-800' : 'bg-brand-600 text-white'}`}>
        {text}
      </span>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="shrink-0 text-ink-500">{label}</span>
      {value ? (
        <span className="text-right font-medium text-ink-900">{value}</span>
      ) : (
        <span className="text-right text-ink-400 italic">Not provided</span>
      )}
    </div>
  )
}
