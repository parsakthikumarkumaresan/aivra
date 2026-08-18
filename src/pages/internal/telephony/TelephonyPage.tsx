import { useState } from 'react'
import { PhoneCall, Radio, ShieldCheck, ShieldOff, Signal, Split } from 'lucide-react'
import { usePhoneNumbers, useTelephonyProviders, useSipTrunks, useComplianceSettings, useDndEntries, useRoutingRules } from '@/hooks/useTelephony'
import { telephonyService } from '@/services/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Tabs } from '@/components/ui/Tabs'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDateTime } from '@/utils/format'
import type { PhoneNumber, PhoneNumberStatus, TelephonyProviderAccount, SipTrunk, ComplianceSetting, DndEntry, RoutingRule } from '@/types'

const NUMBER_STATUS_TONE: Record<PhoneNumberStatus, BadgeTone> = { active: 'success', unassigned: 'neutral', porting: 'warning' }

const SECTIONS = [
  { value: 'numbers', label: 'Numbers' },
  { value: 'providers', label: 'Providers' },
  { value: 'sip', label: 'SIP / BYOC' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'dnd', label: 'DND' },
  { value: 'routing', label: 'Routing' },
]

export default function TelephonyPage() {
  const [section, setSection] = useState('numbers')

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-6">
      <PageHeader
        icon={<PhoneCall className="size-5" />}
        title="Telephony"
        description="Platform-level numbers, carriers and call routing. Voice agents only reference an assigned number here — they don't configure it."
      />
      <Tabs items={SECTIONS} value={section} onChange={setSection} />
      {section === 'numbers' && <NumbersSection />}
      {section === 'providers' && <ProvidersSection />}
      {section === 'sip' && <SipSection />}
      {section === 'compliance' && <ComplianceSection />}
      {section === 'dnd' && <DndSection />}
      {section === 'routing' && <RoutingSection />}
    </div>
  )
}

function NumbersSection() {
  const { data, loading } = usePhoneNumbers()
  const columns: DataTableColumn<PhoneNumber>[] = [
    { key: 'number', header: 'Number', render: (n) => <span className="font-mono text-[13px] text-ink-900">{n.number}</span> },
    { key: 'country', header: 'Country', render: (n) => <span className="text-[13px] text-ink-600">{n.country}</span> },
    { key: 'assigned', header: 'Assigned agent', render: (n) => n.assignedAgentName ? <span className="text-[13px] text-ink-700">{n.assignedAgentName}</span> : <span className="text-[13px] text-ink-400">Unassigned</span> },
    { key: 'status', header: 'Status', render: (n) => <Badge tone={NUMBER_STATUS_TONE[n.status]} dot>{n.status}</Badge> },
    { key: 'cost', header: 'Monthly cost', render: (n) => <span className="text-[13px] text-ink-600">{n.currency} {n.monthlyCost.toFixed(2)}</span> },
  ]
  return (
    <DataTable
      columns={columns}
      data={data ?? []}
      keyExtractor={(n) => n.id}
      loading={loading}
      emptyState={<EmptyState icon={<PhoneCall className="size-6" />} title="No numbers provisioned" description="Provision a number from a connected provider to assign it to a voice agent." />}
    />
  )
}

function ProvidersSection() {
  const { data, loading } = useTelephonyProviders()
  const columns: DataTableColumn<TelephonyProviderAccount>[] = [
    { key: 'name', header: 'Provider', render: (p) => <span className="font-medium text-ink-900">{p.name}</span> },
    { key: 'status', header: 'Status', render: (p) => <Badge tone={p.status === 'connected' ? 'success' : 'neutral'} dot>{p.status.replace('_', ' ')}</Badge> },
    { key: 'account', header: 'Account', render: (p) => <span className="text-[13px] text-ink-600">{p.accountLabel ?? '—'}</span> },
    { key: 'numbers', header: 'Numbers', render: (p) => <span className="text-[13px] text-ink-600">{p.numbersCount}</span> },
  ]
  return <DataTable columns={columns} data={data ?? []} keyExtractor={(p) => p.id} loading={loading} />
}

