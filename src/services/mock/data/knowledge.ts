import type { KnowledgeSource } from '@/types'

export const mockKnowledgeSources: KnowledgeSource[] = [
  {
    id: 'ks_1', name: 'Product Catalog 2026', type: 'file', owner: 'Rohan Mehta',
    lastSyncAt: '2026-08-17T06:15:00Z', status: 'synced', employeeAccess: ['voice'],
    documentCount: 212, sizeLabel: '48 MB', freshnessLabel: 'Synced 3 hours ago',
  },
  {
    id: 'ks_2', name: 'Store Locations & Hours', type: 'url', owner: 'Karthik Iyer',
    lastSyncAt: '2026-08-16T09:00:00Z', status: 'synced', employeeAccess: ['voice'],
    documentCount: 6, sizeLabel: '—', freshnessLabel: 'Synced yesterday',
  },
  {
    id: 'ks_3', name: 'Returns & Exchange Policy', type: 'file', owner: 'Karthik Iyer',
    lastSyncAt: '2026-08-03T09:00:00Z', status: 'stale', employeeAccess: ['voice'],
    documentCount: 4, sizeLabel: '1.2 MB', freshnessLabel: 'Not synced in 14 days',
  },
  {
    id: 'ks_4', name: 'Bridal & Custom Design FAQ', type: 'file', owner: 'Rohan Mehta',
    lastSyncAt: '2026-08-15T09:00:00Z', status: 'synced', employeeAccess: ['voice'],
    documentCount: 18, sizeLabel: '3.4 MB', freshnessLabel: 'Synced 2 days ago',
  },
  {
    id: 'ks_5', name: 'HR Interview Rubric Library', type: 'file', owner: 'Priya Nair',
    lastSyncAt: '2026-08-14T09:00:00Z', status: 'synced', employeeAccess: ['hr'],
    documentCount: 9, sizeLabel: '2.1 MB', freshnessLabel: 'Synced 3 days ago',
  },
  {
    id: 'ks_6', name: 'Employee Handbook', type: 'file', owner: 'Rohan Mehta',
    lastSyncAt: '2026-08-10T09:00:00Z', status: 'synced', employeeAccess: ['hr'],
    documentCount: 32, sizeLabel: '6.8 MB', freshnessLabel: 'Synced 7 days ago',
  },
  {
    id: 'ks_7', name: 'Competitor Pricing Sheet', type: 'connected_source', owner: 'David Chen',
    lastSyncAt: '2026-08-09T09:00:00Z', status: 'failed', employeeAccess: [],
    documentCount: 0, sizeLabel: '—', freshnessLabel: 'Last sync failed', failureReason: 'Source spreadsheet permissions revoked.',
  },
]
