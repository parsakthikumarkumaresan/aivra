import { voiceService } from '@/services/api'
import type { CallFilters } from '@/services/api'
import type { VoiceAnalyticsFilters } from '@/types'
import { useAsync } from './useAsync'

export function useVoiceConfig() {
  return useAsync(() => voiceService.getConfig(), [])
}

export function useCalls(filters: CallFilters) {
  return useAsync(() => voiceService.listCalls(filters), [filters.intent, filters.outcome, filters.escalated, filters.search])
}

export function useCall(id: string) {
  return useAsync(() => voiceService.getCall(id), [id])
}

export function useVoiceAnalytics(filters: VoiceAnalyticsFilters) {
  return useAsync(
    () => voiceService.getAnalytics(filters),
    [filters.dateRange, filters.agentId, filters.direction, filters.startDate, filters.endDate],
  )
}
