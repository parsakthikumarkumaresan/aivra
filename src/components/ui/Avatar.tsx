import { cn } from '@/utils/cn'
import { initials } from '@/utils/format'

const SIZE_CLASSES = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
}

interface AvatarProps {
  name: string
  src?: string
  size?: keyof typeof SIZE_CLASSES
  color?: string
  className?: string
}

const PALETTE = ['#6D3EF2', '#2137C9', '#178350', '#A8690A', '#B62C2C', '#5C2FD6']

function colorFromName(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

export function Avatar({ name, src, size = 'md', color, className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover ring-1 ring-ink-100', SIZE_CLASSES[size], className)}
      />
    )
  }
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold text-white', SIZE_CLASSES[size], className)}
      style={{ backgroundColor: color ?? colorFromName(name) }}
      aria-label={name}
    >
      {initials(name)}
    </div>
  )
}
