// Real client for JEXA Admin — Jaan business overview
// (app/ai_employees/voice/api/admin_business_routes.py, prefix
// /internal/voice/admin) — platform-role gated server-side.
import { httpClient } from './httpClient'

export interface AdminJaanCustomerRow {
  organizationId: string
  organizationName: string
  status: string
  creditBalanceMinutes: number
  usedMinutes: number
  revenue: number
  lastCallAt: string | null
}

export interface AdminJaanBusinessOverview {
  customerCount: number
  activeCustomers: number
  revenue: number
  totalCalls: number
  totalVoiceMinutes: number
  customers: AdminJaanCustomerRow[]
}

export const adminJaanBusinessService = {
  getOverview(): Promise<AdminJaanBusinessOverview> {
    return httpClient.get<AdminJaanBusinessOverview>('/internal/voice/admin/business-overview')
  },
}
