import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/utils/cn'

interface ProgressBarProps {
  value: number // 0-100
  tone?: 'brand' | 'success' | 'warning' | 'danger'
  className?: string
  trackClassName?: string
}

const TONE_CLASSES = {
  brand: 'bg-brand-600',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
}

export function ProgressBar({ value, tone = 'brand', className, trackClassName }: ProgressBarProps) {
  const { ref, visible } = useReveal<HTMLDivElement>(0.4)
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div ref={ref} className={cn('h-1.5 w-full overflow-hidden rounded-full bg-ink-100', trackClassName, className)}>
      <div
        className={cn('h-full rounded-full transition-[width] duration-700 ease-out', TONE_CLASSES[tone])}
        style={{ width: `${visible ? clamped : 0}%` }}
      />
    </div>
  )
}

export function ScoreRing({ value, size = 44 }: { value: number; size?: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>(0.4)
  const radius = (size - 6) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const tone = value >= 75 ? '#22c55e' : value >= 50 ? '#eab308' : '#ef4444'
  return (
    <div ref={ref} className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={4} fill="none" className="stroke-ink-100" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={4}
          fill="none"
          stroke={tone}
          strokeDasharray={circumference}
          strokeDashoffset={visible ? offset : circumference}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-ink-800">{value}</span>
    </div>
  )
}
