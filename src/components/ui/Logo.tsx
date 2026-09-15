import type { CSSProperties } from 'react'
import { cn } from '@/utils/cn'
import jexaLogo from '@/assets/jexa-logo.png'

interface LogoMarkProps {
  className?: string
  size?: number
}

// Compact icon-only mark for slots the full JEXA.AI lockup can't occupy
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
      aria-label="JEXA.AI"
    >
      <rect width="32" height="32" rx="8" fill="#0A0A0A" />
      <path d="M16 7L25 24H20.6L18.9 20.5H13.1L11.4 24H7L16 7Z" fill="#C1121F" />
      <path d="M16 13.2L18.1 17.5H13.9L16 13.2Z" fill="#F5F5F5" />
    </svg>
  )
}

interface LogoProps {
  className?: string
  markSize?: number
  /** Height in px from the lg breakpoint up — omit for a fixed (non-responsive) size. */
  markSizeLg?: number
}

// Primary JEXA.AI brand lockup — the official supplied asset (black canvas,
// red mark, white wordmark), rendered at its native aspect ratio (never
// cropped/stretched). markSize sets the rendered height in px (width
// follows automatically); markSizeLg optionally steps that up at the lg
// breakpoint via the .logo-img CSS custom properties (see motion.css) since
// an inline style can't itself respond to a media query.
export function Logo({ className, markSize = 30, markSizeLg }: LogoProps) {
  const style = {
    '--logo-h': `${markSize}px`,
    ...(markSizeLg ? { '--logo-h-lg': `${markSizeLg}px` } : {}),
  } as CSSProperties

  return (
    <img
      src={jexaLogo}
      alt="JEXA.AI — Job Execution AI"
      className={cn('logo-img block shrink-0 object-contain', className)}
      style={style}
    />
  )
}
