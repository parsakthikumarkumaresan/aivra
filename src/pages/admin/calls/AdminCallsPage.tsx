import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhoneCall, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { adminCallsService } from '@/services/api'
import { PageHeader, Badge, DataTable, ErrorState, EmptyState } from '@/components/ui'
import type { BadgeTone } from '@/components/ui/Badge'
import { Input, Select } from '@/components/ui/Field'
import { formatDateTime } from '@/utils/format'

const STATUS_TONE: Record<string, BadgeTone> = {
  in_progress: 'info',
  completed: 'success',
  failed: 'danger',
}

const PAGE_SIZE = 20

// JEXA Admin — cross-customer Jaan Calls (Phase 9). Real backend
// (app/ai_employees/voice/api/admin_calls_routes.py), reusing the same
// Call model the customer-facing call history uses — this is a
// cross-organization view, not a second call model.
export default function AdminCallsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [direction, setDirection] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  const result = useAsync(
    () =>
      adminCallsService.list({
        search: debouncedSearch || undefined,
        status: status || undefined,
        direction: direction || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
    [debouncedSearch, status, direction, page],
  )

  const totalPages = result.data ? Math.max(1, Math.ceil(result.data.total / PAGE_SIZE)) : 1

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jaan Calls"
        description="Every Jaan voice call across every customer — real backend, platform-role gated."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by call ID or phone number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          className="max-w-[160px]"
        >
          <option value="">All statuses</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </Select>
        <Select
          value={direction}
          onChange={(e) => {
            setDirection(e.target.value)
            setPage(1)
          }}
          className="max-w-[160px]"
        >
          <option value="">All directions</option>
          <option value="inbound">Inbound</option>
          <option value="outbound">Outbound</option>
        </Select>
      </div>

      {result.error ? (
        <ErrorState description={result.error.message} onRetry={result.refetch} />
      ) : (
        <>
          <DataTable
            columns={[
              {
                key: 'call',
                header: 'Call',
                render: (call) => (
                  <div>
                    <p className="font-mono text-[12.5px] text-ink-900">{call.id}</p>
                    <p className="text-xs text-ink-500">{call.callerNumber ?? 'Unknown number'}</p>
                  </div>
                ),
              },
              {
                key: 'customer',
                header: 'Customer',
                render: (call) => (
                  <div>
                    <p className="text-ink-700">{call.organizationName}</p>
                    <p className="text-xs text-ink-500">{call.agentName}</p>
                  </div>
                ),
              },
              {
                key: 'direction',
                header: 'Direction',
                render: (call) => <span className="capitalize text-ink-600">{call.direction}</span>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (call) => (
                  <Badge tone={STATUS_TONE[call.status] ?? 'neutral'} dot>
                    {call.status.replace('_', ' ')}
                  </Badge>
                ),
              },
              {
                key: 'duration',
                header: 'Duration',
                render: (call) => <span className="text-ink-700">{Math.round(call.durationSeconds / 60)} min</span>,
              },
              { key: 'startedAt', header: 'Started', render: (call) => formatDateTime(call.startedAt) },
              {
                key: 'environment',
                header: 'Environment',
                render: (call) => <span className="capitalize text-ink-600">{call.environment}</span>,
              },
            ]}
            data={result.data?.items ?? []}
            keyExtractor={(call) => call.id}
            loading={result.loading}
            onRowClick={(call) => navigate(`/admin/calls/${call.id}`)}
            emptyState={
              <EmptyState
                icon={<PhoneCall className="size-5" />}
                title="No calls found"
                description="Calls handled by Jaan agents will appear here."
              />
            }
          />

          {result.data && result.data.total > 0 && (
            <div className="flex items-center justify-between text-[13px] text-ink-500">
              <span>
                {result.data.total} call{result.data.total === 1 ? '' : 's'} · Page {page} of {totalPages}
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
