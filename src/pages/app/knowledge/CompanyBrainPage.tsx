import { useState } from 'react'
import { Brain, Upload, Link2, Plug, FileText, RefreshCw, AlertTriangle, Users, Mic, CheckCircle2 } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useKnowledgeSource, useKnowledgeSources } from '@/hooks/useKnowledge'
import { useToast } from '@/hooks/useToast'
import { knowledgeService } from '@/services/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { KpiCard } from '@/components/ui/KpiCard'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Drawer } from '@/components/ui/Drawer'
import { Input, Label, Checkbox } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { KnowledgeSourceCard } from '@/components/knowledge/KnowledgeSourceCard'
import type { EmployeeType, KnowledgeSource } from '@/types'
import { formatRelativeTime } from '@/utils/format'

const STATUS_TONE: Record<KnowledgeSource['status'], BadgeTone> = { synced: 'success', syncing: 'info', failed: 'danger', stale: 'warning' }
const STATUS_LABEL: Record<KnowledgeSource['status'], string> = { synced: 'Synced', syncing: 'Syncing', failed: 'Failed', stale: 'Stale' }
const TYPE_LABEL: Record<KnowledgeSource['type'], string> = { file: 'File', url: 'URL', connected_source: 'Connected Source' }
const EMPLOYEE_ICON = { hr: Users, voice: Mic }
const EMPLOYEE_LABEL = { hr: 'Aivra Hr', voice: 'AI Voice Employee' }

