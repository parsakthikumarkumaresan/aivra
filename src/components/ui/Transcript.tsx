import type { TranscriptTurn } from '@/types'
import { resolveTranscriptSpeaker } from '@/utils/transcriptSpeaker'
import { cn } from '@/utils/cn'

interface TranscriptProps {
  turns: TranscriptTurn[]
  className?: string
  emptyLabel?: string
}

export function Transcript({ turns, className, emptyLabel = 'No transcript available.' }: TranscriptProps) {
  if (!turns || turns.length === 0) {
    return <p className={cn('py-8 text-center text-[13px] text-ink-400', className)}>{emptyLabel}</p>
  }
  return (
    <div className={cn('space-y-4', className)}>
      {turns.map((t, i) => {
        // Real transcript rows have occasionally arrived malformed (a
        // missing id, or a turn shape from an older recording path) —
        // resolveTranscriptSpeaker already covers a missing/unknown
        // `speaker`; these two fallbacks cover the rest without ever
        // hiding the message or crashing the page.
        const config = resolveTranscriptSpeaker(t?.speaker)
        const Icon = config.icon
        const key = t?.id ?? `turn-${i}`
        const text = t?.text ?? ''
        return (
          <div key={key} className={cn('flex items-start gap-2.5', config.align === 'right' && 'flex-row-reverse')}>
            <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full', config.avatarClass)} title={config.label}>
              <Icon className="size-3.5" />
            </span>
            <span className={cn('inline-block max-w-[75%] rounded-xl px-3.5 py-2 text-[13px] leading-relaxed', config.bubbleClass)}>{text}</span>
          </div>
        )
      })}
    </div>
  )
}
