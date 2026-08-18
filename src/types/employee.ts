import type { Channel, EmployeeStatus, EmployeeType } from './common'
import type { BillingCycle } from './billing'

export interface EmployeeKpi {
  label: string
  value: string
  trend?: { direction: 'up' | 'down' | 'flat'; value: string }
}

export interface AIEmployee {
  id: string
  type: EmployeeType
  name: string
  tagline: string
  description: string
  status: EmployeeStatus
  avatarColor: string
  channels: Channel[]
  kpis: EmployeeKpi[]
  lastActivityAt: string
  configuredLabel?: string // e.g. "Jewellery Support" for voice
  createdAt: string
  // Subscription/plan info — undefined when the employee has never been hired
  monthlyPrice: number
  annualPrice: number
  currency: string
  planId?: string
  billingCycle?: BillingCycle
  nextBillingDate?: string
}
