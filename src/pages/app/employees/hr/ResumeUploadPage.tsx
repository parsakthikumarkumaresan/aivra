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
  UserCheck,
} from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useJobs } from '@/hooks/useHr'
import { hrService } from '@/services/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select, Input, Label } from '@/components/ui/Field'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { RESUME_UPLOAD_STATUS_LABEL } from '@/types'
import type { ResumeUploadItem, ResumeUploadStatus } from '@/types'
import { cn } from '@/utils/cn'

const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx']
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const STATUS_TONE: Record<ResumeUploadStatus, BadgeTone> = {
  queued: 'neutral',
  uploading: 'info',
  parsing: 'info',
  ocr_processing: 'info',
  extracting: 'info',
  matching: 'info',
  completed: 'success',
  failed: 'danger',
  needs_review: 'warning',
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

// Shown briefly right after HR clicks "Confirm & Continue", before the
// first real onProgress callback arrives from the backend.
const CONFIRM_PENDING_PROGRESS = 60

export default function ResumeUploadPage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'AI HR Employee', href: '/app/employees/hr' }, { label: 'Candidates', href: '/app/employees/hr/candidates' }, { label: 'Upload Resumes' }])
  const [params] = useSearchParams()
  const jobs = useJobs()
  const [jobId, setJobId] = useState(params.get('job') ?? '')
  const [dragging, setDragging] = useState(false)
  const [uploads, setUploads] = useState<ResumeUploadItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const filesRef = useRef<Map<string, File>>(new Map())

  const selectedJob = jobs.data?.find((j) => j.id === jobId)

  function updateItem(id: string, patch: Partial<ResumeUploadItem>) {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)))
  }

  function runUpload(id: string, file: File) {
    filesRef.current.set(id, file)
    hrService
      .processResumeUpload(jobId, file, (status, progress) => {
        updateItem(id, { status, progress })
      })
      .then((result) => {
        if (result.success) {
          updateItem(id, { status: 'completed', progress: 100, candidateId: result.candidate?.id })
        } else if (result.needsIdentityReview) {
          const review = result.needsIdentityReview
          updateItem(id, {
            status: 'needs_review',
            resumeId: review.resumeId,
            reviewDraft: {
              fullName: review.fullName,
              email: review.email,
              phone: review.phone,
              extractedProfile: review.extractedProfile,
              reason: review.reason,
            },
          })
        } else {
          updateItem(id, { status: 'failed', errorMessage: result.errorMessage })
        }
      })
  }

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      if (!jobId) return
      const files = Array.from(fileList).filter((f) => ACCEPTED_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext)))
      files.forEach((file) => {
        const id = nextUploadId()
        setUploads((prev) => [
          ...prev,
          { id, fileName: file.name, fileSizeLabel: formatFileSize(file.size), status: 'queued', progress: 0 },
        ])
        runUpload(id, file)
      })
    },
    [jobId],
  )

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files)
  }

  function updateReviewDraft(id: string, patch: Partial<NonNullable<ResumeUploadItem['reviewDraft']>>) {
    setUploads((prev) =>
      prev.map((u) => (u.id === id && u.reviewDraft ? { ...u, reviewDraft: { ...u.reviewDraft, ...patch } } : u)),
    )
  }

  function confirmIdentity(item: ResumeUploadItem) {
    if (!item.resumeId || !item.reviewDraft) return
    const { fullName, email, phone } = item.reviewDraft
    updateItem(item.id, { status: 'matching', progress: CONFIRM_PENDING_PROGRESS })
    hrService
      .confirmResumeIdentity(item.resumeId, fullName, email, phone, (status, progress) => {
        updateItem(item.id, { status, progress })
      })
      .then((result) => {
        updateItem(item.id, result.success
          ? { status: 'completed', progress: 100, candidateId: result.candidate?.id }
          : { status: 'failed', errorMessage: result.errorMessage })
      })
  }

  function retryUpload(item: ResumeUploadItem) {
    const file = filesRef.current.get(item.id)
    if (!file) {
      updateItem(item.id, { errorMessage: 'Please re-select this file to retry.' })
      return
    }
    updateItem(item.id, { status: 'queued', progress: 0, errorMessage: undefined })
    runUpload(item.id, file)
  }

  const completedCount = uploads.filter((u) => u.status === 'completed').length
  const needsReviewCount = uploads.filter((u) => u.status === 'needs_review').length
  const failedCount = uploads.filter((u) => u.status === 'failed').length
  const inProgressCount = uploads.length - completedCount - needsReviewCount - failedCount

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

      {needsReviewCount > 0 && (
        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-1.5">
                <UserCheck className="size-4 text-warning-600" />
                Needs your review
              </span>
            }
            description="AI couldn't confidently identify the candidate's name and/or email from these resumes — confirm or correct before they enter the pipeline."
          />
          <div className="divide-y divide-ink-100">
            {uploads.filter((u) => u.status === 'needs_review' && u.reviewDraft).map((u) => {
              const draft = u.reviewDraft!
              const emailValid = EMAIL_PATTERN.test(draft.email)
              return (
                <div key={u.id} className="space-y-3 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning-50 text-warning-600">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-ink-800">{u.fileName}</p>
                      <p className="text-xs text-warning-700">{draft.reason}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-end gap-3 pl-12">
                    <div className="w-48">
                      <Label htmlFor={`${u.id}-name`} required>Candidate name</Label>
                      <Input
                        id={`${u.id}-name`}
                        value={draft.fullName}
                        onChange={(e) => updateReviewDraft(u.id, { fullName: e.target.value })}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="w-56">
                      <Label htmlFor={`${u.id}-email`} required>Candidate email</Label>
                      <Input
                        id={`${u.id}-email`}
                        type="email"
                        value={draft.email}
                        onChange={(e) => updateReviewDraft(u.id, { email: e.target.value })}
                        placeholder="name@example.com"
                        error={Boolean(draft.email) && !emailValid}
                      />
                    </div>
                    <Button size="sm" disabled={!draft.fullName.trim() || !emailValid} onClick={() => confirmIdentity(u)}>
                      Confirm & Continue
                    </Button>
                  </div>
                  {draft.extractedProfile && (draft.extractedProfile.skills.length > 0 || draft.extractedProfile.currentTitle) && (
                    <p className="pl-12 text-xs text-ink-500">
                      Extracted from resume: {draft.extractedProfile.currentTitle && <>{draft.extractedProfile.currentTitle} · </>}
                      {draft.extractedProfile.skills.slice(0, 6).join(', ')}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {uploads.length > 0 && (
        <Card>
          <CardHeader
            title="Processing"
            description={`${completedCount} completed · ${inProgressCount} in progress · ${needsReviewCount} needs review · ${failedCount} failed`}
          />
          <div className="divide-y divide-ink-100">
            {uploads.filter((u) => u.status !== 'needs_review').map((u) => (
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
          {completedCount > 0 && inProgressCount === 0 && needsReviewCount === 0 && (
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
