import type { VoiceProjectStatus } from '@/services/api'
import type { BadgeTone } from '@/components/ui/Badge'

// Single source of truth for VoiceProjectStatus display/transition metadata
// — shared by AdminDeploymentsPage and AdminLeadDetailPage (Phase 6) so
// the lifecycle is never described twice. Mirrors
// app/leads/models/voice_project.py VOICE_PROJECT_TRANSITIONS for UX only
// (which buttons to offer) — the backend state machine is the real
// enforcement; an invalid transition attempted here still gets rejected
// server-side (409 INVALID_STATE_TRANSITION).
export const VOICE_PROJECT_STATUS_LABEL: Record<VoiceProjectStatus, string> = {
  lead_created: 'Lead Created',
  discovery: 'Discovery',
  requirements_collected: 'Requirements Collected',
  configuration: 'Configuration',
  integration: 'Integration',
  testing: 'Testing',
  customer_approval: 'Customer Approval',
  deployment_pending: 'Deployment Pending',
  active: 'Active',
  configuration_failed: 'Configuration Failed',
  integration_failed: 'Integration Failed',
  deployment_failed: 'Deployment Failed',
}

export const VOICE_PROJECT_STATUS_TONE: Record<VoiceProjectStatus, BadgeTone> = {
  lead_created: 'neutral',
  discovery: 'info',
  requirements_collected: 'info',
  configuration: 'warning',
  integration: 'warning',
  testing: 'warning',
  customer_approval: 'brand',
  deployment_pending: 'brand',
  active: 'success',
  configuration_failed: 'danger',
  integration_failed: 'danger',
  deployment_failed: 'danger',
}

export const VOICE_PROJECT_NEXT_STATUSES: Record<VoiceProjectStatus, VoiceProjectStatus[]> = {
  lead_created: ['discovery'],
  discovery: ['requirements_collected'],
  requirements_collected: ['configuration'],
  configuration: ['integration', 'configuration_failed'],
  configuration_failed: ['configuration'],
  integration: ['testing', 'integration_failed'],
  integration_failed: ['integration'],
  testing: ['customer_approval', 'configuration'],
  customer_approval: ['deployment_pending', 'testing'],
  deployment_pending: ['active', 'deployment_failed'],
  deployment_failed: ['deployment_pending'],
  active: [],
}

export const VOICE_PROJECT_FAILURE_STATUSES: VoiceProjectStatus[] = [
  'configuration_failed',
  'integration_failed',
  'deployment_failed',
]

// The "happy path" lifecycle, in order, for a visual stepper — failure
// states are deliberately excluded (they branch off, not part of the
// main line).
export const VOICE_PROJECT_LIFECYCLE_ORDER: VoiceProjectStatus[] = [
  'lead_created',
  'discovery',
  'requirements_collected',
  'configuration',
  'integration',
  'testing',
  'customer_approval',
  'deployment_pending',
  'active',
]
