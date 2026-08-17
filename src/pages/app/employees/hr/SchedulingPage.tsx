import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendarClock, RefreshCw, PlugZap, CheckCircle2, ArrowLeft, Globe2, Video, Users, MailCheck } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useCandidate, useCandidates, useHrConfig, useInterview, useScheduleSlots } from '@/hooks/useHr'
import { hrService } from '@/services/api'
import { useToast } from '@/hooks/useToast'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { HrSubNav } from '@/components/employees/hr/HrSubNav'
import { CalendarSlotCard } from '@/components/employees/hr/CalendarSlotCard'
import type { ScheduleSlot } from '@/types'
import { formatDate } from '@/utils/format'

export default function SchedulingPage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'AI HR Employee', href: '/app/employees/hr' }, { label: 'Scheduling' }])
  const [params] = useSearchParams()
  const candidateId = params.get('candidate')

  if (!candidateId) return <SchedulingHub />
  return <CandidateScheduling candidateId={candidateId} />
}

function SchedulingHub() {
  const candidates = useCandidates({ stage: 'interview_approved' })
  const scheduled = useCandidates({ stage: 'interview_scheduled' })

  return (
    <div className="space-y-5">
      <PageHeader icon={<CalendarClock className="size-5" />} title="Scheduling" description="Book human interviews for candidates approved after AI screening." />
      <HrSubNav />

      <Card>
        <CardHeader title="Ready to Schedule" description="Approved for human interview, no slot booked yet" />
        {candidates.loading ? (
          <CardBody><Skeleton className="h-32 w-full" /></CardBody>
        ) : (candidates.data ?? []).length === 0 ? (
          <CardBody>
            <EmptyState compact icon={<CalendarClock className="size-6" />} title="Nothing to schedule" description="Candidates approved for a human interview will appear here." />
          </CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {candidates.data?.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                <Avatar name={c.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-ink-800">{c.name}</p>
                  <p className="truncate text-xs text-ink-500">{c.currentTitle}</p>
                </div>
                <Link to={`/app/employees/hr/schedule?candidate=${c.id}`}>
                  <Button size="sm" icon={<CalendarClock className="size-3.5" />}>Schedule</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Already Scheduled" />
        {scheduled.loading ? (
          <CardBody><Skeleton className="h-24 w-full" /></CardBody>
        ) : (scheduled.data ?? []).length === 0 ? (
          <CardBody>
            <p className="text-sm text-ink-500">No interviews scheduled yet.</p>
          </CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {scheduled.data?.map((c) => (
              <Link key={c.id} to={`/app/employees/hr/schedule?candidate=${c.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-ink-25">
                <Avatar name={c.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-ink-800">{c.name}</p>
                  <p className="truncate text-xs text-ink-500">{c.currentTitle}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function CandidateScheduling({ candidateId }: { candidateId: string }) {
  const candidate = useCandidate(candidateId)
  const interview = useInterview(candidateId)
  const config = useHrConfig()
  const slots = useScheduleSlots()
  const { show } = useToast()

  const [calendarReady, setCalendarReady] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const [selected, setSelected] = useState<ScheduleSlot | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState<ScheduleSlot | null>(null)

  const calendarConnected = calendarReady || config.data?.calendarConnected
  const alreadyScheduled = interview.data?.scheduledHumanInterviewAt

  function handleReconnect() {
    setReconnecting(true)
    window.setTimeout(() => {
      setReconnecting(false)
      setCalendarReady(true)
      show({ tone: 'success', title: 'Calendar reconnected', description: 'Google Calendar access has been restored.' })
    }, 1200)
  }

  async function handleConfirm() {
    if (!selected) return
    setConfirming(true)
    setBookingError(null)
    const result = await hrService.bookSlot(selected.id, candidateId)
    setConfirming(false)
    if (result.success) {
      setConfirmed(selected)
      setSelected(null)
      slots.refetch()
      interview.refetch()
      candidate.refetch()
    } else {
      setBookingError('This slot was just taken by another interviewer. Please choose an alternative slot below.')
      setSelected(null)
      slots.refetch()
    }
  }

  return (
    <div className="space-y-5">
      <Link to={`/app/employees/hr/candidates/${candidateId}`} className="flex items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" />
        Back to candidate
      </Link>

      <PageHeader icon={<CalendarClock className="size-5" />} title="Interview Scheduling" description="Book a human interview slot with the hiring team." />

      {candidate.loading ? (
        <Skeleton className="h-16 w-full" />
      ) : candidate.error || !candidate.data ? (
        <ErrorState title="Could not load candidate" onRetry={candidate.refetch} />
      ) : (
        <Card>
          <CardBody className="flex items-center gap-3">
            <Avatar name={candidate.data.name} size="md" />
            <div>
              <p className="text-[13.5px] font-semibold text-ink-900">{candidate.data.name}</p>
              <p className="text-xs text-ink-500">{candidate.data.currentTitle}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {(alreadyScheduled || confirmed) && (
        <Card>
          <CardHeader title="Interview Scheduled" />
          <CardBody className="space-y-3">
            <div className="flex items-center gap-2 text-[13px] text-success-700">
              <CheckCircle2 className="size-4" />
              Confirmed for {formatDate(confirmed?.startTime ?? interview.data?.scheduledHumanInterviewAt ?? '', 'EEEE, MMM d, yyyy · h:mm a')}
            </div>
            <div className="space-y-1.5 text-[13px]">
              <p className="flex items-center gap-2 text-ink-700">
                <Video className="size-3.5 text-ink-400" />
                Google Meet: <span className="font-medium text-brand-600">{interview.data?.meetingLink ?? 'Generating…'}</span>
              </p>
              <p className="flex items-center gap-2 text-ink-700">
                <Users className="size-3.5 text-ink-400" />
                Interviewer: <span className="font-medium">{interview.data?.scheduledInterviewer ?? confirmed?.interviewerName}</span>
              </p>
            </div>
            <div className="space-y-1 border-t border-ink-100 pt-3 text-[13px]">
              <p className="flex items-center gap-2 text-success-700"><MailCheck className="size-3.5" /> Candidate notified ✓</p>
              <p className="flex items-center gap-2 text-success-700"><MailCheck className="size-3.5" /> HR notified ✓</p>
              <p className="flex items-center gap-2 text-success-700"><CheckCircle2 className="size-3.5" /> Calendar event created ✓</p>
            </div>
          </CardBody>
        </Card>
      )}

      {!config.loading && !calendarConnected && (
        <ErrorState
          variant="error"
          title="Calendar integration expired"
          description="Google Calendar access expired for the hiring team. Reconnect to load live interviewer availability."
          onRetry={handleReconnect}
          compact
        />
      )}
      {reconnecting && (
        <div className="flex items-center gap-2 text-[13px] text-ink-500">
          <RefreshCw className="size-3.5 animate-spin" />
          Reconnecting to Google Calendar…
        </div>
      )}

      {bookingError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-[13px] text-danger-700">
          <PlugZap className="mt-0.5 size-4 shrink-0" />
          {bookingError}
        </div>
      )}

      {!alreadyScheduled && !confirmed && (
        <Card className={!calendarConnected ? 'pointer-events-none opacity-50' : ''}>
          <CardHeader
            title="Available Slots"
            description="Times shown in the hiring team's timezone"
            actions={
              <span className="flex items-center gap-1.5 text-xs text-ink-500">
                <Globe2 className="size-3.5" />
                Asia/Kolkata (IST)
              </span>
            }
          />
          <CardBody>
            {slots.loading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {slots.data?.map((slot) => (
                  <CalendarSlotCard key={slot.id} slot={slot} selected={selected?.id === slot.id} onSelect={setSelected} />
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Confirm interview"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)} disabled={confirming}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} loading={confirming}>
              Confirm & Send Invite
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-3 text-[13.5px]">
            <Row label="Candidate" value={candidate.data?.name ?? '—'} />
            <Row label="Interviewer" value={selected.interviewerName} />
            <Row label="Date" value={formatDate(selected.startTime, 'EEEE, MMM d, yyyy')} />
            <Row
              label="Time"
              value={`${new Date(selected.startTime).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })} (${selected.timezone})`}
            />
            <Row label="Duration" value="45 minutes" />
            <Row label="Meeting" value="Google Meet (auto-generated)" />
          </div>
        )}
      </Modal>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 pb-2.5 last:border-0">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  )
}
