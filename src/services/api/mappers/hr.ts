// Adapter layer: backend HR contracts (app/ai_employees/hr/schemas/*.py) <->
// this frontend's pre-existing types (src/types/hr.ts). The backend's data
// model is intentionally simpler in a few places (one linear candidate
// stage instead of two separate approval gates, a narrower extracted-profile
// shape) — these functions translate rather than the UI being redesigned
// around the backend, per the "preserve existing UI" instruction.
import type {
  ApprovalGateStatus,
  Candidate,
  CandidateStage,
  EmploymentType,
  ExtractedResumeProfile,
  Job,
  JobStatus,
  JdMatchBreakdown,
  MatchLabel,
  ResumeUploadStatus,
} from '@/types'

// ---------------------------------------------------------------------
// Job
// ---------------------------------------------------------------------
export interface BackendJob {
  id: string
  title: string
  department: string | null
  description: string | null
  requirements: string[]
  location: string | null
  employmentType: string
  status: string
  createdAt: string
  candidateCount: number
}

export function mapJob(res: BackendJob): Job {
  return {
    id: res.id,
    title: res.title,
    department: res.department ?? '',
    location: res.location ?? '',
    employmentType: res.employmentType as EmploymentType,
    experienceLevel: '', // Not modeled on the backend HrJob yet.
    status: res.status as JobStatus,
    description: res.description ?? '',
    requirements: res.requirements,
    requiredSkills: [], // Not modeled separately on the backend — requirements doubles for both.
    createdAt: res.createdAt,
    candidateCount: res.candidateCount,
  }
}

// ---------------------------------------------------------------------
// Candidate stage — backend (app/ai_employees/hr/models/candidate.py)
// collapses HR-review and human-review approval into the single `stage`
// value; the frontend models them as separate gates. Both directions below.
// ---------------------------------------------------------------------
const BACKEND_TO_FRONTEND_STAGE: Record<string, CandidateStage> = {
  new: 'uploaded',
  processing: 'processing',
  matched: 'analyzed',
  hr_review: 'hr_review',
  screening_approved: 'screening_approved',
  screening: 'ai_screening',
  screened: 'screening_completed',
  human_review: 'human_review',
  interview_pending: 'interview_approved',
  interview_scheduled: 'interview_scheduled',
  completed: 'completed',
  rejected: 'rejected',
  withdrawn: 'on_hold',
  on_hold: 'on_hold',
}

const FRONTEND_TO_BACKEND_STAGE: Record<CandidateStage, string> = {
  uploaded: 'new',
  processing: 'processing',
  analyzed: 'matched',
  hr_review: 'hr_review',
  screening_approved: 'screening_approved',
  ai_screening: 'screening',
  screening_completed: 'screened',
  human_review: 'human_review',
  interview_approved: 'interview_pending',
  interview_scheduled: 'interview_scheduled',
  completed: 'completed',
  rejected: 'rejected',
  on_hold: 'on_hold',
}

export function mapStageToFrontend(backendStage: string): CandidateStage {
  return BACKEND_TO_FRONTEND_STAGE[backendStage] ?? 'uploaded'
}

export function mapStageToBackend(stage: CandidateStage | 'all'): string | undefined {
  if (stage === 'all') return undefined
  return FRONTEND_TO_BACKEND_STAGE[stage]
}

const STAGE_ORDER = Object.keys(BACKEND_TO_FRONTEND_STAGE)
function stageIndex(backendStage: string): number {
  const i = STAGE_ORDER.indexOf(backendStage)
  return i === -1 ? 0 : i
}

/** Derives the two approval-gate fields the frontend expects from the backend's single linear stage. */
function deriveApprovals(backendStage: string): { screeningApproval: ApprovalGateStatus; interviewApproval: ApprovalGateStatus } {
  const hrReviewIdx = stageIndex('hr_review')
  const humanReviewIdx = stageIndex('human_review')

  if (backendStage === 'rejected') {
    const wasPastHumanReview = false // No history available from CandidateResponse alone — best-effort.
    return { screeningApproval: 'rejected', interviewApproval: wasPastHumanReview ? 'rejected' : 'not_ready' }
  }
  if (backendStage === 'on_hold' || backendStage === 'withdrawn') {
    return { screeningApproval: 'on_hold', interviewApproval: 'on_hold' }
  }

  const idx = stageIndex(backendStage)
  const screeningApproval: ApprovalGateStatus = idx > hrReviewIdx ? 'approved' : idx === hrReviewIdx ? 'pending' : 'not_ready'
  const interviewApproval: ApprovalGateStatus =
    idx > humanReviewIdx ? 'approved' : idx === humanReviewIdx ? 'pending' : 'not_ready'
  return { screeningApproval, interviewApproval }
}

// ---------------------------------------------------------------------
// Candidate
// ---------------------------------------------------------------------
export interface BackendCandidate {
  id: string
  jobId: string
  fullName: string
  email: string
  phone: string | null
  source: string
  stage: string
  resumeId: string | null
  rejectedReason: string | null
}

// Backend CandidateSource (app/ai_employees/hr/models/candidate.py) is a
// narrower set than the frontend's — no careers-site/LinkedIn/agency/job-board
// distinction exists on the backend yet, so those map to their closest backend
// equivalent when sent, and default to 'direct_upload' when received.
const BACKEND_TO_FRONTEND_SOURCE: Record<string, Candidate['source']> = {
  resume_upload: 'direct_upload',
  manual: 'direct_upload',
  referral: 'referral',
}

function mapSourceToFrontend(backendSource: string): Candidate['source'] {
  return BACKEND_TO_FRONTEND_SOURCE[backendSource] ?? 'direct_upload'
}

