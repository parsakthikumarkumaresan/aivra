import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PhoneCall,
  FileText,
  MessageSquareText,
  Sparkles,
  AlertCircle,
  Loader2,
  RefreshCw,
  Video,
} from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useCandidate, useInterview, useJob } from '@/hooks/useHr'
import { useToast } from '@/hooks/useToast'
import { hrService } from '@/services/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Timeline } from '@/components/ui/Timeline'
import type { TimelineEntry } from '@/components/ui/Timeline'
import { Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Transcript } from '@/components/ui/Transcript'
import { EvidenceCard } from '@/components/employees/hr/EvidenceCard'
import { ResumeAnalysisCard } from '@/components/employees/hr/ResumeAnalysisCard'
import { JdMatchCard } from '@/components/employees/hr/JdMatchCard'
import { CANDIDATE_STAGE_LABEL } from '@/types'
import { formatDate, formatDateTime } from '@/utils/format'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'resume', label: 'Resume Evidence' },
  { value: 'screening', label: 'Screening' },
  { value: 'aiscreening', label: 'AI Screening' },
  { value: 'feedback', label: 'Human Feedback' },
  { value: 'timeline', label: 'Timeline' },
]

type DecisionKind = 'reject' | 'hold'
type DecisionGate = 'screening' | 'interview'

