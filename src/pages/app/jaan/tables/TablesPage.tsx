import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, Plus, Upload } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useAgentTables } from '@/hooks/useJaan'
import { jaanTablesService } from '@/services/api'
import { useToast } from '@/hooks/useToast'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Input, Label, Textarea } from '@/components/ui/Field'
import type { AgentTable } from '@/types'
import { formatDateTime } from '@/utils/format'

function CreateTableModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const { show } = useToast()

  async function create() {
    if (!name.trim()) return
    setCreating(true)
    await jaanTablesService.createTable({ name, description, columns: [{ id: 'c1', name: 'Column 1', type: 'text' }] })
    setCreating(false)
    show({ tone: 'success', title: 'Table created', description: name })
    onCreated()
    onClose()
    setName('')
    setDescription('')
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Table" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create} loading={creating}>Create</Button></>}>
      <div className="space-y-4">
        <div><Label required>Table Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Store Locations" autoFocus /></div>
        <div><Label>Description</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this table is used for during a call" /></div>
      </div>
    </Modal>
  )
}

export default function TablesPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Tables' }])
  const navigate = useNavigate()
  const tables = useAgentTables()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const filtered = (tables.data ?? []).filter((t) => !search || t.name.toLowerCase().includes(search.toLowerCase()))

  const columns: DataTableColumn<AgentTable>[] = [
    { key: 'name', header: 'Table', render: (t) => (
      <span className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Database className="size-4" /></span>
        <span>
          <span className="block text-[13px] font-semibold text-ink-900">{t.name}</span>
          <span className="block text-[11.5px] text-ink-500">{t.description}</span>
        </span>
      </span>
    ) },
    { key: 'columns', header: 'Columns', render: (t) => <span className="text-[13px] text-ink-600">{t.columns.length}</span> },
    { key: 'rows', header: 'Rows', render: (t) => <span className="text-[13px] text-ink-600">{t.rowCount}</span> },
    { key: 'access', header: 'Agent Access', render: (t) => <span className="text-[13px] text-ink-600">{t.agentAccess.length} agent{t.agentAccess.length !== 1 ? 's' : ''}</span> },
    { key: 'updated', header: 'Updated', render: (t) => <span className="text-[13px] text-ink-500">{formatDateTime(t.updatedAt)}</span> },
  ]

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-6">
      <PageHeader
        title="Tables"
        description="Structured data Jaan agents can look up during a call — customers, appointments, products and more."
        actions={
          <>
            <Button variant="outline" icon={<Upload className="size-3.5" />}>Import</Button>
            <Button icon={<Plus className="size-3.5" />} onClick={() => setCreateOpen(true)}>Create Table</Button>
          </>
        }
      />
      <SearchInput value={search} onChange={setSearch} placeholder="Search tables…" containerClassName="w-64" />
      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(t) => t.id}
        loading={tables.loading}
        onRowClick={(t) => navigate(`/app/jaan/tables/${t.id}`)}
        emptyState={
          <EmptyState
            icon={<Database className="size-6" />}
            title="No tables yet"
            description="Create a structured table so Jaan can look up real data mid-call."
            action={<Button icon={<Plus className="size-4" />} onClick={() => setCreateOpen(true)}>Create Table</Button>}
          />
        }
      />
      <CreateTableModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={tables.refetch} />
    </div>
  )
}
