import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendarClock, RefreshCw, PlugZap, CheckCircle2, ArrowLeft, Globe2 } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useCandidate, useHrConfig, useScheduleSlots } from '@/hooks/useHr'
import { hrService } from '@/services/api'
import { useToast } from '@/hooks/useToast'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { Modal } from '@/components/ui/Modal'
import { CalendarSlotCard } from '@/components/employees/hr/CalendarSlotCard'
import type { ScheduleSlot } from '@/types'
import { formatDate } from '@/utils/format'

export default function SchedulingPage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'AI HR Employee', href: '/app/employees/hr' }, { label: 'Scheduling' }])
  const [params] = useSearchParams()
  const candidateId = params.get('candidate') ?? 'cand_2'
  const candidate = useCandidate(candidateId)
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

      {candidate.data && (
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

      {confirmed && (
        <div className="flex items-start gap-2.5 rounded-xl border border-success-100 bg-success-50 px-4 py-3 text-[13px] text-success-700">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          Interview confirmed for {formatDate(confirmed.startTime, 'EEE, MMM d')} with {confirmed.interviewerName}. A calendar invite and notification have been sent to {candidate.data?.name ?? 'the candidate'}.
        </div>
      )}

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
