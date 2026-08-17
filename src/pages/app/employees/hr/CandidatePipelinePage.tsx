import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Upload, Users2 } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useCandidates, useJobs } from '@/hooks/useHr'
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
import { HrSubNav } from '@/components/employees/hr/HrSubNav'
import { CANDIDATE_PIPELINE_STAGES, CANDIDATE_STAGE_LABEL } from '@/types'
import type { Candidate, CandidateStage } from '@/types'
import { formatDate } from '@/utils/format'

const SOURCE_LABEL: Record<string, string> = {
  careers_site: 'Careers Site', referral: 'Referral', linkedin: 'LinkedIn', agency: 'Agency', job_board: 'Job Board', direct_upload: 'Direct Upload',
}

export default function CandidatePipelinePage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'AI HR Employee', href: '/app/employees/hr' }, { label: 'Candidates' }])
  const [params, setParams] = useSearchParams()
  const jobs = useJobs()
  const [search, setSearch] = useState('')

  const jobId = params.get('job') ?? 'all'
  const stage = (params.get('stage') as CandidateStage | 'all') ?? 'all'
  const source = params.get('source') ?? 'all'

  const candidates = useCandidates({ jobId, stage, source, search })

  const jobOptions = useMemo(
    () => [{ value: 'all', label: 'All Jobs' }, ...(jobs.data ?? []).map((j) => ({ value: j.id, label: j.title }))],
    [jobs.data],
  )

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value === 'all') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const hasFilters = jobId !== 'all' || stage !== 'all' || source !== 'all' || Boolean(search)

  const columns: DataTableColumn<Candidate>[] = [
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
    { key: 'stage', header: 'Stage', render: (c) => <Badge tone="neutral">{CANDIDATE_STAGE_LABEL[c.stage]}</Badge> },
    {
      key: 'score',
      header: 'JD Match',
      render: (c) => (c.overallScore !== null ? <ScoreRing value={c.overallScore} size={36} /> : <span className="text-xs text-ink-400">Processing</span>),
    },
    { key: 'source', header: 'Source', render: (c) => <span className="text-[13px] text-ink-600">{SOURCE_LABEL[c.source]}</span> },
    { key: 'uploaded', header: 'Uploaded', render: (c) => <span className="text-[13px] text-ink-500">{formatDate(c.uploadedAt)}</span> },
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

      <FilterBar hasActiveFilters={hasFilters} onClear={() => setParams(new URLSearchParams(), { replace: true })}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search candidates…" containerClassName="w-56" />
        <FilterSelect label="Job" value={jobId} options={jobOptions} onChange={(v) => setParam('job', v)} />
        <FilterSelect
          label="Stage"
          value={stage}
          options={[{ value: 'all', label: 'All Stages' }, ...CANDIDATE_PIPELINE_STAGES.map((s) => ({ value: s, label: CANDIDATE_STAGE_LABEL[s] })), { value: 'rejected', label: 'Rejected' }, { value: 'on_hold', label: 'On Hold' }]}
          onChange={(v) => setParam('stage', v)}
        />
        <FilterSelect
          label="Source"
          value={source}
          options={[{ value: 'all', label: 'All Sources' }, ...Object.entries(SOURCE_LABEL).map(([value, label]) => ({ value, label }))]}
          onChange={(v) => setParam('source', v)}
        />
      </FilterBar>

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
                  <span className="text-xs text-ink-400">{jobs.data?.find((j) => j.id === c.jobId)?.title ?? '—'}</span>
                </div>
                <p className="mt-1.5 text-xs text-ink-400">Uploaded {formatDate(c.uploadedAt)} · {SOURCE_LABEL[c.source]}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
