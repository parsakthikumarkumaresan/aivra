import type { CustomizationLead, CustomizationRequestInput, DemoLead, DemoLeadInput, Lead } from '@/types'
import { mockLeads } from './data/leads'
import { delay, nextId } from './utils'

export const leadsService = {
  submitDemoRequest(input: DemoLeadInput): Promise<DemoLead> {
    const lead: DemoLead = {
      id: nextId('lead'),
      kind: 'demo',
      status: 'new',
      createdAt: new Date().toISOString(),
      ...input,
    }
    mockLeads.push(lead)
    return delay(lead, 700)
  },
  submitCustomizationRequest(input: CustomizationRequestInput): Promise<CustomizationLead> {
    const lead: CustomizationLead = {
      id: nextId('lead'),
      kind: 'customization',
      employeeType: 'voice',
      status: 'new',
      createdAt: new Date().toISOString(),
      ...input,
    }
    mockLeads.push(lead)
    return delay(lead, 700)
  },
  listLeads(): Promise<Lead[]> {
    return delay([...mockLeads])
  },
}
