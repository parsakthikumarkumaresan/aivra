import type { Organization, User } from '@/types'
import { mockCurrentUser, mockOrganization, mockUsers } from './data/organization'
import { delay } from './utils'

export const organizationService = {
  getCurrentOrganization(): Promise<Organization> {
    return delay(mockOrganization)
  },
  getCurrentUser(): Promise<User> {
    return delay(mockCurrentUser)
  },
  listUsers(): Promise<User[]> {
    return delay(mockUsers)
  },
}
