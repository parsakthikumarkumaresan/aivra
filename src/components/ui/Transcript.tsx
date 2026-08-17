import { Bot, User, Settings } from 'lucide-react'
import type { TranscriptTurn } from '@/types'
import { cn } from '@/utils/cn'

const SPEAKER_CONFIG = {
  ai: { icon: Bot, align: 'left', bubble: 'bg-ink-100 text-ink-800', avatar: 'bg-brand-100 text-brand-600' },
  candidate: { icon: User, align: 'right', bubble: 'bg-brand-600 text-white', avatar: 'bg-ink-100 text-ink-600' },
  customer: { icon: User, align: 'right', bubble: 'bg-brand-600 text-white', avatar: 'bg-ink-100 text-ink-600' },
  system: { icon: Settings, align: 'left', bubble: 'bg-warning-50 text-warning-700', avatar: 'bg-warning-100 text-warning-600' },
} as const

interface TranscriptProps {
  turns: TranscriptTurn[]
  className?: string
  emptyLabel?: string
}

export function Transcript({ turns, className, emptyLabel = 'No transcript available.' }: TranscriptProps) {
  if (turns.length === 0) {
    return <p className={cn('py-8 text-center text-[13px] text-ink-400', className)}>{emptyLabel}</p>
  }
  return (
    <div className={cn('space-y-4', className)}>
      {turns.map((t) => {
        const config = SPEAKER_CONFIG[t.speaker]
        const Icon = config.icon
        return (
          <div key={t.id} className={cn('flex items-start gap-2.5', config.align === 'right' && 'flex-row-reverse')}>
            <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full', config.avatar)}>
              <Icon className="size-3.5" />
            </span>
            <span className={cn('inline-block max-w-[75%] rounded-xl px-3.5 py-2 text-[13px] leading-relaxed', config.bubble)}>{t.text}</span>
          </div>
        )
      })}
    </div>
  )
}
