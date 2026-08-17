import { Link } from 'react-router-dom'
import { Users, FlaskConical, Pause, Settings2, Briefcase, ChevronRight, FileCheck2, CalendarClock, Sparkles } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useEmployeeByType } from '@/hooks/useEmployees'
import { useJobs, useCandidates, useHrConfig } from '@/hooks/useHr'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { EmployeeStatusBadge } from '@/components/ui/StatusBadge'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Skeleton, SkeletonTable } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { CANDIDATE_STAGE_LABEL } from '@/types'
import type { CandidateStage } from '@/types'
import { formatRelativeTime } from '@/utils/format'

const FUNNEL_STAGES: CandidateStage[] = ['applied', 'screening', 'shortlisted', 'ai_interview', 'human_interview', 'selected']

export default function HrOverviewPage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'AI HR Employee' }])
  const employee = useEmployeeByType('hr')
  const jobs = useJobs()
  const candidates = useCandidates({})
  const config = useHrConfig()

  const openJob = jobs.data?.find((j) => j.status === 'open')
  const recentCandidates = [...(candidates.data ?? [])].sort((a, b) => +new Date(b.appliedAt) - +new Date(a.appliedAt)).slice(0, 5)

  const funnelCounts = FUNNEL_STAGES.map((stage) => ({
    stage,
    count: candidates.data?.filter((c) => c.stage === stage).length ?? 0,
  }))
  const maxFunnel = Math.max(1, ...funnelCounts.map((f) => f.count))

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Users className="size-5" />}
        title={
          <span className="flex items-center gap-2.5">
            AI HR Employee
            {employee.data && <EmployeeStatusBadge status={employee.data.status} />}
          </span>
        }
        description="Screens candidates, conducts structured AI interviews and schedules human interviews."
        meta={employee.data && <span className="text-xs text-ink-400">Last active {formatRelativeTime(employee.data.lastActivityAt)}</span>}
        actions={
          <>
            <Link to="/app/employees/hr/setup">
              <Button variant="outline" icon={<Settings2 className="size-4" />}>
                Configure
              </Button>
            </Link>
            <Link to="/app/employees/hr/interview">
              <Button variant="outline" icon={<FlaskConical className="size-4" />}>
                Test Employee
              </Button>
            </Link>
            <Button variant="ghost" icon={<Pause className="size-4" />}>
              Pause
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Candidates Processed" value="184" icon={<Users className="size-4" />} trend={{ direction: 'up', value: '+12%' }} tooltip="Total candidates who have entered the pipeline for any job." />
        <KpiCard label="Screened" value="142" icon={<FileCheck2 className="size-4" />} trend={{ direction: 'up', value: '+9' }} tooltip="Candidates whose resumes have been evaluated against the job rubric." />
        <KpiCard label="Interviews Completed" value="37" icon={<FlaskConical className="size-4" />} trend={{ direction: 'up', value: '+5' }} tooltip="AI-led structured interviews completed and awaiting or past human review." />
        <KpiCard label="Interviews Scheduled" value="9" icon={<CalendarClock className="size-4" />} trend={{ direction: 'flat', value: '0' }} tooltip="Human interviews currently booked on the calendar." />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Current Job"
            description="Most active open requisition"
            actions={
              <Link to="/app/employees/hr/jobs" className="flex items-center gap-1 text-[13px] font-medium text-brand-600 hover:text-brand-700">
                All jobs <ChevronRight className="size-3.5" />
              </Link>
            }
          />
          <CardBody>
            {jobs.loading ? (
              <Skeleton className="h-24 w-full" />
            ) : openJob ? (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Briefcase className="size-4.5" />
                    </span>
                    <div>
                      <Link to="/app/employees/hr/jobs" className="text-[15px] font-semibold text-ink-900 hover:text-brand-700">
                        {openJob.title}
                      </Link>
                      <p className="text-[13px] text-ink-500">
                        {openJob.department} · {openJob.location}
                      </p>
                    </div>
                  </div>
                  <Badge tone="success" dot>
                    Open
                  </Badge>
                </div>
                <div className="mt-5">
                  <p className="mb-2 text-[13px] font-medium text-ink-600">Candidate Funnel</p>
                  <div className="space-y-2">
                    {funnelCounts.map((f) => (
                      <div key={f.stage} className="flex items-center gap-3">
                        <span className="w-32 shrink-0 text-xs text-ink-500">{CANDIDATE_STAGE_LABEL[f.stage]}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${(f.count / maxFunnel) * 100}%` }} />
                        </div>
                        <span className="w-5 shrink-0 text-right text-xs font-semibold text-ink-700">{f.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink-500">No open jobs yet.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Configuration" description="Current setup summary" />
          <CardBody className="space-y-3">
            {config.loading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <ConfigRow label="Rubric version" value={config.data?.rubricVersion ?? '—'} />
                <ConfigRow label="Interview template" value={config.data?.interviewTemplate ?? '—'} />
                <ConfigRow label="Calendar" value={config.data?.calendarConnected ? 'Connected' : 'Not connected'} tone={config.data?.calendarConnected ? 'success' : 'warning'} />
                <ConfigRow label="Notifications" value={config.data?.notificationsEnabled ? 'Enabled' : 'Disabled'} />
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Recent Candidates"
          description="Latest applicants across all jobs"
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
            {recentCandidates.map((c) => (
              <Link key={c.id} to={`/app/employees/hr/candidates/${c.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ink-25">
                <Avatar name={c.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-ink-800">{c.name}</p>
                  <p className="truncate text-xs text-ink-500">{c.currentTitle}</p>
                </div>
                <Badge tone="neutral">{CANDIDATE_STAGE_LABEL[c.stage]}</Badge>
                <span className="w-24 shrink-0 text-right text-xs text-ink-400">{formatRelativeTime(c.appliedAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card className="border-brand-100 bg-brand-50/40">
        <CardBody className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-600" />
          <p className="text-[13px] leading-relaxed text-ink-700">
            AI provides job-related evidence and recommendations. <span className="font-semibold">Final employment decisions remain with authorized humans.</span>
          </p>
        </CardBody>
      </Card>
    </div>
  )
}

function ConfigRow({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'warning' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-ink-500">{label}</span>
      {tone ? (
        <Badge tone={tone} dot>
          {value}
        </Badge>
      ) : (
        <span className="text-[13px] font-medium text-ink-800">{value}</span>
      )}
    </div>
  )
}
