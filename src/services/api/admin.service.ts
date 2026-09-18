// Real client for the AIVRA-internal /leads and /internal/voice-projects
// APIs (app/leads/api/leads.py, app/leads/api/voice_projects.py). Both are
// already gated server-side by require_platform_role(AIVRA_ADMIN,
// AIVRA_ENGINEER) — this service adds no authorization of its own, it just
// calls the same endpoints an admin session is already allowed to reach.
import { httpClient } from './httpClient'

export type LeadType = 'demo_request' | 'voice_customization' | 'hr_sales_request'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected'

export interface AdminLeadVoiceProject {
  id: string
  name: string
  status: string
}

export interface AdminLead {
  id: string
  type: LeadType
  status: LeadStatus
  contactName: string
  contactEmail: string
  companyName: string | null
  phone: string | null
  message: string | null
  organizationId: string | null
  createdAt: string
  // Present (possibly null) on list/detail/transition responses; absent
  // on the plain convert-lead response, which intentionally kept its
  // original unenriched shape (see app/leads/schemas/lead.py LeadResponse).
  voiceProject?: AdminLeadVoiceProject | null
}

export interface AdminLeadList {
  items: AdminLead[]
  total: number
  page: number
  pageSize: number
}

export type VoiceProjectStatus =
  | 'lead_created'
  | 'discovery'
  | 'requirements_collected'
  | 'configuration'
  | 'integration'
  | 'testing'
  | 'customer_approval'
  | 'deployment_pending'
  | 'active'
  | 'configuration_failed'
  | 'integration_failed'
  | 'deployment_failed'

export interface AdminVoiceProject {
  id: string
  leadId: string
  organizationId: string | null
  name: string
  status: VoiceProjectStatus
  assignedEngineerUserId: string | null
  failureReason: string | null
}

export interface AdminRequirement {
  id: string
  key: string
  value: string
}

export const adminService = {
  listLeads(params: { search?: string; status?: LeadStatus; page?: number; pageSize?: number } = {}): Promise<AdminLeadList> {
    const query = new URLSearchParams()
    if (params.search) query.set('search', params.search)
    if (params.status) query.set('status', params.status)
    query.set('page', String(params.page ?? 1))
    query.set('pageSize', String(params.pageSize ?? 20))
    return httpClient.get<AdminLeadList>(`/leads?${query.toString()}`)
  },
  getLead(leadId: string): Promise<AdminLead> {
    return httpClient.get<AdminLead>(`/leads/${leadId}`)
  },
  transitionLead(leadId: string, targetStatus: LeadStatus): Promise<AdminLead> {
    return httpClient.post<AdminLead>(`/leads/${leadId}/transition`, { targetStatus })
  },
  convertLead(leadId: string, organizationId: string): Promise<AdminLead> {
    return httpClient.post<AdminLead>(`/leads/${leadId}/convert`, { organizationId })
  },

  listVoiceProjects(): Promise<AdminVoiceProject[]> {
    return httpClient.get<AdminVoiceProject[]>('/internal/voice-projects')
  },
  getVoiceProject(projectId: string): Promise<AdminVoiceProject> {
    return httpClient.get<AdminVoiceProject>(`/internal/voice-projects/${projectId}`)
  },
  assignOrganization(projectId: string, organizationId: string): Promise<AdminVoiceProject> {
    return httpClient.post<AdminVoiceProject>(`/internal/voice-projects/${projectId}/assign-organization`, {
      organizationId,
    })
  },
  assignEngineer(projectId: string, engineerUserId: string): Promise<AdminVoiceProject> {
    return httpClient.post<AdminVoiceProject>(`/internal/voice-projects/${projectId}/assign-engineer`, {
      engineerUserId,
    })
  },
  transitionVoiceProject(
    projectId: string,
    targetStatus: VoiceProjectStatus,
    failureReason?: string,
  ): Promise<AdminVoiceProject> {
    return httpClient.post<AdminVoiceProject>(`/internal/voice-projects/${projectId}/transition`, {
      targetStatus,
      failureReason,
    })
  },
  listRequirements(projectId: string): Promise<AdminRequirement[]> {
    return httpClient.get<AdminRequirement[]>(`/internal/voice-projects/${projectId}/requirements`)
  },
}
