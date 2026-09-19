// Real client for JEXA Admin — company-wide business Overview + AI
// Employees landing (app/organizations/api/admin_business.py, prefix
// /internal/business/admin) — platform-role gated server-side. Every
// number is a real cross-tenant aggregate; nothing here is fabricated.
import { httpClient } from './httpClient'

export interface AdminAiEmployeeAdoption {
  jaanCustomers: number
  hrCustomers: number
  bothCustomers: number
}

export interface AdminCustomerGrowthPoint {
  day: string
  newCustomers: number
}

export interface AdminRecentActivityItem {
  id: string
  label: string
  action: string
  organizationId: string | null
  organizationName: string | null
  occurredAt: string
}

export interface AdminRevenueTrendPoint {
  month: string
  subscriptionRevenue: number
  rechargeRevenue: number
}

export interface AdminBusinessOverview {
  totalCustomers: number
  activeCustomers: number
  mrr: number
  mrrCurrency: string
  totalRevenue: number
  aiEmployeeAdoption: AdminAiEmployeeAdoption
  customerGrowth: AdminCustomerGrowthPoint[]
  revenueTrend: AdminRevenueTrendPoint[]
  recentActivity: AdminRecentActivityItem[]
}

export interface AdminAiEmployeeSummary {
  code: string
  name: string
  tagline: string
  customerCount: number
  activeCustomers: number
  revenue: number
  revenueLabel: string
  usageLabel: string
  usageValue: string
}

export interface AdminAiEmployeesLanding {
  employees: AdminAiEmployeeSummary[]
}

export const adminBusinessService = {
  getOverview(growthWindowDays = 90): Promise<AdminBusinessOverview> {
    return httpClient.get<AdminBusinessOverview>(
      `/internal/business/admin/overview?growthWindowDays=${growthWindowDays}`,
    )
  },
  getAiEmployeesLanding(): Promise<AdminAiEmployeesLanding> {
    return httpClient.get<AdminAiEmployeesLanding>('/internal/business/admin/ai-employees')
  },
}
