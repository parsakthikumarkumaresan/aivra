import type { AgentTable } from '@/types'

export const mockAgentTables: AgentTable[] = [
  {
    id: 'tbl_1',
    name: 'Store Locations',
    description: 'Branch addresses, hours and contact numbers Jaan can reference during calls.',
    columns: [
      { id: 'c1', name: 'Store', type: 'text' },
      { id: 'c2', name: 'City', type: 'text' },
      { id: 'c3', name: 'Hours', type: 'text' },
      { id: 'c4', name: 'Phone', type: 'text' },
    ],
    rows: [
      { c1: 'Acme Jewellery — Nungambakkam', c2: 'Chennai', c3: '10:00 – 20:00', c4: '+91 44 4211 0091' },
      { c1: 'Acme Jewellery — Indiranagar', c2: 'Bengaluru', c3: '10:30 – 20:30', c4: '+91 80 4718 2200' },
      { c1: 'Acme Jewellery — Banjara Hills', c2: 'Hyderabad', c3: '10:00 – 20:00', c4: '+91 40 3355 1290' },
    ],
    rowCount: 3,
    agentAccess: ['va_acme_jewellery'],
    updatedAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'tbl_2',
    name: 'Room Types',
    description: 'Room categories, capacity and base rate for Grand Hotel.',
    columns: [
      { id: 'c1', name: 'Room Type', type: 'text' },
      { id: 'c2', name: 'Max Guests', type: 'number' },
      { id: 'c3', name: 'Base Rate (₹)', type: 'number' },
      { id: 'c4', name: 'Available', type: 'boolean' },
    ],
    rows: [
      { c1: 'Deluxe Suite', c2: '2', c3: '8500', c4: 'true' },
      { c1: 'Executive Room', c2: '3', c3: '5200', c4: 'true' },
      { c1: 'Presidential Suite', c2: '4', c3: '18500', c4: 'false' },
    ],
    rowCount: 3,
    agentAccess: ['va_grand_hotel'],
    updatedAt: '2026-08-28T14:00:00Z',
  },
]