export interface BackendExtractedProfile {
  fullName: string
  email: string
  phone: string
  skills: string[]
  totalExperienceYears: number
  workHistory: { company: string; title: string; durationMonths: number }[]
  education: { institution: string; degree: string }[]
  normalizedSkills?: string[]
}

export function mapExtractedProfile(
  profile: BackendExtractedProfile,
  fileName: string,
  fileSizeLabel: string,
  parsedAt: string,
): ExtractedResumeProfile {
  return {
    fileName,
    fileSizeLabel,
    parsedAt,
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    location: '', // Not extracted by the backend's extraction schema yet.
    yearsExperience: profile.totalExperienceYears,
    currentTitle: profile.workHistory[0]?.title ?? '',
    previousCompanies: profile.workHistory.map((w) => w.company),
    skills: profile.skills,
    technicalSkills: profile.normalizedSkills ?? profile.skills,
    education: profile.education,
    certifications: [], // Not extracted by the backend's extraction schema yet.
    projects: [], // Not extracted by the backend's extraction schema yet.
    jobTitles: profile.workHistory.map((w) => w.title),
    summary: '', // Not extracted by the backend's extraction schema yet.
  }
}

export interface BackendAssessment {
  id: string
  candidateId: string
  overallScore: number
  skillMatch: number
  experienceMatch: number
  missingRequirements: string[]
  evidence: { requirement: string; matched: boolean; evidenceText: string }[]
  createdAt: string
}

function matchLabelFor(score: number): MatchLabel {
  if (score >= 85) return 'Strong Match'
  if (score >= 70) return 'Good Match'
  if (score >= 50) return 'Moderate Match'
  return 'Weak Match'
}

export function mapAssessment(res: BackendAssessment): JdMatchBreakdown {
  const matched = res.evidence.filter((e) => e.matched)
  const missing = res.missingRequirements
  return {
    overallScore: Math.round(res.overallScore),
    matchLabel: matchLabelFor(res.overallScore),
    skillsMatch: Math.round(res.skillMatch),
    experienceMatch: Math.round(res.experienceMatch),
    educationMatch: Math.round(res.skillMatch), // Backend doesn't score education separately.
    roleRelevance: Math.round(res.overallScore),
    matchedSkills: matched.map((e) => ({ skill: e.requirement, matchPercent: 100 })),
    strengths: matched.map((e) => e.evidenceText),
    gaps: missing,
  }
}

export function mapCandidate(
  res: BackendCandidate,
  opts: { jobId?: string; assessment?: BackendAssessment; extractedProfile?: ExtractedResumeProfile; uploadedAt?: string } = {},
): Candidate {
  const { screeningApproval, interviewApproval } = deriveApprovals(res.stage)
  return {
    id: res.id,
    jobId: res.jobId,
    name: res.fullName,
    email: res.email,
    phone: res.phone ?? undefined,
    uploadedAt: opts.uploadedAt ?? new Date().toISOString(),
    stage: mapStageToFrontend(res.stage),
    source: mapSourceToFrontend(res.source),
    overallScore: opts.assessment ? Math.round(opts.assessment.overallScore) : null,
    resumeSummary: opts.extractedProfile?.summary ?? '',
    resumeEvidence: [],
    extractedProfile: opts.extractedProfile,
    jdMatch: opts.assessment ? mapAssessment(opts.assessment) : undefined,
    screeningApproval,
    interviewApproval,
    needsAttention: res.stage === 'hr_review' || res.stage === 'human_review',
    attentionReason: res.rejectedReason ?? undefined,
    location: opts.extractedProfile?.location ?? '',
    yearsExperience: opts.extractedProfile?.yearsExperience ?? 0,
    currentTitle: opts.extractedProfile?.currentTitle ?? '',
  }
}

// ---------------------------------------------------------------------
// Resume processing status (app/ai_employees/hr/models/resume.py) -> the
// frontend's upload-progress vocabulary (src/types/hr.ts ResumeUploadStatus).
// ---------------------------------------------------------------------
const RESUME_STATUS_TO_UPLOAD_STATUS: Record<string, ResumeUploadStatus> = {
  uploaded: 'uploading',
  validating: 'uploading',
  stored: 'uploading',
  ocr_processing: 'ocr_processing',
  parsing: 'parsing',
  extracting: 'extracting',
  needs_identity_review: 'needs_review',
  normalizing: 'matching',
  matching: 'matching',
  completed: 'completed',
  processing_failed: 'failed',
  extraction_failed: 'failed',
  matching_failed: 'failed',
}

const PROGRESS_STEP_ORDER = [
  'uploaded',
  'validating',
  'stored',
  'ocr_processing',
  'parsing',
  'extracting',
  'needs_identity_review',
  'normalizing',
  'matching',
  'completed',
]

export function mapResumeStatus(backendStatus: string): ResumeUploadStatus {
  return RESUME_STATUS_TO_UPLOAD_STATUS[backendStatus] ?? 'uploading'
}

export function resumeStatusProgress(backendStatus: string): number {
  const idx = PROGRESS_STEP_ORDER.indexOf(backendStatus)
  if (idx === -1) return 5
  return Math.round(((idx + 1) / PROGRESS_STEP_ORDER.length) * 100)
}

// Stops the automatic poll loop — either genuinely done, genuinely failed,
// or paused waiting on a human (see isResumeNeedsReview).
export function isResumeTerminal(backendStatus: string): boolean {
  return (
    backendStatus === 'completed' ||
    backendStatus === 'needs_identity_review' ||
    backendStatus.endsWith('_failed')
  )
}

export function isResumeFailed(backendStatus: string): boolean {
  return backendStatus.endsWith('_failed')
}

export function isResumeNeedsReview(backendStatus: string): boolean {
  return backendStatus === 'needs_identity_review'
}
