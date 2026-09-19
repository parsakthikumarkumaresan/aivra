import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Gauge, Wallet, Users, ArrowLeft, FileSpreadsheet, Mic, ScrollText, BarChart3, Receipt } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import {
  adminOrganizationsService,
  adminJaanBusinessService,
  adminHrBusinessService,
  adminBillingService,
  adminAuditService,
  adminCallsService,
} from '@/services/api'
import type { AdminOrganizationDetail } from '@/services/api'
import { PageHeader, Badge, Card, CardHeader, CardBody, EmptyState, ErrorState, Button, Tabs, DataTable } from '@/components/ui'
import type { BadgeTone } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format'

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

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'ai-employees', label: 'AI Employees' },
  { value: 'usage', label: 'Usage' },
  { value: 'billing', label: 'Billing' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'activity', label: 'Activity' },
]

// Customer Detail (Admin Console business restructure) — one customer's
// full JEXA relationship: which AI Employees they use, real usage,
// billing, analytics, and activity. Tabbed so the page reads as a
// business record, not a wall of technical sections.
export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
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
    return <ErrorState title="Customer not found" description={detail.error?.message} onRetry={detail.refetch} />
  }

  const org = detail.data
  const hasVoice = org.employeeProvisions.some((p) => p.employeeTypeCode === 'voice')
  const hasHr = org.employeeProvisions.some((p) => p.employeeTypeCode === 'hr')

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin/customers')} className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" /> Back to Customers
      </button>

      <PageHeader
        title={org.name}
        description={`${org.slug} · ${org.industry ?? 'No industry set'} · Customer since ${formatDate(org.createdAt)}`}
        actions={<Badge tone={org.status === 'active' ? 'success' : 'danger'} dot>{org.status}</Badge>}
      />

      <Tabs items={TABS} value={tab} onChange={setTab} />

      {tab === 'overview' && <OverviewTab org={org} hasVoice={hasVoice} hasHr={hasHr} />}
      {tab === 'ai-employees' && <AiEmployeesTab org={org} hasVoice={hasVoice} hasHr={hasHr} />}
      {tab === 'usage' && <UsageTab organizationId={org.id} hasVoice={hasVoice} hasHr={hasHr} />}
      {tab === 'billing' && <BillingTab organizationId={org.id} />}
      {tab === 'analytics' && <AnalyticsTab organizationId={org.id} hasVoice={hasVoice} />}
      {tab === 'activity' && <ActivityTab organizationId={org.id} />}
    </div>
  )
}

type OrgDetail = AdminOrganizationDetail

