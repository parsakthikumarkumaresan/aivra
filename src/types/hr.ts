export type JobStatus = 'draft' | 'open' | 'paused' | 'closed'

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship'

export interface Job {
  id: string
  title: string
  department: string
  location: string
  employmentType: EmploymentType
  experienceLevel: string
  status: JobStatus
  description: string
  requirements: string[]
  requiredSkills: string[]
  createdAt: string
  candidateCount: number
  openSince?: string
}

export interface EvaluationCriterion {
  id: string
  label: string
  description: string
  weight: number // percentage, all criteria should sum ~100
  evidenceHint: string
}

// ---------------------------------------------------------------------
// Candidate pipeline — mirrors the real AIVRA HR workflow:
// Upload -> Processing -> Analyzed -> HR Review (gate) -> Screening Approved
// -> AI Screening -> Screening Completed -> Human Review (gate)
// -> Interview Approved -> Interview Scheduled -> Completed
// ---------------------------------------------------------------------
export type CandidateStage =
  | 'uploaded'
  | 'processing'
  | 'analyzed'
  | 'hr_review'
  | 'screening_approved'
  | 'ai_screening'
  | 'screening_completed'
  | 'human_review'
  | 'interview_approved'
  | 'interview_scheduled'
  | 'completed'
  | 'rejected'
  | 'on_hold'

export const CANDIDATE_STAGE_LABEL: Record<CandidateStage, string> = {
  uploaded: 'Uploaded',
  processing: 'Processing',
  analyzed: 'Analyzed',
  hr_review: 'HR Review',
  screening_approved: 'Screening Approved',
  ai_screening: 'AI Screening',
  screening_completed: 'Screening Completed',
  human_review: 'Human Review',
  interview_approved: 'Interview Approved',
  interview_scheduled: 'Interview Scheduled',
  completed: 'Completed',
  rejected: 'Rejected',
  on_hold: 'On Hold',
}

export type CandidateStageGroup = 'intake' | 'hr_gate' | 'ai_screening' | 'human_gate' | 'interview' | 'closed'

export const CANDIDATE_STAGE_GROUP: Record<CandidateStage, CandidateStageGroup> = {
  uploaded: 'intake',
  processing: 'intake',
  analyzed: 'intake',
  hr_review: 'hr_gate',
  screening_approved: 'ai_screening',
  ai_screening: 'ai_screening',
  screening_completed: 'ai_screening',
  human_review: 'human_gate',
  interview_approved: 'interview',
  interview_scheduled: 'interview',
  completed: 'closed',
  rejected: 'closed',
  on_hold: 'closed',
}

/** Ordered, primary pipeline stages — used for funnels and the pipeline filter (excludes rejected/on_hold). */
export const CANDIDATE_PIPELINE_STAGES: CandidateStage[] = [
  'uploaded',
  'processing',
  'analyzed',
  'hr_review',
  'screening_approved',
  'ai_screening',
  'screening_completed',
  'human_review',
  'interview_approved',
  'interview_scheduled',
  'completed',
]

export type CandidateSource = 'careers_site' | 'referral' | 'linkedin' | 'agency' | 'job_board' | 'direct_upload'

export interface CriterionEvidence {
  criterionId: string
  criterionLabel: string
  score: number // 0-100
  evidence: string
  sourceExcerpt?: string
}

/** A human decision gate the AI cannot cross on its own. */
export type ApprovalGateStatus = 'not_ready' | 'pending' | 'approved' | 'rejected' | 'on_hold'

export interface ExtractedEducation {
  degree: string
  institution: string
}

/** Structured output of resume parsing / OCR / information extraction. */
export interface ExtractedResumeProfile {
  fileName: string
  fileSizeLabel: string
  parsedAt: string
  fullName: string
  email: string
  phone: string
  location: string
  yearsExperience: number
  currentTitle: string
  previousCompanies: string[]
  skills: string[]
  technicalSkills: string[]
  education: ExtractedEducation[]
  certifications: string[]
  projects: string[]
  jobTitles: string[]
  summary: string
}

export type MatchLabel = 'Strong Match' | 'Good Match' | 'Moderate Match' | 'Weak Match'

export interface SkillMatch {
  skill: string
  matchPercent: number
}

