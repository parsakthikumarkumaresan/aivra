import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/hooks/useReveal'

interface ParsedNumber {
  value: number
  prefix: string
  suffix: string
  decimals: number
  hasCommas: boolean
}

function parseNumeric(raw: string): ParsedNumber | null {
  const match = raw.match(/-?[\d,]*\.?\d+/)
  if (!match || match.index === undefined) return null
  const numStr = match[0]
  const value = Number.parseFloat(numStr.replace(/,/g, ''))
  if (Number.isNaN(value)) return null
  return {
    value,
    prefix: raw.slice(0, match.index),
    suffix: raw.slice(match.index + numStr.length),
    decimals: numStr.includes('.') ? numStr.split('.')[1].length : 0,
    hasCommas: numStr.includes(','),
  }
}

function formatNumber(n: number, decimals: number, hasCommas: boolean) {
  const fixed = n.toFixed(decimals)
  if (!hasCommas) return fixed
  const [intPart, decPart] = fixed.split('.')
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decPart ? `${withCommas}.${decPart}` : withCommas
}

// Animates a formatted numeric string ("1,248", "98.6%", "$186") from 0 up
// to its target value, preserving whatever prefix/suffix/comma/decimal
// formatting the source string had. `start` gates the animation (e.g. only
// once the card has scrolled into view) so it never fires off-screen.
export function useCountUp(target: string, options?: { duration?: number; start?: boolean }) {
  const { duration = 900, start = true } = options ?? {}
  const [display, setDisplay] = useState(() => (start ? target : target))
  const hasRunRef = useRef(false)

  useEffect(() => {
    const parsed = parseNumeric(target)
    if (!start || !parsed || prefersReducedMotion()) {
      setDisplay(target)
      return
    }
    if (hasRunRef.current) {
      setDisplay(target)
      return
    }
    hasRunRef.current = true
    const { value, prefix, suffix, decimals, hasCommas } = parsed
    let raf = 0
    const startTime = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(`${prefix}${formatNumber(value * eased, decimals, hasCommas)}${suffix}`)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, start])

  return display
}
