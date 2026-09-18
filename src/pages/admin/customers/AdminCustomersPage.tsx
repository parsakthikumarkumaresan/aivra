import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { adminOrganizationsService } from '@/services/api'
import type { AdminEmployeeProvisionSummary } from '@/services/api'
import { PageHeader, Badge, DataTable, ErrorState, EmptyState } from '@/components/ui'
import type { BadgeTone } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Field'
import { formatDateTime } from '@/utils/format'

const PROVISION_TONE: Record<string, BadgeTone> = {
  active: 'success',
  pending_activation: 'info',
  paused: 'neutral',
  past_due: 'danger',
  cancelled: 'neutral',
  expired: 'neutral',
  not_provisioned: 'neutral',
  deployment_failed: 'danger',
}

const PAGE_SIZE = 20

// JEXA Admin Customer Directory (Phase 5) — real organizations, search,
// pagination, and AI Employee (HR/Voice) provisioning visibility. No
// mock data: an organization with no AI Employees provisioned simply
// shows no badges, rather than a fabricated status.
export default function AdminCustomersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  const result = useAsync(
    () => adminOrganizationsService.list({ search: debouncedSearch || undefined, page, pageSize: PAGE_SIZE }),
    [debouncedSearch, page],
  )

  const totalPages = result.data ? Math.max(1, Math.ceil(result.data.total / PAGE_SIZE)) : 1

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Every JEXA.AI organization, with real AI Employee (HR/Voice) provisioning status. Real backend, platform-role gated."
      />

      <Input
        placeholder="Search by company name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search className="size-4" />}
        className="max-w-md"
      />

      {result.error ? (
        <ErrorState onRetry={result.refetch} />
      ) : (
        <>
          <DataTable
            columns={[
              {
                key: 'name',
                header: 'Company',
                render: (org) => (
                  <div>
                    <p className="font-medium text-ink-900">{org.name}</p>
                    <p className="text-xs text-ink-500">{org.slug}</p>
                  </div>
                ),
              },
              { key: 'industry', header: 'Industry', render: (org) => org.industry ?? '—' },
              {
                key: 'status',
                header: 'Org Status',
                render: (org) => <Badge tone={org.status === 'active' ? 'success' : 'danger'} dot>{org.status}</Badge>,
              },
              {
                key: 'employees',
                header: 'AI Employees',
                render: (org) =>
                  org.employeeProvisions.length === 0 ? (
                    <span className="text-xs text-ink-400">None provisioned</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {org.employeeProvisions.map((p: AdminEmployeeProvisionSummary) => (
                        <Badge key={p.employeeTypeCode} tone={PROVISION_TONE[p.status] ?? 'neutral'}>
                          {p.employeeTypeName}: {p.status.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  ),
              },
              { key: 'createdAt', header: 'Created', render: (org) => formatDateTime(org.createdAt) },
            ]}
            data={result.data?.items ?? []}
            keyExtractor={(org) => org.id}
            loading={result.loading}
            onRowClick={(org) => navigate(`/admin/customers/${org.id}`)}
            emptyState={
              <EmptyState
                icon={<Building2 className="size-5" />}
                title="No customers yet"
                description="Organizations created via signup or converted from a lead will appear here."
              />
            }
          />

          {result.data && result.data.total > 0 && (
            <div className="flex items-center justify-between text-[13px] text-ink-500">
              <span>
                {result.data.total} customer{result.data.total === 1 ? '' : 's'} · Page {page} of {totalPages}
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
