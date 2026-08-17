import { Link } from 'react-router-dom'
import { BarChart3, ArrowUpRight, Users, ScanSearch, PhoneCall, CalendarClock, TrendingDown } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useCandidates, useJobs } from '@/hooks/useHr'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { KpiCard } from '@/components/ui/KpiCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { HrSubNav } from '@/components/employees/hr/HrSubNav'

export default function ReportsPage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'AI HR Employee', href: '/app/employees/hr' }, { label: 'Reports' }])
  const candidates = useCandidates({})
  const jobs = useJobs()

  const loading = candidates.loading || jobs.loading
  const data = candidates.data ?? []
  const screened = data.filter((c) => c.overallScore !== null).length
  const inScreening = data.filter((c) => c.stage === 'ai_screening' || c.stage === 'screening_approved').length
  const scheduled = data.filter((c) => c.stage === 'interview_scheduled').length
  const conversion = data.length ? Math.round((data.filter((c) => c.stage === 'completed').length / data.length) * 100) : 0

  return (
    <div className="space-y-5">
      <PageHeader icon={<BarChart3 className="size-5" />} title="Reports" description="A quick read on hiring throughput across all jobs." />
      <HrSubNav />

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px] rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Resumes Screened" value={String(screened)} icon={<ScanSearch className="size-4" />} tooltip="Candidates whose resumes have been analyzed and matched." />
          <KpiCard label="In AI Screening" value={String(inScreening)} icon={<PhoneCall className="size-4" />} tooltip="Candidates approved for or currently in an AI screening call." />
          <KpiCard label="Interviews Scheduled" value={String(scheduled)} icon={<CalendarClock className="size-4" />} tooltip="Human interviews currently booked." />
          <KpiCard label="Funnel Conversion" value={`${conversion}%`} icon={<TrendingDown className="size-4" />} tooltip="Share of all candidates who reached Completed." />
        </div>
      )}

      <Card>
        <CardHeader
          title="Full HR Analytics"
          description="Funnel breakdowns, time-to-screen and per-job performance"
          actions={
            <Link to="/app/analytics?tab=hr">
              <Button size="sm" variant="outline" iconRight={<ArrowUpRight className="size-3.5" />}>
                Open Analytics
              </Button>
            </Link>
          }
        />
        <CardBody className="flex items-center gap-3 text-[13px] text-ink-600">
          <Users className="size-4 shrink-0 text-ink-400" />
          Detailed charts for candidate funnels, screening completion and time-to-screen live in Analytics → HR.
        </CardBody>
      </Card>
    </div>
  )
}
