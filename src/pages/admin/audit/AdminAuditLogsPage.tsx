import { useEffect, useState } from 'react'
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { adminAuditService } from '@/services/api'
import { PageHeader, Badge, DataTable, ErrorState, EmptyState } from '@/components/ui'
import type { BadgeTone } from '@/components/ui/Badge'
import { Input, Select } from '@/components/ui/Field'
import { formatDateTime } from '@/utils/format'

const RESULT_TONE: Record<string, BadgeTone> = {
  success: 'success',
  failure: 'danger',
}

const PAGE_SIZE = 50

// JEXA Admin — Audit Logs (Phase 13). Real, cross-organization view over
// the existing AuditEvent trail — every admin quote/credit/agent/
// telephony action already writes one of these; this page just surfaces
// them. No second audit system, no fabricated "before/after" diff (the
// model doesn't store one).
export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [action, setAction] = useState('')
  const [result, setResult] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  const events = useAsync(
    () =>
      adminAuditService.list({
        search: debouncedSearch || undefined,
        action: action || undefined,
        result: result || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
    [debouncedSearch, action, result, page],
  )

  const totalPages = events.data ? Math.max(1, Math.ceil(events.data.total / PAGE_SIZE)) : 1

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Every recorded admin action across every customer — real backend, platform-role gated."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by action or resource ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Select
          value={action}
          onChange={(e) => {
            setAction(e.target.value)
            setPage(1)
          }}
          className="max-w-[220px]"
        >
          <option value="">All actions</option>
          <option value="quote.created">quote.created</option>
          <option value="quote.updated">quote.updated</option>
          <option value="quote.sent">quote.sent</option>
          <option value="quote.accepted">quote.accepted</option>
          <option value="quote.rejected">quote.rejected</option>
          <option value="voice_credits.admin_adjustment">voice_credits.admin_adjustment</option>
          <option value="voice_agent.created">voice_agent.created</option>
          <option value="voice_agent.published">voice_agent.published</option>
          <option value="telephony_provider.connected">telephony_provider.connected</option>
          <option value="phone_number.assigned">phone_number.assigned</option>
        </Select>
        <Select
          value={result}
          onChange={(e) => {
            setResult(e.target.value)
            setPage(1)
          }}
          className="max-w-[160px]"
        >
          <option value="">All results</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </Select>
      </div>

      {events.error ? (
        <ErrorState description={events.error.message} onRetry={events.refetch} />
      ) : (
        <>
          <DataTable
            columns={[
              { key: 'timestamp', header: 'Timestamp', render: (e) => formatDateTime(e.createdAt) },
              {
                key: 'actor',
                header: 'Actor',
                render: (e) => (
                  <div>
                    <p className="text-ink-800">{e.actorEmail ?? e.actorType}</p>
                    <p className="text-xs text-ink-500 capitalize">{e.actorType.replace('_', ' ')}</p>
                  </div>
                ),
              },
              { key: 'action', header: 'Action', render: (e) => <span className="font-mono text-[12.5px] text-ink-700">{e.action}</span> },
              {
                key: 'resource',
                header: 'Resource',
                render: (e) => (
                  <div>
                    <p className="text-ink-700 capitalize">{e.resourceType}</p>
                    <p className="font-mono text-[11px] text-ink-400">{e.resourceId}</p>
                  </div>
                ),
              },
              { key: 'customer', header: 'Customer', render: (e) => <span className="text-ink-700">{e.organizationName}</span> },
              {
                key: 'result',
                header: 'Result',
                render: (e) => <Badge tone={RESULT_TONE[e.result] ?? 'neutral'} dot>{e.result}</Badge>,
              },
            ]}
            data={events.data?.items ?? []}
            keyExtractor={(e) => e.id}
            loading={events.loading}
            emptyState={
              <EmptyState
                icon={<ScrollText className="size-5" />}
                title="No audit events found"
                description="Admin actions (quotes, credit adjustments, agent publishes, telephony changes) will appear here."
              />
            }
          />

          {events.data && events.data.total > 0 && (
            <div className="flex items-center justify-between text-[13px] text-ink-500">
              <span>
                {events.data.total} event{events.data.total === 1 ? '' : 's'} · Page {page} of {totalPages}
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
