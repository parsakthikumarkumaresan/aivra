import { Link } from 'react-router-dom'
import {
  Users,
  Pause,
  Settings2,
  Briefcase,
  ChevronRight,
  Plus,
  Upload,
  ClipboardList,
  PhoneCall,
  CalendarClock,
  Sparkles,
  FileCheck2,
  UserCheck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useEmployeeByType } from '@/hooks/useEmployees'
import { useJobs, useCandidates } from '@/hooks/useHr'
import { useAppData } from '@/app/AppDataProvider'
import { useToast } from '@/hooks/useToast'
import { subscriptionService } from '@/services/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmployeeStatusBadge } from '@/components/ui/StatusBadge'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Skeleton, SkeletonTable } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { HrSubNav } from '@/components/employees/hr/HrSubNav'
import { CANDIDATE_STAGE_LABEL } from '@/types'
import type { Candidate, Job } from '@/types'
import { formatRelativeTime } from '@/utils/format'

export default function HrOverviewPage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'Jexa HR' }])
  const employee = useEmployeeByType('hr')
  const jobs = useJobs()
  const candidates = useCandidates({})
  const { refetchEmployees } = useAppData()
  const { show } = useToast()
  const navigate = useNavigate()

  async function pauseEmployee() {
    await subscriptionService.pauseSubscription('hr')
    refetchEmployees()
    show({ tone: 'success', title: 'Jexa HR paused', description: 'It will stop taking new work immediately.' })
    navigate('/app/employees/hr')
  }

  const loading = jobs.loading || candidates.loading
  const jobData = jobs.data ?? []
  const candidateData = candidates.data ?? []

  const openJobs = jobData.filter((j) => j.status === 'open')
  const awaitingHrReview = candidateData.filter((c) => c.screeningApproval === 'pending')
  const aiScreenings = candidateData.filter((c) => c.stage === 'ai_screening' || c.stage === 'screening_approved')
  const interviewsScheduled = candidateData.filter((c) => c.stage === 'interview_scheduled')
  const reportsAwaitingReview = candidateData.filter((c) => c.stage === 'human_review')
  const readyToSchedule = candidateData.filter((c) => c.stage === 'interview_approved')

  const recentCandidates = [...candidateData].sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt)).slice(0, 6)

  function jobStats(job: Job) {
    const forJob = candidateData.filter((c) => c.jobId === job.id)
    return {
      total: forJob.length,
      awaitingReview: forJob.filter((c) => c.screeningApproval === 'pending').length,
      screeningApproved: forJob.filter((c) => c.stage === 'screening_approved' || c.stage === 'ai_screening').length,
      interviewsScheduled: forJob.filter((c) => c.stage === 'interview_scheduled').length,
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        icon={<Users className="size-5" />}
        title={
          <span className="flex items-center gap-2.5">
            Jexa HR
            {employee.data && <EmployeeStatusBadge status={employee.data.status} />}
          </span>
        }
        description="Helps your HR team screen candidates, conduct initial AI interviews and schedule human interviews."
        meta={employee.data && <span className="text-xs text-ink-400">Last active {formatRelativeTime(employee.data.lastActivityAt)}</span>}
        actions={
          <>
            <Link to="/app/employees/hr/jobs?new=1">
              <Button icon={<Plus className="size-4" />}>Create Job</Button>
            </Link>
            <Link to="/app/employees/hr/candidates/upload">
              <Button variant="outline" icon={<Upload className="size-4" />}>
                Upload Resumes
              </Button>
            </Link>
            <Link to="/app/employees/hr/configuration">
              <Button variant="ghost" icon={<Settings2 className="size-4" />}>
                Configure
              </Button>
            </Link>
            <Button variant="ghost" icon={<Pause className="size-4" />} onClick={pauseEmployee}>
              Pause
            </Button>
          </>
        }
      />

      <HrSubNav />

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard label="Open Jobs" value={String(openJobs.length)} icon={<Briefcase className="size-4" />} tooltip="Jobs currently open and accepting resumes." />
          <KpiCard label="Candidates" value={String(candidateData.length)} icon={<Users className="size-4" />} tooltip="Total candidates uploaded across all jobs." />
          <KpiCard label="Awaiting HR Review" value={String(awaitingHrReview.length)} icon={<ClipboardList className="size-4" />} tooltip="Analyzed candidates waiting for HR to approve AI screening." trendGood="down" />
          <KpiCard label="AI Screenings" value={String(aiScreenings.length)} icon={<PhoneCall className="size-4" />} tooltip="Candidates approved for or currently in an AI screening call." />
          <KpiCard label="Interviews Scheduled" value={String(interviewsScheduled.length)} icon={<CalendarClock className="size-4" />} tooltip="Human interviews currently booked on the calendar." />
        </div>
      )}

      <Card>
        <CardHeader
          title="Active Jobs"
          description="Open requisitions and where their candidates stand"
          actions={
            <Link to="/app/employees/hr/jobs" className="flex items-center gap-1 text-[13px] font-medium text-brand-600 hover:text-brand-700">
              All jobs <ChevronRight className="size-3.5" />
            </Link>
          }
        />
        {loading ? (
          <CardBody>
            <Skeleton className="h-32 w-full" />
          </CardBody>
        ) : openJobs.length === 0 ? (
          <CardBody>
            <p className="text-sm text-ink-500">No open jobs yet.</p>
          </CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {openJobs.map((job) => {
              const stats = jobStats(job)
              return (
                <div key={job.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Briefcase className="size-4" />
                    </span>
                    <div>
                      <Link to={`/app/employees/hr/jobs/${job.id}`} className="text-[14px] font-semibold text-ink-900 hover:text-brand-700">
                        {job.title}
                      </Link>
                      <p className="text-xs text-ink-500">{job.department} · {job.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-ink-500 sm:gap-5">
                    <span><span className="font-semibold text-ink-800">{stats.total}</span> Candidates</span>
                    <span><span className="font-semibold text-ink-800">{stats.awaitingReview}</span> Awaiting Review</span>
                    <span><span className="font-semibold text-ink-800">{stats.screeningApproved}</span> Screening Approved</span>
                    <span><span className="font-semibold text-ink-800">{stats.interviewsScheduled}</span> Interviews Scheduled</span>
                  </div>
                  <Link to={`/app/employees/hr/jobs/${job.id}`}>
                    <Button size="sm" variant="outline">Open Job</Button>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Needs Your Attention" description="Human decisions Jexa HR is waiting on" />
        <CardBody className="space-y-1 p-2">
          <AttentionRow
            icon={<ClipboardList className="size-4" />}
            tone="warning"
            label={`${awaitingHrReview.length} candidate${awaitingHrReview.length === 1 ? '' : 's'} awaiting screening approval`}
            href="/app/employees/hr/candidates?stage=hr_review"
          />
          <AttentionRow
            icon={<FileCheck2 className="size-4" />}
            tone="brand"
            label={`${reportsAwaitingReview.length} screening report${reportsAwaitingReview.length === 1 ? '' : 's'} awaiting review`}
            href="/app/employees/hr/candidates?stage=human_review"
          />
          <AttentionRow
            icon={<UserCheck className="size-4" />}
            tone="success"
            label={`${readyToSchedule.length} candidate${readyToSchedule.length === 1 ? '' : 's'} ready to schedule`}
            href="/app/employees/hr/candidates?stage=interview_approved"
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Recent Candidates"
          description="Latest resumes across all jobs"
          actions={
            <Link to="/app/employees/hr/candidates" className="flex items-center gap-1 text-[13px] font-medium text-brand-600 hover:text-brand-700">
              View pipeline <ChevronRight className="size-3.5" />
            </Link>
          }
        />
        {candidates.loading ? (
          <SkeletonTable rows={5} cols={4} />
        ) : (
          <div className="divide-y divide-ink-100">
            {recentCandidates.map((c: Candidate) => (
              <Link key={c.id} to={`/app/employees/hr/candidates/${c.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ink-25">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-ink-800">{c.name}</p>
                  <p className="truncate text-xs text-ink-500">{c.currentTitle}</p>
                </div>
                <Badge tone="neutral">{CANDIDATE_STAGE_LABEL[c.stage]}</Badge>
                <span className="w-24 shrink-0 text-right text-xs text-ink-400">{formatRelativeTime(c.uploadedAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card className="border-brand-100 bg-brand-50/40">
        <CardBody className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-600" />
          <p className="text-[13px] leading-relaxed text-ink-700">
            AI-generated candidate assessments and screenings are evidence-backed recommendations.{' '}
            <span className="font-semibold">Final hiring decisions remain with authorized HR personnel.</span>
          </p>
        </CardBody>
      </Card>
    </div>
  )
}

function AttentionRow({ icon, tone, label, href }: { icon: React.ReactNode; tone: 'warning' | 'brand' | 'success'; label: string; href: string }) {
  const toneClasses = {
    warning: 'bg-warning-100 text-warning-600',
    brand: 'bg-brand-100 text-brand-600',
    success: 'bg-success-100 text-success-600',
  }
  return (
    <Link to={href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-ink-50">
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${toneClasses[tone]}`}>
        {icon}
      </span>
      <span className="text-[13.5px] font-medium text-ink-800">{label}</span>
      <ChevronRight className="ml-auto size-4 text-ink-300" />
    </Link>
  )
}
