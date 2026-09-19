// Real client for JEXA Admin — Telephony (Phase 11): a read-only view of
// one organization's telephony resources
// (app/ai_employees/voice/api/admin_telephony_routes.py, prefix
// /internal/voice/admin) — platform-role gated server-side. Reuses the
// same PhoneNumber/TelephonyProviderAccount/SipTrunk/ComplianceRecord/
// DndEntry models the customer-facing telephony console uses.
import { httpClient } from './httpClient'

export interface AdminTelephonyProvider {
  id: string
  providerType: string
  accountLabel: string | null
  status: string
}

export interface AdminPhoneNumber {
  id: string
  number: string
  country: string
  status: string
  monthlyCost: number
  currency: string
  providerAccountId: string
  assignedAgentId: string | null
  assignedAgentName: string | null
}

export interface AdminSipTrunk {
  id: string
  name: string
  host: string
  status: string
  codec: string
  providerAccountId: string
}

export interface AdminComplianceRecord {
  id: string
  label: string
  description: string | null
  region: string
  enabled: boolean
}

export interface AdminDndEntry {
  id: string
  number: string
  reason: string | null
  addedAt: string
}

export interface AdminTelephonyOverview {
  organizationId: string
  organizationName: string
  providers: AdminTelephonyProvider[]
  numbers: AdminPhoneNumber[]
  trunks: AdminSipTrunk[]
  compliance: AdminComplianceRecord[]
  dndEntries: AdminDndEntry[]
}

export const adminTelephonyService = {
  get(organizationId: string): Promise<AdminTelephonyOverview> {
    return httpClient.get<AdminTelephonyOverview>(
      `/internal/voice/admin/organizations/${organizationId}/telephony`,
    )
  },
}
