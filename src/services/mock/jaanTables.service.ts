import type { AgentTable } from '@/types'
import { mockAgentTables } from './data/jaan/tables'
import { delay, nextId } from './utils'

export const jaanTablesService = {
  listTables(): Promise<AgentTable[]> {
    return delay(mockAgentTables)
  },
  getTable(id: string): Promise<AgentTable | undefined> {
    return delay(mockAgentTables.find((t) => t.id === id))
  },
  createTable(input: Pick<AgentTable, 'name' | 'description' | 'columns'>): Promise<AgentTable> {
    const table: AgentTable = { ...input, id: nextId('tbl'), rows: [], rowCount: 0, agentAccess: [], updatedAt: new Date().toISOString() }
    mockAgentTables.unshift(table)
    return delay(table, 450)
  },
  deleteTable(id: string): Promise<void> {
    const i = mockAgentTables.findIndex((t) => t.id === id)
    if (i !== -1) mockAgentTables.splice(i, 1)
    return delay(undefined, 300)
  },
}
