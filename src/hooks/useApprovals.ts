import { approvalsService } from '@/services/api'
import { useAsync } from './useAsync'

export function useApprovals() {
  return useAsync(() => approvalsService.listApprovals(), [])
}
