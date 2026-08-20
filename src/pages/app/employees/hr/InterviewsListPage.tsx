import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck2, Video, Calendar as CalendarIcon, Eye } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useInterviewsList, useJobs } from '@/hooks/useHr'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { HrSubNav } from '@/components/employees/hr/HrSubNav'
import { ScheduleInterviewModal } from '@/components/employees/hr/ScheduleInterviewModal'
import { CANDIDATE_STAGE_LABEL } from '@/types'
import type { Candidate, CandidateStage, Interview } from '@/types'
import { formatDateTime } from '@/utils/format'

const STAGE_TONE: Record<CandidateStage, BadgeTone> = {
  uploaded: 'neutral', processing: 'neutral', analyzed: 'neutral', hr_review: 'warning',
  screening_approved: 'info', ai_screening: 'info', screening_completed: 'info', human_review: 'warning',
  interview_approved: 'brand', interview_scheduled: 'success', completed: 'success', rejected: 'danger', on_hold: 'warning',
}

export default function InterviewsListPage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'AI HR Employee', href: '/app/employees/hr' }, { label: 'Interviews' }])
  const interviews = useInterviewsList()
  const jobs = useJobs()
  const [scheduleFor, setScheduleFor] = useState<Candidate | null>(null)

  const columns: DataTableColumn<{ candidate: Candidate; interview?: Interview }>[] = [
    {
      key: 'candidate',
      header: 'Candidate',
      render: ({ candidate: c }) => (
        <Link to={`/app/employees/hr/candidates/${c.id}`} className="flex items-center gap-2.5">
          <Avatar name={c.name} size="sm" />
          <span className="min-w-0">
            <span className="block font-medium text-ink-900">{c.name}</span>
            <span className="block truncate text-xs text-ink-500">{c.currentTitle}</span>
          </span>
        </Link>
      ),
    },
    {
      key: 'job',
      header: 'Job',
      render: ({ candidate: c }) => <span className="text-[13px] text-ink-600">{jobs.data?.find((j) => j.id === c.jobId)?.title ?? '—'}</span>,
    },
    { key: 'stage', header: 'Status', render: ({ candidate: c }) => <Badge tone={STAGE_TONE[c.stage]}>{CANDIDATE_STAGE_LABEL[c.stage]}</Badge> },
    {
      key: 'interviewer',
      header: 'Interviewer',
      render: ({ interview }) => <span className="text-[13px] text-ink-600">{interview?.scheduledInterviewer ?? '—'}</span>,
    },
    {
      key: 'when',
      header: 'Date & Time',
      render: ({ interview }) => (
        <span className="flex items-center gap-1.5 text-[13px] text-ink-600">
          <CalendarIcon className="size-3.5 text-ink-400" />
          {interview?.scheduledHumanInterviewAt ? formatDateTime(interview.scheduledHumanInterviewAt) : 'Not scheduled'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: ({ candidate: c, interview }) => {
        if (interview?.scheduledHumanInterviewAt) {
          return (
            <div className="flex items-center gap-2">
              <Link to={`/app/employees/hr/interviews/${c.id}`}>
                <Button size="sm" variant="outline" icon={<Eye className="size-3.5" />}>
                  View Details
                </Button>
              </Link>
              {interview.meetingLink && (
                <a href={`https://${interview.meetingLink}`} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="ghost" icon={<Video className="size-3.5" />}>
                    Join
                  </Button>
                </a>
              )}
            </div>
          )
        }
        return (
          <Button size="sm" icon={<CalendarIcon className="size-3.5" />} onClick={() => setScheduleFor(c)}>
            Schedule
          </Button>
        )
      },
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader icon={<CalendarCheck2 className="size-5" />} title="Interviews" description="Human interviews approved, scheduled or completed." />
      <HrSubNav />
      <DataTable
        columns={columns}
        data={interviews.data ?? []}
        keyExtractor={(row) => row.candidate.id}
        loading={interviews.loading}
        emptyState={
          <EmptyState
            icon={<CalendarCheck2 className="size-6" />}
            title="No interviews yet"
            description="Approve a candidate for a human interview after AI screening to see it here."
          />
        }
      />

      <ScheduleInterviewModal
        open={Boolean(scheduleFor)}
        onClose={() => setScheduleFor(null)}
        candidateId={scheduleFor?.id ?? ''}
        candidateName={scheduleFor?.name ?? ''}
        onScheduled={() => interviews.refetch()}
      />
    </div>
  )
}
