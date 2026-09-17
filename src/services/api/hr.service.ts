// Real client for the HR bounded context (app/ai_employees/hr/api/*.py),
// matching the mock module's exported shape (services/mock/hr.service.ts)
// field-for-field so hooks/pages don't change — only services/api/index.ts
// swaps which module they come from.
//
// Real: jobs (list/get/create), candidates (list/get/decision actions),
// resume upload + async processing (real multipart upload, real polling of
// backend processing state), assessment fetch.
//
// Mock-delegated (no corresponding backend endpoint yet — see the final
// integration report for the authoritative list, not faked as "real"):
// rubric templates, schedule slots, hiring team roster, HR config, slot
// booking, AI screening call simulation, resume sample preview/testing
// tools, screenings/interviews list views.
import type { Candidate, CandidateStage, ExtractedResumeProfile, HrEmployeeConfig, Interview, Job, ResumeUploadStatus, ScheduleSlot } from '@/types'
import { hrService as mockHrService } from '@/services/mock/hr.service'
import { httpClient } from './httpClient'
import { isApiError } from './errors'
import {
  mapCandidate,
  mapExtractedProfile,
  mapJob,
  mapResumeStatus,
  mapScheduleSlot,
  mapScreeningAndInterview,
  mapStageToBackend,
  isResumeFailed,
  isResumeNeedsReview,
  isResumeTerminal,
  resumeStatusProgress,
  type BackendAssessment,
  type BackendCandidate,
  type BackendExtractedProfile,
  type BackendInterview,
  type BackendJob,
  type BackendScheduleSlot,
  type BackendScreening,
} from './mappers/hr'

export interface CandidateFilters {
  jobId?: string
  stage?: CandidateStage | 'all'
  source?: string
  search?: string
  // Lifecycle visibility — orthogonal to `stage`. Defaults to 'active' on
  // the backend (archived candidates are hidden unless asked for).
  status?: 'active' | 'archived' | 'all'
}

export interface BulkArchiveResult {
  archived: Candidate[]
  // candidateId -> reason it couldn't be archived (not_found, already_archived).
  skipped: Record<string, string>
}

interface BackendResume {
  id: string
  jobId: string
  candidateId: string | null
  originalFilename: string
  contentType: string
  sizeBytes: number
  status: string
  failureReason: string | null
  extractedProfile: BackendExtractedProfile | null
}

interface UploadResumeResponse {
  resume: BackendResume
  processingJob: { id: string; resumeId: string; status: string; attempts: number; lastError: string | null }
}

interface ConfirmIdentityResponse {
  candidate: BackendCandidate
  resume: BackendResume
  processingJob: { id: string; resumeId: string; status: string; attempts: number; lastError: string | null }
}

export interface ResumeIdentityReview {
  resumeId: string
  reason: string
  fullName: string
  email: string
  phone?: string
  extractedProfile?: ExtractedResumeProfile
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function fetchAssessment(candidateId: string): Promise<BackendAssessment | undefined> {
  try {
    return await httpClient.get<BackendAssessment>(`/hr/resumes/candidates/${candidateId}/assessment`)
  } catch (err) {
    if (isApiError(err) && err.status === 404) return undefined
    throw err
  }
}

async function fetchScreening(candidateId: string): Promise<BackendScreening | undefined> {
  try {
    return await httpClient.get<BackendScreening>(`/hr/screenings/candidates/${candidateId}`)
  } catch (err) {
    if (isApiError(err) && err.status === 404) return undefined
    throw err
  }
}

async function fetchInterviewRecord(candidateId: string): Promise<BackendInterview | undefined> {
  try {
    return await httpClient.get<BackendInterview>(`/hr/candidates/${candidateId}/interview`)
  } catch (err) {
    if (isApiError(err) && err.status === 404) return undefined
    throw err
  }
}

async function enrichCandidate(res: BackendCandidate): Promise<Candidate> {
  const [assessment, resume] = await Promise.all([
    fetchAssessment(res.id),
    res.resumeId ? httpClient.get<BackendResume>(`/hr/resumes/${res.resumeId}`).catch(() => undefined) : Promise.resolve(undefined),
  ])
  const extractedProfile =
    resume?.extractedProfile && resume.status === 'completed'
      ? mapExtractedProfile(resume.extractedProfile, resume.originalFilename, formatFileSize(resume.sizeBytes), new Date().toISOString())
      : undefined
  return mapCandidate(res, { assessment, extractedProfile })
}

const MAX_POLL_ATTEMPTS = 60
const POLL_INTERVAL_MS = 1500

/** Polls a resume until it reaches a terminal state (completed / failed /
 * needs_identity_review), reporting progress as it goes. Shared by the
 * initial upload and by confirm-identity, since both resume the same
 * async pipeline. */
async function pollUntilTerminal(
  initial: BackendResume,
  onProgress: (status: ResumeUploadStatus, progress: number) => void,
): Promise<BackendResume> {
  onProgress(mapResumeStatus(initial.status), resumeStatusProgress(initial.status))
  let resume = initial
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS && !isResumeTerminal(resume.status); attempt++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
    try {
      resume = await httpClient.get<BackendResume>(`/hr/resumes/${initial.id}`)
    } catch {
      continue // transient poll failure — keep trying until MAX_POLL_ATTEMPTS
    }
    onProgress(mapResumeStatus(resume.status), resumeStatusProgress(resume.status))
  }
  return resume
}

