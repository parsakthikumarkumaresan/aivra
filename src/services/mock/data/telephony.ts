import type { ComplianceSetting, DndEntry, PhoneNumber, RoutingRule, SipTrunk, TelephonyProviderAccount } from '@/types'

export const mockPhoneNumbers: PhoneNumber[] = [
  { id: 'num_1', number: '+91 80 4718 2200', country: 'India', providerId: 'prov_twilio', assignedAgentId: 'va_acme_jewellery', assignedAgentName: 'Acme Jewellery AI Customer Assistant', status: 'active', monthlyCost: 800, currency: 'INR' },
  { id: 'num_2', number: '+91 44 2891 0050', country: 'India', providerId: 'prov_twilio', status: 'unassigned', monthlyCost: 800, currency: 'INR' },
  { id: 'num_3', number: '+1 415 555 0132', country: 'United States', providerId: 'prov_exotel', status: 'porting', monthlyCost: 400, currency: 'INR' },
]

export const mockTelephonyProviders: TelephonyProviderAccount[] = [
  { id: 'prov_twilio', name: 'Twilio', status: 'connected', accountLabel: 'JEXA.AI Production', numbersCount: 2 },
  { id: 'prov_exotel', name: 'Exotel', status: 'connected', accountLabel: 'JEXA.AI India', numbersCount: 1 },
  { id: 'prov_vonage', name: 'Vonage', status: 'not_connected', numbersCount: 0 },
]

export const mockSipTrunks: SipTrunk[] = [
  { id: 'sip_1', name: 'Primary Voice Trunk', provider: 'Twilio Elastic SIP', host: 'sip.aivra-prod.pstn.twilio.com', status: 'active', codec: 'OPUS / G.711' },
  { id: 'sip_2', name: 'BYOC Failover', provider: 'Customer-provided', host: 'byoc.acmecorp-internal.com', status: 'inactive', codec: 'G.711' },
]

export const mockComplianceSettings: ComplianceSetting[] = [
  { id: 'comp_1', label: 'Call recording disclosure', description: 'Announce that calls may be recorded at the start of every call.', enabled: true, region: 'India' },
  { id: 'comp_2', label: 'TRAI DLT registration', description: 'Sender ID and templates registered with TRAI DLT for SMS actions.', enabled: true, region: 'India' },
  { id: 'comp_3', label: 'Do Not Disturb (NDNC) check', description: 'Skip outbound calls to numbers registered on the National DNC registry.', enabled: true, region: 'India' },
  { id: 'comp_4', label: 'Call retention policy', description: 'Automatically delete recordings and transcripts after 180 days.', enabled: false, region: 'Global' },
]

export const mockDndEntries: DndEntry[] = [
  { id: 'dnd_1', number: '+91 98765 43210', reason: 'Customer opted out via SMS', addedAt: '2026-07-02T10:00:00Z' },
  { id: 'dnd_2', number: '+91 99887 66554', reason: 'NDNC registry match', addedAt: '2026-06-18T10:00:00Z' },
]

export const mockRoutingRules: RoutingRule[] = [
  { id: 'route_1', name: 'Business hours → AI Agent', condition: 'business_hours', destination: 'Acme Jewellery AI Customer Assistant', enabled: true, priority: 1 },
  { id: 'route_2', name: 'After hours → Voicemail', condition: 'after_hours', destination: 'Voicemail box', enabled: true, priority: 2 },
  { id: 'route_3', name: 'Agent unavailable → Support Desk', condition: 'agent_unavailable', destination: '+91 80 4718 2200', enabled: true, priority: 3 },
]
