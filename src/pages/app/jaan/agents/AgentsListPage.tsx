import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Copy, Download, FlaskConical, Pencil, Plus, Trash2, MoreHorizontal } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useVoiceAgents } from '@/hooks/useVoiceAgentBuilder'
import { useToast } from '@/hooks/useToast'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterBar, FilterSelect } from '@/components/ui/FilterBar'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Popover, PopoverItem } from '@/components/ui/Popover'
import { Modal } from '@/components/ui/Modal'
import { Input, Label, Select } from '@/components/ui/Field'
import type { VoiceAgent, VoiceAgentStatus } from '@/types'
import { VOICE_AGENT_STATUS_LABEL } from '@/types'
import { formatDateTime } from '@/utils/format'

const STATUS_TONE: Record<VoiceAgentStatus, BadgeTone> = { draft: 'neutral', testing: 'info', live: 'success', paused: 'warning' }

function CreateAgentModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const [name, setName] = useState('')
  const [agentType, setAgentType] = useState<'voice' | 'broadcast'>('voice')
  const [model, setModel] = useState<'standard' | 'premium'>('standard')
  const [creating, setCreating] = useState(false)
  const { show } = useToast()

  async function handleCreate() {
    if (!name.trim()) {
      show({ tone: 'error', title: 'Agent name required' })
      return
    }
    setCreating(true)
    // Mock layer doesn't yet expose a createVoiceAgent endpoint — this is the
    // clean seam where a real POST /voice-agents call would go.
    await new Promise((r) => setTimeout(r, 500))
    setCreating(false)
    show({ tone: 'success', title: 'Agent created', description: `${name} is ready to configure.` })
    onCreated('va_acme_jewellery') // demo: land on an existing seeded agent
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Agent"
      description="Give your new Jaan voice agent a name and starting configuration."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} loading={creating}>Create Agent</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label required>Agent Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jaan Receptionist" autoFocus />
        </div>
        <div>
          <Label required>Agent Type</Label>
          <Select value={agentType} onChange={(e) => setAgentType(e.target.value as 'voice' | 'broadcast')}>
            <option value="voice">Voice</option>
            <option value="broadcast">Broadcast</option>
          </Select>
        </div>
        <div>
          <Label required>Model</Label>
          <Select value={model} onChange={(e) => setModel(e.target.value as 'standard' | 'premium')}>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </Select>
        </div>
      </div>
    </Modal>
  )
}

export default function AgentsListPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Agents' }])
  const navigate = useNavigate()
  const agents = useVoiceAgents()
  const { show } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)

  const filtered = useMemo(() => {
    return (agents.data ?? []).filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [agents.data, search, statusFilter])

  async function duplicate(agent: VoiceAgent) {
    show({ tone: 'success', title: 'Agent duplicated', description: `"${agent.name} (Copy)" was added to your workspace.` })
  }

  const columns: DataTableColumn<VoiceAgent>[] = [
    {
      key: 'agent', header: 'Agent', render: (a) => (
        <button onClick={() => navigate(`/app/jaan/agents/${a.id}`)} className="flex items-center gap-2.5 text-left">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Bot className="size-4" /></span>
          <span>
            <span className="block text-[13px] font-semibold text-ink-900">{a.name}</span>
            <span className="block text-[11.5px] text-ink-500">{a.industry}</span>
          </span>
        </button>
      ),
    },
    { key: 'type', header: 'Type', render: () => <span className="text-[13px] text-ink-600">Voice</span> },
    { key: 'model', header: 'Model', render: (a) => <span className="text-[13px] text-ink-600">{a.advancedConfig.llmModel}</span> },
    { key: 'status', header: 'Status', render: (a) => <Badge tone={STATUS_TONE[a.status]} dot>{VOICE_AGENT_STATUS_LABEL[a.status]}</Badge> },
    { key: 'updatedBy', header: 'Updated By', render: () => <span className="text-[13px] text-ink-600">You</span> },
    { key: 'updatedAt', header: 'Updated At', render: (a) => <span className="text-[13px] text-ink-500">{formatDateTime(a.lastUpdatedAt)}</span> },
    {
      key: 'actions', header: '', className: 'text-right', render: (a) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Popover
            align="right"
            trigger={({ toggle }) => (
              <button onClick={toggle} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label="Agent actions">
                <MoreHorizontal className="size-4" />
              </button>
            )}
          >
            {(close) => (
              <>
                <PopoverItem icon={<Pencil className="size-4" />} onClick={() => { close(); navigate(`/app/jaan/agents/${a.id}`) }}>Edit</PopoverItem>
                <PopoverItem icon={<Copy className="size-4" />} onClick={() => { close(); duplicate(a) }}>Duplicate</PopoverItem>
                <PopoverItem icon={<FlaskConical className="size-4" />} onClick={() => { close(); navigate(`/app/jaan/agents/${a.id}?tab=simulate`) }}>Test</PopoverItem>
                <PopoverItem tone="danger" icon={<Trash2 className="size-4" />} onClick={close}>Delete</PopoverItem>
              </>
            )}
          </Popover>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 p-6">
      <PageHeader
        title="Agents"
        description="Create and manage every Jaan voice agent in your workforce."
        actions={
          <>
            <Button variant="outline" icon={<Download className="size-3.5" />}>Export</Button>
            <Button icon={<Plus className="size-3.5" />} onClick={() => setCreateOpen(true)}>Create Agent</Button>
          </>
        }
      />

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search agents…" containerClassName="w-64" />
        <FilterSelect
          label="Status"
          value={statusFilter}
          options={[{ value: 'all', label: 'All' }, ...Object.entries(VOICE_AGENT_STATUS_LABEL).map(([value, label]) => ({ value, label }))]}
          onChange={setStatusFilter}
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(a) => a.id}
        loading={agents.loading}
        onRowClick={(a) => navigate(`/app/jaan/agents/${a.id}`)}
        emptyState={
          <EmptyState
            icon={<Bot className="size-6" />}
            title="No agents yet"
            description="Create your first Jaan voice agent to start handling calls."
            action={<Button icon={<Plus className="size-4" />} onClick={() => setCreateOpen(true)}>Create Agent</Button>}
          />
        }
      />

      <CreateAgentModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={(id) => navigate(`/app/jaan/agents/${id}`)} />
    </div>
  )
}
