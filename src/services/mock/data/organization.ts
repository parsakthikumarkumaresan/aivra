import type { AiGovernancePreferences, NotificationPreferences, Organization, User } from '@/types'

export const mockOrganization: Organization = {
  id: 'org_acme',
  name: 'Acme Corporation',
  slug: 'acme-corp',
  plan: 'growth',
  industry: 'Jewellery & Retail',
  timezone: 'Asia/Kolkata',
  createdAt: '2025-11-02T09:00:00Z',
}

export const mockUsers: User[] = [
  { id: 'user_1', name: 'Aditi Sharma', email: 'aditi@acmecorp.com', role: 'owner', title: 'Founder & CEO', lastActiveAt: '2026-08-17T10:12:00Z' },
  { id: 'user_2', name: 'Rohan Mehta', email: 'rohan@acmecorp.com', role: 'admin', title: 'Head of People', lastActiveAt: '2026-08-17T09:40:00Z' },
  { id: 'user_3', name: 'Priya Nair', email: 'priya@acmecorp.com', role: 'manager', title: 'Talent Acquisition Lead', lastActiveAt: '2026-08-16T18:05:00Z' },
  { id: 'user_4', name: 'Karthik Iyer', email: 'karthik@acmecorp.com', role: 'manager', title: 'Customer Experience Manager', lastActiveAt: '2026-08-17T08:22:00Z' },
  { id: 'user_5', name: 'Sana Fatima', email: 'sana@acmecorp.com', role: 'member', title: 'Recruiter', lastActiveAt: '2026-08-15T14:50:00Z' },
  { id: 'user_6', name: 'David Chen', email: 'david@acmecorp.com', role: 'viewer', title: 'Finance Analyst', lastActiveAt: '2026-08-14T11:30:00Z' },
]

export const mockCurrentUser: User = mockUsers[1]

// Mutable, in-memory — mutated in place by organizationService so an update
// is visible everywhere the same object is read from, without a page reload.
export const mockNotificationPreferences: NotificationPreferences = {
  escalations: true,
  approvals: true,
  dailyDigest: false,
  integrationFailures: true,
}

export const mockAiPreferences: AiGovernancePreferences = {
  autoEscalateLowConfidence: true,
  confidenceThreshold: 70,
}
