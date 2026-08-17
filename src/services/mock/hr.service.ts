import type {
  Candidate,
  CandidateStage,
  EvaluationCriterion,
  HrEmployeeConfig,
  Interview,
  Job,
  ResumeUploadStatus,
  ScheduleSlot,
} from '@/types'
import { mockJobs } from './data/hr/jobs'
import { mockCandidates } from './data/hr/candidates'
import { defaultRubricTemplate, mockRubric } from './data/hr/rubric'
import { mockInterviews, getInterviewByCandidate } from './data/hr/interviews'
import { mockHiringTeam, mockHrConfig, mockScheduleSlots } from './data/hr/schedule'
import { computeJdMatch } from './data/hr/matching'
import { RESUME_SAMPLE_POOL } from './data/hr/resumeSamples'
import { delay, maybeFail, nextId } from './utils'

export interface CandidateFilters {
  jobId?: string
  stage?: CandidateStage | 'all'
  source?: string
  search?: string
}

const UPLOAD_STEP_ORDER: ResumeUploadStatus[] = ['uploading', 'parsing', 'ocr_processing', 'extracting', 'matching', 'completed']

export const hrService = {
  listJobs(): Promise<Job[]> {
    return delay(mockJobs)
  },
  getJob(id: string): Promise<Job | undefined> {
    return delay(mockJobs.find((j) => j.id === id))
  },
  getRubric(jobId: string): Promise<EvaluationCriterion[]> {
    return delay(mockRubric[jobId] ?? defaultRubricTemplate.map((c, i) => ({ ...c, id: `crit_${i + 1}` })))
  },
  listCandidates(filters: CandidateFilters = {}): Promise<Candidate[]> {
    let results = [...mockCandidates]
    if (filters.jobId && filters.jobId !== 'all') results = results.filter((c) => c.jobId === filters.jobId)
    if (filters.stage && filters.stage !== 'all') results = results.filter((c) => c.stage === filters.stage)
    if (filters.source && filters.source !== 'all') results = results.filter((c) => c.source === filters.source)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      results = results.filter((c) => c.name.toLowerCase().includes(q) || c.currentTitle.toLowerCase().includes(q))
    }
    return delay(results, 400)
  },
  getCandidate(id: string): Promise<Candidate | undefined> {
    return delay(mockCandidates.find((c) => c.id === id))
  },
  getInterview(candidateId: string): Promise<Interview | undefined> {
    return delay(getInterviewByCandidate(candidateId))
  },
  getInterviewById(id: string): Promise<Interview | undefined> {
    return delay(mockInterviews[id])
  },
  listScheduleSlots(): Promise<ScheduleSlot[]> {
    return delay(mockScheduleSlots)
  },
  getHiringTeam() {
    return delay(mockHiringTeam)
  },
  getConfig(): Promise<HrEmployeeConfig> {
    return delay(mockHrConfig)
  },
  createJob(input: Pick<Job, 'title' | 'department' | 'location' | 'employmentType' | 'experienceLevel' | 'description'> & Partial<Pick<Job, 'requirements' | 'requiredSkills'>>): Promise<Job> {
    const job: Job = {
      id: nextId('job'),
      status: 'draft',
      createdAt: new Date().toISOString(),
      candidateCount: 0,
      requirements: input.requirements ?? [],
      requiredSkills: input.requiredSkills ?? [],
      ...input,
    }
    mockJobs.unshift(job)
    return delay(job, 600)
  },
  bookSlot(slotId: string, candidateId: string): Promise<{ success: boolean; slot?: ScheduleSlot }> {
    const slot = mockScheduleSlots.find((s) => s.id === slotId)
    if (!slot || !slot.available) return delay({ success: false }, 700)
    slot.available = false
    const candidate = mockCandidates.find((c) => c.id === candidateId)
    if (candidate) {
      candidate.stage = 'interview_scheduled'
      const interview = candidate.interviewId ? mockInterviews[candidate.interviewId] : undefined
      if (interview) {
        interview.scheduledHumanInterviewAt = slot.startTime
        interview.scheduledInterviewer = slot.interviewerName
        interview.meetingLink = `meet.google.com/${nextId('mtg').replace('_', '-')}`
      }
    }
    return delay({ success: true, slot }, 900)
  },

  // -------------------------------------------------------------------
  // Human approval gates — the AI never crosses these on its own.
  // -------------------------------------------------------------------
  approveForScreening(candidateId: string): Promise<Candidate | undefined> {
    const candidate = mockCandidates.find((c) => c.id === candidateId)
    if (candidate) {
      candidate.screeningApproval = 'approved'
      candidate.stage = 'screening_approved'
      candidate.needsAttention = false
    }
    return delay(candidate, 500)
  },
  rejectCandidate(candidateId: string, note?: string): Promise<Candidate | undefined> {
    const candidate = mockCandidates.find((c) => c.id === candidateId)
    if (candidate) {
      candidate.stage = 'rejected'
      if (candidate.interviewApproval === 'pending') candidate.interviewApproval = 'rejected'
      else candidate.screeningApproval = 'rejected'
      candidate.needsAttention = false
      candidate.attentionReason = note
    }
    return delay(candidate, 500)
  },
  holdCandidate(candidateId: string, note?: string): Promise<Candidate | undefined> {
    const candidate = mockCandidates.find((c) => c.id === candidateId)
    if (candidate) {
      candidate.stage = 'on_hold'
      if (candidate.interviewApproval === 'pending') candidate.interviewApproval = 'on_hold'
      else candidate.screeningApproval = 'on_hold'
      candidate.needsAttention = true
      candidate.attentionReason = note ?? 'Placed on hold by HR.'
    }
    return delay(candidate, 500)
  },
  approveForInterview(candidateId: string): Promise<Candidate | undefined> {
    const candidate = mockCandidates.find((c) => c.id === candidateId)
    if (candidate) {
      candidate.interviewApproval = 'approved'
      candidate.stage = 'interview_approved'
      candidate.needsAttention = false
    }
    return delay(candidate, 500)
  },

  // -------------------------------------------------------------------
  // AI Screening call lifecycle
  // -------------------------------------------------------------------
  startScreeningCall(candidateId: string): Promise<Interview | undefined> {
    const candidate = mockCandidates.find((c) => c.id === candidateId)
    if (!candidate) return delay(undefined)
    candidate.stage = 'ai_screening'

    const existing = candidate.interviewId ? mockInterviews[candidate.interviewId] : undefined
    let interview = existing && existing.status !== 'failed' ? existing : undefined

    if (!interview) {
      const job = mockJobs.find((j) => j.id === candidate.jobId)
      const rubric = mockRubric[candidate.jobId] ?? defaultRubricTemplate.map((c, i) => ({ ...c, id: `crit_${i + 1}` }))
      const criteria = rubric.slice(0, 4)
      const id = nextId('intnew')
      const questions = criteria.map((r, i) => ({
        id: `q${i + 1}`,
        category: r.label,
        prompt: `Tell me about your experience relevant to ${r.label.toLowerCase()}.`,
        answered: true,
      }))
      const now = new Date().toISOString()
      const transcript = [
        { id: 't0', speaker: 'ai' as const, text: `Hi ${candidate.name.split(' ')[0]}, thanks for taking this call. I'll ask a few structured questions about your experience for the ${job?.title ?? 'role'} — this should take about 15 minutes. Ready to begin?`, timestamp: now },
        { id: 't0b', speaker: 'candidate' as const, text: 'Yes, ready!', timestamp: now },
        ...questions.flatMap((q, i) => [
          { id: `ta${i}`, speaker: 'ai' as const, text: q.prompt, timestamp: now },
          { id: `tb${i}`, speaker: 'candidate' as const, text: `Sure — ${candidate.resumeSummary}`, timestamp: now },
        ]),
      ]
      interview = {
        id,
        candidateId: candidate.id,
        jobId: candidate.jobId,
        status: 'not_started',
        template: `${job?.title ?? 'Role'} — Structured Interview`,
        durationMinutes: 15,
        language: 'English (India)',
        questionCategories: criteria.map((r) => r.label),
        questions,
        transcript,
      }
      mockInterviews[id] = interview
      candidate.interviewId = id
    }
    interview.status = 'preparing'
    return delay(interview, 500)
  },

  completeScreeningCall(candidateId: string): Promise<Interview | undefined> {
    const candidate = mockCandidates.find((c) => c.id === candidateId)
    if (!candidate || !candidate.interviewId) return delay(undefined)
    const interview = mockInterviews[candidate.interviewId]
    if (!interview) return delay(undefined)

    const rubric = mockRubric[candidate.jobId] ?? defaultRubricTemplate.map((c, i) => ({ ...c, id: `crit_${i + 1}` }))
    const baseScore = candidate.jdMatch?.overallScore ?? 70
    const criterionEvidence = rubric.slice(0, 4).map((r, i) => ({
      criterionId: r.id,
      criterionLabel: r.label,
      score: Math.max(35, Math.min(97, baseScore + (i % 2 === 0 ? 4 : -6) + (i * 3) % 11)),
      evidence: `Assessed during the AI screening call based on the candidate's responses about ${r.label.toLowerCase()}.`,
    }))
    const overall = Math.round(criterionEvidence.reduce((sum, e) => sum + e.score, 0) / criterionEvidence.length)

    interview.status = 'completed'
    interview.completedAt = new Date().toISOString()
    interview.questions = interview.questions.map((q) => ({ ...q, answered: true }))
    interview.report = {
      summary: `${candidate.name} completed the AI screening call. Overall assessment: ${overall >= 80 ? 'Strong' : overall >= 60 ? 'Solid' : 'Mixed'} responses across ${criterionEvidence.length} evaluation criteria.`,
      strengths: criterionEvidence.filter((e) => e.score >= 75).map((e) => `Strong responses on ${e.criterionLabel.toLowerCase()}`).slice(0, 3).length
        ? criterionEvidence.filter((e) => e.score >= 75).map((e) => `Strong responses on ${e.criterionLabel.toLowerCase()}`)
        : ['Completed the full screening call with clear, structured answers.'],
      gaps: criterionEvidence.filter((e) => e.score < 65).map((e) => `Limited depth on ${e.criterionLabel.toLowerCase()}`).length
        ? criterionEvidence.filter((e) => e.score < 65).map((e) => `Limited depth on ${e.criterionLabel.toLowerCase()}`)
        : ['No significant gaps identified during the call.'],
      unansweredQuestions: [],
      criterionEvidence,
      recommendedNextStep: overall >= 65 ? 'Proceed to human interview review.' : 'Review carefully before proceeding — mixed screening signal.',
      humanReviewRequired: true,
    }

    candidate.stage = 'human_review'
    candidate.interviewApproval = 'pending'
    return delay(interview, 400)
  },

  // -------------------------------------------------------------------
  // Resume upload & processing
  // -------------------------------------------------------------------
  uploadResumeStepOrder: UPLOAD_STEP_ORDER,
  async processResumeUpload(
    jobId: string,
    fileName: string,
    onProgress: (status: ResumeUploadStatus, progress: number) => void,
  ): Promise<{ success: boolean; candidate?: Candidate; errorMessage?: string }> {
    const job = mockJobs.find((j) => j.id === jobId)
    if (!job) return { success: false, errorMessage: 'Job not found.' }

    for (let i = 0; i < UPLOAD_STEP_ORDER.length; i++) {
      const status = UPLOAD_STEP_ORDER[i]
      await delay(null, 550)
      onProgress(status, Math.round(((i + 1) / UPLOAD_STEP_ORDER.length) * 100))
    }

    if (maybeFail(0.12)) {
      return { success: false, errorMessage: 'Could not parse this file — it may be scanned, password-protected or corrupted.' }
    }

    const sample = RESUME_SAMPLE_POOL[Math.floor(Math.random() * RESUME_SAMPLE_POOL.length)]
    const extractedProfile = {
      ...sample,
      fileName,
      parsedAt: new Date().toISOString(),
    }
    const jdMatch = computeJdMatch(extractedProfile, job)

    const candidate: Candidate = {
      id: nextId('cnew'),
      jobId,
      name: extractedProfile.fullName,
      email: extractedProfile.email,
      phone: extractedProfile.phone,
      uploadedAt: new Date().toISOString(),
      stage: 'analyzed',
      source: 'direct_upload',
      screeningApproval: 'pending',
      interviewApproval: 'not_ready',
      overallScore: jdMatch.overallScore,
      resumeSummary: extractedProfile.summary,
      resumeEvidence: [],
      extractedProfile,
      jdMatch,
      location: extractedProfile.location,
      yearsExperience: extractedProfile.yearsExperience,
      currentTitle: extractedProfile.currentTitle,
    }
    mockCandidates.unshift(candidate)
    job.candidateCount += 1

    return { success: true, candidate }
  },

  // -------------------------------------------------------------------
  // Configuration → Testing & Preview
  // -------------------------------------------------------------------
  listResumeSamples(): Promise<{ index: number; label: string }[]> {
    return delay(RESUME_SAMPLE_POOL.map((s, i) => ({ index: i, label: `${s.fullName} — ${s.currentTitle}` })))
  },
  previewResumeMatch(sampleIndex: number, jobId: string) {
    const sample = RESUME_SAMPLE_POOL[sampleIndex]
    const job = mockJobs.find((j) => j.id === jobId)
    if (!sample || !job) return delay(undefined, 400)
    const profile = { ...sample, fileName: `${sample.fullName.replace(/\s+/g, '_')}_Resume.pdf`, parsedAt: new Date().toISOString() }
    const match = computeJdMatch(profile, job)
    return delay({ profile, match }, 900)
  },

  // -------------------------------------------------------------------
  // Screenings & Interviews list views
  // -------------------------------------------------------------------
  listScreenings(): Promise<{ candidate: Candidate; interview?: Interview }[]> {
    const stages: CandidateStage[] = ['screening_approved', 'ai_screening', 'screening_completed', 'human_review']
    const results = mockCandidates
      .filter((c) => stages.includes(c.stage) || (c.interviewId && mockInterviews[c.interviewId]?.status === 'failed'))
      .map((c) => ({ candidate: c, interview: c.interviewId ? mockInterviews[c.interviewId] : undefined }))
    return delay(results, 400)
  },
  listInterviews(): Promise<{ candidate: Candidate; interview?: Interview }[]> {
    const stages: CandidateStage[] = ['interview_approved', 'interview_scheduled', 'completed']
    const results = mockCandidates
      .filter((c) => stages.includes(c.stage))
      .map((c) => ({ candidate: c, interview: c.interviewId ? mockInterviews[c.interviewId] : undefined }))
    return delay(results, 400)
  },
}
