import type { EmployeeType } from './common'

export type LeadStatus = 'new' | 'in_progress' | 'provisioned'

export interface DemoLeadInput {
  fullName: string
  companyName: string
  businessEmail: string
  phoneNumber: string
  industry: string
  companyWebsite?: string
  companySize?: string
  interestedIn: EmployeeType
  additionalRequirements?: string
}

export interface DemoLead extends DemoLeadInput {
  id: string
  kind: 'demo'
  status: LeadStatus
  createdAt: string
}

export interface CustomizationRequestInput {
  companyName: string
  contactPerson: string
  businessEmail: string
  phone: string
  industry: string
  website?: string
  businessType?: string
  operatingHours?: string
  expectedCallVolume?: string
  languages?: string
  primaryUseCase: string
  requiredCapabilities?: string
  existingSystems?: string
  currentPhoneProvider?: string
  knowledgeSources?: string
  specialRequirements?: string
}

export interface CustomizationLead extends CustomizationRequestInput {
  id: string
  kind: 'customization'
  employeeType: 'voice'
  status: LeadStatus
  createdAt: string
}

export type Lead = DemoLead | CustomizationLead
