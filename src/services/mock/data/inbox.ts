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
    id: 'conv_2', employeeType: 'hr', subject: 'Arvind Subramanian — Ready for human interview',
    participantName: 'Arvind Subramanian', status: 'open', updatedAt: '2026-08-15T11:32:00Z', createdAt: '2026-08-15T11:00:00Z',
    aiSummary: 'AI interview completed with a strong recommendation. Human review requested before scheduling the panel round.',
    escalationReason: 'AI interviews always require human review before proceeding — this is not an error state.',
    transcript: [
      { id: 't1', speaker: 'ai', text: 'Hi Arvind, thanks for joining — let\'s get started.', timestamp: '2026-08-15T11:00:00Z' },
      { id: 't2', speaker: 'candidate', text: 'Happy to be here.', timestamp: '2026-08-15T11:00:05Z' },
    ],
    context: [
      { label: 'Job', value: 'Senior Product Designer' },
      { label: 'Score', value: '91 / 100' },
      { label: 'Stage', value: 'Human Interview' },
    ],
    sourceRecordLabel: 'View candidate profile', sourceRecordHref: '/app/employees/hr/candidates/cand_2',
  },
  {
    id: 'conv_3', employeeType: 'hr', subject: 'Job "Retail Store Associate" saved as draft',
    participantName: 'System', status: 'resolved', updatedAt: '2026-08-10T09:00:00Z', createdAt: '2026-08-10T09:00:00Z',
    aiSummary: 'A new job was created but not yet published. No candidate activity until it is activated.',
    transcript: [], context: [{ label: 'Status', value: 'Draft' }],
    sourceRecordLabel: 'View job', sourceRecordHref: '/app/employees/hr/jobs',
  },
]