export default function CandidateDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { show } = useToast()
  const candidate = useCandidate(id)
  const job = useJob(candidate.data?.jobId ?? '')
  const interview = useInterview(id)
  const [tab, setTab] = useState('overview')
  const [feedbackDraft, setFeedbackDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [decision, setDecision] = useState<{ kind: DecisionKind; gate: DecisionGate } | null>(null)
  const [decisionNote, setDecisionNote] = useState('')

  useSetBreadcrumbs(
    [
      { label: 'AI Employees', href: '/app/employees' },
      { label: 'AI HR Employee', href: '/app/employees/hr' },
      { label: 'Candidates', href: '/app/employees/hr/candidates' },
      { label: candidate.data?.name ?? '…' },
    ],
    [candidate.data?.name],
  )

  if (candidate.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (candidate.error || !candidate.data) {
    return <ErrorState title="Could not load candidate" onRetry={candidate.refetch} />
  }

  const c = candidate.data

  async function refreshAll() {
    await Promise.all([candidate.refetch(), interview.refetch()])
  }

  async function handleApproveForScreening() {
    setBusy(true)
    await hrService.approveForScreening(c.id)
    setBusy(false)
    show({ tone: 'success', title: 'Approved for AI screening', description: `${c.name} can now be called by the AI HR Employee.` })
    refreshAll()
  }

  async function handleApproveForInterview() {
    setBusy(true)
    await hrService.approveForInterview(c.id)
    setBusy(false)
    show({ tone: 'success', title: 'Approved for human interview', description: 'You can now schedule this candidate.' })
    refreshAll()
  }

  async function handleStartScreening() {
    setBusy(true)
    await hrService.startScreeningCall(c.id)
    setBusy(false)
    navigate(`/app/employees/hr/screenings/${c.id}`)
  }

  async function submitDecision() {
    if (!decision) return
    setBusy(true)
    if (decision.kind === 'reject') await hrService.rejectCandidate(c.id, decisionNote || undefined)
    else await hrService.holdCandidate(c.id, decisionNote || undefined)
    setBusy(false)
    setDecision(null)
    setDecisionNote('')
    show({ tone: decision.kind === 'reject' ? 'info' : 'warning', title: decision.kind === 'reject' ? 'Candidate rejected' : 'Candidate on hold' })
    refreshAll()
  }

  const timelineEntries: TimelineEntry[] = [
    { id: 'tl1', title: `Resume uploaded via ${c.source.replace('_', ' ')}`, timestamp: formatDateTime(c.uploadedAt), iconTone: 'neutral' },
    ...(c.jdMatch ? [{ id: 'tl2', title: 'Resume analyzed and matched to job', description: `Overall JD match ${c.jdMatch.overallScore}%`, timestamp: formatDateTime(c.uploadedAt), iconTone: 'brand' as const }] : []),
    ...(c.screeningApproval === 'approved' ? [{ id: 'tl3', title: 'Approved for AI screening', timestamp: formatDateTime(c.uploadedAt), iconTone: 'success' as const }] : []),
    ...(interview.data?.completedAt ? [{ id: 'tl4', title: 'AI screening completed', timestamp: formatDateTime(interview.data.completedAt), iconTone: 'brand' as const }] : []),
    ...(interview.data?.status === 'failed' ? [{ id: 'tl4b', title: 'AI screening call failed', timestamp: formatDateTime(c.uploadedAt), iconTone: 'danger' as const }] : []),
    ...(c.interviewApproval === 'approved' ? [{ id: 'tl5', title: 'Approved for human interview', timestamp: formatDateTime(c.uploadedAt), iconTone: 'success' as const }] : []),
    ...(c.stage === 'interview_scheduled' ? [{ id: 'tl6', title: 'Human interview scheduled', timestamp: formatDateTime(c.uploadedAt), iconTone: 'brand' as const }] : []),
    ...(c.stage === 'completed' ? [{ id: 'tl7', title: 'Candidate marked completed', timestamp: formatDateTime(c.uploadedAt), iconTone: 'success' as const }] : []),
    ...(c.stage === 'rejected' ? [{ id: 'tl8', title: 'Candidate rejected', description: c.attentionReason, timestamp: formatDateTime(c.uploadedAt), iconTone: 'danger' as const }] : []),
    ...(c.stage === 'on_hold' ? [{ id: 'tl9', title: 'Candidate placed on hold', description: c.attentionReason, timestamp: formatDateTime(c.uploadedAt), iconTone: 'warning' as const }] : []),
  ]

  return (
    <div className="space-y-5">
      <Link to="/app/employees/hr/candidates" className="flex items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" />
        Back to pipeline
      </Link>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {c.name}
            <Badge tone="neutral">{CANDIDATE_STAGE_LABEL[c.stage]}</Badge>
          </span>
        }
        description={`${c.currentTitle} · ${c.yearsExperience} years experience`}
        icon={<Avatar name={c.name} size="lg" />}
        meta={
          <>
            <span className="flex items-center gap-1.5 text-xs text-ink-500"><Mail className="size-3.5" />{c.email}</span>
            {c.phone && <span className="flex items-center gap-1.5 text-xs text-ink-500"><Phone className="size-3.5" />{c.phone}</span>}
            <span className="flex items-center gap-1.5 text-xs text-ink-500"><MapPin className="size-3.5" />{c.location}</span>
            <span className="flex items-center gap-1.5 text-xs text-ink-500"><Briefcase className="size-3.5" />{job.data?.title ?? '—'}</span>
            <span className="flex items-center gap-1.5 text-xs text-ink-500"><Calendar className="size-3.5" />Uploaded {formatDate(c.uploadedAt)}</span>
          </>
        }
        actions={<CandidateActionBar
          candidate={c}
          interviewStatus={interview.data?.status}
          busy={busy}
          onApproveScreening={handleApproveForScreening}
          onApproveInterview={handleApproveForInterview}
          onStartScreening={handleStartScreening}
          onReject={(gate) => setDecision({ kind: 'reject', gate })}
          onHold={(gate) => setDecision({ kind: 'hold', gate })}
        />}
      />

      {c.needsAttention && c.attentionReason && (
        <div className="flex items-start gap-2.5 rounded-xl border border-warning-100 bg-warning-50 px-4 py-3 text-[13px] text-warning-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {c.attentionReason}
        </div>
      )}

      <Tabs items={TABS} value={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {c.extractedProfile ? (
              <ResumeAnalysisCard profile={c.extractedProfile} />
            ) : (
              <EmptyState
                icon={<Loader2 className="size-6 animate-spin" />}
                title="Resume processing in progress"
                description="Extracted candidate information will appear here once resume parsing completes."
              />
            )}
          </div>
          {c.jdMatch ? (
            <JdMatchCard match={c.jdMatch} jobTitle={job.data?.title ?? 'this role'} />
          ) : (
            <EmptyState compact icon={<Loader2 className="size-5 animate-spin" />} title="Matching…" description="JD match will appear once processing completes." />
          )}
        </div>
      )}

      {tab === 'resume' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {c.resumeEvidence.length === 0 ? (
            <EmptyState
              icon={<FileText className="size-6" />}
              title="Resume not yet screened"
              description="AI resume screening evidence will appear here once processed."
              className="md:col-span-2"
            />
          ) : (
            c.resumeEvidence.map((e) => <EvidenceCard key={e.criterionId} evidence={e} />)
          )}
        </div>
      )}

      {tab === 'screening' && (
        <Card>
          {c.screeningAnswers && c.screeningAnswers.length > 0 ? (
            <CardBody className="space-y-4">
              {c.screeningAnswers.map((qa, i) => (
                <div key={i}>
                  <p className="text-[13px] font-medium text-ink-800">{qa.question}</p>
                  <p className="mt-1 text-[13.5px] text-ink-600">{qa.answer}</p>
                </div>
              ))}
            </CardBody>
          ) : (
            <EmptyState icon={<MessageSquareText className="size-6" />} title="No screening questions on file" description="This candidate has not completed a screening questionnaire." />
          )}
        </Card>
      )}

      {tab === 'aiscreening' && (
        <div className="space-y-4">
          {interview.loading ? (
            <Skeleton className="h-48 w-full" />
          ) : !interview.data ? (
            <EmptyState
              icon={<PhoneCall className="size-6" />}
              title="AI screening not started"
              description={
                c.screeningApproval === 'approved'
                  ? 'This candidate is approved — start the AI screening call to begin.'
                  : 'Approve this candidate for AI screening to unlock the call.'
              }
              action={
                c.screeningApproval === 'approved' ? (
                  <Button icon={<PhoneCall className="size-4" />} onClick={handleStartScreening} loading={busy}>
                    Start AI Screening
                  </Button>
                ) : undefined
              }
            />
          ) : interview.data.status === 'failed' ? (
            <EmptyState
              icon={<AlertCircle className="size-6" />}
              title="AI screening call failed"
              description="The AI Voice Employee could not connect to this candidate."
              action={
                <Button icon={<RefreshCw className="size-4" />} onClick={handleStartScreening} loading={busy}>
                  Retry Screening Call
                </Button>
              }
            />
          ) : !interview.data.report ? (
            <EmptyState
              icon={<PhoneCall className="size-6" />}
              title="AI screening in progress"
              description="This candidate's AI screening call has not finished yet."
              action={
                <Link to={`/app/employees/hr/screenings/${c.id}`}>
                  <Button icon={<PhoneCall className="size-4" />}>View Live Call</Button>
                </Link>
              }
            />
          ) : (
            <>
              <div className="flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-[13px] text-brand-800">
                <Sparkles className="mt-0.5 size-4 shrink-0" />
                <span>
                  <span className="font-semibold">Human review required.</span> Recommended next step: {interview.data.report.recommendedNextStep}
                </span>
              </div>
              <Card>
                <CardHeader title="Screening Summary" />
                <CardBody>
                  <p className="text-[13.5px] leading-relaxed text-ink-700">{interview.data.report.summary}</p>
                </CardBody>
              </Card>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader title="Strengths" />
                  <CardBody className="space-y-2">
                    {interview.data.report.strengths.map((s, i) => (
                      <p key={i} className="flex items-start gap-2 text-[13px] text-ink-700">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success-600" />
                        {s}
                      </p>
                    ))}
                  </CardBody>
                </Card>
                <Card>
                  <CardHeader title="Gaps" />
                  <CardBody className="space-y-2">
                    {interview.data.report.gaps.map((s, i) => (
                      <p key={i} className="flex items-start gap-2 text-[13px] text-ink-700">
                        <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-warning-600" />
                        {s}
                      </p>
                    ))}
                  </CardBody>
                </Card>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {interview.data.report.criterionEvidence.map((e) => (
                  <EvidenceCard key={e.criterionId} evidence={e} />
                ))}
              </div>
              <Card>
                <CardHeader title="Transcript" />
                <CardBody className="max-h-80 overflow-y-auto">
                  <Transcript turns={interview.data.transcript} />
                </CardBody>
              </Card>
            </>
          )}
        </div>
      )}

      {tab === 'feedback' && (
        <Card>
          <CardHeader title="Human Feedback" description="Notes from the hiring team — visible to all interviewers" />
          <CardBody className="space-y-4">
            <div className="rounded-lg bg-ink-25 p-3.5">
              <div className="flex items-center gap-2">
                <Avatar name="Priya Nair" size="xs" />
                <span className="text-[13px] font-semibold text-ink-800">Priya Nair</span>
                <span className="text-xs text-ink-400">Talent Acquisition Lead</span>
              </div>
              <p className="mt-2 text-[13px] text-ink-600">Strong communicator in the AI screening transcript — recommend moving forward to the panel round.</p>
            </div>
            <div>
              <Textarea value={feedbackDraft} onChange={(e) => setFeedbackDraft(e.target.value)} placeholder="Add your feedback for the hiring team…" />
              <div className="mt-2 flex justify-end">
                <Button size="sm" disabled={!feedbackDraft.trim()} onClick={() => setFeedbackDraft('')}>
                  Post Feedback
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {tab === 'timeline' && (
        <Card>
          <CardBody>
            <Timeline entries={timelineEntries} />
          </CardBody>
        </Card>
      )}

      <Modal
        open={Boolean(decision)}
        onClose={() => setDecision(null)}
        title={decision?.kind === 'reject' ? `Reject ${c.name}?` : `Put ${c.name} on hold?`}
        footer={
          <>
            <Button variant="outline" onClick={() => setDecision(null)} disabled={busy}>
              Cancel
            </Button>
            <Button variant={decision?.kind === 'reject' ? 'danger' : 'primary'} onClick={submitDecision} loading={busy}>
              {decision?.kind === 'reject' ? 'Reject Candidate' : 'Place On Hold'}
            </Button>
          </>
        }
      >
        <div>
          <p className="mb-3 text-[13px] text-ink-600">
            {decision?.kind === 'reject'
              ? 'This candidate will be removed from the active pipeline. This is a human decision — the AI will not act on this candidate again.'
              : 'This candidate will be paused in the pipeline until you resume them.'}
          </p>
          <Textarea value={decisionNote} onChange={(e) => setDecisionNote(e.target.value)} placeholder="Add a note (optional)…" />
        </div>
      </Modal>
    </div>
  )
}

