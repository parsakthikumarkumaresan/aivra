// Real client for JEXA Admin — Audit Logs (Phase 13)
// (app/audit/api/admin_audit.py, prefix /internal/audit-logs) —
// platform-role gated server-side. Reads the same AuditEvent trail
// already written by admin quote/credit/agent/telephony actions.
import { httpClient } from './httpClient'

export interface AdminAuditEvent {
  id: string
  organizationId: string
  organizationName: string
  actorId: string | null
  actorType: string
  actorEmail: string | null
  action: string
  resourceType: string
  resourceId: string
  result: string
  requestId: string | null
  createdAt: string
}

export interface AdminAuditEventList {
  items: AdminAuditEvent[]
  total: number
  page: number
  pageSize: number
}

export const adminAuditService = {
  list(params: {
    organizationId?: string
    actorId?: string
    action?: string
    resourceType?: string
    result?: string
    search?: string
    createdAfter?: string
    createdBefore?: string
    page?: number
    pageSize?: number
  }): Promise<AdminAuditEventList> {
    const query = new URLSearchParams()
    if (params.organizationId) query.set('organizationId', params.organizationId)
    if (params.actorId) query.set('actorId', params.actorId)
    if (params.action) query.set('action', params.action)
    if (params.resourceType) query.set('resourceType', params.resourceType)
    if (params.result) query.set('result', params.result)
    if (params.search) query.set('search', params.search)
    if (params.createdAfter) query.set('createdAfter', params.createdAfter)
    if (params.createdBefore) query.set('createdBefore', params.createdBefore)
    query.set('page', String(params.page ?? 1))
    query.set('pageSize', String(params.pageSize ?? 50))
    return httpClient.get<AdminAuditEventList>(`/internal/audit-logs?${query.toString()}`)
  },
}
