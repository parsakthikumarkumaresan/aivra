import type { AiGovernancePreferences, NotificationPreferences, Organization, User } from '@/types'
import { mockAiPreferences, mockCurrentUser, mockNotificationPreferences, mockOrganization, mockUsers } from './data/organization'
import { delay } from './utils'

export const organizationService = {
  getCurrentOrganization(): Promise<Organization> {
    return delay(mockOrganization)
  },
  updateOrganization(patch: Partial<Pick<Organization, 'name' | 'slug' | 'industry' | 'timezone'>>): Promise<Organization> {
    Object.assign(mockOrganization, patch)
    return delay(mockOrganization, 500)
  },
  getCurrentUser(): Promise<User> {
    return delay(mockCurrentUser)
  },
  listUsers(): Promise<User[]> {
    return delay(mockUsers)
  },
  getNotificationPreferences(): Promise<NotificationPreferences> {
    return delay(mockNotificationPreferences)
  },
  updateNotificationPreferences(patch: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    Object.assign(mockNotificationPreferences, patch)
    return delay(mockNotificationPreferences, 500)
  },
  getAiPreferences(): Promise<AiGovernancePreferences> {
    return delay(mockAiPreferences)
  },
  updateAiPreferences(patch: Partial<AiGovernancePreferences>): Promise<AiGovernancePreferences> {
    Object.assign(mockAiPreferences, patch)
    return delay(mockAiPreferences, 500)
  },
}
