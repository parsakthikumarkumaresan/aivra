// Real client for app/ai_employees/voice/api/builder_routes.py, matching
// the mock module's exported shape (services/mock/voiceAgentBuilder.service.ts)
// plus two additions the real backend actually supports that the mock
// never modeled: getProviderCatalog() and startTestCall() (a real LiveKit
// room/token so the configured STT/TTS/Realtime provider can be exercised
// live from the browser, without needing full inbound/outbound telephony).
//
// The backend's PATCH /internal/voice-agents/{id} only accepts the 12
// named config sections wrapped in {patch: {...}} — not an arbitrary
// object — and status transitions (test/approve/publish) are separate,
// state-machine-gated endpoints, unlike the mock's single
// Object.assign(agent, patch) shortcut. updateVoiceAgent() always resends
// every section from the given draft (safe/idempotent — the backend just
// reassigns each JSON column to its current value) so the existing
// Save-button call site (AgentWorkspacePage.tsx) doesn't need to know
// which section actually changed. publishVoiceAgent() drives the real
// draft -> test -> approved -> published chain in one call so the existing
// single "Publish" button still works.
import type { ReplayConversation, TestDebugSnapshot, TranscriptTurn, VoiceAgent } from '@/types'
import { httpClient } from './httpClient'

const BASE = '/internal/voice-agents'

const CONFIG_SECTION_KEYS = [
  'promptConfig',
  'flowConfig',
  'contextConfig',
  'library',
  'toolIds',
  'voiceConfig',
  'transcriptionConfig',
  'callEndConfig',
  'transferConfig',
  'analysisConfig',
  'callActionsConfig',
  'advancedConfig',
] as const

interface BackendVoiceAgentResponse {
  id: string
  organizationId: string
  name: string
  industry: string | null
  status: string
  environment: string
  version: number
  lastUpdatedAt: string
  assignedPhoneNumberId: string | null
  promptConfig: Record<string, unknown>
  flowConfig: Record<string, unknown>
  contextConfig: Record<string, unknown>
  library: Record<string, unknown>
  tools: VoiceAgent['tools']
  voiceConfig: Record<string, unknown>
  transcriptionConfig: Record<string, unknown>
  callEndConfig: Record<string, unknown>
  transferConfig: Record<string, unknown>
  analysisConfig: Record<string, unknown>
  callActionsConfig: Record<string, unknown>
  advancedConfig: Record<string, unknown>
}

interface BackendAgentVersionResponse {
  id: string
  voiceAgentId: string
  versionNumber: number
  status: string
}

interface BackendReplayConversation {
  id: string
  agentId: string
  customerName: string
  durationSeconds: number
  outcome: string
  startedAt: string
  transcript: TranscriptTurn[]
  toolCalls: ReplayConversation['toolCalls']
  knowledgeRetrieved: string[]
  timeline: ReplayConversation['timeline']
}

interface BackendProviderCatalog {
  providers: Array<{
    id: string
    name: string
    capabilities: string[]
    realtimeModels: string[]
    realtimeVoices: { id: string; name: string; description?: string }[]
    sttModels: string[]
    sttModes: string[]
    ttsModels: string[]
    ttsVoices: { id: string; name: string; language?: string; gender?: string; description?: string }[]
    ttsVoicesByModel: Record<string, { id: string; name: string; language?: string; gender?: string; description?: string }[]>
    llmModels: string[]
  }>
  turnDetectionModes: string[]
  ambientSounds: { id: string; name: string; clip: string }[]
}

/** Merges the backend's freeform JSON section over typed defaults — the
 * backend never guarantees every field of a section is present (it's a
 * validated-but-freeform JSON column), so every field the UI reads must
 * have a safe fallback. */
function withDefaults<T extends object>(defaults: T, patch: Record<string, unknown> | undefined): T {
  return { ...defaults, ...(patch ?? {}) } as T
}

