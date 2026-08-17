import type { Conversation } from '@/types'
import { mockConversations } from './data/inbox'
import { delay } from './utils'

export const inboxService = {
  listConversations(): Promise<Conversation[]> {
    return delay(mockConversations)
  },
  getConversation(id: string): Promise<Conversation | undefined> {
    return delay(mockConversations.find((c) => c.id === id))
  },
}