function OverviewTab({ org, hasVoice, hasHr }: { org: OrgDetail; hasVoice: boolean; hasHr: boolean }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="AI Employees" description="Real provisioning status — never inferred." />
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
          <CardHeader title="Jaan Voice — Quick Actions" />
          <CardBody className="flex flex-wrap gap-3">
            <Link to={`/admin/credits?org=${org.id}`}><Button variant="outline" icon={<Wallet className="size-4" />}>Manage Credits</Button></Link>
            <Link to={`/admin/telephony?org=${org.id}`}><Button variant="outline" icon={<Mic className="size-4" />}>Telephony</Button></Link>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Quotes" />
        <CardBody className="flex flex-wrap gap-3">
          <Link to={`/admin/quotes/new?organizationId=${org.id}`}><Button variant="outline" icon={<FileSpreadsheet className="size-4" />}>Create Quote</Button></Link>
          <Link to={`/admin/quotes?organizationId=${org.id}`}><Button variant="outline" icon={<FileSpreadsheet className="size-4" />}>View Quotes</Button></Link>
        </CardBody>
      </Card>

      {org.voiceProjects.length > 0 && (
        <Card>
          <CardHeader title="Custom Jaan Deployments" description="app.leads.VoiceProject — custom build lifecycle." />
          <div className="divide-y divide-ink-100">
            {org.voiceProjects.map((vp) => (
              <div key={vp.id} className="flex items-center justify-between px-5 py-3">
                <span className="text-[13px] font-medium text-ink-800">{vp.name}</span>
                <Badge tone={STATUS_TONE[vp.status] ?? 'neutral'} dot>{vp.status.replace('_', ' ')}</Badge>
              </div>
            ))}
          </div>
          <CardBody className="border-t border-ink-100 py-3">
            <Link to="/admin/deployments" className="text-[12.5px] font-medium text-brand-600 hover:text-brand-700">
              View all deployments →
            </Link>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Members" />
        {org.members.length === 0 ? (
          <CardBody><EmptyState compact icon={<Users className="size-5" />} title="No members" /></CardBody>
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
      {!hasVoice && !hasHr && (
        <EmptyState icon={<Users className="size-5" />} title="No AI Employees active" description="This customer hasn't been provisioned on Jaan or HR AI yet." />
      )}
    </div>
  )
}

function AiEmployeesTab({ org, hasVoice, hasHr }: { org: OrgDetail; hasVoice: boolean; hasHr: boolean }) {
  const jaan = useAsync(() => (hasVoice ? adminJaanBusinessService.getOverview() : Promise.resolve(null)), [hasVoice])
  const hr = useAsync(() => (hasHr ? adminHrBusinessService.getOverview() : Promise.resolve(null)), [hasHr])
  const jaanRow = jaan.data?.customers.find((c) => c.organizationId === org.id)
  const hrRow = hr.data?.customers.find((c) => c.organizationId === org.id)

  if (!hasVoice && !hasHr) {
    return <EmptyState icon={<Users className="size-5" />} title="No AI Employees active" description="This customer hasn't been provisioned on Jaan or HR AI yet." />
  }

  return (
    <div className="space-y-6">
      {hasVoice && (
        <Card>
          <CardHeader title="Jaan" description="Voice AI Employee" />
          <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {jaan.loading ? (
              <Skeleton className="h-16 w-full sm:col-span-4" />
            ) : jaanRow ? (
              <>
                <Field label="Credit Balance" value={`${jaanRow.creditBalanceMinutes.toLocaleString()} min`} />
                <Field label="Used" value={`${jaanRow.usedMinutes.toLocaleString()} min`} />
                <Field label="Revenue" value={formatCurrency(jaanRow.revenue)} />
                <Field label="Last Call" value={jaanRow.lastCallAt ? formatDateTime(jaanRow.lastCallAt) : 'No calls yet'} />
              </>
            ) : (
              <p className="text-[13px] text-ink-500 sm:col-span-4">No Jaan usage data yet.</p>
            )}
          </CardBody>
        </Card>
      )}
      {hasHr && (
        <Card>
          <CardHeader title="HR AI" description="HR / Recruitment AI Employee" />
          <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {hr.loading ? (
              <Skeleton className="h-16 w-full sm:col-span-4" />
            ) : hrRow ? (
              <>
                <Field label="Plan" value={hrRow.planName ?? '—'} />
                <Field label="Candidates" value={hrRow.candidatesCount.toLocaleString()} />
                <Field label="Jobs" value={hrRow.jobsCount.toLocaleString()} />
                <Field label="Last Activity" value={hrRow.lastActivityAt ? formatDateTime(hrRow.lastActivityAt) : 'No activity yet'} />
              </>
            ) : (
              <p className="text-[13px] text-ink-500 sm:col-span-4">No HR AI subscription data yet.</p>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}

function UsageTab({ organizationId, hasVoice, hasHr }: { organizationId: string; hasVoice: boolean; hasHr: boolean }) {
  const jaan = useAsync(() => (hasVoice ? adminJaanBusinessService.getOverview() : Promise.resolve(null)), [hasVoice])
  const hr = useAsync(() => (hasHr ? adminHrBusinessService.getOverview() : Promise.resolve(null)), [hasHr])
  const jaanRow = jaan.data?.customers.find((c) => c.organizationId === organizationId)
  const hrRow = hr.data?.customers.find((c) => c.organizationId === organizationId)

  if (!hasVoice && !hasHr) {
    return <EmptyState icon={<Gauge className="size-5" />} title="No product usage" description="No active AI Employee to show usage for." />
  }

  return (
    <div className="space-y-6">
      {hasVoice && (
        <Card>
          <CardHeader title="Jaan Voice Usage" description="Real credit ledger data." />
          <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Credit Balance" value={jaanRow ? `${jaanRow.creditBalanceMinutes.toLocaleString()} min` : '—'} />
            <Field label="Minutes Used" value={jaanRow ? `${jaanRow.usedMinutes.toLocaleString()} min` : '—'} />
            <Field label="Last Call" value={jaanRow?.lastCallAt ? formatDateTime(jaanRow.lastCallAt) : 'No calls yet'} />
          </CardBody>
          <CardBody className="border-t border-ink-100 pt-3">
            <Link to={`/admin/credits?org=${organizationId}`} className="text-[12.5px] font-medium text-brand-600 hover:text-brand-700">
              Full credit history & adjustments →
            </Link>
          </CardBody>
        </Card>
      )}
      {hasHr && (
        <Card>
          <CardHeader title="HR AI Usage" description="Real candidate/job counts — HR-specific, not blended with Jaan." />
          <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Candidates Processed" value={hrRow ? hrRow.candidatesCount.toLocaleString() : '—'} />
            <Field label="Jobs Posted" value={hrRow ? hrRow.jobsCount.toLocaleString() : '—'} />
            <Field label="Last Activity" value={hrRow?.lastActivityAt ? formatDateTime(hrRow.lastActivityAt) : 'No activity yet'} />
          </CardBody>
        </Card>
      )}
    </div>
  )
}

function BillingTab({ organizationId }: { organizationId: string }) {
  const subscriptions = useAsync(() => adminBillingService.listSubscriptions(organizationId), [organizationId])
  const invoices = useAsync(() => adminBillingService.listInvoices(organizationId), [organizationId])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Quick Links" description="Billing systems stay separate by design." />
        <CardBody className="flex flex-wrap gap-3">
          <Link to={`/admin/credits?org=${organizationId}`}><Button variant="outline" icon={<Wallet className="size-4" />}>Jaan Voice Credits</Button></Link>
          <Link to={`/admin/quotes?organizationId=${organizationId}`}><Button variant="outline" icon={<FileSpreadsheet className="size-4" />}>Quotes</Button></Link>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Subscriptions" description="Real, Stripe-backed JEXA subscription status." />
        {subscriptions.error ? (
          <CardBody><ErrorState description={subscriptions.error.message} onRetry={subscriptions.refetch} /></CardBody>
        ) : !subscriptions.loading && (subscriptions.data?.length ?? 0) === 0 ? (
          <CardBody><EmptyState compact icon={<Receipt className="size-5" />} title="No subscriptions" /></CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {(subscriptions.data ?? []).map((sub) => (
              <div key={sub.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-[13px] font-medium text-ink-800 uppercase">{sub.employeeType}</p>
                  <p className="text-xs text-ink-500 capitalize">{sub.billingCycle} · {sub.currentPeriodEnd ? `renews ${formatDate(sub.currentPeriodEnd)}` : 'no renewal date'}</p>
                </div>
                <Badge tone={STATUS_TONE[sub.status] ?? 'neutral'} dot>{sub.status.replace('_', ' ')}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <CardHeader title="Invoices" description="Real invoice records, written from Stripe webhook truth." />
        {invoices.error ? (
          <CardBody><ErrorState description={invoices.error.message} onRetry={invoices.refetch} /></CardBody>
        ) : !invoices.loading && (invoices.data?.length ?? 0) === 0 ? (
          <CardBody><EmptyState compact icon={<Receipt className="size-5" />} title="No invoices" /></CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {(invoices.data ?? []).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-[13px] font-medium text-ink-800">{formatCurrency(inv.amount, inv.currency)}</p>
                  <p className="text-xs text-ink-500">{formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}</p>
                </div>
                <Badge tone={STATUS_TONE[inv.status] ?? 'neutral'}>{inv.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function AnalyticsTab({ organizationId, hasVoice }: { organizationId: string; hasVoice: boolean }) {
  const analytics = useAsync(
    () => (hasVoice ? adminCallsService.getOrganizationAnalytics(organizationId) : Promise.resolve(null)),
    [organizationId, hasVoice],
  )

  if (!hasVoice) {
    return <EmptyState icon={<BarChart3 className="size-5" />} title="No analytics available" description="Jaan Voice analytics require an active Jaan subscription. HR AI analytics beyond usage counts aren't computed yet." />
  }
  if (analytics.loading) return <Skeleton className="h-48 w-full" />
  if (analytics.error || !analytics.data) return <ErrorState description={analytics.error?.message} onRetry={analytics.refetch} />

  const data = analytics.data
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Jaan Voice Summary" description="Last 30 days." />
        <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Total Calls" value={String(data.summary.totalCalls)} />
          <Field label="Connected" value={String(data.summary.connectedCalls)} />
          <Field label="Success Rate" value={`${data.summary.successRate}%`} />
          <Field label="Avg Duration" value={`${Math.round(data.summary.averageDurationSeconds)}s`} />
        </CardBody>
      </Card>
    </div>
  )
}

function ActivityTab({ organizationId }: { organizationId: string }) {
  const events = useAsync(() => adminAuditService.list({ organizationId, pageSize: 50 }), [organizationId])

  return (
    <Card>
      <CardHeader title="Recent Activity" description="Real audit trail for this customer." />
      <DataTable
        columns={[
          { key: 'action', header: 'Action', render: (e) => <span className="font-mono text-[12.5px] text-ink-700">{e.action}</span> },
          { key: 'resource', header: 'Resource', render: (e) => <span className="text-ink-600 capitalize">{e.resourceType}</span> },
          { key: 'actor', header: 'Actor', render: (e) => <span className="text-ink-600">{e.actorEmail ?? e.actorType}</span> },
          { key: 'timestamp', header: 'When', render: (e) => formatDateTime(e.createdAt) },
        ]}
        data={events.data?.items ?? []}
        keyExtractor={(e) => e.id}
        loading={events.loading}
        emptyState={<EmptyState icon={<ScrollText className="size-5" />} title="No recorded activity" />}
      />
    </Card>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</p>
      <p className="mt-1 text-[13px] text-ink-800">{value}</p>
    </div>
  )
}
