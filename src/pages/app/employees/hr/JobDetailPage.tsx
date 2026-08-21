import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Briefcase, MapPin, Upload, Users, ClipboardList, CheckCircle2, ChevronRight } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useCandidates, useJob, useRubric } from '@/hooks/useHr'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { ScoreRing } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { CANDIDATE_STAGE_LABEL } from '@/types'
import type { JobStatus } from '@/types'
import { formatDate } from '@/utils/format'

const STATUS_TONE: Record<JobStatus, BadgeTone> = { draft: 'neutral', open: 'success', paused: 'warning', closed: 'danger' }
const STATUS_LABEL: Record<JobStatus, string> = { draft: 'Draft', open: 'Open', paused: 'Paused', closed: 'Closed' }

export default function JobDetailPage() {
  const { id = '' } = useParams()
  const job = useJob(id)
  const rubric = useRubric(id)
  const candidates = useCandidates({ jobId: id })

  useSetBreadcrumbs(
    [
      { label: 'AI Employees', href: '/app/employees' },
      { label: 'Aivra Hr', href: '/app/employees/hr' },
      { label: 'Jobs', href: '/app/employees/hr/jobs' },
      { label: job.data?.title ?? '…' },
    ],
    [job.data?.title],
  )

  if (job.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
  if (job.error || !job.data) {
    return <ErrorState title="Could not load job" onRetry={job.refetch} />
  }

  const j = job.data
  const candidateData = candidates.data ?? []
  const awaitingReview = candidateData.filter((c) => c.screeningApproval === 'pending').length
  const inScreening = candidateData.filter((c) => c.stage === 'screening_approved' || c.stage === 'ai_screening').length
  const interviewsScheduled = candidateData.filter((c) => c.stage === 'interview_scheduled').length
  const completed = candidateData.filter((c) => c.stage === 'completed').length

  return (
    <div className="space-y-5">
      <Link to="/app/employees/hr/jobs" className="flex items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" />
        Back to jobs
      </Link>

      <PageHeader
        icon={<Briefcase className="size-5" />}
        title={
          <span className="flex items-center gap-3">
            {j.title}
            <Badge tone={STATUS_TONE[j.status]} dot>{STATUS_LABEL[j.status]}</Badge>
          </span>
        }
        description={`${j.department} · ${j.experienceLevel}`}
        meta={
          <span className="flex items-center gap-1.5 text-xs text-ink-500">
            <MapPin className="size-3.5" />
            {j.location}
          </span>
        }
        actions={
          <Link to={`/app/employees/hr/candidates/upload?job=${j.id}`}>
            <Button icon={<Upload className="size-4" />}>Upload Resumes</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Candidates" value={candidateData.length} icon={<Users className="size-4" />} />
        <StatCard label="Awaiting Review" value={awaitingReview} icon={<ClipboardList className="size-4" />} />
        <StatCard label="In Screening" value={inScreening} icon={<ClipboardList className="size-4" />} />
        <StatCard label="Interviews Scheduled" value={interviewsScheduled} icon={<CheckCircle2 className="size-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Job Description" />
            <CardBody>
              <p className="text-[13.5px] leading-relaxed text-ink-700">{j.description}</p>
            </CardBody>
          </Card>

          {j.requirements.length > 0 && (
            <Card>
              <CardHeader title="Requirements" />
              <CardBody>
                <ul className="space-y-1.5">
                  {j.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13.5px] text-ink-700">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand-600" />
                      {r}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Candidates" description={`${candidateData.length} total, ${completed} completed`} actions={
              <Link to={`/app/employees/hr/candidates?job=${j.id}`} className="flex items-center gap-1 text-[13px] font-medium text-brand-600 hover:text-brand-700">
                View in pipeline <ChevronRight className="size-3.5" />
              </Link>
            } />
            {candidates.loading ? (
              <CardBody><Skeleton className="h-32 w-full" /></CardBody>
            ) : candidateData.length === 0 ? (
              <CardBody>
                <EmptyState
                  compact
                  icon={<Upload className="size-6" />}
                  title="No candidates yet"
                  description="Upload resumes to start building this job's candidate pipeline."
                  action={
                    <Link to={`/app/employees/hr/candidates/upload?job=${j.id}`}>
                      <Button size="sm" icon={<Upload className="size-3.5" />}>Upload Resumes</Button>
                    </Link>
                  }
                />
              </CardBody>
            ) : (
              <div className="divide-y divide-ink-100">
                {candidateData.slice(0, 8).map((c) => (
                  <Link key={c.id} to={`/app/employees/hr/candidates/${c.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ink-25">
                    <Avatar name={c.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-ink-800">{c.name}</p>
                      <p className="truncate text-xs text-ink-500">{c.currentTitle}</p>
                    </div>
                    <Badge tone="neutral">{CANDIDATE_STAGE_LABEL[c.stage]}</Badge>
                    {c.overallScore !== null && <ScoreRing value={c.overallScore} size={32} />}
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          {j.requiredSkills.length > 0 && (
            <Card>
              <CardHeader title="Required Skills" />
              <CardBody className="flex flex-wrap gap-1.5">
                {j.requiredSkills.map((s) => (
                  <Badge key={s} tone="brand">{s}</Badge>
                ))}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Evaluation Criteria" description="Used to score AI screening calls" />
            <CardBody className="space-y-2">
              {rubric.loading ? (
                <Skeleton className="h-24 w-full" />
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
            <CardBody className="space-y-1.5 text-[13px] text-ink-500">
              <p>Company: <span className="font-medium text-ink-800">{j.companyName || '—'}</span></p>
              <p>AI Agent Name: <span className="font-medium text-ink-800">{j.aiAgentName || 'Zara'}</span></p>
              <p>Employment type: <span className="font-medium text-ink-800">{j.employmentType.replace('_', ' ')}</span></p>
              <p>Created: <span className="font-medium text-ink-800">{formatDate(j.createdAt)}</span></p>
              {j.openSince && <p>Open since: <span className="font-medium text-ink-800">{formatDate(j.openSince)}</span></p>}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-ink-500">{label}</span>
        <span className="flex size-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
      </div>
      <p className="mt-2 text-[22px] font-bold leading-none text-ink-900">{value}</p>
    </div>
  )
}