function toVoiceAgent(res: BackendVoiceAgentResponse): VoiceAgent {
  return {
    id: res.id,
    organizationId: res.organizationId,
    employeeId: res.id,
    name: res.name,
    industry: res.industry ?? 'General',
    status: res.status as VoiceAgent['status'],
    environment: res.environment as VoiceAgent['environment'],
    version: res.version,
    lastUpdatedAt: res.lastUpdatedAt,
    assignedPhoneNumberId: res.assignedPhoneNumberId ?? undefined,
    promptConfig: withDefaults(
      { introMessage: '', delayBeforeSpeakingSeconds: 0, allowIntroInterruptions: true, systemPrompt: '' },
      res.promptConfig,
    ),
    flowConfig: withDefaults({ startNodeId: 'greeting', nodes: [] }, res.flowConfig),
    contextConfig: withDefaults({ variables: [] }, res.contextConfig),
    library: withDefaults({ knowledgeSourceIds: [] }, res.library),
    tools: res.tools ?? [],
    voiceConfig: withDefaults(
      {
        mode: 'custom',
        provider: 'openai',
        model: 'gpt-4o-mini-tts',
        language: 'en-IN',
        gender: 'neutral' as const,
        voiceName: 'alloy',
        introRing: false,
        backgroundSound: false,
        backgroundSoundId: '',
        backgroundSoundVolume: 0.3,
        realtimeProvider: 'openai',
        realtimeModel: 'gpt-realtime',
        realtimeVoice: 'marin',
        textNormalizationPresets: [] as string[],
      },
      res.voiceConfig,
    ),
    transcriptionConfig: withDefaults(
      {
        provider: 'openai',
        model: 'gpt-4o-transcribe',
        languages: ['en-IN'] as string[],
        turnMode: 'Heuristic',
        fixedSilenceSeconds: 1.0,
        turnSensitivity: 'Medium (ideal for regular conversations)',
        interruptionEnabled: true,
        interruptionSensitivity: 'Medium (ideal for regular conversations)',
        noiseReduction: true,
        languageSwitching: false,
      },
      res.transcriptionConfig,
    ),
    callEndConfig: withDefaults(
      {
        endMessage: '',
        generateSummary: true,
        extractIntent: true,
        determineOutcome: true,
        updateCrm: false,
        sendNotification: false,
        webhookUrl: '',
      },
      res.callEndConfig,
    ),
    transferConfig: withDefaults(
      {
        enabled: false,
        conditions: [],
        destination: '',
        businessHoursOnly: false,
        fallbackMessage: '',
        timeoutSeconds: 30,
        transferMessage: '',
      },
      res.transferConfig,
    ),
    analysisConfig: withDefaults(
      { intentDetection: true, sentimentAnalysis: true, resolutionDetection: true, summary: true, keyTopics: true, customFields: [] },
      res.analysisConfig,
    ),
    callActionsConfig: withDefaults({ actions: [] }, res.callActionsConfig),
    advancedConfig: withDefaults(
      {
        llmProvider: 'OpenAI',
        llmModel: 'gpt-4o-mini',
        temperature: 0.5,
        contextWindowTokens: 8000,
        latencyMode: 'balanced' as const,
        vadEnabled: true,
        turnDetectionMode: 'Server VAD',
        retryPolicy: 'No retry',
        debugMode: false,
        webhookUrl: '',
        environment: res.environment as VoiceAgent['environment'],
        runtimeVersion: `v${res.version}`,
      },
      res.advancedConfig,
    ),
    callLimits: { voicemailDetectionEnabled: false, maxCallDurationSeconds: 600, noResponseTimeoutSeconds: 10, noResponseMessage: '' },
  }
}

function toPatchBody(source: Partial<VoiceAgent>): { patch: Record<string, unknown> } {
  const patch: Record<string, unknown> = {}
  for (const key of CONFIG_SECTION_KEYS) {
    if (key in source) patch[key] = (source as Record<string, unknown>)[key]
  }
  return { patch }
}

