import { Link, useNavigate, useParams } from 'react-router-dom'
import { Gauge, Wallet, Rocket, Users, ArrowLeft, FileSpreadsheet } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { adminOrganizationsService } from '@/services/api'
import { PageHeader, Badge, Card, CardHeader, CardBody, ErrorState, EmptyState, Button } from '@/components/ui'
import type { BadgeTone } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDateTime } from '@/utils/format'

const STATUS_TONE: Record<string, BadgeTone> = {
  active: 'success',
  pending_activation: 'info',
  paused: 'neutral',
  past_due: 'danger',
  cancelled: 'neutral',
  expired: 'neutral',
  not_provisioned: 'neutral',
  deployment_failed: 'danger',
}

// Customer Detail (Phase 5) — real organization data plus AI Employee
// (HR/Voice) provisioning, Jaan Voice Projects, and members. Deliberately
// does NOT embed the Jaan credit ledger inline (that stays owned by the
// Usage/Credits pages, reached via customer-context navigation below) —
// avoids a second place that reads/derives credit balances.
export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const detail = useAsync(() => adminOrganizationsService.get(id!), [id])

  if (detail.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }
  if (detail.error || !detail.data) {
    return <ErrorState title="Customer not found" onRetry={detail.refetch} />
  }

  const org = detail.data
  const hasVoice = org.employeeProvisions.some((p) => p.employeeTypeCode === 'voice')

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin/customers')} className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" /> Back to Customers
      </button>

      <PageHeader
        title={org.name}
        description={`${org.slug} · ${org.industry ?? 'No industry set'} · ${org.timezone}`}
        actions={<Badge tone={org.status === 'active' ? 'success' : 'danger'} dot>{org.status}</Badge>}
      />

      <Card>
        <CardHeader title="AI Employees" description="Real provisioning status (app.ai_employees.provisioning) — never inferred." />
        <CardBody>
          {org.employeeProvisions.length === 0 ? (
            <EmptyState compact icon={<Users className="size-5" />} title="No AI Employees provisioned" />
          ) : (
            <div className="flex flex-wrap gap-3">
              {org.employeeProvisions.map((p) => (
                <div key={p.employeeTypeCode} className="flex items-center gap-3 rounded-lg border border-ink-200 px-4 py-3">
                  <div>
                    <p className="text-[13px] font-semibold text-ink-900">{p.employeeTypeName}</p>
                    <p className="text-xs text-ink-500">{p.activatedAt ? `Activated ${formatDateTime(p.activatedAt)}` : 'Not yet activated'}</p>
                  </div>
                  <Badge tone={STATUS_TONE[p.status] ?? 'neutral'} dot>{p.status.replace('_', ' ')}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {hasVoice && (
        <Card>
          <CardHeader
            title="Jaan Voice — Quick Actions"
            description="Jump into this customer's usage and credit management."
          />
          <CardBody className="flex flex-wrap gap-3">
            <Link to={`/admin/usage?org=${org.id}`}>
              <Button variant="outline" icon={<Gauge className="size-4" />}>View Usage</Button>
            </Link>
            <Link to={`/admin/credits?org=${org.id}`}>
              <Button variant="outline" icon={<Wallet className="size-4" />}>Manage Credits</Button>
            </Link>
            <Link to={`/admin/quotes/new?organizationId=${org.id}`}>
              <Button variant="outline" icon={<FileSpreadsheet className="size-4" />}>Create Quote</Button>
            </Link>
            <Link to={`/admin/quotes?organizationId=${org.id}`}>
              <Button variant="outline" icon={<FileSpreadsheet className="size-4" />}>View Quotes</Button>
            </Link>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Voice Deployment Projects" description="Custom Jaan builds for this customer (app.leads.VoiceProject)." />
        {org.voiceProjects.length === 0 ? (
          <CardBody>
            <EmptyState compact icon={<Rocket className="size-5" />} title="No deployment projects" />
          </CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {org.voiceProjects.map((vp) => (
              <div key={vp.id} className="flex items-center justify-between px-5 py-3">
                <span className="text-[13px] font-medium text-ink-800">{vp.name}</span>
                <Badge tone={STATUS_TONE[vp.status] ?? 'neutral'} dot>{vp.status.replace('_', ' ')}</Badge>
              </div>
            ))}
          </div>
        )}
        <CardBody className="border-t border-ink-100 py-3">
          <Link to="/admin/deployments" className="text-[12.5px] font-medium text-brand-600 hover:text-brand-700">
            View all deployments →
          </Link>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Members" />
        {org.members.length === 0 ? (
          <CardBody>
            <EmptyState compact icon={<Users className="size-5" />} title="No members" />
          </CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {org.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-[13px] font-medium text-ink-800">{m.fullName}</p>
                  <p className="text-xs text-ink-500">{m.email}</p>
                </div>
                <Badge tone="neutral">{m.role.replace('_', ' ')}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
