import { Badge } from './Badge'
import type { BadgeTone } from './Badge'
import type { ApprovalStatus, EmployeeStatus, IntegrationStatus } from '@/types'
import { EMPLOYEE_STATUS_LABEL } from '@/types'

const EMPLOYEE_STATUS_TONE: Record<EmployeeStatus, BadgeTone> = {
  draft: 'neutral',
  testing: 'info',
  active: 'success',
  paused: 'neutral',
  needs_attention: 'danger',
  waiting_approval: 'warning',
}

export function EmployeeStatusBadge({ status, className }: { status: EmployeeStatus; className?: string }) {
  return (
    <Badge tone={EMPLOYEE_STATUS_TONE[status]} dot className={className}>
      {EMPLOYEE_STATUS_LABEL[status]}
    </Badge>
  )
}

const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  info_requested: 'Info Requested',
  expired: 'Expired',
}

const APPROVAL_STATUS_TONE: Record<ApprovalStatus, BadgeTone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  info_requested: 'info',
  expired: 'neutral',
}

export function ApprovalStatusBadge({ status, className }: { status: ApprovalStatus; className?: string }) {
  return (
    <Badge tone={APPROVAL_STATUS_TONE[status]} dot className={className}>
      {APPROVAL_STATUS_LABEL[status]}
    </Badge>
  )
}

const INTEGRATION_STATUS_LABEL: Record<IntegrationStatus, string> = {
  connected: 'Connected',
  not_connected: 'Not Connected',
  expired: 'Expired',
}

const INTEGRATION_STATUS_TONE: Record<IntegrationStatus, BadgeTone> = {
  connected: 'success',
  not_connected: 'neutral',
  expired: 'danger',
}

export function IntegrationStatusBadge({ status, className }: { status: IntegrationStatus; className?: string }) {
  return (
    <Badge tone={INTEGRATION_STATUS_TONE[status]} dot className={className}>
      {INTEGRATION_STATUS_LABEL[status]}
    </Badge>
  )
}
