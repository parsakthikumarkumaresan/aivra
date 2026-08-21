import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useScheduleSlots } from '@/hooks/useHr'
import { useToast } from '@/hooks/useToast'
import { hrService } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Modal } from '@/components/ui/Modal'
import { Input, Label, Select } from '@/components/ui/Field'
import { formatDate } from '@/utils/format'

// Booking still requires a real slot server-side, and the candidate's own
// email is always derived from their identity by the backend — HR only
// ever supplies the interview panel here, never the candidate's email.
export function ScheduleInterviewModal({
  open,
  onClose,
  candidateId,
  candidateName,
  candidateEmail,
  onScheduled,
}: {
  open: boolean
  onClose: () => void
  candidateId: string
  candidateName: string
  candidateEmail?: string
  onScheduled: () => void
}) {
  const { show } = useToast()
  const slots = useScheduleSlots()
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [panelistEmails, setPanelistEmails] = useState<string[]>([''])
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedSlotId('')
      setPanelistEmails([''])
      slots.refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function updateEmail(index: number, value: string) {
    setPanelistEmails((prev) => prev.map((e, i) => (i === index ? value : e)))
  }
  function addEmailField() {
    setPanelistEmails((prev) => [...prev, ''])
  }
  function removeEmailField(index: number) {
    setPanelistEmails((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleBook() {
    if (!selectedSlotId) return
    setBooking(true)
    const emails = panelistEmails.map((e) => e.trim()).filter(Boolean)
    try {
      await hrService.approveForInterview(candidateId)
    } catch {
      // Ignored if already approved or in interview stage
    }
    const result = await hrService.bookSlot(selectedSlotId, candidateId, emails)
    setBooking(false)
    if (result.success) {
      if (result.candidateNotified !== false && result.panelistsNotified !== false) {
        show({ tone: 'success', title: 'Interview scheduled', description: `${candidateName} and panel members have been sent invitation emails.` })
      } else {
        show({
          tone: 'warning',
          title: 'Interview scheduled (Email Warning)',
          description: 'The interview was booked successfully, but invitation email(s) could not be sent. Check your SMTP configuration.',
        })
      }
      onScheduled()
      onClose()
    } else {
      show({
        tone: 'error',
        title: 'Could not schedule the interview',
        description: result.error || 'That slot was just taken — please pick another available time.',
      })
      slots.refetch()
      setSelectedSlotId('')
    }
  }

  const availableSlots = slots.data ?? []

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Schedule interview — ${candidateName}`}
      description={
        candidateEmail
          ? `Candidate invitation email will be sent automatically to ${candidateEmail}.`
          : "The candidate's email is taken automatically from their profile — you only need to add the interview panel."
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={booking}>
            Cancel
          </Button>
          <Button onClick={handleBook} loading={booking} disabled={!selectedSlotId}>
            Confirm & Send Invite
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-[13.5px]">
        <div>
          <Label required>Interview slot</Label>
          {slots.loading ? (
            <Skeleton className="h-9 w-full" />
          ) : availableSlots.length === 0 ? (
            <p className="text-xs text-ink-500">No open slots available right now. Ask the hiring team to add availability.</p>
          ) : (
            <Select value={selectedSlotId} onChange={(e) => setSelectedSlotId(e.target.value)}>
              <option value="">Select a time…</option>
              {availableSlots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {formatDate(slot.startTime, 'EEE, MMM d, yyyy · h:mm a')} ({slot.timezone})
                </option>
              ))}
            </Select>
          )}
        </div>

        <div className="space-y-2 border-t border-ink-100 pt-3">
          <Label>Panel member emails</Label>
          {panelistEmails.map((email, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={email} onChange={(e) => updateEmail(i, e.target.value)} placeholder="interviewer@company.com" type="email" />
              {panelistEmails.length > 1 && (
                <button type="button" onClick={() => removeEmailField(i)} className="shrink-0 text-ink-400 hover:text-ink-700">
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}
          <Button type="button" size="sm" variant="ghost" icon={<Plus className="size-3.5" />} onClick={addEmailField}>
            Add panelist
          </Button>
        </div>
      </div>
    </Modal>
  )
}
