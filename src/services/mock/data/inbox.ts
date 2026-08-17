import type { Conversation } from '@/types'

export const mockConversations: Conversation[] = [
  {
    id: 'conv_1', employeeType: 'hr', subject: 'Naveen Pillai — On Hold pending budget approval',
    participantName: 'Naveen Pillai', status: 'waiting', updatedAt: '2026-08-16T10:00:00Z', createdAt: '2026-08-12T09:00:00Z',
    aiSummary: 'Candidate scored 68/100 for Customer Success Manager. Placed on hold pending finance budget approval — no further AI action possible until a human decision is made.',
    escalationReason: 'Requires a human decision: approve budget to proceed, or reject the candidate.',
    transcript: [], context: [
      { label: 'Job', value: 'Customer Success Manager' },
      { label: 'Score', value: '68 / 100' },
      { label: 'Stage', value: 'On Hold' },
    ],
    sourceRecordLabel: 'View candidate profile', sourceRecordHref: '/app/employees/hr/candidates/cand_13',
  },
  {
    id: 'conv_2', employeeType: 'hr', subject: 'Arjun Verma — Screening report ready for review',
    participantName: 'Arjun Verma', status: 'open', updatedAt: '2026-08-16T14:35:00Z', createdAt: '2026-08-16T14:00:00Z',
    aiSummary: 'AI screening call completed with a strong recommendation. Human review requested before approving for a human interview.',
    escalationReason: 'AI screening calls always require human review before a candidate can be approved for a human interview — this is not an error state.',
    transcript: [
      { id: 't1', speaker: 'ai', text: 'Hi Arjun, thanks for making time. Let\'s dive in — describe a distributed system you designed and the key scaling challenges.', timestamp: '2026-08-16T14:00:00Z' },
      { id: 't2', speaker: 'candidate', text: 'At RouteX I designed the event-driven order routing system…', timestamp: '2026-08-16T14:01:40Z' },
    ],
    context: [
      { label: 'Job', value: 'Backend Engineer' },
      { label: 'JD Match', value: '82%' },
      { label: 'Stage', value: 'Human Review' },
    ],
    sourceRecordLabel: 'View candidate profile', sourceRecordHref: '/app/employees/hr/candidates/cand_7',
  },
  {
    id: 'conv_3', employeeType: 'hr', subject: 'Job "Retail Store Associate" saved as draft',
    participantName: 'System', status: 'resolved', updatedAt: '2026-08-10T09:00:00Z', createdAt: '2026-08-10T09:00:00Z',
    aiSummary: 'A new job was created but not yet published. No candidate activity until it is activated.',
    transcript: [], context: [{ label: 'Status', value: 'Draft' }],
    sourceRecordLabel: 'View job', sourceRecordHref: '/app/employees/hr/jobs',
  },
]
