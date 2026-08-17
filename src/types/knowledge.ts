import type { EmployeeType } from './common'

export type KnowledgeSourceType = 'file' | 'url' | 'connected_source'

export type KnowledgeSyncStatus = 'synced' | 'syncing' | 'failed' | 'stale'

export interface KnowledgeSource {
  id: string
  name: string
  type: KnowledgeSourceType
  owner: string
  lastSyncAt: string
  status: KnowledgeSyncStatus
  employeeAccess: EmployeeType[]
  documentCount: number
  sizeLabel: string
  freshnessLabel: string
  failureReason?: string
}

export interface KnowledgeDocumentChunk {
  id: string
  heading: string
  excerpt: string
}

export interface KnowledgeDocumentDetail extends KnowledgeSource {
  version: string
  chunks: KnowledgeDocumentChunk[]
  permissions: string
}
