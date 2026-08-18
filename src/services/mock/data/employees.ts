import type { AIEmployee } from '@/types'

// Static product catalog — describes every AI Employee AIVRA offers, independent
// of whether this organization has hired them. Status, KPIs, pricing and billing
// fields are merged in at read time by employees.service from the subscription
// and plan layers — see subscription.service.ts.
export const employeeCatalog: Omit<AIEmployee, 'status' | 'kpis' | 'lastActivityAt' | 'monthlyPrice' | 'annualPrice' | 'currency' | 'planId' | 'billingCycle' | 'nextBillingDate'>[] = [
  {
    id: 'emp_hr',
    type: 'hr',
    name: 'AI HR Employee',
    tagline: 'Recruiting & Interview Copilot',
    description: 'Screens candidates, conducts structured AI interviews and schedules human interviews.',
    avatarColor: '#6D3EF2',
    channels: ['chat', 'email'],
    createdAt: '2025-12-01T10:00:00Z',
  },
  {
    id: 'emp_voice',
    type: 'voice',
    name: 'AI Voice Employee',
    tagline: 'Customer Voice & Support Employee',
    description: 'Handles customer conversations, enquiries, bookings and support across configured industries.',
    avatarColor: '#2137C9',
    channels: ['voice'],
    configuredLabel: 'Jewellery Support',
    createdAt: '2025-12-08T10:00:00Z',
  },
]

// KPIs shown once an employee is active — zeroed/hidden entirely when not hired.
export const employeeKpis: Record<string, AIEmployee['kpis']> = {
  hr: [
    { label: 'Candidates Processed', value: '184', trend: { direction: 'up', value: '+12%' } },
    { label: 'Interviews Completed', value: '37', trend: { direction: 'up', value: '+5' } },
  ],
  voice: [
    { label: 'Calls Handled', value: '1,248', trend: { direction: 'up', value: '+8%' } },
    { label: 'Resolution Rate', value: '92%', trend: { direction: 'up', value: '+2.1%' } },
  ],
}

export const employeeLastActivity: Record<string, string> = {
  hr: '2026-08-17T09:52:00Z',
  voice: '2026-08-17T10:05:00Z',
}
