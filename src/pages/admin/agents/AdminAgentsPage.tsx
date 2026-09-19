import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { adminAgentsService } from '@/services/api'
import { PageHeader, Badge, DataTable, ErrorState, EmptyState } from '@/components/ui'
import type { BadgeTone } from '@/components/ui/Badge'
import { Input, Select } from '@/components/ui/Field'
import { formatDateTime } from '@/utils/format'

const STATUS_TONE: Record<string, BadgeTone> = {
  draft: 'neutral',
  testing: 'info',
  live: 'success',
  paused: 'warning',
}

const PAGE_SIZE = 20

// JEXA Admin — cross-customer Jaan Agent Management (Phase 8). Real
// backend (app/ai_employees/voice/api/admin_agents_routes.py), reusing the
// same VoiceAgent/AgentVersion domain the customer-facing builder uses —
// this is a read/summary view across every organization, not a second
// agent model.
export default function AdminAgentsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [environment, setEnvironment] = useState('')
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
      adminAgentsService.list({
        search: debouncedSearch || undefined,
        status: status || undefined,
        environment: environment || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
    [debouncedSearch, status, environment, page],
  )

  const totalPages = result.data ? Math.max(1, Math.ceil(result.data.total / PAGE_SIZE)) : 1

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jaan Agents"
        description="Every Jaan voice agent across every customer — real backend, platform-role gated. Not the customer-facing Agent Workspace."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by agent name or industry…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
          }}
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
          <option value="draft">Draft</option>
          <option value="testing">Testing</option>
          <option value="live">Live</option>
          <option value="paused">Paused</option>
        </Select>
        <Select
          value={environment}
          onChange={(e) => {
            setEnvironment(e.target.value)
            setPage(1)
          }}
          className="max-w-[160px]"
        >
          <option value="">All environments</option>
          <option value="staging">Staging</option>
          <option value="production">Production</option>
        </Select>
      </div>

      {result.error ? (
        <ErrorState description={result.error.message} onRetry={result.refetch} />
      ) : (
        <>
          <DataTable
            columns={[
              {
                key: 'name',
                header: 'Agent',
                render: (agent) => (
                  <div>
                    <p className="font-medium text-ink-900">{agent.name}</p>
                    <p className="text-xs text-ink-500">{agent.industry ?? 'No industry set'}</p>
                  </div>
                ),
              },
              {
                key: 'customer',
                header: 'Customer',
                render: (agent) => <span className="text-ink-700">{agent.organizationName}</span>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (agent) => (
                  <Badge tone={STATUS_TONE[agent.status] ?? 'neutral'} dot>
                    {agent.status}
                  </Badge>
                ),
              },
              {
                key: 'environment',
                header: 'Environment',
                render: (agent) => <span className="capitalize text-ink-600">{agent.environment}</span>,
              },
              {
                key: 'version',
                header: 'Published Version',
                render: (agent) =>
                  agent.publishedVersion != null ? (
                    <span className="font-mono text-ink-700">v{agent.publishedVersion}</span>
                  ) : (
                    <span className="text-ink-400">Not published</span>
                  ),
              },
              {
                key: 'calls',
                header: 'Calls',
                render: (agent) => <span className="text-ink-700">{agent.callCount.toLocaleString()}</span>,
              },
              { key: 'updatedAt', header: 'Last Updated', render: (agent) => formatDateTime(agent.updatedAt) },
            ]}
            data={result.data?.items ?? []}
            keyExtractor={(agent) => agent.id}
            loading={result.loading}
            onRowClick={(agent) => navigate(`/admin/agents/${agent.id}`)}
            emptyState={
              <EmptyState
                icon={<Bot className="size-5" />}
                title="No agents found"
                description="Jaan agents created through the customer builder will appear here."
              />
            }
          />

          {result.data && result.data.total > 0 && (
            <div className="flex items-center justify-between text-[13px] text-ink-500">
              <span>
                {result.data.total} agent{result.data.total === 1 ? '' : 's'} · Page {page} of {totalPages}
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
