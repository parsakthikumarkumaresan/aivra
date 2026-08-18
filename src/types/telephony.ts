// Telephony is a separate platform-level module — numbers, providers and
// carrier config are shared infrastructure, not something the Voice Agent
// Builder owns. A voice agent only ever *references* an already-configured
// number (see VoiceAgent.assignedPhoneNumberId).

export type PhoneNumberStatus = 'active' | 'unassigned' | 'porting'

export interface PhoneNumber {
  id: string
  number: string
  country: string
  providerId: string
  assignedAgentId?: string
  assignedAgentName?: string
  status: PhoneNumberStatus
  monthlyCost: number
  currency: string
}

export type TelephonyProviderStatus = 'connected' | 'not_connected'

export interface TelephonyProviderAccount {
  id: string
  name: string
  status: TelephonyProviderStatus
  accountLabel?: string
  numbersCount: number
}

export type SipTrunkStatus = 'active' | 'inactive'

export interface SipTrunk {
  id: string
  name: string
  provider: string
  host: string
  status: SipTrunkStatus
  codec: string
}

export interface ComplianceSetting {
  id: string
  label: string
  description: string
  enabled: boolean
  region: string
}

export interface DndEntry {
  id: string
  number: string
  reason: string
  addedAt: string
}

export type RoutingRuleCondition = 'business_hours' | 'after_hours' | 'region' | 'agent_unavailable'

export interface RoutingRule {
  id: string
  name: string
  condition: RoutingRuleCondition
  destination: string
  enabled: boolean
  priority: number
}