export const voiceAgentBuilderService = {
  listVoiceAgents(): Promise<VoiceAgent[]> {
    return httpClient.get<BackendVoiceAgentResponse[]>(BASE).then((agents) => agents.map(toVoiceAgent))
  },
  getVoiceAgent(id: string): Promise<VoiceAgent | undefined> {
    return httpClient.get<BackendVoiceAgentResponse>(`${BASE}/${id}`).then(toVoiceAgent)
  },
  createVoiceAgent(name: string, industry?: string): Promise<VoiceAgent> {
    return httpClient.post<BackendVoiceAgentResponse>(BASE, { name, industry }).then(toVoiceAgent)
  },
  // Resends every config section from `patch` (which is always the full
  // current draft from the Save-button call site) — see file header.
  updateVoiceAgent(id: string, patch: Partial<VoiceAgent>): Promise<VoiceAgent> {
    return httpClient.patch<BackendVoiceAgentResponse>(`${BASE}/${id}`, toPatchBody(patch)).then(toVoiceAgent)
  },
  // Drives the real draft -> test -> approved -> published chain so the
  // existing single "Publish" button keeps working unchanged.
  async publishVoiceAgent(id: string): Promise<VoiceAgent> {
    await httpClient.post<BackendAgentVersionResponse>(`${BASE}/${id}/submit-test`)
    await httpClient.post<BackendAgentVersionResponse>(`${BASE}/${id}/approve`)
    await httpClient.post<BackendAgentVersionResponse>(`${BASE}/${id}/publish`)
    return httpClient.get<BackendVoiceAgentResponse>(`${BASE}/${id}`).then(toVoiceAgent)
  },
  pauseVoiceAgent(id: string): Promise<VoiceAgent> {
    return httpClient.post<BackendVoiceAgentResponse>(`${BASE}/${id}/pause`).then(toVoiceAgent)
  },
  resumeVoiceAgent(id: string): Promise<VoiceAgent> {
    return httpClient.post<BackendVoiceAgentResponse>(`${BASE}/${id}/resume`).then(toVoiceAgent)
  },
  listVersions(id: string): Promise<BackendAgentVersionResponse[]> {
    return httpClient.get<BackendAgentVersionResponse[]>(`${BASE}/${id}/versions`)
  },

  sendTestMessage(agentId: string, userText: string): Promise<{ userTurn: TranscriptTurn; agentTurn: TranscriptTurn; debug: TestDebugSnapshot }> {
    return httpClient.post(`${BASE}/${agentId}/test-message`, { userText })
  },

  listReplayConversations(agentId: string): Promise<ReplayConversation[]> {
    return httpClient
      .get<BackendReplayConversation[]>(`${BASE}/${agentId}/replay-conversations`)
      .then((rows) => rows.map((r) => ({ ...r, outcome: r.outcome as ReplayConversation['outcome'] })))
  },
  getReplayConversation(id: string, agentId: string): Promise<ReplayConversation | undefined> {
    return httpClient
      .get<BackendReplayConversation>(`${BASE}/${agentId}/replay-conversations/${id}`)
      .then((r) => ({ ...r, outcome: r.outcome as ReplayConversation['outcome'] }))
  },

  /** Real, curated provider/model/voice catalog — see
   * app/ai_employees/voice/providers/catalog.py. Never contains API keys. */
  getProviderCatalog(): Promise<BackendProviderCatalog> {
    return httpClient.get<BackendProviderCatalog>(`${BASE}/providers`)
  },

  /** Places a real LiveKit room + agent dispatch for this agent's
   * published or draft configuration; returns a browser-joinable token so the
   * configured STT/TTS/Realtime provider can actually be exercised live. */
  startTestCall(
    agentId: string,
    payload?: StartTestCallPayload,
  ): Promise<StartTestCallResult> {
    return httpClient.post(`${BASE}/${agentId}/start-test-call`, payload)
  },

  /** Real outbound caller ID(s) available for test calls — currently just
   * the single VOICE_OUTBOUND_CALLER_ID configured for this deployment (a
   * real number provisioned with the SIP trunk provider), never
   * fabricated. Empty when unconfigured. */
  getOutboundNumbers(): Promise<OutboundNumberOption[]> {
    return httpClient
      .get<{ numbers: OutboundNumberOption[] }>(`${BASE}/outbound-numbers`)
      .then((r) => r.numbers)
  },
}

export interface OutboundNumberOption {
  number: string
  label: string
}

export interface StartTestCallPayload {
  userNumber?: string
  agentNumber?: string
  useDraft?: boolean
  contextVariables?: Record<string, unknown>
  callType?: 'phone' | 'web'
}

export interface StartTestCallResult {
  callId: string
  roomName: string
  token: string
  livekitUrl: string
  // "ready" — no destination number was requested (the Web tab).
  // "initiated" — a real SIP participant was created; a phone should ring.
  // "failed" — a destination number was requested but the real SIP dial
  //   did not succeed — see dialError for why. Never inferred just from
  //   the request containing a destination number.
  dialStatus?: string
  dialError?: string
}

export type { BackendProviderCatalog }
