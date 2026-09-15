import type { TranscriptTurn } from './hr'

// ---------------------------------------------------------------------
// JEXA.AI-internal Voice Agent Builder domain model.
//
// This is the technical configuration behind a customer's AI Voice
// Employee — configured exclusively by the JEXA.AI implementation team,
// never by the customer. The customer-safe subset of this (name, voice,
// language, speaking style, greeting, basic notification/escalation
// preferences) lives separately on VoiceEmployeeConfig (types/voice.ts)
// and is edited from the customer-facing Basic Settings page.
//
// Frontend/mock model only — see services/mock/voiceAgentBuilder.service.ts.
// ---------------------------------------------------------------------

export type VoiceAgentStatus = 'draft' | 'testing' | 'live' | 'paused'

export const VOICE_AGENT_STATUS_LABEL: Record<VoiceAgentStatus, string> = {
  draft: 'Draft',
  testing: 'Testing',
  live: 'Live',
  paused: 'Paused',
}

export type VoiceAgentEnvironment = 'staging' | 'production'

// -- Prompt --------------------------------------------------------------
export interface VoiceAgentPromptConfig {
  introMessage: string
  delayBeforeSpeakingSeconds: number
  allowIntroInterruptions: boolean
  systemPrompt: string
}

// -- Flow ------------------------------------------------------------------
export type FlowNodeType = 'greeting' | 'prompt' | 'condition' | 'tool' | 'transfer' | 'collect_information' | 'api_action' | 'end'

export const FLOW_NODE_TYPE_LABEL: Record<FlowNodeType, string> = {
  greeting: 'Greeting',
  prompt: 'Prompt',
  condition: 'Condition',
  tool: 'Tool',
  transfer: 'Transfer',
  collect_information: 'Collect Information',
  api_action: 'API Action',
  end: 'End',
}

export interface FlowNode {
  id: string
  type: FlowNodeType
  name: string
  prompt?: string
  condition?: string
  toolId?: string
  nextNodeIds: string[]
  fallbackNodeId?: string
  /** Column/row purely for a clean branch layout — not free-form drag coordinates. */
  column: number
  row: number
}

export interface VoiceAgentFlowConfig {
  startNodeId: string
  nodes: FlowNode[]
}

// -- Context ---------------------------------------------------------------
export type ContextVariableType = 'string' | 'number' | 'boolean' | 'date'

export interface ContextVariable {
  id: string
  name: string
  type: ContextVariableType
  description: string
  source: string
  required: boolean
  sampleValue: string
}

export interface VoiceAgentContextConfig {
  variables: ContextVariable[]
}

// -- Tools -------------------------------------------------------------------
export type ToolAuthType = 'none' | 'api_key' | 'bearer'
export type ToolHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
export type ToolKind = 'api' | 'transfer' | 'internal'

export interface ToolField {
  name: string
  type: string
  required: boolean
}

export interface VoiceAgentTool {
  id: string
  name: string
  description: string
  kind: ToolKind
  method: ToolHttpMethod
  endpoint: string
  authType: ToolAuthType
  maskedCredential?: string
  inputs: ToolField[]
  outputs: ToolField[]
  enabled: boolean
}

// -- Voice ---------------------------------------------------------------
export interface VoiceAgentVoiceConfig {
  provider: string
  model: string
  language: string
  gender: 'female' | 'male' | 'neutral'
  voiceName: string
  introRing: boolean
  backgroundSound: boolean
  textNormalizationPresets: string[]
}

// -- Transcription -------------------------------------------------------
export interface VoiceAgentTranscriptionConfig {
  provider: string
  model: string
  languages: string[]
  turnMode: string
  turnSensitivity: string
  interruptionEnabled: boolean
  interruptionSensitivity: string
  noiseReduction: boolean
  languageSwitching: boolean
}

// -- Call End --------------------------------------------------------------
export interface VoiceAgentCallEndConfig {
  endMessage: string
  generateSummary: boolean
  extractIntent: boolean
  determineOutcome: boolean
  updateCrm: boolean
  sendNotification: boolean
  webhookUrl: string
}

