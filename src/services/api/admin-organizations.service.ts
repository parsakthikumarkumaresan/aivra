// Real client for the JEXA Admin Customer Directory / Detail API
// (app/organizations/api/admin_organizations.py, prefix
// /internal/organizations) — platform-role gated server-side.
import { httpClient } from './httpClient'

export interface AdminEmployeeProvisionSummary {
  employeeTypeCode: string
  employeeTypeName: string
  status: string
  activatedAt: string | null
}

export interface AdminVoiceProjectSummary {
  id: string
  name: string
  status: string
}

export interface AdminOrganizationMember {
  id: string
  userId: string
  email: string
  fullName: string
  role: string
  status: string
}

export interface AdminOrganizationSummary {
  id: string
  name: string
  slug: string
  industry: string | null
  status: string
  createdAt: string
  employeeProvisions: AdminEmployeeProvisionSummary[]
}

export interface AdminOrganizationList {
  items: AdminOrganizationSummary[]
  total: number
  page: number
  pageSize: number
}

export interface AdminOrganizationDetail {
  id: string
  name: string
  slug: string
  industry: string | null
  timezone: string
  status: string
  createdAt: string
  employeeProvisions: AdminEmployeeProvisionSummary[]
  voiceProjects: AdminVoiceProjectSummary[]
  members: AdminOrganizationMember[]
}

export const adminOrganizationsService = {
  list(params: { search?: string; page?: number; pageSize?: number }): Promise<AdminOrganizationList> {
    const query = new URLSearchParams()
    if (params.search) query.set('search', params.search)
    query.set('page', String(params.page ?? 1))
    query.set('pageSize', String(params.pageSize ?? 20))
    return httpClient.get<AdminOrganizationList>(`/internal/organizations?${query.toString()}`)
  },
  get(organizationId: string): Promise<AdminOrganizationDetail> {
    return httpClient.get<AdminOrganizationDetail>(`/internal/organizations/${organizationId}`)
  },
}
