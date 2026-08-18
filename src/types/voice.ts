import type { RiskLevel } from './common'
import type { TranscriptTurn } from './hr'

export type VoiceCapability =
  | 'support'
  | 'booking'
  | 'enquiry'
  | 'qualification'
  | 'cancellation'
  | 'status_lookup'
  | 'human_escalation'

export const VOICE_CAPABILITY_LABEL: Record<VoiceCapability, string> = {
  support: 'Support',
  booking: 'Booking',
  enquiry: 'Enquiry',
  qualification: 'Qualification',
  cancellation: 'Cancellation',
  status_lookup: 'Status Lookup',
  human_escalation: 'Human Escalation',
}

export interface VoiceTool {
  id: string
  name: string
  description: string
  permission: string
  risk: RiskLevel
  approvalRequired: boolean
  connected: boolean
}

export type EscalationTrigger =
  | 'low_confidence'
  | 'customer_request'
  | 'complaint'
  | 'sensitive_action'
  | 'repeated_failure'

export interface EscalationRule {
  trigger: EscalationTrigger
  label: string
  description: string
  enabled: boolean
}

/** Customer-safe notification toggles — distinct from the technical EscalationRule engine below, which AIVRA manages. */
export interface VoiceNotificationPreferences {
  escalations: boolean
  dailySummary: boolean
  missedCalls: boolean
}

/** Customer-safe escalation preferences — a simplified subset of the full EscalationRule engine, which AIVRA manages. */
export interface VoiceBasicEscalationPreferences {
  upsetCaller: boolean
  refundsOrCancellations: boolean
}

export interface VoiceEmployeeConfig {
  businessName: string
  industry: string
  description: string
  timezone: string
  workingHours: string
  language: string
  voice: string
  tone: string
  greeting: string
  fallbackMessage: string
  speakingStyle: string
  knowledgeSourceIds: string[]
  capabilities: VoiceCapability[]
  tools: VoiceTool[]
  escalationRules: EscalationRule[]
  phoneProvider: string
  phoneNumber: string
  inboundEnabled: boolean
  outboundEnabled: boolean
  // Customer-safe fields, editable from Voice Basic Settings — everything
  // above this line is AIVRA-internal (see Advanced Setup).
  employeeName: string
  notificationPreferences: VoiceNotificationPreferences
  basicEscalationPreferences: VoiceBasicEscalationPreferences
}

export type CallOutcome =
  | 'resolved'
  | 'booked'
  | 'cancelled'
  | 'escalated'
  | 'no_action'
  | 'failed'

export const CALL_OUTCOME_LABEL: Record<CallOutcome, string> = {
  resolved: 'Resolved',
  booked: 'Booked',
  cancelled: 'Cancelled',
  escalated: 'Escalated',
  no_action: 'No Action',
  failed: 'Failed',
}

export type CallIntent =
  | 'faq'
  | 'booking'
  | 'cancellation'
  | 'status_lookup'
  | 'complaint'
  | 'unknown'

export interface ToolExecution {
  id: string
  toolName: string
  input: string
  result: string
  status: 'success' | 'failed' | 'pending'
  latencyMs: number
  timestamp: string
}

export interface Call {
  id: string
  callerName: string
  callerNumber: string
  employeeId: string
  startedAt: string
  durationSeconds: number
  intent: CallIntent
  outcome: CallOutcome
  escalated: boolean
  escalationReason?: string
  recordingAvailable: boolean
  summary: string
  transcript: TranscriptTurn[]
  toolsUsed: ToolExecution[]
  actionsTaken: string[]
}

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'tool_call' | 'human_handoff'

export type SimulatorScenario =
  | 'faq'
  | 'booking'
  | 'cancellation'
  | 'unknown_question'
  | 'api_failure'
  | 'human_escalation'

export const SIMULATOR_SCENARIO_LABEL: Record<SimulatorScenario, string> = {
  faq: 'FAQ',
  booking: 'Booking',
  cancellation: 'Cancellation',
  unknown_question: 'Unknown Question',
  api_failure: 'API Failure',
  human_escalation: 'Human Escalation',
}

export interface SimulatorResult {
  outcome: 'pass' | 'needs_review'
  transcript: TranscriptTurn[]
  failedStep?: string
  toolResult?: string
  configurationSuggestion?: string
}
