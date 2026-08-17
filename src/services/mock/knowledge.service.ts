import type { EmployeeType, KnowledgeDocumentDetail, KnowledgeSource } from '@/types'
import { mockKnowledgeSources } from './data/knowledge'
import { delay, nextId } from './utils'

function toDetail(source: KnowledgeSource): KnowledgeDocumentDetail {
  return {
    ...source,
    version: 'v' + Math.max(1, Math.round(source.documentCount / 20)),
    permissions: 'Organization members with Admin or Manager role',
    chunks: Array.from({ length: Math.min(4, Math.max(1, Math.round(source.documentCount / 40))) }).map((_, i) => ({
      id: `chunk_${source.id}_${i}`,
      heading: `Section ${i + 1}`,
      excerpt: 'Preview of indexed content used to ground AI Employee responses for this source…',
    })),
  }
}

export const knowledgeService = {
  listSources(): Promise<KnowledgeSource[]> {
    return delay(mockKnowledgeSources)
  },
  getSource(id: string): Promise<KnowledgeDocumentDetail | undefined> {
    const source = mockKnowledgeSources.find((s) => s.id === id)
    return delay(source ? toDetail(source) : undefined)
  },
  addFileSource(name: string): Promise<KnowledgeSource> {
    const source: KnowledgeSource = {
      id: nextId('ks'), name, type: 'file', owner: 'Rohan Mehta', lastSyncAt: new Date().toISOString(),
      status: 'syncing', employeeAccess: [], documentCount: 1, sizeLabel: '—', freshnessLabel: 'Syncing…',
    }
    mockKnowledgeSources.unshift(source)
    return delay(source, 700)
  },
  addUrlSource(url: string): Promise<KnowledgeSource> {
    const source: KnowledgeSource = {
      id: nextId('ks'), name: url, type: 'url', owner: 'Rohan Mehta', lastSyncAt: new Date().toISOString(),
      status: 'syncing', employeeAccess: [], documentCount: 1, sizeLabel: '—', freshnessLabel: 'Syncing…',
    }
    mockKnowledgeSources.unshift(source)
    return delay(source, 700)
  },
  setEmployeeAccess(id: string, access: EmployeeType[]): Promise<KnowledgeSource | undefined> {
    const source = mockKnowledgeSources.find((s) => s.id === id)
    if (source) source.employeeAccess = access
    return delay(source, 500)
  },
  reindex(id: string): Promise<KnowledgeSource | undefined> {
    const source = mockKnowledgeSources.find((s) => s.id === id)
    if (source) {
      source.status = 'synced'
      source.lastSyncAt = new Date().toISOString()
      source.freshnessLabel = 'Synced just now'
      source.failureReason = undefined
    }
    return delay(source, 900)
  },
}
