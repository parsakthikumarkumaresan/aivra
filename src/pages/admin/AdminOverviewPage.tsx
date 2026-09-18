import { Target, Rocket, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAsync } from '@/hooks/useAsync'
import { adminService } from '@/services/api'
import { PageHeader, KpiCard, Card, CardBody, EmptyState, ErrorState } from '@/components/ui'
import { Skeleton } from '@/components/ui/Skeleton'

// Real counts only, per spec section 4/19/36 ("do not use fake hardcoded
// analytics... where backend data does not yet exist, implement the
// required backend instead of generating fake values"). Customers,
// Agents, Calls, Revenue, and Usage KPIs are intentionally NOT shown here
// yet — there is no cross-tenant admin aggregation endpoint for those
// today (see Section 43 audit); adding fake numbers for them would violate
// the mock-data policy. They land once the corresponding admin API exists.
const FAILURE_STATUSES = ['configuration_failed', 'integration_failed', 'deployment_failed']

export default function AdminOverviewPage() {
  const leads = useAsync(() => adminService.listLeads(), [])
  const projects = useAsync(() => adminService.listVoiceProjects(), [])

  const loading = leads.loading || projects.loading
  const error = leads.error || projects.error

  const newLeads = leads.data?.items.filter((l) => l.status === 'new').length ?? 0
  const activeProjects = projects.data?.filter((p) => p.status === 'active').length ?? 0
  const inProgressProjects =
    projects.data?.filter((p) => !['active', ...FAILURE_STATUSES].includes(p.status)).length ?? 0
  const failedProjects = projects.data?.filter((p) => FAILURE_STATUSES.includes(p.status)).length ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="JEXA Admin Overview"
        description="Live counts from the Leads and Voice Deployment pipeline. Customer, agent, call and revenue rollups arrive once their admin APIs exist."
      />

      {error ? (
        <ErrorState onRetry={() => { leads.refetch(); projects.refetch() }} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px] rounded-xl" />)
          ) : (
            <>
              <KpiCard label="New Leads" value={String(newLeads)} icon={<Target className="size-4" />} />
              <KpiCard label="Deployments In Progress" value={String(inProgressProjects)} icon={<Rocket className="size-4" />} />
              <KpiCard label="Active Deployments" value={String(activeProjects)} icon={<CheckCircle2 className="size-4" />} />
              <KpiCard label="Failed Deployments" value={String(failedProjects)} icon={<AlertTriangle className="size-4" />} />
            </>
          )}
        </div>
      )}

      <Card>
        <CardBody>
          <h2 className="text-[15px] font-semibold text-ink-900">Getting started</h2>
          {leads.data && leads.data.items.length === 0 && projects.data && projects.data.length === 0 ? (
            <EmptyState
              className="mt-4"
              icon={<Target className="size-5" />}
              title="No leads yet"
              description="Demo requests and Jaan customization requests submitted from the marketing site will appear here."
              compact
            />
          ) : (
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/admin/leads" className="text-[13.5px] font-medium text-brand-600 hover:text-brand-700">
                Review leads →
              </Link>
              <Link to="/admin/deployments" className="text-[13.5px] font-medium text-brand-600 hover:text-brand-700">
                View deployments →
              </Link>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
