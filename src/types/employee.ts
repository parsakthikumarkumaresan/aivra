import type { Channel, EmployeeStatus, EmployeeType } from './common'

export interface EmployeeKpi {
  label: string
  value: string
  trend?: { direction: 'up' | 'down' | 'flat'; value: string }
}

export interface AIEmployee {
  id: string
  type: EmployeeType
  name: string
  tagline: string
  description: string
  status: EmployeeStatus
  avatarColor: string
  channels: Channel[]
  kpis: EmployeeKpi[]
  lastActivityAt: string
  configuredLabel?: string // e.g. "Jewellery Support" for voice
  createdAt: string
}