function SipSection() {
  const { data, loading } = useSipTrunks()
  const columns: DataTableColumn<SipTrunk>[] = [
    { key: 'name', header: 'Trunk', render: (t) => <span className="font-medium text-ink-900">{t.name}</span> },
    { key: 'provider', header: 'Provider', render: (t) => <span className="text-[13px] text-ink-600">{t.provider}</span> },
    { key: 'host', header: 'Host', render: (t) => <span className="font-mono text-[12.5px] text-ink-600">{t.host}</span> },
    { key: 'codec', header: 'Codec', render: (t) => <span className="text-[13px] text-ink-600">{t.codec}</span> },
    { key: 'status', header: 'Status', render: (t) => <Badge tone={t.status === 'active' ? 'success' : 'neutral'} dot icon={t.status === 'active' ? <Signal className="size-3" /> : <Radio className="size-3" />}>{t.status}</Badge> },
  ]
  return (
    <DataTable
      columns={columns}
      data={data ?? []}
      keyExtractor={(t) => t.id}
      loading={loading}
      emptyState={<EmptyState icon={<Radio className="size-6" />} title="No SIP trunks configured" description="Bring-your-own-carrier trunks appear here once connected." />}
    />
  )
}

function ComplianceSection() {
  const { data, loading, refetch } = useComplianceSettings()
  async function toggle(setting: ComplianceSetting, enabled: boolean) {
    await telephonyService.toggleCompliance(setting.id, enabled)
    refetch()
  }
  if (loading) return <Card><CardBody><p className="text-sm text-ink-500">Loading…</p></CardBody></Card>
  return (
    <Card>
      <CardHeader title="Compliance settings" description="Regional call-handling and consent requirements." />
      <div className="divide-y divide-ink-100">
        {(data ?? []).map((c) => (
          <div key={c.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
            <div className="flex items-start gap-2.5">
              {c.enabled ? <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success-600" /> : <ShieldOff className="mt-0.5 size-4 shrink-0 text-ink-400" />}
              <div>
                <p className="text-[13.5px] font-medium text-ink-800">{c.label} <Badge tone="neutral" className="ml-1.5">{c.region}</Badge></p>
                <p className="text-xs text-ink-500">{c.description}</p>
              </div>
            </div>
            <Switch checked={c.enabled} onChange={(v) => toggle(c, v)} />
          </div>
        ))}
      </div>
    </Card>
  )
}

function DndSection() {
  const { data, loading } = useDndEntries()
  const columns: DataTableColumn<DndEntry>[] = [
    { key: 'number', header: 'Number', render: (d) => <span className="font-mono text-[13px] text-ink-900">{d.number}</span> },
    { key: 'reason', header: 'Reason', render: (d) => <span className="text-[13px] text-ink-600">{d.reason}</span> },
    { key: 'added', header: 'Added', render: (d) => <span className="text-[13px] text-ink-500">{formatDateTime(d.addedAt)}</span> },
  ]
  return (
    <DataTable
      columns={columns}
      data={data ?? []}
      keyExtractor={(d) => d.id}
      loading={loading}
      emptyState={<EmptyState icon={<ShieldOff className="size-6" />} title="No numbers on the DND list" description="Numbers that opted out of outbound calls appear here." />}
    />
  )
}

function RoutingSection() {
  const { data, loading } = useRoutingRules()
  const columns: DataTableColumn<RoutingRule>[] = [
    { key: 'priority', header: '#', render: (r) => <span className="text-[13px] text-ink-500">{r.priority}</span> },
    { key: 'name', header: 'Rule', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'condition', header: 'Condition', render: (r) => <span className="text-[13px] text-ink-600">{r.condition.replace('_', ' ')}</span> },
    { key: 'destination', header: 'Destination', render: (r) => <span className="text-[13px] text-ink-600">{r.destination}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={r.enabled ? 'success' : 'neutral'} dot icon={<Split className="size-3" />}>{r.enabled ? 'Enabled' : 'Disabled'}</Badge> },
  ]
  return <DataTable columns={columns} data={data ?? []} keyExtractor={(r) => r.id} loading={loading} />
}
