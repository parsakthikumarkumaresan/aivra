import { Link, useNavigate } from 'react-router-dom'
import { PhoneCall, Clock, RefreshCw, Eye } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useJobs, useScreenings } from '@/hooks/useHr'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { HrSubNav } from '@/components/employees/hr/HrSubNav'
import type { Candidate, Interview, InterviewStatus } from '@/types'
import { formatDuration } from '@/utils/format'

const STATUS_LABEL: Record<InterviewStatus, string> = {
  not_started: 'Not Started',
  preparing: 'Preparing Call',
  calling: 'Calling',
  connected: 'Connected',
  in_progress: 'AI Screening in Progress',
  completed: 'Completed',
  failed: 'Failed',
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

export default function ScreeningsListPage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'Aivra Hr', href: '/app/employees/hr' }, { label: 'Screenings' }])
  const screenings = useScreenings()
  const jobs = useJobs()
  const navigate = useNavigate()

  function startScreening(candidate: Candidate) {
    // Prompt review/edit + the actual Start Screening action happen on the
    // screening detail page — never started sight-unseen from this list.
    navigate(`/app/employees/hr/screenings/${candidate.id}`)
  }

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
    {
      key: 'status',
      header: 'Call Status',
      render: ({ interview }) => <Badge tone={STATUS_TONE[interview?.status ?? 'not_started']} dot>{STATUS_LABEL[interview?.status ?? 'not_started']}</Badge>,
    },
    {
      key: 'duration',
      header: 'Duration',
      render: ({ interview }) => (
        <span className="flex items-center gap-1.5 text-[13px] text-ink-600">
          <Clock className="size-3.5 text-ink-400" />
          {interview?.durationMinutes ? formatDuration(interview.durationMinutes * 60) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: ({ candidate: c, interview }) => {
        if (!interview || interview.status === 'not_started') {
          return (
            <Button size="sm" icon={<PhoneCall className="size-3.5" />} onClick={() => startScreening(c)}>
              Start Screening
            </Button>
          )
        }
        if (interview.status === 'failed') {
          return (
            <Button size="sm" variant="outline" icon={<RefreshCw className="size-3.5" />} onClick={() => startScreening(c)}>
              Retry
            </Button>
          )
        }
        if (interview.status === 'completed') {
          return (
            <Link to={`/app/employees/hr/candidates/${c.id}`}>
              <Button size="sm" variant="outline" icon={<Eye className="size-3.5" />}>
                View Report
              </Button>
            </Link>
          )
        }
        return (
          <Link to={`/app/employees/hr/screenings/${c.id}`}>
            <Button size="sm" variant="outline" icon={<Eye className="size-3.5" />}>
              View Live Call
            </Button>
          </Link>
        )
      },
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader icon={<PhoneCall className="size-5" />} title="Screenings" description="AI voice screening calls for candidates approved by HR." />
      <HrSubNav />
      <DataTable
        columns={columns}
        data={screenings.data ?? []}
        keyExtractor={(row) => row.candidate.id}
        loading={screenings.loading}
        emptyState={
          <EmptyState
            icon={<PhoneCall className="size-6" />}
            title="No screenings yet"
            description="Approve a candidate for AI screening from the Candidates tab to see it here."
          />
        }
      />
    </div>
  )
}
