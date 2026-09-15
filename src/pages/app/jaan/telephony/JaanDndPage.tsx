import { useState } from 'react'
import { ShieldOff, Plus, Upload, Download } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useDndEntries } from '@/hooks/useTelephony'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import type { DndEntry } from '@/types'
import { formatDateTime } from '@/utils/format'

export default function JaanDndPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Telephony' }, { label: 'DND' }])
  const dnd = useDndEntries()
  const [search, setSearch] = useState('')

  const filtered = (dnd.data ?? []).filter((d) => !search || d.number.includes(search))

  const columns: DataTableColumn<DndEntry>[] = [
    { key: 'number', header: 'Number', render: (d) => <span className="font-mono text-[13px] text-ink-900">{d.number}</span> },
    { key: 'reason', header: 'Reason', render: (d) => <span className="text-[13px] text-ink-600">{d.reason}</span> },
    { key: 'added', header: 'Added', render: (d) => <span className="text-[13px] text-ink-500">{formatDateTime(d.addedAt)}</span> },
  ]

  return (
    <div className="mx-auto max-w-[1200px] space-y-5 p-6">
      <PageHeader
        title="Do Not Disturb"
        description="Numbers excluded from outbound campaigns."
        actions={<><Button variant="outline" icon={<Upload className="size-3.5" />}>Import</Button><Button variant="outline" icon={<Download className="size-3.5" />}>Export</Button><Button icon={<Plus className="size-3.5" />}>Add Number</Button></>}
      />
      <SearchInput value={search} onChange={setSearch} placeholder="Search number…" containerClassName="w-64" />
      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(d) => d.id}
        loading={dnd.loading}
        emptyState={<EmptyState icon={<ShieldOff className="size-6" />} title="No numbers on the DND list" description="Numbers that opted out of outbound calls will appear here." />}
      />
    </div>
  )
}
