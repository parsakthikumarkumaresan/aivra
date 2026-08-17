import { hrService } from '@/services/api'
import type { CandidateFilters } from '@/services/api'
import { useAsync } from './useAsync'

export function useJobs() {
  return useAsync(() => hrService.listJobs(), [])
}

export function useJob(id: string) {
  return useAsync(() => hrService.getJob(id), [id])
}

export function useRubric(jobId: string) {
  return useAsync(() => hrService.getRubric(jobId), [jobId])
}

export function useCandidates(filters: CandidateFilters) {
  return useAsync(() => hrService.listCandidates(filters), [filters.jobId, filters.stage, filters.source, filters.search])
}

export function useCandidate(id: string) {
  return useAsync(() => hrService.getCandidate(id), [id])
}

export function useInterview(candidateId: string) {
  return useAsync(() => hrService.getInterview(candidateId), [candidateId])
}

export function useScheduleSlots() {
  return useAsync(() => hrService.listScheduleSlots(), [])
}

export function useHrConfig() {
  return useAsync(() => hrService.getConfig(), [])
}

export function useScreenings() {
  return useAsync(() => hrService.listScreenings(), [])
}

export function useInterviewsList() {
  return useAsync(() => hrService.listInterviews(), [])
}
