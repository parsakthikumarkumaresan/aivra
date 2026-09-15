import type { HTMLAttributes } from 'react'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/utils/cn'

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  delay?: number // ms — for staggering a sequence of siblings
}

// Scroll-triggered fade + rise, used to bring marketing sections and card
// grids in as the user scrolls, instead of everything animating at once.
export function Reveal({ children, className, delay = 0, style, ...props }: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={cn('reveal', visible && 'reveal-visible', className)}
      style={{ ...style, transitionDelay: visible ? `${delay}ms` : '0ms' }}
      {...props}
    >
      {children}
    </div>
  )
}
