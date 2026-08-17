import type { Approval, ApprovalStatus } from '@/types'
import { mockApprovals } from './data/approvals'
import { delay } from './utils'

export const approvalsService = {
  listApprovals(): Promise<Approval[]> {
    return delay(mockApprovals)
  },
  decide(id: string, status: ApprovalStatus, note: string): Promise<Approval | undefined> {
    const approval = mockApprovals.find((a) => a.id === id)
    if (approval) {
      approval.status = status
      approval.decidedAt = new Date().toISOString()
      approval.decidedBy = 'Rohan Mehta'
      approval.decisionNote = note
    }
    return delay(approval, 700)
  },
}
