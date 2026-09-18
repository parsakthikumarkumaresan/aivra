import type { ReactNode } from 'react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/utils/cn'

interface PopoverProps {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode
  children: (close: () => void) => ReactNode
  align?: 'left' | 'right'
  className?: string
  panelClassName?: string
}

// Portaled to document.body (matching Modal.tsx/Drawer.tsx's existing
// pattern) — an in-place `position: absolute` panel gets clipped by any
// ancestor with overflow set on either axis, e.g. DataTable's
// `overflow-x-auto` wrapper (overflow-x != visible forces overflow-y to
// clip too, per the CSS spec), which was hiding the row-actions menu.
export function Popover({ trigger, children, align = 'right', className, panelClassName }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left?: number; right?: number } | null>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect()
    if (!rect) return
    setCoords({
      top: rect.bottom + 8,
      left: align === 'left' ? rect.left : undefined,
      right: align === 'right' ? window.innerWidth - rect.right : undefined,
    })
  }, [align])

  useLayoutEffect(() => {
    if (open) updatePosition()
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (anchorRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onReposition = () => updatePosition()
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onReposition, true)
    window.addEventListener('resize', onReposition)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onReposition, true)
      window.removeEventListener('resize', onReposition)
    }
  }, [open, updatePosition])

  return (
    <div ref={anchorRef} className={cn('relative inline-block', className)}>
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open &&
        coords &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: 'fixed', top: coords.top, left: coords.left, right: coords.right }}
            className={cn(
              'z-50 min-w-56 rounded-xl border border-ink-300 bg-surface-elevated p-1.5 shadow-elevated',
              panelClassName,
            )}
          >
            {children(() => setOpen(false))}
          </div>,
          document.body,
        )}
    </div>
  )
}

export function PopoverItem({ icon, children, onClick, tone = 'default' }: { icon?: ReactNode; children: ReactNode; onClick?: () => void; tone?: 'default' | 'danger' }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] font-medium transition-colors duration-150',
        tone === 'danger' ? 'text-danger-600 hover:bg-danger-100' : 'text-ink-700 hover:bg-ink-200',
      )}
    >
      {icon}
      {children}
    </button>
  )
}
