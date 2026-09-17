// Mirrors app/ai_employees/voice/schemas/analytics.py (VoiceAnalyticsResponse)
// field-for-field. CamelModel on the backend auto-camelCases every snake_case
// field name, so these types use the exact camelCase keys the API actually
// returns — never `any`, never a superset of real fields.

export type VoiceAnalyticsDateRange = 'today' | 'yesterday' | '7d' | '30d' | 'custom'
export type VoiceAnalyticsDirection = 'inbound' | 'outbound'

export interface VoiceAnalyticsMeta {
  organizationId: string
  agentId: string | null
  direction: string | null
  dateRange: string
  startDate: string
  endDate: string
  bucket: string
  timezone: string
}

export type VoiceFunnelStageKey = 'attempted' | 'dialled' | 'connected' | 'human_answered' | 'engaged'

export interface VoiceFunnelStage {
  key: VoiceFunnelStageKey
  label: string
  count: number
  pctOfAttempted: number
  description: string
}

export interface VoiceCallsOverTimePoint {
  bucketStart: string
  attempted: number
  dialled: number
  connected: number
  humanAnswered: number
  engaged: number
}

export interface VoiceConnectRateAttempt {
  attemptNumber: number
  dialled: number
  connected: number
  connectRate: number
}

export interface VoiceConnectRateResponse {
  connected: number
  dialled: number
  connectRate: number
  byAttempt: VoiceConnectRateAttempt[]
}

export interface VoiceDispositionRow {
  reason: string
  label: string
  calls: number
  pctOfAttempted: number
}

export interface VoiceCallDurationStats {
  humanAnsweredCalls: number
  averageSeconds: number
  medianSeconds: number
  p90Seconds: number
  longestSeconds: number
}

export interface VoiceDurationByStateRow {
  state: string
  label: string
  calls: number
  pctOfConnected: number
  avgSeconds: number
  totalSeconds: number
  pctOfDuration: number
  notEnoughData: boolean
}

export interface VoiceHowCallsEndedRow {
  reason: string
  label: string
  calls: number
  pctOfConnected: number
}

export interface VoiceVoicemailStats {
  voicemailCalls: number
  pctOfConnected: number
  durationSeconds: number
  detectionImplemented: boolean
  description: string
}

export interface VoiceOutcomeRow {
  outcome: string
  calls: number
  pctOfAnswered: number
  avgTalkTimeSeconds: number
}

export interface VoiceCallerNumberRow {
  number: string
  attempted: number
  connectRate: number
  avgDurationSeconds: number
}

export interface VoiceAgentInterventionRow {
  agentId: string
  agentName: string
  attempted: number
  humanAnswered: number
  engaged: number
  engagedRate: number
  avgDurationSeconds: number
}

export interface VoiceInterventionResponse {
  byCallerNumber: VoiceCallerNumberRow[]
  byAgent: VoiceAgentInterventionRow[]
}

export interface VoiceIntentRow {
  intent: string
  calls: number
  pct: number
}

export interface VoiceAnalyticsSummary {
  totalCalls: number
  connectedCalls: number
  missedCalls: number
  voiceMinutes: number
  averageDurationSeconds: number
  successRate: number
  completionRate: number
  transferRate: number
}

export interface VoiceAnalyticsResponse {
  meta: VoiceAnalyticsMeta
  summary: VoiceAnalyticsSummary
  funnel: VoiceFunnelStage[]
  callsOverTime: VoiceCallsOverTimePoint[]
  connectRate: VoiceConnectRateResponse
  disposition: VoiceDispositionRow[]
  callDuration: VoiceCallDurationStats
  durationByState: VoiceDurationByStateRow[]
  howCallsEnded: VoiceHowCallsEndedRow[]
  voicemail: VoiceVoicemailStats
  outcomes: VoiceOutcomeRow[]
  whereToIntervene: VoiceInterventionResponse
  intentDistribution: VoiceIntentRow[]
}

export interface VoiceAnalyticsFilters {
  dateRange: VoiceAnalyticsDateRange
  agentId?: string
  direction?: VoiceAnalyticsDirection
  startDate?: string
  endDate?: string
}
