import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Archive, Trash2, Upload, Users2 } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useCandidates, useJobs } from '@/hooks/useHr'
import { useToast } from '@/hooks/useToast'
import { hrService } from '@/services/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { FilterBar, FilterSelect } from '@/components/ui/FilterBar'
import { SearchInput } from '@/components/ui/SearchInput'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { ScoreRing } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { Modal } from '@/components/ui/Modal'
import { HrSubNav } from '@/components/employees/hr/HrSubNav'
import { CANDIDATE_PIPELINE_STAGES, CANDIDATE_STAGE_LABEL } from '@/types'
import type { Candidate, CandidateStage } from '@/types'
import { formatDate } from '@/utils/format'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
  { value: 'all', label: 'All' },
]

export default function CandidatePipelinePage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'AI HR Employee', href: '/app/employees/hr' }, { label: 'Candidates' }])
  const [params, setParams] = useSearchParams()
  const jobs = useJobs()
  const { show } = useToast()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmingBulkArchive, setConfirmingBulkArchive] = useState(false)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState<Candidate | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const jobId = params.get('job') ?? 'all'
  const stage = (params.get('stage') as CandidateStage | 'all') ?? 'all'
  const status = (params.get('status') as 'active' | 'archived' | 'all') ?? 'active'

  const candidates = useCandidates({ jobId, stage, search, status })

  const jobOptions = useMemo(
    () => [{ value: 'all', label: 'All Jobs' }, ...(jobs.data ?? []).map((j) => ({ value: j.id, label: j.title }))],
    [jobs.data],
  )

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value === 'all') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
    setSelected(new Set())
  }

  const hasFilters = jobId !== 'all' || stage !== 'all' || status !== 'active' || Boolean(search)

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const visibleIds = (candidates.data ?? []).map((c) => c.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))

  function toggleSelectAllVisible() {
    setSelected(() => {
      if (allVisibleSelected) return new Set()
      return new Set(visibleIds)
    })
  }

  async function submitBulkArchive() {
    setBulkBusy(true)
    const result = await hrService.bulkArchiveCandidates(Array.from(selected))
    setBulkBusy(false)
    setConfirmingBulkArchive(false)
    setSelected(new Set())
    const skippedCount = Object.keys(result.skipped).length
    show({
      tone: skippedCount > 0 ? 'warning' : 'success',
      title: `${result.archived.length} candidate${result.archived.length === 1 ? '' : 's'} archived`,
      description: skippedCount > 0 ? `${skippedCount} could not be archived.` : 'Their recruitment history has been preserved.',
    })
    candidates.refetch()
  }

  // "Delete" in the HR UI is implemented as archival — the same
  // production-grade mechanism bulk archive already uses — so candidate
  // history, resumes, assessments, screenings and audit records are never
  // destroyed. The label stays "Delete" because that's the mental model the
  // HR user has (remove from the active pipeline), even though internally
  // it's a reversible archive.
  async function submitDelete() {
    if (!confirmingDelete) return
    setDeleteBusy(true)
    await hrService.archiveCandidate(confirmingDelete.id)
    setDeleteBusy(false)
    setConfirmingDelete(null)
    show({ tone: 'success', title: `${confirmingDelete.name} removed from the pipeline`, description: 'Their recruitment history has been preserved.' })
    candidates.refetch()
  }

  const columns: DataTableColumn<Candidate>[] = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={allVisibleSelected}
          onChange={toggleSelectAllVisible}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select all visible candidates"
          className="size-4 rounded border-ink-300 text-brand-600 focus:ring-2 focus:ring-brand-500/30"
        />
      ),
      headerClassName: 'w-10',
      render: (c) => (
        <input
          type="checkbox"
          checked={selected.has(c.id)}
          onChange={() => toggleSelected(c.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${c.name}`}
          className="size-4 rounded border-ink-300 text-brand-600 focus:ring-2 focus:ring-brand-500/30"
        />
      ),
    },
    {
      key: 'candidate',
      header: 'Candidate',
      render: (c) => (
        <Link to={`/app/employees/hr/candidates/${c.id}`} className="flex items-center gap-2.5">
          <Avatar name={c.name} size="sm" />
          <span className="min-w-0">
            <span className="block font-medium text-ink-900">{c.name}</span>
            <span className="block truncate text-xs text-ink-500">{c.currentTitle}</span>
          </span>
        </Link>
      ),
    },
    {
      key: 'job',
      header: 'Job',
      render: (c) => <span className="text-[13px] text-ink-600">{jobs.data?.find((j) => j.id === c.jobId)?.title ?? '—'}</span>,
    },
    {
      key: 'stage',
      header: 'Stage',
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <Badge tone="neutral">{CANDIDATE_STAGE_LABEL[c.stage]}</Badge>
          {c.archivedAt && <Badge tone="neutral">Archived</Badge>}
        </div>
      ),
    },
    {
      key: 'score',
      header: 'JD Match',
      render: (c) => (c.overallScore !== null ? <ScoreRing value={c.overallScore} size={36} /> : <span className="text-xs text-ink-400">Processing</span>),
    },
    { key: 'uploaded', header: 'Uploaded', render: (c) => <span className="text-[13px] text-ink-500">{formatDate(c.uploadedAt)}</span> },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-10',
      render: (c) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setConfirmingDelete(c)
          }}
          aria-label={`Delete ${c.name}`}
          title="Delete candidate"
          className="rounded-lg p-1.5 text-ink-400 hover:bg-danger-50 hover:text-danger-600"
        >
          <Trash2 className="size-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Candidate Pipeline"
        description="Every candidate resume the AI HR Employee has processed, matched or screened."
        actions={
          <Link to="/app/employees/hr/candidates/upload">
            <Button icon={<Upload className="size-4" />}>Upload Resumes</Button>
          </Link>
        }
      />

      <HrSubNav />

      <FilterBar hasActiveFilters={hasFilters} onClear={() => { setParams(new URLSearchParams(), { replace: true }); setSelected(new Set()) }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search candidates…" containerClassName="w-56" />
        <FilterSelect label="Job" value={jobId} options={jobOptions} onChange={(v) => setParam('job', v)} />
        <FilterSelect
          label="Stage"
          value={stage}
          options={[{ value: 'all', label: 'All Stages' }, ...CANDIDATE_PIPELINE_STAGES.map((s) => ({ value: s, label: CANDIDATE_STAGE_LABEL[s] })), { value: 'rejected', label: 'Rejected' }, { value: 'on_hold', label: 'On Hold' }]}
          onChange={(v) => setParam('stage', v)}
        />
        <FilterSelect label="Status" value={status} options={STATUS_OPTIONS} onChange={(v) => setParam('status', v)} />
      </FilterBar>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
          <span className="text-[13px] font-medium text-brand-800">{selected.size} candidate{selected.size === 1 ? '' : 's'} selected</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
            <Button size="sm" icon={<Archive className="size-3.5" />} onClick={() => setConfirmingBulkArchive(true)}>
              Archive Selected
            </Button>
          </div>
        </div>
      )}

      {/* Desktop / tablet table */}
      <div className="hidden sm:block">
        <DataTable
          columns={columns}
          data={candidates.data ?? []}
          keyExtractor={(c) => c.id}
          loading={candidates.loading}
          emptyState={
            <EmptyState
              icon={<Users2 className="size-6" />}
              title="No candidates match these filters"
              description="Try clearing filters or search terms to see more of the pipeline."
            />
          }
        />
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-3 sm:hidden">
        {candidates.loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : (candidates.data ?? []).length === 0 ? (
          <EmptyState
            icon={<Users2 className="size-6" />}
            title="No candidates match these filters"
            description="Try clearing filters or search terms to see more of the pipeline."
          />
        ) : (
          candidates.data?.map((c) => (
            <Link key={c.id} to={`/app/employees/hr/candidates/${c.id}`} className="flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4">
              <Avatar name={c.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold text-ink-900">{c.name}</p>
                    <p className="truncate text-xs text-ink-500">{c.currentTitle}</p>
                  </div>
                  {c.overallScore !== null ? <ScoreRing value={c.overallScore} size={32} /> : <span className="shrink-0 text-xs text-ink-400">Processing</span>}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge tone="neutral">{CANDIDATE_STAGE_LABEL[c.stage]}</Badge>
                  {c.archivedAt && <Badge tone="neutral">Archived</Badge>}
                  <span className="text-xs text-ink-400">{jobs.data?.find((j) => j.id === c.jobId)?.title ?? '—'}</span>
                </div>
                <p className="mt-1.5 text-xs text-ink-400">Uploaded {formatDate(c.uploadedAt)}</p>
              </div>
            </Link>
          ))
        )}
      </div>

      <Modal
        open={confirmingBulkArchive}
        onClose={() => setConfirmingBulkArchive(false)}
        title={`Archive ${selected.size} candidate${selected.size === 1 ? '' : 's'}?`}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmingBulkArchive(false)} disabled={bulkBusy}>
              Cancel
            </Button>
            <Button onClick={submitBulkArchive} loading={bulkBusy}>
              Archive Selected
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-ink-600">
          Their recruitment history will be preserved and they can be restored later.
        </p>
      </Modal>

      <Modal
        open={Boolean(confirmingDelete)}
        onClose={() => setConfirmingDelete(null)}
        title="Delete candidate?"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmingDelete(null)} disabled={deleteBusy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={submitDelete} loading={deleteBusy}>
              Delete Candidate
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-ink-600">
          {confirmingDelete?.name} will be removed from the active candidate pipeline. Historical records are retained for audit and compliance purposes.
        </p>
      </Modal>
    </div>
  )
}
