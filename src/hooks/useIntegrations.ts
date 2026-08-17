import { integrationsService } from '@/services/api'
import { useAsync } from './useAsync'

export function useIntegrations() {
  return useAsync(() => integrationsService.listIntegrations(), [])
}
