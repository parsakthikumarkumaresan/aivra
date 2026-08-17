import type { AIEmployee } from '@/types'

export const mockEmployees: AIEmployee[] = [
  {
    id: 'emp_hr',
    type: 'hr',
    name: 'AI HR Employee',
    tagline: 'Recruiting & Interview Copilot',
    description: 'Screens candidates, conducts structured AI interviews and schedules human interviews.',
    status: 'active',
    avatarColor: '#6D3EF2',
    channels: ['chat', 'email'],
    kpis: [
      { label: 'Candidates Processed', value: '184', trend: { direction: 'up', value: '+12%' } },
      { label: 'Interviews Completed', value: '37', trend: { direction: 'up', value: '+5' } },
    ],
    lastActivityAt: '2026-08-17T09:52:00Z',
    createdAt: '2025-12-01T10:00:00Z',
  },
  {
    id: 'emp_voice',
    type: 'voice',
    name: 'AI Voice Employee',
    tagline: 'Jewellery Support',
    description: 'Handles customer conversations, enquiries, bookings and support across configured industries.',
    status: 'active',
    avatarColor: '#2170C9',
    channels: ['voice'],
    kpis: [
      { label: 'Calls Handled', value: '1,248', trend: { direction: 'up', value: '+8%' } },
      { label: 'Resolution Rate', value: '92%', trend: { direction: 'up', value: '+2.1%' } },
    ],
    lastActivityAt: '2026-08-17T10:05:00Z',
    configuredLabel: 'Jewellery Support',
    createdAt: '2025-12-08T10:00:00Z',
  },
]
