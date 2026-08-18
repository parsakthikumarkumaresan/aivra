import { cn } from '@/utils/cn'
import aivraLogo from '@/assets/be6218ac-8d51-44ec-8654-55daa950fc57.png'

interface LogoMarkProps {
  className?: string
  size?: number
}

// Compact icon-only mark for slots the full AIVRA lockup can't occupy
// without being cropped or squeezed into a square (collapsed sidebar,
// tiny decorative previews). The supplied brand PNG is a wide horizontal
// lockup, so this SVG approximation remains the icon-only treatment.
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
}

// Primary AIVRA brand lockup — the official supplied asset, rendered at its
// native aspect ratio (never cropped/stretched). markSize sets the rendered
// height in px; width follows automatically.
export function Logo({ className, markSize = 30 }: LogoProps) {
  return (
    <img
      src={aivraLogo}
      alt="AIVRA — AI Workforce Operating System"
      className={cn('block w-auto shrink-0 object-contain', className)}
      style={{ height: markSize }}
    />
  )
}