// -- Call Transfer -----------------------------------------------------------
export interface TransferCondition {
  id: string
  label: string
  description: string
  enabled: boolean
}

export interface VoiceAgentTransferConfig {
  enabled: boolean
  conditions: TransferCondition[]
  destination: string
  businessHoursOnly: boolean
  fallbackMessage: string
  timeoutSeconds: number
  transferMessage: string
}

// -- Analysis ----------------------------------------------------------------
export interface AnalysisField {
  id: string
  name: string
  description: string
  outputType: 'text' | 'boolean' | 'number' | 'enum'
}

export interface VoiceAgentAnalysisConfig {
  intentDetection: boolean
  sentimentAnalysis: boolean
  resolutionDetection: boolean
  summary: boolean
  keyTopics: boolean
  customFields: AnalysisField[]
}

// -- Call Actions --------------------------------------------------------
export interface CallAction {
  id: string
  name: string
  trigger: string
  destination: string
  payloadFields: string[]
  enabled: boolean
}

export interface VoiceAgentCallActionsConfig {
  actions: CallAction[]
}

// -- Call limits (Jaan customer-facing "Advanced" tab) ----------------------
export interface VoiceAgentCallLimitsConfig {
  voicemailDetectionEnabled: boolean
  maxCallDurationSeconds: number
  noResponseTimeoutSeconds: number
  noResponseMessage: string
}

// -- Advanced (JEXA.AI internal only) ---------------------------------------
export interface VoiceAgentAdvancedConfig {
  llmProvider: string
  llmModel: string
  temperature: number
  contextWindowTokens: number
  latencyMode: 'balanced' | 'low_latency' | 'high_quality'
  vadEnabled: boolean
  turnDetectionMode: string
  retryPolicy: string
  debugMode: boolean
  webhookUrl: string
  environment: VoiceAgentEnvironment
  runtimeVersion: string
}

// -- Root entity -----------------------------------------------------------
export interface VoiceAgent {
  id: string
  organizationId: string
  employeeId: string
  name: string
  industry: string
  status: VoiceAgentStatus
  environment: VoiceAgentEnvironment
  version: number
  lastUpdatedAt: string
  assignedPhoneNumberId?: string
  promptConfig: VoiceAgentPromptConfig
  flowConfig: VoiceAgentFlowConfig
  contextConfig: VoiceAgentContextConfig
  library: { knowledgeSourceIds: string[] }
  tools: VoiceAgentTool[]
  voiceConfig: VoiceAgentVoiceConfig
  transcriptionConfig: VoiceAgentTranscriptionConfig
  callEndConfig: VoiceAgentCallEndConfig
  transferConfig: VoiceAgentTransferConfig
  analysisConfig: VoiceAgentAnalysisConfig
  callActionsConfig: VoiceAgentCallActionsConfig
  advancedConfig: VoiceAgentAdvancedConfig
  callLimits: VoiceAgentCallLimitsConfig
}

// -- Test / Replay -----------------------------------------------------------
export interface TestDebugSnapshot {
  currentNodeName: string
  toolCalled?: string
  knowledgeRetrieved?: string
  contextSnapshot: Record<string, string>
}

export interface TestTurnResult {
  turn: TranscriptTurn
  debug: TestDebugSnapshot
}

export interface ReplayToolCall {
  id: string
  name: string
  input: string
  output: string
  status: 'success' | 'failed'
  timestamp: string
}

export interface ReplayTimelineEntry {
  id: string
  label: string
  timestamp: string
}

export interface ReplayConversation {
  id: string
  agentId: string
  customerName: string
  durationSeconds: number
  outcome: 'resolved' | 'escalated' | 'booked' | 'failed'
  startedAt: string
  transcript: TranscriptTurn[]
  toolCalls: ReplayToolCall[]
  knowledgeRetrieved: string[]
  timeline: ReplayTimelineEntry[]
}
