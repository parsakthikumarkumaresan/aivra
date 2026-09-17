// Real client for app/ai_employees/voice/api/{customer_routes,analytics_routes}.py,
// matching the mock module's exported shape (services/mock/voice.service.ts)
// for listCalls/getCall so no hook/component needs to change beyond the
// barrel swap. getConfig/saveConfig/runScenario have no wired real
// equivalent worth using yet (the backend's own POST /voice/simulate
// returns a canned response server-side, not a real simulated call) and
// stay mock-delegated, following the same hybrid pattern as hr.service.ts.
import type { Call, CallIntent, CallOutcome, SimulatorResult, SimulatorScenario, VoiceEmployeeConfig, VoiceAnalyticsFilters, VoiceAnalyticsResponse } from '@/types'
import { voiceService as mockVoiceService } from '@/services/mock/voice.service'
import { httpClient } from './httpClient'

export interface CallFilters {
  intent?: CallIntent | 'all'
  outcome?: CallOutcome | 'all'
  escalated?: 'all' | 'yes' | 'no'
  search?: string
}

interface BackendToolExecution {
  id: string
  toolName: string
  input: string
  result: string
  status: 'success' | 'failed' | 'pending'
  latencyMs: number
  timestamp: string
}

// The backend's Call.transcript is a raw jsonb array (app/ai_employees/
// voice/schemas/customer.py: `transcript: list[dict[str, Any]]`). Turns
// recorded by the live worker (CallService.append_transcript_turn) do
// carry a real `id`/`timestamp`, but this is a loosely-typed JSON column,
// not a validated schema — mapTranscript() below prefers those real
// values when present and only ever falls back to a synthetic id/omitted
// timestamp for a malformed or historical row that's missing them, so it
// must never be assumed to already match the frontend shape.
interface BackendTranscriptTurn {
  id?: string | null
  speaker?: string | null
  text?: string | null
  timestamp?: string | null
}

interface BackendCallResponse {
  id: string
  callerName: string
  callerNumber: string
  employeeId: string
  startedAt: string
  durationSeconds: number
  intent: string
  outcome: string
  escalated: boolean
  escalationReason: string | null
  recordingAvailable: boolean
  summary: string
  transcript: BackendTranscriptTurn[] | null
  toolsUsed: BackendToolExecution[]
  actionsTaken: string[]
}

function mapTranscript(turns: BackendTranscriptTurn[] | null | undefined): Call['transcript'] {
  return (turns ?? []).map((t, i) => ({
    id: t?.id || `t${i}`,
    speaker: t?.speaker ?? '',
    text: t?.text ?? '',
    timestamp: t?.timestamp ?? undefined,
  }))
}

function toCall(res: BackendCallResponse): Call {
  return {
    id: res.id,
    callerName: res.callerName,
    callerNumber: res.callerNumber,
    employeeId: res.employeeId,
    startedAt: res.startedAt,
    durationSeconds: res.durationSeconds,
    intent: res.intent as CallIntent,
    outcome: res.outcome as CallOutcome,
    escalated: res.escalated,
    escalationReason: res.escalationReason ?? undefined,
    recordingAvailable: res.recordingAvailable,
    summary: res.summary,
    transcript: mapTranscript(res.transcript),
    toolsUsed: res.toolsUsed ?? [],
    actionsTaken: res.actionsTaken ?? [],
  }
}

export const voiceService = {
  getConfig(): Promise<VoiceEmployeeConfig> {
    return mockVoiceService.getConfig()
  },
  saveConfig(patch: Partial<VoiceEmployeeConfig>): Promise<VoiceEmployeeConfig> {
    return mockVoiceService.saveConfig(patch)
  },
  listCalls(filters: CallFilters = {}): Promise<Call[]> {
    const params = new URLSearchParams()
    if (filters.intent && filters.intent !== 'all') params.set('intent', filters.intent)
    if (filters.outcome && filters.outcome !== 'all') params.set('outcome', filters.outcome)
    if (filters.escalated && filters.escalated !== 'all') params.set('escalated', filters.escalated === 'yes' ? 'true' : 'false')
    const qs = params.toString()
    return httpClient.get<BackendCallResponse[]>(`/voice/calls${qs ? `?${qs}` : ''}`).then((calls) => {
      const mapped = calls.map(toCall)
      if (!filters.search) return mapped
      const q = filters.search.toLowerCase()
      return mapped.filter((c) => c.callerName.toLowerCase().includes(q) || c.callerNumber.includes(q) || c.id.includes(q))
    })
  },
  getCall(id: string): Promise<Call | undefined> {
    return httpClient.get<BackendCallResponse>(`/voice/calls/${id}`).then(toCall)
  },
  getAnalytics(filters: VoiceAnalyticsFilters): Promise<VoiceAnalyticsResponse> {
    const params = new URLSearchParams()
    params.set('dateRange', filters.dateRange)
    if (filters.agentId) params.set('agentId', filters.agentId)
    if (filters.direction) params.set('direction', filters.direction)
    if (filters.dateRange === 'custom' && filters.startDate) params.set('startDate', filters.startDate)
    if (filters.dateRange === 'custom' && filters.endDate) params.set('endDate', filters.endDate)
    return httpClient.get<VoiceAnalyticsResponse>(`/analytics/voice?${params.toString()}`)
  },
  runScenario(scenario: SimulatorScenario): Promise<SimulatorResult> {
    return mockVoiceService.runScenario(scenario)
  },
}
