// Real client for JEXA Admin — HR AI business overview
// (app/ai_employees/hr/api/admin_business.py, prefix /internal/hr/admin)
// — platform-role gated server-side. HR-specific metrics only — never
// borrows Jaan's voice/credits/telephony usage model.
import { httpClient } from './httpClient'

export interface AdminHrCustomerRow {
  organizationId: string
  organizationName: string
  status: string
  planName: string | null
  candidatesCount: number
  jobsCount: number
  lastActivityAt: string | null
}

export interface AdminHrBusinessOverview {
  customerCount: number
  activeCustomers: number
  mrr: number
  candidatesTotal: number
  jobsTotal: number
  interviewsTotal: number
  customers: AdminHrCustomerRow[]
}

export const adminHrBusinessService = {
  getOverview(): Promise<AdminHrBusinessOverview> {
    return httpClient.get<AdminHrBusinessOverview>('/internal/hr/admin/business-overview')
  },
}
