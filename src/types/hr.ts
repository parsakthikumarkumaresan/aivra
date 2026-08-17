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

export type CandidateStage =
  | 'applied'
  | 'screening'
  | 'shortlisted'
  | 'ai_interview'
  | 'human_interview'
  | 'selected'
  | 'rejected'
  | 'on_hold'

export const CANDIDATE_STAGE_LABEL: Record<CandidateStage, string> = {
  applied: 'Applied',
  screening: 'Screening',
  shortlisted: 'Shortlisted',
  ai_interview: 'AI Interview',
  human_interview: 'Human Interview',
  selected: 'Selected',
  rejected: 'Rejected',
  on_hold: 'On Hold',
}

export type CandidateSource = 'careers_site' | 'referral' | 'linkedin' | 'agency' | 'job_board'

export interface CriterionEvidence {
  criterionId: string
  criterionLabel: string
  score: number // 0-100
  evidence: string
  sourceExcerpt?: string
}

export interface Candidate {
  id: string
  jobId: string
  name: string
  email: string
  phone?: string
  avatarUrl?: string
  appliedAt: string
  stage: CandidateStage
  source: CandidateSource
  overallScore: number | null
  resumeSummary: string
  resumeEvidence: CriterionEvidence[]
  screeningAnswers?: { question: string; answer: string }[]
  needsAttention?: boolean
  attentionReason?: string
  interviewId?: string
  location: string
  yearsExperience: number
  currentTitle: string
}

export type InterviewStatus = 'not_started' | 'in_progress' | 'completed' | 'human_review' | 'expired'

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
  completedAt?: string
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
