// Real client for JEXA Admin — cross-customer Jaan Calls + Analytics
// (app/ai_employees/voice/api/admin_calls_routes.py, prefix
// /internal/voice/admin) — platform-role gated server-side. Read-only
// views over the same Call/CallAnalysis/Transcript/ToolExecution domain
// the customer-facing call history uses.
import { httpClient } from './httpClient'
import type { VoiceAnalyticsResponse } from '@/types'

export interface AdminCallSummary {
  id: string
  organizationId: string
  organizationName: string
  voiceAgentId: string
  agentName: string
  direction: string
  status: string
  callerNumber: string | null
  startedAt: string
  endedAt: string | null
  durationSeconds: number
  outcome: string | null
  escalated: boolean
  escalationReason: string | null
  environment: string
}

export interface AdminCallList {
  items: AdminCallSummary[]
  total: number
  page: number
  pageSize: number
}

export interface AdminCallToolExecution {
  id: string
  toolName: string
  status: string
  durationMs: number
  timestamp: string
}

export interface AdminCallAnalysis {
  intentDetected: string | null
  sentiment: string | null
  resolutionStatus: string | null
  summary: string | null
  keyTopics: string[]
}

export interface AdminCallDetail {
  id: string
  organizationId: string
  organizationName: string
  voiceAgentId: string
  agentName: string
  providerCallId: string | null
  roomName: string | null
  callerName: string | null
  callerNumber: string | null
  direction: string
  status: string
  startedAt: string
  endedAt: string | null
  durationSeconds: number
  intent: string | null
  outcome: string | null
  escalated: boolean
  escalationReason: string | null
  recordingAvailable: boolean
  summary: string | null
  endReason: string | null
  transcript: Array<{ id: string; speaker: string; text: string; timestamp: string }>
  toolsUsed: AdminCallToolExecution[]
  analysis: AdminCallAnalysis | null
}

export interface AdminAnalyticsUsagePoint {
  day: string
  calls: number
}

export interface AdminAnalyticsCustomerUsage {
  organizationId: string
  organizationName: string
  calls: number
}

export interface AdminAnalytics {
  windowDays: number
  totalCustomers: number
  activeJaanAgents: number
  totalCalls: number
  totalVoiceMinutes: number
  averageDurationSeconds: number
  completedCalls: number
  failedCalls: number
  successRate: number
  usageTrend: AdminAnalyticsUsagePoint[]
  customerUsage: AdminAnalyticsCustomerUsage[]
}

export const adminCallsService = {
  list(params: {
    organizationId?: string
    agentId?: string
    direction?: string
    status?: string
    escalated?: boolean
    search?: string
    startedAfter?: string
    startedBefore?: string
    page?: number
    pageSize?: number
  }): Promise<AdminCallList> {
    const query = new URLSearchParams()
    if (params.organizationId) query.set('organizationId', params.organizationId)
    if (params.agentId) query.set('agentId', params.agentId)
    if (params.direction) query.set('direction', params.direction)
    if (params.status) query.set('status', params.status)
    if (params.escalated !== undefined) query.set('escalated', String(params.escalated))
    if (params.search) query.set('search', params.search)
    if (params.startedAfter) query.set('startedAfter', params.startedAfter)
    if (params.startedBefore) query.set('startedBefore', params.startedBefore)
    query.set('page', String(params.page ?? 1))
    query.set('pageSize', String(params.pageSize ?? 20))
    return httpClient.get<AdminCallList>(`/internal/voice/admin/calls?${query.toString()}`)
  },
  get(callId: string): Promise<AdminCallDetail> {
    return httpClient.get<AdminCallDetail>(`/internal/voice/admin/calls/${callId}`)
  },
  getAnalytics(windowDays = 30): Promise<AdminAnalytics> {
    return httpClient.get<AdminAnalytics>(
      `/internal/voice/admin/analytics?windowDays=${windowDays}`,
    )
  },
  getOrganizationAnalytics(
    organizationId: string,
    params: { dateRange?: string; agentId?: string; direction?: string } = {},
  ): Promise<VoiceAnalyticsResponse> {
    const query = new URLSearchParams()
    query.set('dateRange', params.dateRange ?? '30d')
    if (params.agentId) query.set('agentId', params.agentId)
    if (params.direction) query.set('direction', params.direction)
    return httpClient.get<VoiceAnalyticsResponse>(
      `/internal/voice/admin/organizations/${organizationId}/analytics?${query.toString()}`,
    )
  },
}
