export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer'

export interface Organization {
  id: string
  name: string
  slug: string
  logoUrl?: string
  plan: 'trial' | 'growth' | 'enterprise'
  industry?: string
  timezone: string
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  title?: string
  lastActiveAt?: string
}

export interface NotificationPreferences {
  escalations: boolean
  approvals: boolean
  dailyDigest: boolean
  integrationFailures: boolean
}

export interface AiGovernancePreferences {
  autoEscalateLowConfidence: boolean
  confidenceThreshold: number
}
