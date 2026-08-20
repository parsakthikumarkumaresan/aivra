import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Briefcase, Users, MapPin, Upload } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useJobs } from '@/hooks/useHr'
import { useToast } from '@/hooks/useToast'
import { hrService } from '@/services/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Label, Select, Textarea } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { HrSubNav } from '@/components/employees/hr/HrSubNav'
import type { EmploymentType, Job, JobStatus } from '@/types'
import { formatDate } from '@/utils/format'

const STATUS_TONE: Record<JobStatus, BadgeTone> = { draft: 'neutral', open: 'success', paused: 'warning', closed: 'danger' }
const STATUS_LABEL: Record<JobStatus, string> = { draft: 'Draft', open: 'Open', paused: 'Paused', closed: 'Closed' }
const EMPLOYMENT_LABEL: Record<EmploymentType, string> = { full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', internship: 'Internship' }

export default function JobsListPage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'AI HR Employee', href: '/app/employees/hr' }, { label: 'Jobs' }])
  const jobs = useJobs()
  const { show } = useToast()
  const [params, setParams] = useSearchParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', companyName: '', aiAgentName: '', department: '', location: '', employmentType: 'full_time' as EmploymentType, experienceLevel: '', description: '', requiredSkills: '' })

  useEffect(() => {
    if (params.get('new') === '1') {
      setModalOpen(true)
      const next = new URLSearchParams(params)
      next.delete('new')
      setParams(next, { replace: true })
    }
  }, [])

  async function handleCreate() {
    if (!form.title || !form.department) return
    setCreating(true)
    await hrService.createJob({
      ...form,
      requirements: [],
      requiredSkills: form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
    })
    setCreating(false)
    setModalOpen(false)
    setForm({ title: '', companyName: '', aiAgentName: '', department: '', location: '', employmentType: 'full_time', experienceLevel: '', description: '', requiredSkills: '' })
    show({ tone: 'success', title: 'Job created', description: `${form.title} was added as a draft.` })
    jobs.refetch()
  }

  const columns: DataTableColumn<Job>[] = [
    {
      key: 'title',
      header: 'Job',
      render: (job) => (
        <Link to={`/app/employees/hr/jobs/${job.id}`} className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Briefcase className="size-3.5" />
          </span>
          <span>
            <span className="block font-medium text-ink-900">{job.title}</span>
            <span className="block text-xs text-ink-500">{job.department}</span>
          </span>
        </Link>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (job) => (
        <span className="flex items-center gap-1.5 text-[13px] text-ink-600">
          <MapPin className="size-3.5 text-ink-400" />
          {job.location}
        </span>
      ),
    },
    { key: 'type', header: 'Type', render: (job) => <span className="text-[13px] text-ink-600">{EMPLOYMENT_LABEL[job.employmentType]}</span> },
    { key: 'experience', header: 'Experience', render: (job) => <span className="text-[13px] text-ink-600">{job.experienceLevel}</span> },
    {
      key: 'candidates',
      header: 'Candidates',
      render: (job) => (
        <Link to={`/app/employees/hr/jobs/${job.id}`} className="flex items-center gap-1.5 text-[13px] font-medium text-brand-600 hover:text-brand-700">
          <Users className="size-3.5" />
          {job.candidateCount}
        </Link>
      ),
    },
    { key: 'created', header: 'Created', render: (job) => <span className="text-[13px] text-ink-500">{formatDate(job.createdAt)}</span> },
    { key: 'status', header: 'Status', render: (job) => <Badge tone={STATUS_TONE[job.status]} dot>{STATUS_LABEL[job.status]}</Badge> },
    {
      key: 'actions',
      header: '',
      render: (job) => (
        <Link to={`/app/employees/hr/candidates/upload?job=${job.id}`} onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" icon={<Upload className="size-3.5" />}>
            Upload Resumes
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description="Manage open requisitions and their AI-screened candidate pipelines."
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => setModalOpen(true)}>
            Create Job
          </Button>
        }
      />

      <HrSubNav />

      {/* Desktop / tablet table */}
      <div className="hidden sm:block">
        <DataTable
          columns={columns}
          data={jobs.data ?? []}
          keyExtractor={(j) => j.id}
          loading={jobs.loading}
          emptyState={
            <EmptyState
              icon={<Briefcase className="size-6" />}
              title="No jobs yet"
              description="Create your first job to start sourcing and screening candidates with AI."
              action={<Button icon={<Plus className="size-4" />} onClick={() => setModalOpen(true)}>Create Job</Button>}
            />
          }
        />
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-3 sm:hidden">
        {jobs.loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : (jobs.data ?? []).length === 0 ? (
          <EmptyState
            icon={<Briefcase className="size-6" />}
            title="No jobs yet"
            description="Create your first job to start sourcing and screening candidates with AI."
            action={<Button icon={<Plus className="size-4" />} onClick={() => setModalOpen(true)}>Create Job</Button>}
          />
        ) : (
          jobs.data?.map((job) => (
            <Link key={job.id} to={`/app/employees/hr/jobs/${job.id}`} className="block rounded-xl border border-ink-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-semibold text-ink-900">{job.title}</p>
                  <p className="text-xs text-ink-500">{job.department} · {job.location}</p>
                </div>
                <Badge tone={STATUS_TONE[job.status]} dot>{STATUS_LABEL[job.status]}</Badge>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs text-ink-500">
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-ink-400" />
                  {job.candidateCount} candidates
                </span>
                <span>{formatDate(job.createdAt)}</span>
              </div>
            </Link>
          ))
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create a new job"
        description="AIVRA will generate a draft evaluation rubric once details are added."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={creating} disabled={!form.title || !form.department}>
              Create Job
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label required>Job title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Product Designer" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Company name</Label>
              <Input
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="e.g. Infosys Pvt Ltd"
              />
              <p className="mt-1 text-xs text-ink-400">The AI agent says it's calling from this company.</p>
            </div>
            <div>
              <Label>AI agent name</Label>
              <Input
                value={form.aiAgentName}
                onChange={(e) => setForm({ ...form, aiAgentName: e.target.value })}
                placeholder="e.g. Zara"
              />
              <p className="mt-1 text-xs text-ink-400">The name the AI screening assistant introduces itself with.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Department</Label>
              <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Design" />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Bengaluru, India" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Employment type</Label>
              <Select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value as EmploymentType })}>
                {Object.entries(EMPLOYMENT_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Experience level</Label>
              <Input value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })} placeholder="3-6 years" />
            </div>
          </div>
          <div>
            <Label>Required skills</Label>
            <Input value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} placeholder="Python, AWS, PostgreSQL (comma-separated)" />
          </div>
          <div>
            <Label>Job description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Paste or write the job description…" />
          </div>
        </div>
      </Modal>
    </div>
  )
}
