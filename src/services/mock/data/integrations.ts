import type { Integration } from '@/types'

export const mockIntegrations: Integration[] = [
  {
    id: 'int_gcal', name: 'Google Calendar', category: 'calendar',
    description: 'Sync interviewer availability and book human interviews directly on the hiring team\'s calendars.',
    status: 'expired', logoInitial: 'G', accentColor: '#2170C9', connectedAt: '2026-06-01T09:00:00Z', expiresAt: '2026-08-16T09:00:00Z',
    usedByEmployees: ['hr'], accountLabel: 'rohan@acmecorp.com',
  },
  {
    id: 'int_outlook', name: 'Outlook Calendar', category: 'calendar',
    description: 'Alternative calendar provider for interview scheduling.',
    status: 'not_connected', logoInitial: 'O', accentColor: '#2170C9', usedByEmployees: [],
  },
  {
    id: 'int_greenhouse', name: 'Greenhouse', category: 'ats',
    description: 'Sync candidates, jobs and interview stages with your existing ATS.',
    status: 'not_connected', logoInitial: 'GH', accentColor: '#178350', usedByEmployees: [],
  },
  {
    id: 'int_hubspot', name: 'HubSpot CRM', category: 'crm',
    description: 'Push booking and order context to HubSpot for customer records.',
    status: 'not_connected', logoInitial: 'H', accentColor: '#c8850c', usedByEmployees: [],
  },
  {
    id: 'int_salesforce', name: 'Salesforce', category: 'crm',
    description: 'Sync customer and order records for the AI Voice Employee to reference during calls.',
    status: 'connected', logoInitial: 'SF', accentColor: '#2170C9', connectedAt: '2026-07-20T09:00:00Z',
    usedByEmployees: ['voice'], accountLabel: 'Acme Jewellery Org',
  },
  {
    id: 'int_twilio', name: 'Twilio', category: 'telephony',
    description: 'Phone number provisioning and call routing for the AI Voice Employee.',
    status: 'connected', logoInitial: 'T', accentColor: '#d33d3d', connectedAt: '2026-06-15T09:00:00Z',
    usedByEmployees: ['voice'], accountLabel: '+91 80 4718 2200',
  },
  {
    id: 'int_gmail', name: 'Gmail', category: 'email',
    description: 'Send candidate communications and interview confirmations.',
    status: 'connected', logoInitial: 'M', accentColor: '#d33d3d', connectedAt: '2026-07-01T09:00:00Z',
    usedByEmployees: ['hr'], accountLabel: 'hiring@acmecorp.com',
  },
  {
    id: 'int_custom', name: 'Order Management API', category: 'custom_api',
    description: 'Custom REST API connecting the AI Voice Employee to your order and inventory system.',
    status: 'connected', logoInitial: 'API', accentColor: '#6D3EF2', connectedAt: '2026-06-10T09:00:00Z',
    usedByEmployees: ['voice'], accountLabel: 'api.acmejewellery.com',
  },
]
