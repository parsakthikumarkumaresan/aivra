import { organizationService } from '@/services/api'
import { useAsync } from './useAsync'

export function useOrganization() {
  return useAsync(() => organizationService.getCurrentOrganization(), [])
}

export function useCurrentUser() {
  return useAsync(() => organizationService.getCurrentUser(), [])
}

export function useUsers() {
  return useAsync(() => organizationService.listUsers(), [])
}
