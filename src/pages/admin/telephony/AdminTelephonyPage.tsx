import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PhoneCall, Radio, ShieldCheck, PhoneOff, Plug } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { adminOrganizationsService, adminTelephonyService } from '@/services/api'
import type { AdminOrganizationSummary } from '@/services/api'
import { PageHeader, Badge, Card, CardHeader, CardBody, EmptyState, ErrorState } from '@/components/ui'
import type { BadgeTone } from '@/components/ui/Badge'
import { CustomerSelector } from '@/components/admin/CustomerSelector'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDateTime } from '@/utils/format'

const CONNECTION_TONE: Record<string, BadgeTone> = {
  connected: 'success',
  not_connected: 'neutral',
}

const NUMBER_TONE: Record<string, BadgeTone> = {
  active: 'success',
  unassigned: 'neutral',
  porting: 'warning',
}

// JEXA Admin Telephony (Phase 11) — a real, read-only view of one
// customer's telephony resources at a time (providers, numbers, trunks,
// compliance, DND). Connecting new carrier accounts or trunks stays a
// customer-org action (their own /internal/telephony console) — admin
// never provisions infrastructure on a customer's behalf here, and status
// values are shown exactly as modeled, never invented.
export default function AdminTelephonyPage() {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Telephony"
        description="Search for a customer to view their telephony resources — real backend, platform-role gated."
      />

      <CustomerSelector value={selected} onChange={setSelected} className="max-w-md" />

      {!selected ? (
        <EmptyState icon={<PhoneCall className="size-5" />} title="Select a customer" description="Search for a customer above to view their telephony resources." compact />
      ) : (
        <OrganizationTelephony organizationId={selected.id} />
      )}
    </div>
  )
}

function OrganizationTelephony({ organizationId }: { organizationId: string }) {
  const overview = useAsync(() => adminTelephonyService.get(organizationId), [organizationId])

  if (overview.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }
  if (overview.error || !overview.data) {
    return <ErrorState description={overview.error?.message} onRetry={overview.refetch} />
  }

  const data = overview.data

  return (
    <>
      <Card>
        <CardHeader title="Provider Accounts" description="Real connection status — never fabricated." />
        {data.providers.length === 0 ? (
          <CardBody>
            <EmptyState compact icon={<Plug className="size-5" />} title="No provider accounts connected" />
          </CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {data.providers.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-[13px] font-medium text-ink-800 uppercase">{p.providerType}</p>
                  <p className="text-xs text-ink-500">{p.accountLabel ?? 'No label'}</p>
                </div>
                <Badge tone={CONNECTION_TONE[p.status] ?? 'neutral'} dot>{p.status.replace('_', ' ')}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Phone Numbers" description="Agent assignment shown exactly as modeled — VoiceAgent.assignedPhoneNumberId." />
        {data.numbers.length === 0 ? (
          <CardBody>
            <EmptyState compact icon={<PhoneCall className="size-5" />} title="No phone numbers" />
          </CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {data.numbers.map((n) => (
              <div key={n.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-[13px] font-medium text-ink-800">{n.number}</p>
                  <p className="text-xs text-ink-500">
                    {n.country} · {n.currency} {n.monthlyCost.toFixed(2)}/mo
                    {n.assignedAgentName ? ` · assigned to ${n.assignedAgentName}` : ' · unassigned'}
                  </p>
                </div>
                <Badge tone={NUMBER_TONE[n.status] ?? 'neutral'} dot>{n.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="SIP Trunks" />
        {data.trunks.length === 0 ? (
          <CardBody>
            <EmptyState compact icon={<Radio className="size-5" />} title="No SIP trunks configured" />
          </CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {data.trunks.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-[13px] font-medium text-ink-800">{t.name}</p>
                  <p className="text-xs text-ink-500">{t.host} · {t.codec}</p>
                </div>
                <Badge tone={t.status === 'active' ? 'success' : 'neutral'} dot>{t.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Compliance" />
        {data.compliance.length === 0 ? (
          <CardBody>
            <EmptyState compact icon={<ShieldCheck className="size-5" />} title="No compliance records" />
          </CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {data.compliance.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-[13px] font-medium text-ink-800">{c.label}</p>
                  <p className="text-xs text-ink-500">{c.region}{c.description ? ` · ${c.description}` : ''}</p>
                </div>
                <Badge tone={c.enabled ? 'success' : 'neutral'} dot>{c.enabled ? 'Enabled' : 'Disabled'}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Do Not Disturb List" />
        {data.dndEntries.length === 0 ? (
          <CardBody>
            <EmptyState compact icon={<PhoneOff className="size-5" />} title="No numbers opted out" />
          </CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {data.dndEntries.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-[13px] font-medium text-ink-800">{d.number}</p>
                  <p className="text-xs text-ink-500">{d.reason ?? 'No reason given'}</p>
                </div>
                <span className="text-xs text-ink-400">{formatDateTime(d.addedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}
