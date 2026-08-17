import { useEffect, useRef, useState } from 'react'
import { Pause, Play, Volume2 } from 'lucide-react'
import { formatDuration } from '@/utils/format'
import { cn } from '@/utils/cn'

export function AudioPlayer({ durationSeconds, className }: { durationSeconds: number; className?: string }) {
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (playing) {
      intervalRef.current = window.setInterval(() => {
        setPosition((p) => {
          if (p >= durationSeconds) {
            setPlaying(false)
            return durationSeconds
          }
          return p + 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [playing, durationSeconds])

  const progress = durationSeconds > 0 ? (position / durationSeconds) * 100 : 0

  return (
    <div className={cn('flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-25 px-4 py-3', className)}>
      <button
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? 'Pause recording' : 'Play recording'}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700"
      >
        {playing ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
      </button>
      <div className="min-w-0 flex-1">
        <div
          className="h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-ink-200"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const ratio = (e.clientX - rect.left) / rect.width
            setPosition(Math.round(ratio * durationSeconds))
          }}
        >
          <div className="h-full rounded-full bg-brand-600 transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-ink-500">
          <span>{formatDuration(position)}</span>
          <span>{formatDuration(durationSeconds)}</span>
        </div>
      </div>
      <Volume2 className="size-4 shrink-0 text-ink-400" />
    </div>
  )
}
