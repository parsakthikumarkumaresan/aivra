export type WorkflowNodeType = 'trigger' | 'condition' | 'action' | 'wait' | 'branch' | 'tool_call' | 'api_call' | 'agent_call' | 'transfer' | 'webhook' | 'end'

export const WORKFLOW_NODE_TYPE_LABEL: Record<WorkflowNodeType, string> = {
  trigger: 'Trigger',
  condition: 'Condition',
  action: 'Action',
  wait: 'Wait',
  branch: 'Branch',
  tool_call: 'Tool Call',
  api_call: 'API Call',
  agent_call: 'Agent Call',
  transfer: 'Transfer',
  webhook: 'Webhook',
  end: 'End',
}

export interface WorkflowNode {
  id: string
  type: WorkflowNodeType
  name: string
  description: string
  nextNodeIds: string[]
}

export type WorkflowStatus = 'active' | 'paused' | 'draft'

export interface Workflow {
  id: string
  name: string
  description: string
  status: WorkflowStatus
  triggerLabel: string
  nodes: WorkflowNode[]
  runsCount: number
  lastRunAt?: string
  updatedAt: string
}
