import { PhoneCall, Plus, Upload, Download } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { usePhoneNumbers } from '@/hooks/useTelephony'
import { useVoiceAgents } from '@/hooks/useVoiceAgentBuilder'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import type { PhoneNumber, PhoneNumberStatus } from '@/types'

const STATUS_TONE: Record<PhoneNumberStatus, BadgeTone> = { active: 'success', unassigned: 'neutral', porting: 'warning' }

export default function JaanNumbersPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Telephony' }, { label: 'Numbers' }])
  const numbers = usePhoneNumbers()
  const agents = useVoiceAgents()

  const columns: DataTableColumn<PhoneNumber>[] = [
    { key: 'number', header: 'Number', render: (n) => <span className="font-mono text-[13px] text-ink-900">{n.number}</span> },
    { key: 'name', header: 'Name', render: (n) => <span className="text-[13px] text-ink-600">{n.country} number</span> },
    { key: 'provider', header: 'Provider', render: (n) => <span className="text-[13px] text-ink-600">{n.providerId}</span> },
    { key: 'providedBy', header: 'Provided By', render: () => <span className="text-[13px] text-ink-600">JEXA.AI</span> },
    { key: 'capabilities', header: 'Capabilities', render: () => <span className="text-[13px] text-ink-600">Voice</span> },
    { key: 'agent', header: 'Inbound Agent', render: (n) => <span className="text-[13px] text-ink-700">{n.assignedAgentName ?? <span className="text-ink-400">Unassigned</span>}</span> },
    { key: 'status', header: 'Status', render: (n) => <Badge tone={STATUS_TONE[n.status]} dot>{n.status}</Badge> },
  ]

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-6">
      <PageHeader
        title="Numbers"
        description="Phone numbers connected to your Jaan agents."
        actions={<><Button variant="outline" icon={<Upload className="size-3.5" />}>Import</Button><Button icon={<Plus className="size-3.5" />}>Add Number</Button></>}
      />
      <DataTable
        columns={columns}
        data={numbers.data ?? []}
        keyExtractor={(n) => n.id}
        loading={numbers.loading || agents.loading}
        emptyState={<EmptyState icon={<PhoneCall className="size-6" />} title="No numbers yet" description="Add a phone number so customers can call your Jaan agents." action={<Button icon={<Plus className="size-4" />}>Add Number</Button>} />}
      />
      {numbers.data && numbers.data.length > 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" icon={<Download className="size-3.5" />}>Export</Button>
        </div>
      )}
    </div>
  )
}