async function resumeOutcome(resume: BackendResume): Promise<{
  success: boolean
  candidate?: Candidate
  needsIdentityReview?: ResumeIdentityReview
  errorMessage?: string
}> {
  if (!isResumeTerminal(resume.status)) {
    return { success: false, errorMessage: 'Processing is taking longer than expected. Check back later.' }
  }
  if (isResumeFailed(resume.status)) {
    return { success: false, errorMessage: resume.failureReason ?? 'Resume processing failed.' }
  }
  if (isResumeNeedsReview(resume.status)) {
    const partial = resume.extractedProfile
    return {
      success: false,
      needsIdentityReview: {
        resumeId: resume.id,
        reason: resume.failureReason ?? 'Could not confidently extract a candidate name and email.',
        fullName: partial?.fullName ?? '',
        email: partial?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partial.email) ? partial.email : '',
        phone: partial?.phone,
        extractedProfile: partial
          ? mapExtractedProfile(partial, resume.originalFilename, formatFileSize(resume.sizeBytes), new Date().toISOString())
          : undefined,
      },
    }
  }
  // Completed — the pipeline created the Candidate; fetch and enrich it.
  if (!resume.candidateId) {
    return { success: false, errorMessage: 'Resume completed processing but has no associated candidate.' }
  }
  const backendCandidate = await httpClient.get<BackendCandidate>(`/hr/candidates/${resume.candidateId}`)
  const candidate = await enrichCandidate(backendCandidate)
  return { success: true, candidate }
}

