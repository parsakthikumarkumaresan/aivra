import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Receipt, Wallet, FileSpreadsheet, CreditCard, TrendingUp } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { adminBillingService, adminBusinessService, adminOrganizationsService } from '@/services/api'
import type { AdminOrganizationSummary } from '@/services/api'
import { PageHeader, KpiCard, Badge, Card, CardHeader, CardBody, EmptyState, ErrorState, Button } from '@/components/ui'
import type { BadgeTone } from '@/components/ui/Badge'
import { CustomerSelector } from '@/components/admin/CustomerSelector'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/utils/format'

const SUBSCRIPTION_TONE: Record<string, BadgeTone> = {
  active: 'success',
  pending_activation: 'info',
  paused: 'neutral',
  past_due: 'danger',
  cancelled: 'neutral',
  expired: 'neutral',
  not_hired: 'neutral',
}

const INVOICE_TONE: Record<string, BadgeTone> = {
  draft: 'neutral',
  open: 'warning',
  paid: 'success',
  void: 'neutral',
  uncollectible: 'danger',
}

// JEXA Admin Billing (Phase 10) — a unified administrative VIEW across
// three deliberately separate real systems: JEXA subscription billing
// (this page, Stripe-backed), Jaan Voice Credits (Phase 4, canonical
// credit ledger — linked out to, never duplicated), and Quotes (Phase 7 —
// linked out to). No new Stripe integration, no fabricated invoices.
export default function AdminBillingPage() {
  const [params] = useSearchParams()
  const deepLinkOrgId = params.get('org')

  const [selected, setSelected] = useState<AdminOrganizationSummary | null>(null)
  const deepLinked = useAsync(
    () => (deepLinkOrgId ? adminOrganizationsService.get(deepLinkOrgId) : Promise.resolve(null)),
    [deepLinkOrgId],
  )
  useEffect(() => {
    if (deepLinked.data) setSelected(deepLinked.data)
  }, [deepLinked.data])

  const revenue = useAsync(() => adminBusinessService.getOverview(), [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Revenue"
        description="Platform-wide revenue, plus per-customer subscription and invoice detail. Jaan Voice Credits and Quotes stay in their own dedicated pages — linked below, never duplicated."
      />

      {revenue.error ? null : revenue.loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : revenue.data ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="MRR" value={formatCurrency(revenue.data.mrr, revenue.data.mrrCurrency)} icon={<TrendingUp className="size-4" />} tooltip="Active HR AI self-service subscriptions, monthly-normalized." />
          <KpiCard label="Total Revenue" value={formatCurrency(revenue.data.totalRevenue, revenue.data.mrrCurrency)} icon={<Wallet className="size-4" />} tooltip="Paid subscription invoices + paid Jaan recharges, all time." />
          <KpiCard label="Active Customers" value={String(revenue.data.activeCustomers)} icon={<Receipt className="size-4" />} />
          <KpiCard label="Total Customers" value={String(revenue.data.totalCustomers)} icon={<Receipt className="size-4" />} />
        </div>
      ) : null}

      <CustomerSelector value={selected} onChange={setSelected} className="max-w-md" />

      {!selected ? (
        <EmptyState icon={<Receipt className="size-5" />} title="Select a customer" description="Search for a customer above to view their billing." compact />
      ) : (
        <OrganizationBilling organizationId={selected.id} />
      )}
    </div>
  )
}

function OrganizationBilling({ organizationId }: { organizationId: string }) {
  const subscriptions = useAsync(() => adminBillingService.listSubscriptions(organizationId), [organizationId])
  const invoices = useAsync(() => adminBillingService.listInvoices(organizationId), [organizationId])

  return (
    <>
      <Card>
        <CardHeader title="Quick Links" description="These systems stay separate by design — jump into the one you need." />
        <CardBody className="flex flex-wrap gap-3">
          <Link to={`/admin/credits?org=${organizationId}`}>
            <Button variant="outline" icon={<Wallet className="size-4" />}>Jaan Voice Credits</Button>
          </Link>
          <Link to={`/admin/quotes?organizationId=${organizationId}`}>
            <Button variant="outline" icon={<FileSpreadsheet className="size-4" />}>Quotes</Button>
          </Link>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Subscriptions" description="Real, Stripe-backed JEXA subscription status per AI Employee." />
        {subscriptions.error ? (
          <CardBody><ErrorState description={subscriptions.error.message} onRetry={subscriptions.refetch} /></CardBody>
        ) : !subscriptions.loading && (subscriptions.data?.length ?? 0) === 0 ? (
          <CardBody>
            <EmptyState compact icon={<CreditCard className="size-5" />} title="No subscriptions" description="This organization hasn't hired any self-service AI Employee." />
          </CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {(subscriptions.data ?? []).map((sub) => (
              <div key={sub.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-[13px] font-medium text-ink-800 uppercase">{sub.employeeType}</p>
                  <p className="text-xs text-ink-500 capitalize">
                    {sub.billingCycle} · {sub.currentPeriodEnd ? `renews ${formatDate(sub.currentPeriodEnd)}` : 'no renewal date'}
                    {sub.cancelAtPeriodEnd && ' · cancels at period end'}
                  </p>
                </div>
                <Badge tone={SUBSCRIPTION_TONE[sub.status] ?? 'neutral'} dot>{sub.status.replace('_', ' ')}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Invoices" description="Real invoice records, written from Stripe webhook truth — never marked paid from the frontend." />
        {invoices.error ? (
          <CardBody><ErrorState description={invoices.error.message} onRetry={invoices.refetch} /></CardBody>
        ) : !invoices.loading && (invoices.data?.length ?? 0) === 0 ? (
          <CardBody>
            <EmptyState compact icon={<Receipt className="size-5" />} title="No invoices" />
          </CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {(invoices.data ?? []).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-[13px] font-medium text-ink-800">
                    {formatCurrency(inv.amount, inv.currency)}
                  </p>
                  <p className="text-xs text-ink-500">
                    {formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={INVOICE_TONE[inv.status] ?? 'neutral'}>{inv.status}</Badge>
                  {inv.hostedInvoiceUrl && (
                    <a href={inv.hostedInvoiceUrl} target="_blank" rel="noreferrer" className="text-[12.5px] font-medium text-brand-600 hover:text-brand-700">
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}
