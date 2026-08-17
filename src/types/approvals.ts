import type { ApprovalStatus, EmployeeType, RiskLevel } from './common'

export interface Approval {
  id: string
  employeeType: EmployeeType
  employeeName: string
  requestedAction: string
  affectedRecordLabel: string
  affectedRecordHref: string
  reason: string
  evidence: string[]
  status: ApprovalStatus
  risk: RiskLevel
  requestedAt: string
  expiresAt: string
  decidedAt?: string
  decidedBy?: string
  decisionNote?: string
}
