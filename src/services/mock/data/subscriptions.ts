import type { Subscription } from '@/types'
import { getPlanForEmployee } from './plans'
import type { VoiceProject } from './voiceProject'

export type MockScenarioId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export const MOCK_SCENARIOS: { id: MockScenarioId; label: string; description: string }[] = [
  { id: 'A', label: 'New Customer', description: 'No AI Employees provisioned yet' },
  { id: 'B', label: 'HR Active', description: 'Jexa HR active' },
  { id: 'C', label: 'Voice Deployment Pending', description: 'Customer requested a custom Jaan — JEXA.AI is configuring it' },
  { id: 'D', label: 'Voice Active', description: 'Jaan deployed and live, branded for the customer' },
  { id: 'E', label: 'HR + Voice Active', description: 'Both AI Employees provisioned and active' },
  { id: 'F', label: 'HR Paused', description: 'Jexa HR subscription paused' },
]

const ORG_ID = 'org_acme'

const SAMPLE_VOICE_PROJECT: VoiceProject = { businessName: 'Acme Jewellery', industry: 'Jewellery & Retail' }

function subscription(employeeType: 'hr' | 'voice', overrides: Partial<Subscription> = {}): Subscription {
  const plan = getPlanForEmployee(employeeType)
  return {
    id: `sub_${employeeType}`,
    organizationId: ORG_ID,
    employeeType,
    planId: plan.id,
    billingCycle: 'monthly',
    status: 'active',
    paymentStatus: 'paid',
    startDate: '2025-12-01T10:00:00Z',
    nextBillingDate: '2026-09-18T00:00:00Z',
    ...overrides,
  }
}

export function buildScenarioSubscriptions(scenario: MockScenarioId): Subscription[] {
  switch (scenario) {
    case 'A':
      return []
    case 'B':
      return [subscription('hr')]
    case 'C':
      return [subscription('voice', { status: 'pending_activation' })]
    case 'D':
      return [subscription('voice')]
    case 'E':
      return [subscription('hr'), subscription('voice')]
    case 'F':
      return [subscription('hr', { status: 'paused' })]
    default:
      return []
  }
}

export function buildScenarioVoiceProject(scenario: MockScenarioId): VoiceProject | null {
  return ['C', 'D', 'E'].includes(scenario) ? SAMPLE_VOICE_PROJECT : null
}

// Maps the 4 demo customer accounts (see aivra-backend/scripts/seed_demo_users.py)
// to the mock subscription scenario that should apply automatically the
// moment that organization logs in — no manual "Developer" scenario switch
// needed. Keyed by the real organization's slug (from GET /organizations/me).
export const DEMO_ORG_SCENARIO_MAP: Record<string, MockScenarioId> = {
  'jaan-demo-both': 'E', // user1 — Jexa HR + Jaan both active
  'jaan-demo-hr': 'B', // user2 — Jexa HR only
  'jaan-demo-voice': 'D', // user3 — Jaan (Voice) only
  'jaan-demo-fresh': 'A', // user4 — fresh signup, nothing purchased
}

export function getScenarioForOrgSlug(slug: string | undefined): MockScenarioId | undefined {
  if (!slug) return undefined
  return DEMO_ORG_SCENARIO_MAP[slug]
}
