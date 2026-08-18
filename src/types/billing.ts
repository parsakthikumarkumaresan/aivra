import type { EmployeeType } from './common'

export type BillingCycle = 'monthly' | 'annual'

export type SubscriptionStatus =
  | 'active'
  | 'pending_activation'
  | 'paused'
  | 'past_due'
  | 'cancelled'
  | 'expired'

export type PaymentStatus = 'paid' | 'pending' | 'failed'

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  active: 'Active',
  pending_activation: 'Activating',
  paused: 'Paused',
  past_due: 'Payment Issue',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

export interface EmployeePlanLimit {
  label: string
  value: string
}

export interface EmployeePlan {
  id: string
  employeeType: EmployeeType
  name: string
  monthlyPrice: number
  annualPrice: number
  currency: string
  features: string[]
  limits: EmployeePlanLimit[]
}

export interface Subscription {
  id: string
  organizationId: string
  employeeType: EmployeeType
  planId: string
  billingCycle: BillingCycle
  status: SubscriptionStatus
  paymentStatus: PaymentStatus
  startDate: string
  nextBillingDate: string
  cancelledAt?: string
}

export interface BillingAccount {
  organizationId: string
  paymentMethod: {
    brand: string
    last4: string
    expiry: string
  }
}

export interface Invoice {
  id: string
  employeeType: EmployeeType
  amount: number
  currency: string
  status: PaymentStatus
  issuedAt: string
  periodLabel: string
}

export interface EmployeeCatalogContent {
  employeeType: EmployeeType
  whatItDoes: string[]
  howItWorks: string[]
  includes: string[]
  faq: { question: string; answer: string }[]
}
