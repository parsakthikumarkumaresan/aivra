import type { Call, CallIntent, CallOutcome, SimulatorResult, SimulatorScenario, VoiceEmployeeConfig } from '@/types'
import { mockVoiceConfig } from './data/voice/config'
import { mockCalls } from './data/voice/calls'
import { mockScenarioResults } from './data/voice/scenarios'
import { delay } from './utils'

export interface CallFilters {
  intent?: CallIntent | 'all'
  outcome?: CallOutcome | 'all'
  escalated?: 'all' | 'yes' | 'no'
  search?: string
}

export const voiceService = {
  getConfig(): Promise<VoiceEmployeeConfig> {
    return delay(mockVoiceConfig)
  },
  saveConfig(patch: Partial<VoiceEmployeeConfig>): Promise<VoiceEmployeeConfig> {
    Object.assign(mockVoiceConfig, patch)
    return delay(mockVoiceConfig, 500)
  },
  listCalls(filters: CallFilters = {}): Promise<Call[]> {
    let results = [...mockCalls]
    if (filters.intent && filters.intent !== 'all') results = results.filter((c) => c.intent === filters.intent)
    if (filters.outcome && filters.outcome !== 'all') results = results.filter((c) => c.outcome === filters.outcome)
    if (filters.escalated && filters.escalated !== 'all') results = results.filter((c) => c.escalated === (filters.escalated === 'yes'))
    if (filters.search) {
      const q = filters.search.toLowerCase()
      results = results.filter((c) => c.callerName.toLowerCase().includes(q) || c.callerNumber.includes(q))
    }
    return delay(results, 400)
  },
  getCall(id: string): Promise<Call | undefined> {
    return delay(mockCalls.find((c) => c.id === id))
  },
  runScenario(scenario: SimulatorScenario): Promise<SimulatorResult> {
    return delay(mockScenarioResults[scenario], 1200)
  },
}
