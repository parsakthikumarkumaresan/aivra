import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { adminCreditsService, adminOrganizationsService } from '@/services/api'
import type { AdminOrganizationSummary } from '@/services/api'
import { PageHeader, ErrorState, Button, EmptyState } from '@/components/ui'
import { CustomerSelector } from '@/components/admin/CustomerSelector'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDateTime } from '@/utils/format'

// Read-only usage view (spec section 12/19) — for making adjustments, see
// /admin/credits. The customer is chosen via the real Customer Directory
// (CustomerSelector) rather than a raw organization-ID text box; a
// Customer Detail "View Usage" link can also deep-link here via ?org=.
export default function AdminUsagePage() {
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

  const summary = useAsync(
    () => (selected ? adminCreditsService.getOrganizationCredits(selected.id) : Promise.resolve(null)),
    [selected?.id],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Voice Usage"
        description="Per-customer Jaan Voice Credit usage. Real backend — to add or adjust credits, use Credits."
        actions={
          <Link to="/admin/credits">
            <Button variant="outline">Manage Credits</Button>
          </Link>
        }
      />

      <CustomerSelector value={selected} onChange={setSelected} className="max-w-md" />

      {!selected ? (
        <EmptyState icon={<Wallet className="size-5" />} title="Select a customer" description="Search for a customer above to view their voice usage." compact />
      ) : summary.error ? (
        <ErrorState title="Could not load usage" onRetry={summary.refetch} />
      ) : summary.loading || !summary.data ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Tile label="Balance" value={`${summary.data.balanceMinutes} min`} />
            <Tile label="Purchased" value={`${summary.data.purchasedMinutes} min`} />
            <Tile label="Used" value={`${summary.data.usedMinutes} min`} />
            <Tile label="Last Recharge" value={summary.data.lastRechargeAt ? formatDateTime(summary.data.lastRechargeAt) : 'Never'} />
          </div>
          {summary.data.purchasedMinutes > 0 && (
            <div className="rounded-xl border border-ink-200 bg-surface p-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-ink-500">Usage</span>
                <span className="font-medium text-ink-800">{summary.data.usagePercent}%</span>
              </div>
              <ProgressBar value={summary.data.usagePercent} className="mt-2" tone={summary.data.usagePercent > 90 ? 'danger' : 'brand'} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-surface p-4">
      <p className="text-[12px] font-medium text-ink-500">{label}</p>
      <p className="mt-1 text-[20px] font-bold text-ink-900">{value}</p>
    </div>
  )
}
