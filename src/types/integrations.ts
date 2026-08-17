import type { EmployeeType, IntegrationCategory, IntegrationStatus } from './common'

export interface Integration {
  id: string
  name: string
  category: IntegrationCategory
  description: string
  status: IntegrationStatus
  logoInitial: string
  accentColor: string
  connectedAt?: string
  expiresAt?: string
  usedByEmployees: EmployeeType[]
  accountLabel?: string
}
