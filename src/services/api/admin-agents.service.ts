// Real client for JEXA Admin — cross-customer Jaan Agent Management
// (app/ai_employees/voice/api/admin_agents_routes.py, prefix
// /internal/voice/admin) — platform-role gated server-side. Reuses the
// same VoiceAgent/AgentVersion domain as the customer-facing builder; this
// is a read/summary + pause/resume view only, never a second agent model.
import { httpClient } from './httpClient'

export interface AdminVoiceAgentSummary {
  id: string
  organizationId: string
  organizationName: string
  name: string
  industry: string | null
  status: string
  environment: string
  publishedVersion: number | null
  latestVersion: number | null
  callCount: number
  createdAt: string
  updatedAt: string
}

export interface AdminVoiceAgentList {
  items: AdminVoiceAgentSummary[]
  total: number
  page: number
  pageSize: number
}

export interface AdminAgentRecentCall {
  id: string
  direction: string
  status: string
  startedAt: string
  durationSeconds: number
  outcome: string | null
}

export interface AdminVoiceAgentVersionSummary {
  id: string
  versionNumber: number
  status: string
  isActive: boolean
  publishedAt: string | null
}

export interface AdminVoiceAgentDetail {
  id: string
  organizationId: string
  organizationName: string
  name: string
  industry: string | null
  status: string
  environment: string
  assignedPhoneNumberId: string | null
  createdAt: string
  updatedAt: string
  versions: AdminVoiceAgentVersionSummary[]
  publishedVersion: number | null
  voiceMode: string | null
  voiceProvider: string | null
  voiceModel: string | null
  voiceLanguage: string | null
  voiceConfig: Record<string, unknown>
  recentCalls: AdminAgentRecentCall[]
  callCount: number
}

export interface AdminAgentAction {
  id: string
  status: string
}

export const adminAgentsService = {
  list(params: {
    organizationId?: string
    search?: string
    status?: string
    environment?: string
    page?: number
    pageSize?: number
  }): Promise<AdminVoiceAgentList> {
    const query = new URLSearchParams()
    if (params.organizationId) query.set('organizationId', params.organizationId)
    if (params.search) query.set('search', params.search)
    if (params.status) query.set('status', params.status)
    if (params.environment) query.set('environment', params.environment)
    query.set('page', String(params.page ?? 1))
    query.set('pageSize', String(params.pageSize ?? 20))
    return httpClient.get<AdminVoiceAgentList>(`/internal/voice/admin/agents?${query.toString()}`)
  },
  get(agentId: string): Promise<AdminVoiceAgentDetail> {
    return httpClient.get<AdminVoiceAgentDetail>(`/internal/voice/admin/agents/${agentId}`)
  },
  pause(agentId: string): Promise<AdminAgentAction> {
    return httpClient.post<AdminAgentAction>(`/internal/voice/admin/agents/${agentId}/pause`)
  },
  resume(agentId: string): Promise<AdminAgentAction> {
    return httpClient.post<AdminAgentAction>(`/internal/voice/admin/agents/${agentId}/resume`)
  },
}