export default function CompanyBrainPage() {
  useSetBreadcrumbs([{ label: 'Company Brain' }])
  const sources = useKnowledgeSources()
  const { show } = useToast()
  const [addModal, setAddModal] = useState<'file' | 'url' | 'connect' | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [adding, setAdding] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const detail = useKnowledgeSource(selectedId ?? '')

  const data = sources.data ?? []
  const totalDocs = data.reduce((sum, s) => sum + s.documentCount, 0)
  const failedCount = data.filter((s) => s.status === 'failed').length
  const staleCount = data.filter((s) => s.status === 'stale').length

  async function handleAdd() {
    if (!inputValue.trim()) return
    setAdding(true)
    if (addModal === 'url') await knowledgeService.addUrlSource(inputValue)
    else await knowledgeService.addFileSource(inputValue)
    setAdding(false)
    setAddModal(null)
    setInputValue('')
    show({ tone: 'success', title: 'Source added', description: 'Indexing has started — this usually takes a few minutes.' })
    sources.refetch()
  }

  async function handleReindex(id: string) {
    await knowledgeService.reindex(id)
    show({ tone: 'success', title: 'Re-indexing started' })
    sources.refetch()
    detail.refetch()
  }

  async function handleAccessToggle(source: KnowledgeSource, type: EmployeeType) {
    const next = source.employeeAccess.includes(type) ? source.employeeAccess.filter((t) => t !== type) : [...source.employeeAccess, type]
    await knowledgeService.setEmployeeAccess(source.id, next)
    sources.refetch()
    detail.refetch()
  }

  const columns: DataTableColumn<KnowledgeSource>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (s) => (
        <button onClick={() => setSelectedId(s.id)} className="flex items-center gap-2.5 text-left">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <FileText className="size-3.5" />
          </span>
          <span>
            <span className="block font-medium text-ink-900 hover:text-brand-700">{s.name}</span>
            <span className="block text-xs text-ink-500">{s.documentCount} documents · {s.sizeLabel}</span>
          </span>
        </button>
      ),
    },
    { key: 'type', header: 'Type', render: (s) => <span className="text-[13px] text-ink-600">{TYPE_LABEL[s.type]}</span> },
    { key: 'owner', header: 'Owner', render: (s) => <span className="text-[13px] text-ink-600">{s.owner}</span> },
    { key: 'sync', header: 'Last Sync', render: (s) => <span className="text-[13px] text-ink-500">{formatRelativeTime(s.lastSyncAt)}</span> },
    { key: 'status', header: 'Status', render: (s) => <Badge tone={STATUS_TONE[s.status]} dot>{STATUS_LABEL[s.status]}</Badge> },
    {
      key: 'access',
      header: 'Employee Access',
      render: (s) =>
        s.employeeAccess.length === 0 ? (
          <span className="text-xs text-ink-400">Not assigned</span>
        ) : (
          <div className="flex items-center gap-1.5">
            {s.employeeAccess.map((type) => {
              const Icon = EMPLOYEE_ICON[type]
              return (
                <span key={type} className="flex items-center gap-1 rounded-full bg-ink-100 px-2 py-1 text-xs text-ink-600">
                  <Icon className="size-3" />
                  {type.toUpperCase()}
                </span>
              )
            })}
          </div>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Brain className="size-5" />}
        title="Company Brain"
        description="Shared, governed knowledge that powers every AI Employee."
        actions={
          <>
            <Button variant="outline" icon={<Upload className="size-4" />} onClick={() => setAddModal('file')}>
              Upload File
            </Button>
            <Button variant="outline" icon={<Link2 className="size-4" />} onClick={() => setAddModal('url')}>
              Add URL
            </Button>
            <Button icon={<Plug className="size-4" />} onClick={() => setAddModal('connect')}>
              Connect Source
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Sources" value={String(data.length)} icon={<Brain className="size-4" />} tooltip="Total knowledge sources connected to your organization." />
        <KpiCard label="Indexed Documents" value={String(totalDocs)} icon={<FileText className="size-4" />} tooltip="Total documents indexed and available to AI Employees." />
        <KpiCard label="Failed Sources" value={String(failedCount)} icon={<AlertTriangle className="size-4" />} tooltip="Sources that failed to sync and need attention." trendGood="down" />
        <KpiCard label="Stale Sources" value={String(staleCount)} icon={<RefreshCw className="size-4" />} tooltip="Sources that have not synced recently and may be out of date." trendGood="down" />
      </div>

      {/* Desktop / tablet table */}
      <div className="hidden sm:block">
        <DataTable
          columns={columns}
          data={data}
          keyExtractor={(s) => s.id}
          loading={sources.loading}
          emptyState={
            <EmptyState
              icon={<Brain className="size-6" />}
              title="No knowledge sources yet"
              description="AI Employees need approved knowledge to answer questions accurately. Upload a file or connect a source to get started."
              action={<Button icon={<Upload className="size-4" />} onClick={() => setAddModal('file')}>Upload File</Button>}
            />
          }
        />
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-3 sm:hidden">
        {sources.loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : data.length === 0 ? (
          <EmptyState
            icon={<Brain className="size-6" />}
            title="No knowledge sources yet"
            description="Upload a file or connect a source to get started."
          />
        ) : (
          data.map((s) => <KnowledgeSourceCard key={s.id} source={s} onClick={() => setSelectedId(s.id)} />)
        )}
      </div>

      {/* Add source modal */}
      <Modal
        open={addModal !== null}
        onClose={() => setAddModal(null)}
        title={addModal === 'file' ? 'Upload a file' : addModal === 'url' ? 'Add a URL source' : 'Connect a source'}
        footer={
          addModal === 'connect' ? (
            <Button variant="outline" onClick={() => setAddModal(null)}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setAddModal(null)} disabled={adding}>
                Cancel
              </Button>
              <Button onClick={handleAdd} loading={adding} disabled={!inputValue.trim()}>
                Add Source
              </Button>
            </>
          )
        }
      >
        {addModal === 'file' && (
          <div className="space-y-3">
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 bg-ink-25 px-6 py-10 text-center">
              <Upload className="size-6 text-ink-400" />
              <p className="mt-2 text-[13px] text-ink-500">Drag and drop a PDF, DOCX or CSV, or enter a file name below.</p>
            </div>
            <div>
              <Label required>File name</Label>
              <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="e.g. Loyalty Program Terms.pdf" />
            </div>
          </div>
        )}
        {addModal === 'url' && (
          <div>
            <Label required>URL</Label>
            <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="https://your-site.com/faq" />
          </div>
        )}
        {addModal === 'connect' && (
          <div className="space-y-2">
            {['Notion', 'Google Drive', 'Confluence', 'Zendesk Help Center'].map((name) => (
              <div key={name} className="flex items-center justify-between rounded-lg border border-ink-200 p-3">
                <span className="text-[13px] font-medium text-ink-800">{name}</span>
                <Button size="sm" variant="outline" disabled>
                  Connect
                </Button>
              </div>
            ))}
            <p className="pt-1 text-xs text-ink-400">Connected sources require an integration — set these up from Integrations.</p>
          </div>
        )}
      </Modal>

      {/* Source detail drawer */}
      <Drawer open={Boolean(selectedId)} onClose={() => setSelectedId(null)} title={detail.data?.name ?? 'Source'} width="440px">
        {detail.loading ? (
          <Skeleton className="h-64 w-full" />
        ) : detail.data ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <Badge tone={STATUS_TONE[detail.data.status]} dot>{STATUS_LABEL[detail.data.status]}</Badge>
              <Button size="sm" variant="outline" icon={<RefreshCw className="size-3.5" />} onClick={() => handleReindex(detail.data!.id)}>
                Re-index
              </Button>
            </div>

            {detail.data.failureReason && (
              <div className="flex items-start gap-2 rounded-lg border border-danger-100 bg-danger-50 px-3 py-2.5 text-[13px] text-danger-700">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                {detail.data.failureReason}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <MetaRow label="Type" value={TYPE_LABEL[detail.data.type]} />
              <MetaRow label="Owner" value={detail.data.owner} />
              <MetaRow label="Version" value={detail.data.version} />
              <MetaRow label="Documents" value={String(detail.data.documentCount)} />
              <MetaRow label="Size" value={detail.data.sizeLabel} />
              <MetaRow label="Last Sync" value={formatRelativeTime(detail.data.lastSyncAt)} />
            </div>

            <div>
              <p className="mb-1.5 text-[13px] font-semibold text-ink-800">Permissions</p>
              <p className="text-[13px] text-ink-600">{detail.data.permissions}</p>
            </div>

            <div>
              <p className="mb-2 text-[13px] font-semibold text-ink-800">Employee Access</p>
              <div className="space-y-2">
                {(['hr', 'voice'] as EmployeeType[]).map((type) => (
                  <Checkbox
                    key={type}
                    checked={detail.data!.employeeAccess.includes(type)}
                    onChange={() => handleAccessToggle(detail.data!, type)}
                    label={EMPLOYEE_LABEL[type]}
                  />
                ))}
              </div>
              {detail.data.employeeAccess.length === 0 && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-warning-600">
                  <AlertTriangle className="size-3.5" />
                  This source isn't assigned to any employee yet — it won't be used in conversations.
                </p>
              )}
            </div>

            <div>
              <p className="mb-2 text-[13px] font-semibold text-ink-800">Indexed Sections</p>
              <div className="space-y-2">
                {detail.data.chunks.map((chunk) => (
                  <div key={chunk.id} className="rounded-lg border border-ink-200 p-3">
                    <p className="text-[13px] font-medium text-ink-800">{chunk.heading}</p>
                    <p className="mt-1 text-xs text-ink-500">{chunk.excerpt}</p>
                  </div>
                ))}
              </div>
            </div>

            {detail.data.status === 'synced' && (
              <div className="flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2.5 text-[13px] text-success-700">
                <CheckCircle2 className="size-4 shrink-0" />
                This source is up to date and available to assigned AI Employees.
              </div>
            )}
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-400">{label}</p>
      <p className="font-medium text-ink-800">{value}</p>
    </div>
  )
}
