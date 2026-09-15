import type { Workflow } from '@/types'

export const mockWorkflows: Workflow[] = [
  {
    id: 'wf_1',
    name: 'Missed Call → SMS Follow-up',
    description: 'When a call is missed or fails, wait 5 minutes then send an SMS with a callback link.',
    status: 'active',
    triggerLabel: 'Call Outcome = Failed or No Action',
    nodes: [
      { id: 'n1', type: 'trigger', name: 'Call Ended', description: 'Fires when any call ends.', nextNodeIds: ['n2'] },
      { id: 'n2', type: 'condition', name: 'Outcome Check', description: 'Outcome is failed or no_action.', nextNodeIds: ['n3'] },
      { id: 'n3', type: 'wait', name: 'Wait 5 Minutes', description: 'Short delay before following up.', nextNodeIds: ['n4'] },
      { id: 'n4', type: 'action', name: 'Send SMS', description: 'Send a callback link via SMS.', nextNodeIds: ['n5'] },
      { id: 'n5', type: 'end', name: 'End', description: 'Workflow complete.', nextNodeIds: [] },
    ],
    runsCount: 214,
    lastRunAt: '2026-09-14T11:20:00Z',
    updatedAt: '2026-08-20T09:00:00Z',
  },
  {
    id: 'wf_2',
    name: 'High-Value Enquiry Escalation',
    description: 'When a call is tagged high purchase intent, notify the store manager and create a CRM task.',
    status: 'active',
    triggerLabel: 'Post-Call Analysis: Purchase Intent = High',
    nodes: [
      { id: 'n1', type: 'trigger', name: 'Analysis Complete', description: 'Fires when post-call analysis finishes.', nextNodeIds: ['n2'] },
      { id: 'n2', type: 'branch', name: 'Intent Strength', description: 'Branch on Purchase Intent Strength field.', nextNodeIds: ['n3', 'n5'] },
      { id: 'n3', type: 'webhook', name: 'Notify Manager', description: 'POST to store manager notification webhook.', nextNodeIds: ['n4'] },
      { id: 'n4', type: 'tool_call', name: 'Create CRM Task', description: 'Create a follow-up task in CRM.', nextNodeIds: [] },
      { id: 'n5', type: 'end', name: 'End (Low Intent)', description: 'No action needed.', nextNodeIds: [] },
    ],
    runsCount: 58,
    lastRunAt: '2026-09-13T16:45:00Z',
    updatedAt: '2026-08-15T14:00:00Z',
  },
  {
    id: 'wf_3',
    name: 'Weekly Campaign Report',
    description: 'Every Monday, compile campaign performance and email it to the growth team.',
    status: 'draft',
    triggerLabel: 'Schedule: Every Monday 08:00 IST',
    nodes: [
      { id: 'n1', type: 'trigger', name: 'Weekly Schedule', description: 'Cron-style weekly trigger.', nextNodeIds: ['n2'] },
      { id: 'n2', type: 'api_call', name: 'Fetch Campaign Stats', description: 'Pull the last 7 days of campaign data.', nextNodeIds: ['n3'] },
      { id: 'n3', type: 'action', name: 'Email Report', description: 'Send a formatted summary email.', nextNodeIds: [] },
    ],
    runsCount: 0,
    updatedAt: '2026-09-01T10:00:00Z',
  },
]
