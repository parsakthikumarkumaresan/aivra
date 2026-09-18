import { useEffect, useRef, useState } from 'react'
import { Search, Building2, ChevronDown } from 'lucide-react'
import { adminOrganizationsService } from '@/services/api'
import type { AdminOrganizationSummary } from '@/services/api'
import { cn } from '@/utils/cn'

interface CustomerSelectorProps {
  value: AdminOrganizationSummary | null
  onChange: (organization: AdminOrganizationSummary) => void
  placeholder?: string
  className?: string
}

// Reusable admin "customer selector" (spec: Customer selector for Admin
// Usage / Admin Credits) — search-as-you-type against the real Customer
// Directory API, replacing a raw organization-ID text box.
export function CustomerSelector({ value, onChange, placeholder = 'Search customers…', className }: CustomerSelectorProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<AdminOrganizationSummary[]>([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    const timeout = setTimeout(() => {
      adminOrganizationsService
        .list({ search: query || undefined, page: 1, pageSize: 8 })
        .then((res) => setResults(res.items))
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(timeout)
  }, [query, open])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full items-center gap-2 rounded-lg border border-ink-200 bg-surface px-3 text-left text-[13px] text-ink-800 hover:border-ink-300"
      >
        <Building2 className="size-4 shrink-0 text-ink-400" />
        <span className="min-w-0 flex-1 truncate">{value ? value.name : placeholder}</span>
        <ChevronDown className="size-3.5 shrink-0 text-ink-400" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full min-w-[280px] overflow-hidden rounded-lg border border-ink-200 bg-surface-elevated shadow-overlay">
          <div className="border-b border-ink-100 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a company name…"
                className="h-8 w-full rounded-md border border-ink-200 bg-surface pl-8 pr-2 text-[13px] text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-3 text-[12.5px] text-ink-400">Searching…</p>
            ) : results.length === 0 ? (
              <p className="px-3 py-3 text-[12.5px] text-ink-400">No customers found.</p>
            ) : (
              results.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => {
                    onChange(org)
                    setOpen(false)
                    setQuery('')
                  }}
                  className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-ink-50"
                >
                  <span className="text-[13px] font-medium text-ink-900">{org.name}</span>
                  <span className="text-[11px] text-ink-400">{org.slug}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
