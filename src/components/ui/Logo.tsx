import { cn } from '@/utils/cn'

interface LogoMarkProps {
  className?: string
  size?: number
}

export function LogoMark({ className, size = 32 }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={cn('shrink-0', className)}
      role="img"
      aria-label="AIVRA"
    >
      <rect width="32" height="32" rx="8" fill="#6D3EF2" />
      <path d="M16 7L25 24H20.6L18.9 20.5H13.1L11.4 24H7L16 7Z" fill="white" />
      <path d="M16 13.2L18.1 17.5H13.9L16 13.2Z" fill="#6D3EF2" />
    </svg>
  )
}

interface LogoProps {
  className?: string
  markSize?: number
  tagline?: boolean
  wordmarkClassName?: string
}

export function Logo({ className, markSize = 30, tagline = false, wordmarkClassName }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={markSize} />
      <div className="flex flex-col leading-none">
        <span className={cn('text-[17px] font-bold tracking-tight text-ink-900', wordmarkClassName)}>AIVRA</span>
        {tagline && (
          <span className="mt-0.5 text-[11px] font-medium tracking-wide text-ink-500">
            AI Workforce Operating System
          </span>
        )}
      </div>
    </div>
  )
}
