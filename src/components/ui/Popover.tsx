import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'

interface PopoverProps {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode
  children: (close: () => void) => ReactNode
  align?: 'left' | 'right'
  className?: string
  panelClassName?: string
}

export function Popover({ trigger, children, align = 'right', className, panelClassName }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className={cn('relative', className)}>
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div
          className={cn(
            'absolute top-full z-40 mt-2 min-w-56 rounded-xl border border-ink-200 bg-white p-1.5 shadow-elevated',
            align === 'right' ? 'right-0' : 'left-0',
            panelClassName,
          )}
        >
          {children(() => setOpen(false))}
        </div>
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
        tone === 'danger' ? 'text-danger-600 hover:bg-danger-50' : 'text-ink-700 hover:bg-ink-100',
      )}
    >
      {icon}
      {children}
    </button>
  )
}
