import type { EmployeeType } from './common'

export type ActivityEventType =
  | 'candidate_progressed'
  | 'interview_completed'
  | 'call_completed'
  | 'call_escalated'
  | 'approval_requested'
  | 'approval_decided'
  | 'integration_failed'
  | 'knowledge_synced'
  | 'employee_status_changed'

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  employeeType?: EmployeeType
  title: string
  description: string
  timestamp: string
  href?: string
}
