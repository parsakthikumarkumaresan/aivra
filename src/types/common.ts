export type EmployeeStatus =
  | 'draft'
  | 'testing'
  | 'active'
  | 'paused'
  | 'needs_attention'
  | 'waiting_approval'

export type EmployeeType = 'hr' | 'voice'

export type Channel = 'voice' | 'chat' | 'email' | 'sms' | 'web'

export type RiskLevel = 'low' | 'medium' | 'high'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'info_requested' | 'expired'

export type IntegrationStatus = 'connected' | 'not_connected' | 'expired'

export type IntegrationCategory = 'calendar' | 'ats' | 'crm' | 'telephony' | 'email' | 'custom_api'

export type UiState = 'idle' | 'loading' | 'empty' | 'error' | 'success'

export interface Actor {
  id: string
  name: string
  avatarUrl?: string
  role?: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export const EMPLOYEE_STATUS_LABEL: Record<EmployeeStatus, string> = {
  draft: 'Draft',
  testing: 'Testing',
  active: 'Active',
  paused: 'Paused',
  needs_attention: 'Needs Attention',
  waiting_approval: 'Waiting for Approval',
}
