// Real client for app/organizations/api/organizations.py, matching the mock
// module's exact exported shape (services/mock/organization.service.ts) so
// no hook or component needs to change — only the swap in services/api/index.ts.
//
// NotificationPreferences / AiGovernancePreferences have no backend endpoint
// yet (no route in app/organizations or elsewhere exposes these) — those two
// methods are intentionally left mock-backed below rather than faking a
// real-looking response for a feature that isn't connected.
import type { AiGovernancePreferences, NotificationPreferences, Organization, User } from '@/types'
import { organizationService as mockOrganizationService } from '@/services/mock/organization.service'
import { authService } from './auth.service'
import { httpClient } from './httpClient'

interface OrganizationResponse {
  id: string
  name: string
  slug: string
  industry: string | null
  timezone: string
  status: string
  createdAt: string
}

interface OrganizationMemberResponse {
  id: string
  userId: string
  email: string
  fullName: string
  role: string
  status: string
}

// The backend has no billing/plan field on Organization yet (that lives in
// the separate, still-mock subscription service) — 'growth' is a display
// default, not a value read from any real subscription state.
function toOrganization(res: OrganizationResponse): Organization {
  return {
    id: res.id,
    name: res.name,
    slug: res.slug,
    plan: 'growth',
    industry: res.industry ?? undefined,
    timezone: res.timezone,
    createdAt: res.createdAt,
  }
}

function toUser(member: OrganizationMemberResponse): User {
  return {
    id: member.userId,
    name: member.fullName,
    email: member.email,
    role: (member.role as User['role']) ?? 'member',
  }
}

export const organizationService = {
  getCurrentOrganization(): Promise<Organization> {
    if (!authService.isAuthenticated()) return Promise.reject(new Error('Not authenticated'))
    return httpClient.get<OrganizationResponse>('/organizations/me').then(toOrganization)
  },
  updateOrganization(patch: Partial<Pick<Organization, 'name' | 'slug' | 'industry' | 'timezone'>>): Promise<Organization> {
    // Backend has no slug-rename endpoint (slug is immutable post-creation) — silently drop it.
    const { name, industry, timezone } = patch
    return httpClient.patch<OrganizationResponse>('/organizations/me', { name, industry, timezone }).then(toOrganization)
  },
  async getCurrentUser(): Promise<User> {
    if (!authService.isAuthenticated()) return Promise.reject(new Error('Not authenticated'))
    const me = await authService.me()
    return {
      id: me.id,
      name: me.fullName,
      email: me.email,
      role: (authService.currentRole() as User['role']) ?? 'member',
    }
  },
  listUsers(): Promise<User[]> {
    if (!authService.isAuthenticated()) return Promise.reject(new Error('Not authenticated'))
    return httpClient.get<OrganizationMemberResponse[]>('/organizations/me/members').then((members) => members.map(toUser))
  },
  // Not yet connected — no backend endpoint for notification preferences.
  getNotificationPreferences(): Promise<NotificationPreferences> {
    return mockOrganizationService.getNotificationPreferences()
  },
  updateNotificationPreferences(patch: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    return mockOrganizationService.updateNotificationPreferences(patch)
  },
  // Not yet connected — no backend endpoint for AI governance preferences.
  getAiPreferences(): Promise<AiGovernancePreferences> {
    return mockOrganizationService.getAiPreferences()
  },
  updateAiPreferences(patch: Partial<AiGovernancePreferences>): Promise<AiGovernancePreferences> {
    return mockOrganizationService.updateAiPreferences(patch)
  },
}
