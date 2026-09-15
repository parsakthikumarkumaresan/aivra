import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Megaphone, Plus } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useCampaigns } from '@/hooks/useJaan'
import { useVoiceAgents } from '@/hooks/useVoiceAgentBuilder'
import { jaanCampaignsService } from '@/services/api'
import { useToast } from '@/hooks/useToast'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar, FilterSelect } from '@/components/ui/FilterBar'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Input, Label, Select } from '@/components/ui/Field'
import type { Campaign, CampaignStatus, CampaignType } from '@/types'
import { CAMPAIGN_STATUS_LABEL, CAMPAIGN_TYPE_LABEL } from '@/types'
import { formatDateTime } from '@/utils/format'

const STATUS_TONE: Record<CampaignStatus, BadgeTone> = { draft: 'neutral', scheduled: 'info', running: 'success', paused: 'warning', completed: 'neutral', failed: 'danger' }

function CreateCampaignModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const agents = useVoiceAgents()
  const [name, setName] = useState('')
  const [type, setType] = useState<CampaignType>('outbound')
  const [agentId, setAgentId] = useState('')
  const { show } = useToast()

  async function create() {
    const agent = agents.data?.find((a) => a.id === agentId) ?? agents.data?.[0]
    if (!name.trim() || !agent) return
    await jaanCampaignsService.createCampaign({
      name, type, agentId: agent.id, agentName: agent.name, contactListName: 'New Contact List', totalContacts: 0,
      startTime: new Date().toISOString(), retryPolicy: { maxAttempts: 3, retryDelayMinutes: 60 }, taskExpiryMinutes: 1440,
      concurrency: 5, callerId: '', voicemailBehavior: 'leave_message',
    })
    show({ tone: 'success', title: 'Campaign created', description: name })
    onCreated()
    onClose()
    setName('')
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Campaign" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create}>Create</Button></>}>
      <div className="space-y-4">
        <div><Label required>Campaign Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Diwali Follow-up" autoFocus /></div>
        <div>
          <Label required>Type</Label>
          <Select value={type} onChange={(e) => setType(e.target.value as CampaignType)}>
            {Object.entries(CAMPAIGN_TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
        </div>
        <div>
          <Label required>Agent</Label>
          <Select value={agentId} onChange={(e) => setAgentId(e.target.value)}>
            <option value="">Select an agent…</option>
            {(agents.data ?? []).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
        </div>
      </div>
    </Modal>
  )
}

export default function CampaignsListPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Campaigns' }])
  const navigate = useNavigate()
  const campaigns = useCampaigns()
  const [statusFilter, setStatusFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)

  const filtered = (campaigns.data ?? []).filter((c) => statusFilter === 'all' || c.status === statusFilter)

  const columns: DataTableColumn<Campaign>[] = [
    { key: 'name', header: 'Campaign', render: (c) => (
      <span className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Megaphone className="size-4" /></span>
        <span>
          <span className="block text-[13px] font-semibold text-ink-900">{c.name}</span>
          <span className="block text-[11.5px] text-ink-500">{c.agentName}</span>
        </span>
      </span>
    ) },
    { key: 'type', header: 'Type', render: (c) => <span className="text-[13px] text-ink-600">{CAMPAIGN_TYPE_LABEL[c.type]}</span> },
    { key: 'contacts', header: 'Contacts', render: (c) => <span className="text-[13px] text-ink-600">{c.totalContacts}</span> },
    { key: 'status', header: 'Status', render: (c) => <Badge tone={STATUS_TONE[c.status]} dot>{CAMPAIGN_STATUS_LABEL[c.status]}</Badge> },
    { key: 'start', header: 'Start Time', render: (c) => <span className="text-[13px] text-ink-500">{formatDateTime(c.startTime)}</span> },
  ]

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-6">
      <PageHeader
        title="Campaigns"
        description="Outbound, realtime and batch calling campaigns run by your Jaan agents."
        actions={<Button icon={<Plus className="size-3.5" />} onClick={() => setCreateOpen(true)}>Create Campaign</Button>}
      />
      <FilterBar>
        <FilterSelect label="Status" value={statusFilter} options={[{ value: 'all', label: 'All' }, ...Object.entries(CAMPAIGN_STATUS_LABEL).map(([v, l]) => ({ value: v, label: l }))]} onChange={setStatusFilter} />
      </FilterBar>
      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(c) => c.id}
        loading={campaigns.loading}
        onRowClick={(c) => navigate(`/app/jaan/campaigns/${c.id}`)}
        emptyState={<EmptyState icon={<Megaphone className="size-6" />} title="No campaigns yet" description="Launch your first outbound or triggered calling campaign." action={<Button icon={<Plus className="size-4" />} onClick={() => setCreateOpen(true)}>Create Campaign</Button>} />}
      />
      <CreateCampaignModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={campaigns.refetch} />
    </div>
  )
}
