import type { EmployeeType } from './common'
import type { TranscriptTurn } from './hr'

export type InboxTab = 'all' | 'needs_attention' | 'voice' | 'hr' | 'escalations'

export type ConversationStatus = 'open' | 'resolved' | 'escalated' | 'waiting'

export interface ConversationContext {
  label: string
  value: string
}

export interface Conversation {
  id: string
  employeeType: EmployeeType
  subject: string
  participantName: string
  status: ConversationStatus
  updatedAt: string
  createdAt: string
  aiSummary: string
  escalationReason?: string
  transcript: TranscriptTurn[]
  context: ConversationContext[]
  sourceRecordLabel: string
  sourceRecordHref: string
}
