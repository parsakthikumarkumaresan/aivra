import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { adminService } from '@/services/api'
import type { LeadStatus, LeadType } from '@/services/api'
import { PageHeader, Badge, DataTable, ErrorState, EmptyState, Button } from '@/components/ui'
import type { BadgeTone } from '@/components/ui/Badge'
import { Input, Select } from '@/components/ui/Field'
import { formatDateTime } from '@/utils/format'
import { VOICE_PROJECT_STATUS_LABEL, VOICE_PROJECT_STATUS_TONE } from '@/components/admin/voiceProjectMeta'

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  converted: 'Converted',
  rejected: 'Rejected',
}

const STATUS_TONE: Record<LeadStatus, BadgeTone> = {
  new: 'info',
  contacted: 'brand',
  qualified: 'warning',
  converted: 'success',
  rejected: 'neutral',
}

const TYPE_LABEL: Record<LeadType, string> = {
  demo_request: 'Demo Request',
  voice_customization: 'Jaan Customization',
  hr_sales_request: 'HR Sales Request',
}

const PAGE_SIZE = 20

// JEXA Admin — Leads directory (Phase 6). JEXA-level operational area: a
// Lead can be a demo_request, voice_customization (Jaan), or
// hr_sales_request — this page treats all three generically rather than
// assuming every lead is a Jaan lead.
export default function AdminLeadsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<LeadStatus | ''>('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [status])

  const result = useAsync(
    () =>
      adminService.listLeads({
        search: debouncedSearch || undefined,
        status: status || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
    [debouncedSearch, status, page],
  )

  const totalPages = result.data ? Math.max(1, Math.ceil(result.data.total / PAGE_SIZE)) : 1

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="The JEXA sales → implementation pipeline: demo requests, Jaan customization, and HR sales inquiries (app.leads — real backend, platform-role gated)."
      />

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search by company, contact, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="size-4" />}
          className="max-w-md"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus | '')} className="max-w-[180px]">
          <option value="">All stages</option>
          {(Object.keys(STATUS_LABEL) as LeadStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
      </div>

      {result.error ? (
        <ErrorState onRetry={result.refetch} />
      ) : (
        <>
          <DataTable
            columns={[
              {
                key: 'company',
                header: 'Company',
                render: (row) => <span className="font-medium text-ink-900">{row.companyName ?? 'Not available'}</span>,
              },
              {
                key: 'contact',
                header: 'Contact',
                render: (row) => (
                  <div>
                    <p className="text-ink-800">{row.contactName}</p>
                    <p className="text-xs text-ink-500">{row.contactEmail}</p>
                  </div>
                ),
              },
              { key: 'type', header: 'Product', render: (row) => TYPE_LABEL[row.type] },
              {
                key: 'status',
                header: 'Lead Stage',
                render: (row) => (
                  <Badge tone={STATUS_TONE[row.status]} dot>
                    {STATUS_LABEL[row.status]}
                  </Badge>
                ),
              },
              {
                key: 'voiceProject',
                header: 'VoiceProject',
                render: (row) =>
                  row.voiceProject ? (
                    <Badge tone={VOICE_PROJECT_STATUS_TONE[row.voiceProject.status as keyof typeof VOICE_PROJECT_STATUS_TONE]} dot>
                      {VOICE_PROJECT_STATUS_LABEL[row.voiceProject.status as keyof typeof VOICE_PROJECT_STATUS_LABEL] ?? row.voiceProject.status}
                    </Badge>
                  ) : (
                    <span className="text-xs text-ink-400">None</span>
                  ),
              },
              { key: 'createdAt', header: 'Created', render: (row) => formatDateTime(row.createdAt) },
              {
                key: 'actions',
                header: 'Actions',
                render: (row) => (
                  <Button size="sm" variant="ghost" icon={<Eye className="size-3.5" />} onClick={() => navigate(`/admin/leads/${row.id}`)}>
                    View
                  </Button>
                ),
              },
            ]}
            data={result.data?.items ?? []}
            keyExtractor={(row) => row.id}
            loading={result.loading}
            onRowClick={(row) => navigate(`/admin/leads/${row.id}`)}
            emptyState={
              <EmptyState
                icon={<Target className="size-5" />}
                title="No leads yet"
                description="Demo requests and Jaan customization requests will appear here as they're submitted."
              />
            }
          />

          {result.data && result.data.total > 0 && (
            <div className="flex items-center justify-between text-[13px] text-ink-500">
              <span>
                {result.data.total} lead{result.data.total === 1 ? '' : 's'} · Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-1 rounded-lg border border-ink-200 px-2.5 py-1.5 disabled:opacity-40"
                >
                  <ChevronLeft className="size-3.5" /> Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-1 rounded-lg border border-ink-200 px-2.5 py-1.5 disabled:opacity-40"
                >
                  Next <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
