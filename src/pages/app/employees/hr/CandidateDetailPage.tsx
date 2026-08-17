import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FlaskConical,
  FileText,
  MessageSquareText,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useCandidate, useInterview, useJob } from '@/hooks/useHr'
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
import { EvidenceCard } from '@/components/employees/hr/EvidenceCard'
import { CandidateScoreCard } from '@/components/employees/hr/CandidateScoreCard'
import { CANDIDATE_STAGE_LABEL } from '@/types'
import { formatDate, formatDateTime } from '@/utils/format'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'resume', label: 'Resume Evidence' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'AI Interview' },
  { value: 'feedback', label: 'Human Feedback' },
  { value: 'timeline', label: 'Timeline' },
]

export default function CandidateDetailPage() {
  const { id = '' } = useParams()
  const candidate = useCandidate(id)
  const job = useJob(candidate.data?.jobId ?? '')
  const interview = useInterview(id)
  const [tab, setTab] = useState('overview')
  const [feedbackDraft, setFeedbackDraft] = useState('')

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

  const timelineEntries: TimelineEntry[] = [
    { id: 'tl1', title: `Applied via ${c.source.replace('_', ' ')}`, timestamp: formatDateTime(c.appliedAt), iconTone: 'neutral' },
    ...(c.resumeEvidence.length > 0 ? [{ id: 'tl2', title: 'AI resume screening completed', description: `Overall score ${c.overallScore}/100`, timestamp: formatDateTime(c.appliedAt), iconTone: 'brand' as const }] : []),
    ...(interview.data ? [{ id: 'tl3', title: 'AI interview ' + (interview.data.status === 'completed' ? 'completed' : 'started'), timestamp: formatDateTime(interview.data.completedAt ?? c.appliedAt), iconTone: 'brand' as const }] : []),
    ...(c.stage === 'human_interview' || c.stage === 'selected' ? [{ id: 'tl4', title: 'Moved to human interview', timestamp: formatDateTime(c.appliedAt), iconTone: 'warning' as const }] : []),
    ...(c.stage === 'selected' ? [{ id: 'tl5', title: 'Candidate selected', timestamp: formatDateTime(c.appliedAt), iconTone: 'success' as const }] : []),
    ...(c.stage === 'rejected' ? [{ id: 'tl5', title: 'Candidate rejected', timestamp: formatDateTime(c.appliedAt), iconTone: 'danger' as const }] : []),
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
            <span className="flex items-center gap-1.5 text-xs text-ink-500"><Calendar className="size-3.5" />Applied {formatDate(c.appliedAt)}</span>
          </>
        }
        actions={
          <>
            <Link to={`/app/employees/hr/schedule?candidate=${c.id}`}>
              <Button variant="outline" size="sm" icon={<Calendar className="size-3.5" />}>
                Schedule Interview
              </Button>
            </Link>
            <Button variant="outline" size="sm" icon={<XCircle className="size-3.5" />}>
              Reject
            </Button>
            <Button size="sm" icon={<CheckCircle2 className="size-3.5" />}>
              Advance Stage
            </Button>
          </>
        }
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
          <div className="lg:col-span-2">
            <Card>
              <CardHeader title="Resume Summary" />
              <CardBody>
                <p className="text-[13.5px] leading-relaxed text-ink-700">{c.resumeSummary}</p>
              </CardBody>
            </Card>
          </div>
          <CandidateScoreCard overallScore={c.overallScore} evidence={c.resumeEvidence} />
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

      {tab === 'interview' && (
        <div className="space-y-4">
          {interview.loading ? (
            <Skeleton className="h-48 w-full" />
          ) : !interview.data ? (
            <EmptyState
              icon={<FlaskConical className="size-6" />}
              title="AI interview not started"
              description="Once the candidate is shortlisted, the AI HR Employee will conduct a structured interview here."
              action={
                <Link to="/app/employees/hr/interview">
                  <Button icon={<FlaskConical className="size-4" />}>Start AI Interview</Button>
                </Link>
              }
            />
          ) : !interview.data.report ? (
            <EmptyState
              icon={<FlaskConical className="size-6" />}
              title="Interview in progress"
              description="This candidate's AI interview has not finished yet."
              action={
                <Link to="/app/employees/hr/interview">
                  <Button icon={<FlaskConical className="size-4" />}>Open Live Interview</Button>
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
                <CardHeader title="Interview Summary" />
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
                <CardBody className="max-h-80 space-y-3 overflow-y-auto">
                  {interview.data.transcript.map((t) => (
                    <div key={t.id} className={t.speaker === 'ai' ? 'text-left' : 'text-right'}>
                      <span className={`inline-block max-w-[80%] rounded-xl px-3.5 py-2 text-[13px] ${t.speaker === 'ai' ? 'bg-ink-100 text-ink-800' : 'bg-brand-600 text-white'}`}>
                        {t.text}
                      </span>
                    </div>
                  ))}
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
              <p className="mt-2 text-[13px] text-ink-600">Strong communicator in the AI interview transcript — recommend moving forward to the panel round.</p>
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
    </div>
  )
}
