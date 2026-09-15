import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  CalendarClock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PhoneCall,
  FileText,
  AlertCircle,
  Loader2,
  RefreshCw,
  Video,
  Archive,
  ArchiveRestore,
  Undo2,
  Eye,
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
import { EvidenceCard } from '@/components/employees/hr/EvidenceCard'
import { ResumeAnalysisCard } from '@/components/employees/hr/ResumeAnalysisCard'
import { JdMatchCard } from '@/components/employees/hr/JdMatchCard'
import { ScheduleInterviewModal } from '@/components/employees/hr/ScheduleInterviewModal'
import { CANDIDATE_STAGE_LABEL } from '@/types'
import { formatDate, formatDateTime } from '@/utils/format'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'resume', label: 'Resume Evidence' },
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
  const [lifecycleAction, setLifecycleAction] = useState<'reconsider' | 'archive' | 'restore' | null>(null)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)

  useSetBreadcrumbs(
    [
      { label: 'AI Employees', href: '/app/employees' },
      { label: 'Jexa HR', href: '/app/employees/hr' },
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
    show({ tone: 'success', title: 'Approved for AI screening', description: `${c.name} can now be called by Jexa HR.` })
    refreshAll()
  }

  async function handleApproveForInterview() {
    setBusy(true)
    await hrService.approveForInterview(c.id)
    setBusy(false)
    show({ tone: 'success', title: 'Approved for human interview', description: 'You can now schedule this candidate.' })
    refreshAll()
  }

  function handleStartScreening() {
    // The actual call is placed from the screening page itself, after HR
    // reviews/edits the auto-generated prompt — never started sight-unseen.
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

  async function submitLifecycleAction() {
    if (!lifecycleAction) return
    setBusy(true)
    if (lifecycleAction === 'reconsider') await hrService.reconsiderCandidate(c.id)
    else if (lifecycleAction === 'archive') await hrService.archiveCandidate(c.id)
    else await hrService.restoreCandidate(c.id)
    setBusy(false)
    setLifecycleAction(null)
    show({
      tone: lifecycleAction === 'archive' ? 'info' : 'success',
      title:
        lifecycleAction === 'reconsider'
          ? 'Candidate reconsidered'
          : lifecycleAction === 'archive'
            ? 'Candidate archived'
            : 'Candidate restored',
      description:
        lifecycleAction === 'reconsider'
          ? `${c.name} is back in HR Review.`
          : lifecycleAction === 'archive'
            ? 'Their recruitment history has been preserved.'
            : 'Their recruitment history is unchanged.',
    })
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
            {c.archivedAt && <Badge tone="neutral">Archived</Badge>}
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
          onScheduleInterview={() => setScheduleModalOpen(true)}
          onReject={(gate) => setDecision({ kind: 'reject', gate })}
          onHold={(gate) => setDecision({ kind: 'hold', gate })}
          onReconsider={() => setLifecycleAction('reconsider')}
          onArchive={() => setLifecycleAction('archive')}
          onRestore={() => setLifecycleAction('restore')}
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
          ) : !interview.data.report && interview.data.status !== 'failed' ? (
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
            // Not the first call — a brief summary of the previous attempt on
            // the left, "Call Again" + "View Report" on the right. Full
            // detail (prompt, transcript, JD evidence, structured fields)
            // lives on the screening page itself — "View Report" makes it
            // obvious that page has more than just a way to place a new call.
            <Card>
              <CardBody className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-400">Previous Call Summary</p>
                  <p className="text-[13.5px] leading-relaxed text-ink-700">
                    {interview.data.status === 'failed'
                      ? interview.data.failureReason || 'The call could not be completed.'
                      : interview.data.screeningResult?.recommendation === 'candidate_unavailable'
                        ? 'Candidate was unavailable to talk — no screening details were collected.'
                        : interview.data.report?.summary || 'No summary available.'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link to={`/app/employees/hr/screenings/${c.id}`}>
                    <Button variant="outline" icon={<Eye className="size-4" />}>
                      View Report
                    </Button>
                  </Link>
                  <Button icon={<PhoneCall className="size-4" />} onClick={handleStartScreening} loading={busy}>
                    Call Again
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Available regardless of screening progress — HR can move a
              candidate straight to a human interview even if some AI
              screening details are missing or incomplete. */}
          <div>
            <Button variant="outline" icon={<CalendarClock className="size-4" />} onClick={() => setScheduleModalOpen(true)}>
              Schedule Interview
            </Button>
          </div>
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

      <Modal
        open={Boolean(lifecycleAction)}
        onClose={() => setLifecycleAction(null)}
        title={
          lifecycleAction === 'reconsider'
            ? `Reconsider ${c.name}?`
            : lifecycleAction === 'archive'
              ? `Archive ${c.name}?`
              : `Restore ${c.name}?`
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setLifecycleAction(null)} disabled={busy}>
              Cancel
            </Button>
            <Button variant={lifecycleAction === 'archive' ? 'outline' : 'primary'} onClick={submitLifecycleAction} loading={busy}>
              {lifecycleAction === 'reconsider' ? 'Reconsider Candidate' : lifecycleAction === 'archive' ? 'Archive Candidate' : 'Restore Candidate'}
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-ink-600">
          {lifecycleAction === 'reconsider'
            ? 'This moves the candidate back to HR Review so they can continue through the recruitment workflow. The original rejection stays on record.'
            : lifecycleAction === 'archive'
              ? 'Archive this candidate? Their recruitment history will be preserved and they can be restored later.'
              : 'This restores the candidate to the active pipeline. Their stage and past decisions are unchanged.'}
        </p>
      </Modal>

      <ScheduleInterviewModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        candidateId={c.id}
        candidateName={c.name}
        candidateEmail={c.email}
        onScheduled={refreshAll}
      />
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
  onScheduleInterview: () => void
  onReject: (gate: DecisionGate) => void
  onHold: (gate: DecisionGate) => void
  onReconsider: () => void
  onArchive: () => void
  onRestore: () => void
}

function CandidateActionBar({ candidate, interviewStatus, busy, onApproveScreening, onApproveInterview, onStartScreening, onScheduleInterview, onReject, onHold, onReconsider, onArchive, onRestore }: ActionBarProps) {
  if (!candidate) return null
  const c = candidate

  if (c.archivedAt) {
    return (
      <>
        <Badge tone="neutral">Archived</Badge>
        <Button variant="outline" size="sm" icon={<ArchiveRestore className="size-3.5" />} onClick={onRestore} loading={busy}>
          Restore
        </Button>
      </>
    )
  }

  if (c.stage === 'rejected') {
    return (
      <>
        <Badge tone="danger">Rejected</Badge>
        <Button variant="outline" size="sm" icon={<Archive className="size-3.5" />} onClick={onArchive} disabled={busy}>
          Archive
        </Button>
        <Button size="sm" icon={<Undo2 className="size-3.5" />} onClick={onReconsider} loading={busy}>
          Reconsider
        </Button>
      </>
    )
  }
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

  // Gate 1 — HR review of resume analysis
  if (c.screeningApproval === 'pending' || c.stage === 'hr_review' || c.stage === 'analyzed') {
    return (
      <>
        <Button variant="ghost" size="sm" icon={<PauseCircle className="size-3.5" />} onClick={() => onHold('screening')} disabled={busy}>
          Keep on Hold
        </Button>
        <Button variant="outline" size="sm" icon={<XCircle className="size-3.5" />} onClick={() => onReject('screening')} disabled={busy}>
          Reject
        </Button>
        <Button variant="outline" size="sm" icon={<PhoneCall className="size-3.5" />} onClick={onApproveScreening} loading={busy}>
          Approve for AI Screening
        </Button>
        <Button size="sm" icon={<CheckCircle2 className="size-3.5" />} onClick={onApproveInterview} loading={busy}>
          Approve for Interview
        </Button>
      </>
    )
  }

  if (c.stage === 'screening_approved') {
    return (
      <>
        <Button variant="ghost" size="sm" icon={<PauseCircle className="size-3.5" />} onClick={() => onHold('screening')} disabled={busy}>
          Keep on Hold
        </Button>
        <Button variant="outline" size="sm" icon={<XCircle className="size-3.5" />} onClick={() => onReject('screening')} disabled={busy}>
          Reject
        </Button>
        <Button size="sm" icon={<PhoneCall className="size-3.5" />} onClick={onStartScreening} loading={busy}>
          Start AI Screening
        </Button>
        <Button variant="outline" size="sm" icon={<CheckCircle2 className="size-3.5" />} onClick={onApproveInterview} loading={busy}>
          Approve for Interview
        </Button>
      </>
    )
  }

  if (c.stage === 'ai_screening') {
    if (interviewStatus === 'failed') {
      return (
        <>
          <Button size="sm" icon={<RefreshCw className="size-3.5" />} onClick={onStartScreening} loading={busy}>
            Retry Screening Call
          </Button>
          <Button variant="outline" size="sm" icon={<CheckCircle2 className="size-3.5" />} onClick={onApproveInterview} loading={busy}>
            Approve for Interview
          </Button>
        </>
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

  // Gate 2 — human review of screening report or direct interview approval
  if (c.interviewApproval === 'pending' || c.stage === 'human_review' || c.stage === 'screening_completed') {
    return (
      <>
        <Button variant="ghost" size="sm" icon={<PauseCircle className="size-3.5" />} onClick={() => onHold('interview')} disabled={busy}>
          Keep on Hold
        </Button>
        <Button variant="outline" size="sm" icon={<XCircle className="size-3.5" />} onClick={() => onReject('interview')} disabled={busy}>
          Reject
        </Button>
        <Button size="sm" icon={<CheckCircle2 className="size-3.5" />} onClick={onApproveInterview} loading={busy}>
          Approve for Interview
        </Button>
      </>
    )
  }

  if (c.stage === 'interview_approved' || c.interviewApproval === 'approved') {
    return (
      <Button size="sm" icon={<Calendar className="size-3.5" />} onClick={onScheduleInterview}>
        Schedule Interview
      </Button>
    )
  }

  if (c.stage === 'interview_scheduled') {
    return (
      <Link to={`/app/employees/hr/interviews/${c.id}`}>
        <Button size="sm" variant="outline" icon={<Video className="size-3.5" />}>
          View Interview Details
        </Button>
      </Link>
    )
  }

  return null
}