export const hrService = {
  // -------------------------------------------------------------------
  // Jobs — real
  // -------------------------------------------------------------------
  listJobs(): Promise<Job[]> {
    return httpClient.get<BackendJob[]>('/hr/jobs').then((jobs) => jobs.map(mapJob))
  },
  async getJob(id: string): Promise<Job | undefined> {
    try {
      return mapJob(await httpClient.get<BackendJob>(`/hr/jobs/${id}`))
    } catch (err) {
      if (isApiError(err) && err.status === 404) return undefined
      throw err
    }
  },
  createJob(
    input: Pick<Job, 'title' | 'companyName' | 'aiAgentName' | 'department' | 'location' | 'employmentType' | 'experienceLevel' | 'description'> &
      Partial<Pick<Job, 'requirements' | 'requiredSkills'>>,
  ): Promise<Job> {
    return httpClient
      .post<BackendJob>('/hr/jobs', {
        title: input.title,
        companyName: input.companyName || null,
        aiAgentName: input.aiAgentName || null,
        department: input.department || null,
        description: input.description || null,
        requirements: input.requirements ?? [],
        location: input.location || null,
        employmentType: input.employmentType,
      })
      .then(mapJob)
  },

  // -------------------------------------------------------------------
  // Candidates — real
  // -------------------------------------------------------------------
  async listCandidates(filters: CandidateFilters = {}): Promise<Candidate[]> {
    const params = new URLSearchParams()
    if (filters.jobId && filters.jobId !== 'all') params.set('job_id', filters.jobId)
    if (filters.stage && filters.stage !== 'all') {
      const backendStage = mapStageToBackend(filters.stage)
      if (backendStage) params.set('stage', backendStage)
    }
    if (filters.source && filters.source !== 'all') params.set('source', filters.source)
    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('status', filters.status)
    const query = params.toString()
    const candidates = await httpClient.get<BackendCandidate[]>(`/hr/candidates${query ? `?${query}` : ''}`)
    // List view intentionally does not enrich every row with an assessment +
    // resume fetch (no bulk endpoint exists — that would be N+1 real HTTP
    // calls per page load). overallScore/extractedProfile/jdMatch are left
    // unset here; the candidate detail page (getCandidate) fetches them.
    return candidates.map((c) => mapCandidate(c))
  },
  async getCandidate(id: string): Promise<Candidate | undefined> {
    try {
      const res = await httpClient.get<BackendCandidate>(`/hr/candidates/${id}`)
      return await enrichCandidate(res)
    } catch (err) {
      if (isApiError(err) && err.status === 404) return undefined
      throw err
    }
  },

  // -------------------------------------------------------------------
  // Human approval gates — real
  // -------------------------------------------------------------------
  approveForScreening(candidateId: string): Promise<Candidate | undefined> {
    return httpClient.post<BackendCandidate>(`/hr/candidates/${candidateId}/approve-for-screening`, {}).then((c) => mapCandidate(c))
  },
  rejectCandidate(candidateId: string, note?: string): Promise<Candidate | undefined> {
    return httpClient.post<BackendCandidate>(`/hr/candidates/${candidateId}/reject`, { note }).then((c) => mapCandidate(c))
  },
  holdCandidate(candidateId: string, note?: string): Promise<Candidate | undefined> {
    return httpClient.post<BackendCandidate>(`/hr/candidates/${candidateId}/hold`, { note }).then((c) => mapCandidate(c))
  },
  approveForInterview(candidateId: string): Promise<Candidate | undefined> {
    return httpClient.post<BackendCandidate>(`/hr/candidates/${candidateId}/approve-for-interview`, {}).then((c) => mapCandidate(c))
  },

  // -------------------------------------------------------------------
  // Reconsideration & archival lifecycle — real. Reconsider is a distinct
  // action from Restore (see backend CandidateService docstrings): only a
  // REJECTED application can be reconsidered, and reconsidering never
  // touches archival state; restoring an archived application never
  // touches its stage/decision.
  // -------------------------------------------------------------------
  reconsiderCandidate(candidateId: string, note?: string): Promise<Candidate | undefined> {
    return httpClient
      .post<BackendCandidate>(`/hr/candidates/${candidateId}/reconsider`, { note })
      .then((c) => mapCandidate(c))
  },
  archiveCandidate(candidateId: string): Promise<Candidate | undefined> {
    return httpClient
      .post<BackendCandidate>(`/hr/candidates/${candidateId}/archive`, {})
      .then((c) => mapCandidate(c))
  },
  restoreCandidate(candidateId: string): Promise<Candidate | undefined> {
    return httpClient
      .post<BackendCandidate>(`/hr/candidates/${candidateId}/restore`, {})
      .then((c) => mapCandidate(c))
  },
  async bulkArchiveCandidates(candidateIds: string[]): Promise<BulkArchiveResult> {
    const result = await httpClient.post<{ archived: BackendCandidate[]; skipped: Record<string, string> }>(
      '/hr/candidates/archive',
      { candidateIds },
    )
    return { archived: result.archived.map((c) => mapCandidate(c)), skipped: result.skipped }
  },

  // -------------------------------------------------------------------
  // Resume upload & async processing — real (full pipeline: MinIO storage,
  // Redis/RQ worker, OCR/text extraction, OpenAI structured extraction,
  // identity validation, Candidate creation, JD matching, PostgreSQL
  // persistence). Upload takes only a job + file — the backend creates the
  // Candidate itself once extraction produces a usable identity; it never
  // asks the frontend for one up front.
  // -------------------------------------------------------------------
  async processResumeUpload(
    jobId: string,
    file: File,
    onProgress: (status: ResumeUploadStatus, progress: number) => void,
  ): Promise<{
    success: boolean
    candidate?: Candidate
    needsIdentityReview?: ResumeIdentityReview
    errorMessage?: string
  }> {
    onProgress('uploading', 5)

    let upload: UploadResumeResponse
    try {
      const form = new FormData()
      form.set('job_id', jobId)
      form.set('file', file, file.name)
      upload = await httpClient.postForm<UploadResumeResponse>('/hr/resumes', form)
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Upload failed.'
      return { success: false, errorMessage: message }
    }

    const resume = await pollUntilTerminal(upload.resume, onProgress)
    return resumeOutcome(resume)
  },

  // HR supplying/correcting the identity extraction couldn't confidently
  // produce — never invented by the frontend, always what HR typed here.
  async confirmResumeIdentity(
    resumeId: string,
    fullName: string,
    email: string,
    phone: string | undefined,
    onProgress: (status: ResumeUploadStatus, progress: number) => void,
  ): Promise<{ success: boolean; candidate?: Candidate; errorMessage?: string }> {
    let confirmed: ConfirmIdentityResponse
    try {
      confirmed = await httpClient.post<ConfirmIdentityResponse>(`/hr/resumes/${resumeId}/confirm-identity`, {
        fullName,
        email,
        phone: phone || null,
      })
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Could not confirm candidate identity.'
      return { success: false, errorMessage: message }
    }

    const resume = await pollUntilTerminal(confirmed.resume, onProgress)
    const outcome = await resumeOutcome(resume)
    return { success: outcome.success, candidate: outcome.candidate, errorMessage: outcome.errorMessage }
  },

  // -------------------------------------------------------------------
  // AI Screening call + human Interview — real. Composes the backend's
  // separate Screening (AI call) + Interview (human meeting) resources into
  // the frontend's single Interview shape (see mapScreeningAndInterview).
  // -------------------------------------------------------------------
  async getInterview(candidateId: string): Promise<Interview | undefined> {
    const [screening, interviewRecord, candidateRes] = await Promise.all([
      fetchScreening(candidateId),
      fetchInterviewRecord(candidateId),
      httpClient.get<BackendCandidate>(`/hr/candidates/${candidateId}`).catch(() => undefined),
    ])
    if (!screening && !interviewRecord) return undefined
    let jobTitle = ''
    if (candidateRes) {
      const job = await httpClient.get<BackendJob>(`/hr/jobs/${candidateRes.jobId}`).catch(() => undefined)
      jobTitle = job?.title ?? ''
    }
    return mapScreeningAndInterview(candidateId, candidateRes?.jobId ?? '', jobTitle, screening, interviewRecord)
  },

  // Generates the prompt on first call (lazy) and returns it thereafter —
  // never blank, never a fallback/generic prompt (spec sections 2-4).
  getScreeningPrompt(candidateId: string): Promise<{ promptText: string; promptGeneratedAt: string | null; promptEditedAt: string | null }> {
    return httpClient.get(`/hr/screenings/candidates/${candidateId}/prompt`)
  },
  updateScreeningPrompt(
    candidateId: string,
    promptText: string,
  ): Promise<{ promptText: string; promptGeneratedAt: string | null; promptEditedAt: string | null }> {
    return httpClient.patch(`/hr/screenings/candidates/${candidateId}/prompt`, { promptText })
  },
  async startScreeningCall(candidateId: string): Promise<Interview | undefined> {
    await httpClient.post(`/hr/screenings/candidates/${candidateId}/start`, {})
    return hrService.getInterview(candidateId)
  },
  // Read-only — HR's screening runtime is OpenAI Realtime only, fixed
  // org-wide by backend settings (app/ai_employees/hr/runtime/
  // screening_agent.py); there is no per-call/per-org STT+TTS path to
  // expose here, so this deliberately isn't an editable form.
  getVoiceConfig(): Promise<{ mode: string; realtimeProvider: string; realtimeModel: string; realtimeVoice: string }> {
    return httpClient.get('/hr/screenings/voice-config')
  },

  async listScheduleSlots(): Promise<ScheduleSlot[]> {
    const slots = await httpClient.get<BackendScheduleSlot[]>('/hr/scheduling/availability')
    return slots.map(mapScheduleSlot)
  },
  async getConfig(): Promise<HrEmployeeConfig> {
    // hiringTeam/rubricVersion/interviewTemplate genuinely have no backend
    // equivalent yet — only calendarConnected is made real here.
    const [mockConfig, status] = await Promise.all([
      mockHrService.getConfig(),
      httpClient.get<{ connected: boolean }>('/hr/scheduling/calendar-status'),
    ])
    return { ...mockConfig, calendarConnected: status.connected }
  },
  async bookSlot(
    slotId: string,
    candidateId: string,
    panelistEmails: string[] = [],
  ): Promise<{ success: boolean; slot?: ScheduleSlot; error?: string; candidateNotified?: boolean; panelistsNotified?: boolean; interviewId?: string }> {
    try {
      const res = await httpClient.post<BackendInterview>('/hr/scheduling/book', { slotId, candidateId, panelistEmails })
      const candidateNotified = Boolean(res.candidateNotifiedAt)
      const panelistsNotified = res.panelists ? res.panelists.every((p) => Boolean(p.notifiedAt)) : true
      return { success: true, candidateNotified, panelistsNotified, interviewId: res.id }
    } catch (err) {
      // The backend's message here is real, human-readable copy (e.g. "This
      // slot has already been booked." vs. "Candidate has no approved
      // interview ready to be scheduled.") — surface it rather than
      // collapsing every failure into one generic guess.
      return { success: false, error: err instanceof Error ? err.message : undefined }
    }
  },
  async resendInterviewInvitations(
    interviewId: string,
  ): Promise<{ success: boolean; candidateNotified?: boolean; panelistsNotified?: boolean; error?: string }> {
    try {
      const res = await httpClient.post<BackendInterview>(`/hr/interviews/${interviewId}/resend-invitations`, {})
      const candidateNotified = Boolean(res.candidateNotifiedAt)
      const panelistsNotified = res.panelists ? res.panelists.every((p) => Boolean(p.notifiedAt)) : true
      return { success: true, candidateNotified, panelistsNotified }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : undefined }
    }
  },

  // -------------------------------------------------------------------
  // Screenings & Interviews list views — real. No bulk join endpoint exists
  // yet, so each row's screening/interview is composed with one extra
  // fetch per candidate (small lists — HR's current-in-flight candidates,
  // not the full pipeline).
  // -------------------------------------------------------------------
  async listScreenings(): Promise<{ candidate: Candidate; interview?: Interview }[]> {
    const stages: CandidateStage[] = ['screening_approved', 'ai_screening', 'screening_completed', 'human_review']
    const candidates = (await hrService.listCandidates({})).filter((c) => stages.includes(c.stage))
    return Promise.all(candidates.map(async (candidate) => ({ candidate, interview: await hrService.getInterview(candidate.id) })))
  },
  async listInterviews(): Promise<{ candidate: Candidate; interview?: Interview }[]> {
    const stages: CandidateStage[] = ['interview_approved', 'interview_scheduled', 'completed']
    const candidates = (await hrService.listCandidates({})).filter((c) => stages.includes(c.stage))
    return Promise.all(candidates.map(async (candidate) => ({ candidate, interview: await hrService.getInterview(candidate.id) })))
  },

  // -------------------------------------------------------------------
  // Not yet connected to a backend endpoint — delegated to the mock so
  // these screens keep working, not represented as real backend data.
  // -------------------------------------------------------------------
  getRubric: mockHrService.getRubric,
  getInterviewById: mockHrService.getInterviewById,
  getHiringTeam: mockHrService.getHiringTeam,
  completeScreeningCall: mockHrService.completeScreeningCall,
  uploadResumeStepOrder: mockHrService.uploadResumeStepOrder,
  listResumeSamples: mockHrService.listResumeSamples,
  previewResumeMatch: mockHrService.previewResumeMatch,
}