/** AI-generated candidate assessment against a specific Job/JD — evidence-backed, not a hiring decision. */
export interface JdMatchBreakdown {
  overallScore: number
  matchLabel: MatchLabel
  skillsMatch: number
  experienceMatch: number
  educationMatch: number
  roleRelevance: number
  matchedSkills: SkillMatch[]
  strengths: string[]
  gaps: string[]
}

export interface Candidate {
  id: string
  jobId: string
  name: string
  email: string
  phone?: string
  avatarUrl?: string
  uploadedAt: string
  stage: CandidateStage
  source: CandidateSource
  overallScore: number | null
  resumeSummary: string
  resumeEvidence: CriterionEvidence[]
  extractedProfile?: ExtractedResumeProfile
  jdMatch?: JdMatchBreakdown
  screeningApproval: ApprovalGateStatus
  interviewApproval: ApprovalGateStatus
  screeningAnswers?: { question: string; answer: string }[]
  needsAttention?: boolean
  attentionReason?: string
  interviewId?: string
  location: string
  yearsExperience: number
  currentTitle: string
}

// ---------------------------------------------------------------------
// AI Screening call (voice) — executed only after HR approves the gate
// ---------------------------------------------------------------------
export type InterviewStatus =
  | 'not_started'
  | 'preparing'
  | 'calling'
  | 'connected'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'human_requested'
  | 'expired'

export interface InterviewQuestion {
  id: string
  category: string
  prompt: string
  askedAt?: string
  candidateResponseSummary?: string
  answered: boolean
}

export interface InterviewReport {
  summary: string
  strengths: string[]
  gaps: string[]
  unansweredQuestions: string[]
  criterionEvidence: CriterionEvidence[]
  recommendedNextStep: string
  humanReviewRequired: true
}

export interface Interview {
  id: string
  candidateId: string
  jobId: string
  status: InterviewStatus
  template: string
  durationMinutes: number
  language: string
  questionCategories: string[]
  questions: InterviewQuestion[]
  transcript: TranscriptTurn[]
  report?: InterviewReport
  scheduledHumanInterviewAt?: string
  scheduledInterviewer?: string
  meetingLink?: string
  completedAt?: string
  isDemo?: boolean
}

export interface TranscriptTurn {
  id: string
  speaker: 'ai' | 'candidate' | 'customer' | 'system'
  text: string
  timestamp: string
}

export interface ScheduleSlot {
  id: string
  startTime: string
  endTime: string
  interviewerId: string
  interviewerName: string
  timezone: string
  available: boolean
}

export interface HrEmployeeConfig {
  rubricVersion: string
  interviewTemplate: string
  calendarConnected: boolean
  notificationsEnabled: boolean
  hiringTeam: { id: string; name: string; role: string }[]
  companyName: string
  timezone: string
}

// ---------------------------------------------------------------------
// Resume upload / processing
// ---------------------------------------------------------------------
export type ResumeUploadStatus =
  | 'queued'
  | 'uploading'
  | 'parsing'
  | 'ocr_processing'
  | 'extracting'
  | 'matching'
  | 'completed'
  | 'failed'
  // AI extraction ran but couldn't produce a usable name/email — paused for
  // HR to review the extracted evidence and confirm/correct identity before
  // a Candidate is created. See ResumeUploadPage.
  | 'needs_review'

export const RESUME_UPLOAD_STATUS_LABEL: Record<ResumeUploadStatus, string> = {
  queued: 'Queued',
  uploading: 'Uploading',
  parsing: 'Parsing',
  ocr_processing: 'OCR Processing',
  extracting: 'Extracting Information',
  matching: 'Matching Job',
  completed: 'Completed',
  failed: 'Failed',
  needs_review: 'Needs Review',
}

export interface ResumeUploadItem {
  id: string
  resumeId?: string
  fileName: string
  fileSizeLabel: string
  status: ResumeUploadStatus
  progress: number
  candidateId?: string
  errorMessage?: string
  // Populated once a resume reaches 'needs_review' — whatever AI extraction
  // could produce, shown so HR corrects/confirms it rather than retyping
  // from scratch. Never sent anywhere until HR confirms it.
  reviewDraft?: {
    fullName: string
    email: string
    phone?: string
    extractedProfile?: ExtractedResumeProfile
    reason: string
  }
}
