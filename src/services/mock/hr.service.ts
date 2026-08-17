import type { Candidate, CandidateStage, EvaluationCriterion, HrEmployeeConfig, Interview, Job, ScheduleSlot } from '@/types'
import { mockJobs } from './data/hr/jobs'
import { mockCandidates } from './data/hr/candidates'
import { defaultRubricTemplate, mockRubric } from './data/hr/rubric'
import { mockInterviews, getInterviewByCandidate } from './data/hr/interviews'
import { mockHiringTeam, mockHrConfig, mockScheduleSlots } from './data/hr/schedule'
import { delay, nextId } from './utils'

export interface CandidateFilters {
  jobId?: string
  stage?: CandidateStage | 'all'
  source?: string
  search?: string
}

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
  createJob(input: Pick<Job, 'title' | 'department' | 'location' | 'employmentType' | 'experienceLevel' | 'description'>): Promise<Job> {
    const job: Job = {
      id: nextId('job'),
      status: 'draft',
      createdAt: new Date().toISOString(),
      candidateCount: 0,
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
    if (candidate) candidate.stage = 'human_interview'
    return delay({ success: true, slot }, 900)
  },
}
