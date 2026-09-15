export type AgentTableColumnType = 'text' | 'number' | 'boolean' | 'date'

export interface AgentTableColumn {
  id: string
  name: string
  type: AgentTableColumnType
}

export interface AgentTable {
  id: string
  name: string
  description: string
  columns: AgentTableColumn[]
  rows: Record<string, string>[]
  rowCount: number
  agentAccess: string[] // agent IDs allowed to query this table during a call
  updatedAt: string
}