interface ActionBarProps {
  candidate: ReturnType<typeof useCandidate>['data']
  interviewStatus?: string
  busy: boolean
  onApproveScreening: () => void
  onApproveInterview: () => void
  onStartScreening: () => void
  onReject: (gate: DecisionGate) => void
  onHold: (gate: DecisionGate) => void
}

function CandidateActionBar({ candidate, interviewStatus, busy, onApproveScreening, onApproveInterview, onStartScreening, onReject, onHold }: ActionBarProps) {
  if (!candidate) return null
  const c = candidate

  if (c.stage === 'rejected') return <Badge tone="danger">Rejected</Badge>
  if (c.stage === 'completed') return <Badge tone="success">Completed</Badge>
  if (c.stage === 'on_hold') return <Badge tone="warning">On Hold</Badge>

  if (c.stage === 'uploaded' || c.stage === 'processing') {
    return (
      <span className="flex items-center gap-1.5 text-[13px] text-ink-500">
        <Loader2 className="size-3.5 animate-spin" />
        Waiting for resume processing
      </span>
    )
  }

  // Gate 1 — HR review of resume analysis, before AI screening
  if (c.screeningApproval === 'pending') {
    return (
      <>
        <Button variant="ghost" size="sm" icon={<PauseCircle className="size-3.5" />} onClick={() => onHold('screening')} disabled={busy}>
          Keep on Hold
        </Button>
        <Button variant="outline" size="sm" icon={<XCircle className="size-3.5" />} onClick={() => onReject('screening')} disabled={busy}>
          Reject
        </Button>
        <Button size="sm" icon={<CheckCircle2 className="size-3.5" />} onClick={onApproveScreening} loading={busy}>
          Approve for AI Screening
        </Button>
      </>
    )
  }

  if (c.stage === 'screening_approved') {
    return (
      <Button size="sm" icon={<PhoneCall className="size-3.5" />} onClick={onStartScreening} loading={busy}>
        Start AI Screening
      </Button>
    )
  }

  if (c.stage === 'ai_screening') {
    if (interviewStatus === 'failed') {
      return (
        <Button size="sm" icon={<RefreshCw className="size-3.5" />} onClick={onStartScreening} loading={busy}>
          Retry Screening Call
        </Button>
      )
    }
    return (
      <Link to={`/app/employees/hr/screenings/${c.id}`}>
        <Button size="sm" variant="outline" icon={<PhoneCall className="size-3.5" />}>
          View Live Call
        </Button>
      </Link>
    )
  }

  // Gate 2 — human review of the screening report, before scheduling an interview
  if (c.interviewApproval === 'pending') {
    return (
      <>
        <Button variant="ghost" size="sm" icon={<PauseCircle className="size-3.5" />} onClick={() => onHold('interview')} disabled={busy}>
          Keep on Hold
        </Button>
        <Button variant="outline" size="sm" icon={<XCircle className="size-3.5" />} onClick={() => onReject('interview')} disabled={busy}>
          Reject
        </Button>
        <Button size="sm" icon={<CheckCircle2 className="size-3.5" />} onClick={onApproveInterview} loading={busy}>
          Approve for Human Interview
        </Button>
      </>
    )
  }

  if (c.stage === 'interview_approved') {
    return (
      <Link to={`/app/employees/hr/schedule?candidate=${c.id}`}>
        <Button size="sm" icon={<Calendar className="size-3.5" />}>
          Schedule Interview
        </Button>
      </Link>
    )
  }

  if (c.stage === 'interview_scheduled') {
    return (
      <Link to={`/app/employees/hr/schedule?candidate=${c.id}`}>
        <Button size="sm" variant="outline" icon={<Video className="size-3.5" />}>
          View Interview Details
        </Button>
      </Link>
    )
  }

  return null
}
