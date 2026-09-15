import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, CalendarClock, Video, Users, MailCheck, MailX } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useCandidate, useInterview, useJob } from '@/hooks/useHr'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import type { ScreeningResultSummary } from '@/types'
import { formatDate, formatDateTime } from '@/utils/format'

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

export default function InterviewDetailPage() {
  const { candidateId = '' } = useParams()
  const candidate = useCandidate(candidateId)
  const job = useJob(candidate.data?.jobId ?? '')
  const interview = useInterview(candidateId)

  useSetBreadcrumbs(
    [
      { label: 'AI Employees', href: '/app/employees' },
      { label: 'Jexa HR', href: '/app/employees/hr' },
      { label: 'Interviews', href: '/app/employees/hr/interviews' },
      { label: candidate.data?.name ?? '…' },
    ],
    [candidate.data?.name],
  )

  if (candidate.loading || interview.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (candidate.error || !candidate.data) {
    return <ErrorState title="Could not load candidate" onRetry={candidate.refetch} />
  }

  const c = candidate.data
  const result = interview.data?.screeningResult
  const panelists = interview.data?.panelists ?? []

  return (
    <div className="space-y-5">
      <Link to="/app/employees/hr/interviews" className="flex items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" />
        Back to interviews
      </Link>

      <PageHeader
        title={c.name}
        description="Human interview details — candidate background, panel and the AI screening report."
        icon={<Avatar name={c.name} size="lg" />}
        meta={
          <>
            <span className="flex items-center gap-1.5 text-xs text-ink-500"><Mail className="size-3.5" />{c.email}</span>
            {c.phone && <span className="flex items-center gap-1.5 text-xs text-ink-500"><Phone className="size-3.5" />{c.phone}</span>}
            {c.location && <span className="flex items-center gap-1.5 text-xs text-ink-500"><MapPin className="size-3.5" />{c.location}</span>}
          </>
        }
      />

      {!interview.data?.scheduledHumanInterviewAt ? (
        <EmptyState icon={<CalendarClock className="size-6" />} title="Not scheduled yet" description="No human interview has been booked for this candidate yet." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader title="Candidate Background" />
              <CardBody className="space-y-2.5">
                <Row label="Previous / Current Role" value={c.currentTitle} />
                <Row label="Role Applied For" value={job.data?.title} />
                <Row label="Experience" value={c.yearsExperience ? `${c.yearsExperience} years` : undefined} />
                <Row label="Location" value={c.location} />
                {c.resumeSummary && (
                  <div className="border-t border-ink-100 pt-2.5">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-400">Resume Summary</p>
                    <p className="text-[13px] leading-relaxed text-ink-700">{c.resumeSummary}</p>
                  </div>
                )}
              </CardBody>
            </Card>

            {result && (
              <Card>
                <CardHeader title="AI Screening Report" description="Advisory only — human review required." />
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
                    <Row label="Current Role (per call)" value={result.currentRole} />
                    <Row label="Total Experience" value={result.totalExperience} />
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
                </CardBody>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader title="Interview Schedule" />
              <CardBody className="space-y-2.5 text-[13px]">
                <Row label="Date" value={formatDate(interview.data.scheduledHumanInterviewAt, 'EEEE, MMM d, yyyy')} />
                <Row label="Time" value={formatDateTime(interview.data.scheduledHumanInterviewAt)} />
                <div className="flex items-center justify-between border-b border-ink-100 pb-2.5 last:border-0">
                  <span className="text-ink-500">Meeting</span>
                  {interview.data.meetingLink ? (
                    <a
                      href={`https://${interview.data.meetingLink}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 font-medium text-brand-600 hover:text-brand-700"
                    >
                      <Video className="size-3.5" />
                      Join Link
                    </a>
                  ) : (
                    <span className="text-right text-ink-400 italic">Not created</span>
                  )}
                </div>
                <div className="border-t border-ink-100 pt-2.5">
                  {interview.data.candidateNotifiedAt ? (
                    <p className="flex items-center gap-2 text-success-700"><MailCheck className="size-3.5" /> Candidate notified</p>
                  ) : (
                    <p className="flex items-center gap-2 text-ink-500"><MailX className="size-3.5" /> Candidate not notified</p>
                  )}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Interview Panel" description={<span className="flex items-center gap-1.5"><Users className="size-3.5" />{panelists.length} panelist{panelists.length === 1 ? '' : 's'}</span>} />
              <CardBody className="space-y-2">
                {panelists.length === 0 ? (
                  <p className="text-[13px] text-ink-500">No panel members were added for this interview.</p>
                ) : (
                  panelists.map((p) => (
                    <div key={p.email} className="flex items-center justify-between gap-2 border-b border-ink-100 pb-2 text-[13px] last:border-0">
                      <span className="min-w-0 truncate text-ink-800">{p.name || p.email}</span>
                      {p.notifiedAt ? (
                        <span className="flex shrink-0 items-center gap-1 text-success-700"><MailCheck className="size-3.5" /> Notified</span>
                      ) : (
                        <span className="flex shrink-0 items-center gap-1 text-ink-400"><MailX className="size-3.5" /> Not notified</span>
                      )}
                    </div>
                  ))
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Role" />
              <CardBody className="space-y-2">
                <span className="flex items-center gap-1.5 text-[13px] text-ink-700">
                  <Briefcase className="size-3.5 text-ink-400" />
                  {job.data?.title ?? '—'}
                </span>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink-100 pb-2.5 last:border-0">
      <span className="shrink-0 text-ink-500">{label}</span>
      {value ? (
        <span className="text-right font-medium text-ink-900">{value}</span>
      ) : (
        <span className="text-right text-ink-400 italic">Not provided</span>
      )}
    </div>
  )
}
