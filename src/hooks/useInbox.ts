import { inboxService } from '@/services/api'
import { useAsync } from './useAsync'

export function useConversations() {
  return useAsync(() => inboxService.listConversations(), [])
}

export function useConversation(id: string) {
  return useAsync(() => inboxService.getConversation(id), [id])
}
