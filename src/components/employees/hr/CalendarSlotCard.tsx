import { Clock, User } from 'lucide-react'
import type { ScheduleSlot } from '@/types'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/format'

interface CalendarSlotCardProps {
  slot: ScheduleSlot
  selected?: boolean
  onSelect: (slot: ScheduleSlot) => void
}

export function CalendarSlotCard({ slot, selected, onSelect }: CalendarSlotCardProps) {
  const start = new Date(slot.startTime)
  const end = new Date(slot.endTime)
  const timeLabel = `${start.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })} – ${end.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`

  return (
    <button
      disabled={!slot.available}
      onClick={() => onSelect(slot)}
      className={cn(
        'flex w-full flex-col gap-1.5 rounded-xl border p-3.5 text-left transition-colors duration-150',
        !slot.available && 'cursor-not-allowed border-ink-100 bg-ink-25 opacity-60',
        slot.available && selected && 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20',
        slot.available && !selected && 'border-ink-200 bg-white hover:border-brand-300 hover:bg-brand-50/40',
      )}
    >
      <span className="text-[13px] font-semibold text-ink-900">{formatDate(slot.startTime, 'EEE, MMM d')}</span>
      <span className="flex items-center gap-1.5 text-xs text-ink-600">
        <Clock className="size-3.5 text-ink-400" />
        {timeLabel} · {slot.timezone}
      </span>
      <span className="flex items-center gap-1.5 text-xs text-ink-500">
        <User className="size-3.5 text-ink-400" />
        {slot.interviewerName}
      </span>
      {!slot.available && <span className="text-[11px] font-medium text-danger-500">Already booked</span>}
    </button>
  )
}
