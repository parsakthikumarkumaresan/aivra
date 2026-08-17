import { useCallback, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Users,
} from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useJobs } from '@/hooks/useHr'
import { hrService } from '@/services/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select, Label } from '@/components/ui/Field'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { RESUME_UPLOAD_STATUS_LABEL } from '@/types'
import type { ResumeUploadItem, ResumeUploadStatus } from '@/types'
import { cn } from '@/utils/cn'

const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx']

const STATUS_TONE: Record<ResumeUploadStatus, BadgeTone> = {
  queued: 'neutral',
  uploading: 'info',
  parsing: 'info',
  ocr_processing: 'info',
  extracting: 'info',
  matching: 'info',
  completed: 'success',
  failed: 'danger',
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

let uploadCounter = 0
function nextUploadId() {
  uploadCounter += 1
  return `upload_${uploadCounter}`
}

export default function ResumeUploadPage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'AI HR Employee', href: '/app/employees/hr' }, { label: 'Candidates', href: '/app/employees/hr/candidates' }, { label: 'Upload Resumes' }])
  const [params] = useSearchParams()
  const jobs = useJobs()
  const [jobId, setJobId] = useState(params.get('job') ?? '')
  const [dragging, setDragging] = useState(false)
  const [uploads, setUploads] = useState<ResumeUploadItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedJob = jobs.data?.find((j) => j.id === jobId)

  function runUpload(item: ResumeUploadItem) {
    hrService
      .processResumeUpload(jobId, item.fileName, (status, progress) => {
        setUploads((prev) => prev.map((u) => (u.id === item.id ? { ...u, status, progress } : u)))
      })
      .then((result) => {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === item.id
              ? result.success
                ? { ...u, status: 'completed', progress: 100, candidateId: result.candidate?.id }
                : { ...u, status: 'failed', errorMessage: result.errorMessage }
              : u,
          ),
        )
      })
  }

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      if (!jobId) return
      const files = Array.from(fileList).filter((f) => ACCEPTED_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext)))
      const items: ResumeUploadItem[] = files.map((f) => ({
        id: nextUploadId(),
        fileName: f.name,
        fileSizeLabel: formatFileSize(f.size),
        status: 'queued',
        progress: 0,
      }))
      setUploads((prev) => [...prev, ...items])
      items.forEach((item) => runUpload(item))
    },
    [jobId],
  )

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files)
  }

  function retryUpload(item: ResumeUploadItem) {
    setUploads((prev) => prev.map((u) => (u.id === item.id ? { ...u, status: 'queued', progress: 0, errorMessage: undefined } : u)))
    runUpload(item)
  }

  const completedCount = uploads.filter((u) => u.status === 'completed').length
  const failedCount = uploads.filter((u) => u.status === 'failed').length
  const inProgressCount = uploads.length - completedCount - failedCount

  return (
    <div className="space-y-5">
      <Link to="/app/employees/hr/candidates" className="flex items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" />
        Back to candidates
      </Link>

      <PageHeader icon={<UploadCloud className="size-5" />} title="Upload Candidate Resumes" description="Resumes are parsed, analyzed and matched against the selected job automatically." />

      <Card>
        <CardBody className="space-y-4">
          <div className="max-w-sm">
            <Label required>Job</Label>
            {jobs.loading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select value={jobId} onChange={(e) => setJobId(e.target.value)}>
                <option value="">Select a job…</option>
                {jobs.data?.map((j) => (
                  <option key={j.id} value={j.id}>{j.title} — {j.department}</option>
                ))}
              </Select>
            )}
            {selectedJob && (
              <p className="mt-1.5 text-xs text-ink-500">Resumes will be matched against {selectedJob.requiredSkills.join(', ') || 'this role\'s requirements'}.</p>
            )}
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-150',
              dragging ? 'border-brand-400 bg-brand-50' : 'border-ink-200 bg-ink-25',
              !jobId && 'pointer-events-none opacity-50',
            )}
          >
            <UploadCloud className="size-8 text-ink-400" />
            <p className="mt-3 text-[14px] font-medium text-ink-800">Drag & drop resumes here</p>
            <p className="mt-1 text-[13px] text-ink-500">or</p>
            <Button className="mt-3" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={!jobId}>
              Browse Files
            </Button>
            <p className="mt-3 text-xs text-ink-400">Supported: PDF, DOC, DOCX · single, multiple or bulk upload</p>
            {!jobId && <p className="mt-2 text-xs font-medium text-warning-600">Select a job above to enable upload.</p>}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_EXTENSIONS.join(',')}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </div>
        </CardBody>
      </Card>

      {uploads.length > 0 && (
        <Card>
          <CardHeader
            title="Processing"
            description={`${completedCount} completed · ${inProgressCount} in progress · ${failedCount} failed`}
          />
          <div className="divide-y divide-ink-100">
            {uploads.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500">
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-ink-800">{u.fileName}</p>
                  <p className="text-xs text-ink-500">{u.fileSizeLabel}</p>
                  {u.status !== 'completed' && u.status !== 'failed' && <ProgressBar value={u.progress} className="mt-1.5 max-w-xs" />}
                  {u.status === 'failed' && u.errorMessage && <p className="mt-1 text-xs text-danger-600">{u.errorMessage}</p>}
                </div>
                <Badge tone={STATUS_TONE[u.status]} dot icon={u.status !== 'completed' && u.status !== 'failed' ? <Loader2 className="size-3 animate-spin" /> : undefined}>
                  {RESUME_UPLOAD_STATUS_LABEL[u.status]}
                </Badge>
                {u.status === 'completed' && u.candidateId && (
                  <Link to={`/app/employees/hr/candidates/${u.candidateId}`}>
                    <Button size="sm" variant="outline">View</Button>
                  </Link>
                )}
                {u.status === 'failed' && (
                  <Button size="sm" variant="outline" icon={<RefreshCw className="size-3.5" />} onClick={() => retryUpload(u)}>
                    Retry
                  </Button>
                )}
              </div>
            ))}
          </div>
          {completedCount > 0 && inProgressCount === 0 && (
            <div className="flex items-center justify-between border-t border-ink-100 px-5 py-4">
              <p className="flex items-center gap-2 text-[13px] text-success-700">
                <CheckCircle2 className="size-4" />
                {completedCount} candidate{completedCount === 1 ? '' : 's'} added to the pipeline, awaiting HR review.
              </p>
              <Link to={`/app/employees/hr/candidates?job=${jobId}`}>
                <Button size="sm" icon={<Users className="size-3.5" />}>View Candidates</Button>
              </Link>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
