import type { Workflow } from '@/types'
import { mockWorkflows } from './data/jaan/workflows'
import { delay } from './utils'

export const jaanWorkflowsService = {
  listWorkflows(): Promise<Workflow[]> {
    return delay(mockWorkflows)
  },
  getWorkflow(id: string): Promise<Workflow | undefined> {
    return delay(mockWorkflows.find((w) => w.id === id))
  },
  setWorkflowStatus(id: string, status: Workflow['status']): Promise<Workflow> {
    const workflow = mockWorkflows.find((w) => w.id === id)
    if (!workflow) return Promise.reject(new Error(`Workflow not found: ${id}`))
    workflow.status = status
    workflow.updatedAt = new Date().toISOString()
    return delay(workflow, 350)
  },
}
