import { useState } from 'react'
import { Radio, Signal } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useTelephonyProviders, useSipTrunks } from '@/hooks/useTelephony'
import { PageHeader } from '@/components/ui/PageHeader'
import { PillTabs } from '@/components/ui/Tabs'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { TelephonyProviderAccount, SipTrunk } from '@/types'

export default function JaanTelephonyPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Telephony' }])
  const providers = useTelephonyProviders()
  const trunks = useSipTrunks()
  const [tab, setTab] = useState('providers')

  const providerColumns: DataTableColumn<TelephonyProviderAccount>[] = [
    { key: 'name', header: 'Provider', render: (p) => <span className="font-medium text-ink-900">{p.name}</span> },
    { key: 'status', header: 'Status', render: (p) => <Badge tone={p.status === 'connected' ? 'success' : 'neutral'} dot>{p.status.replace('_', ' ')}</Badge> },
    { key: 'account', header: 'Account', render: (p) => <span className="text-[13px] text-ink-600">{p.accountLabel ?? '—'}</span> },
    { key: 'numbers', header: 'Numbers', render: (p) => <span className="text-[13px] text-ink-600">{p.numbersCount}</span> },
  ]

  const trunkColumns: DataTableColumn<SipTrunk>[] = [
    { key: 'name', header: 'Trunk', render: (t) => <span className="font-medium text-ink-900">{t.name}</span> },
    { key: 'provider', header: 'Provider', render: (t) => <span className="text-[13px] text-ink-600">{t.provider}</span> },
    { key: 'host', header: 'Host', render: (t) => <span className="font-mono text-[12.5px] text-ink-600">{t.host}</span> },
    { key: 'status', header: 'Status', render: (t) => <Badge tone={t.status === 'active' ? 'success' : 'neutral'} dot icon={t.status === 'active' ? <Signal className="size-3" /> : <Radio className="size-3" />}>{t.status}</Badge> },
  ]

  return (
    <div className="mx-auto max-w-[1300px] space-y-5 p-6">
      <PageHeader title="Telephony" description="Carrier connections powering your Jaan agents — numbers only reference these, they don't configure them." />
      <PillTabs items={[{ value: 'providers', label: 'Providers' }, { value: 'sip', label: 'SIP / BYOC' }]} value={tab} onChange={setTab} />
      {tab === 'providers' ? (
        <DataTable columns={providerColumns} data={providers.data ?? []} keyExtractor={(p) => p.id} loading={providers.loading} />
      ) : (
        <DataTable
          columns={trunkColumns}
          data={trunks.data ?? []}
          keyExtractor={(t) => t.id}
          loading={trunks.loading}
          emptyState={<EmptyState icon={<Radio className="size-6" />} title="No SIP trunks configured" description="Bring-your-own-carrier trunks appear here once connected." />}
        />
      )}
    </div>
  )
}
