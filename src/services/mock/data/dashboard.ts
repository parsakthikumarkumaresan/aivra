import type { ActivityEvent, AnalyticsMetric, ChartPoint } from '@/types'

export const dashboardKpis: AnalyticsMetric[] = [
  { id: 'active_employees', label: 'Active AI Employees', value: '2', trend: { direction: 'flat', value: '0' }, tooltip: 'AI Employees currently in an Active status, excluding Draft, Testing and Paused.' },
  { id: 'tasks_completed', label: 'Tasks Completed', value: '1,248', trend: { direction: 'up', value: '+12.4%' }, tooltip: 'Screenings, interviews, calls and bookings completed across all AI Employees in the selected period.' },
  { id: 'conversations', label: 'Conversations', value: '2,873', trend: { direction: 'up', value: '+8.1%' }, tooltip: 'Total voice calls and chat conversations handled across all AI Employees.' },
  { id: 'pending_approvals', label: 'Pending Approvals', value: '3', trend: { direction: 'down', value: '-2' }, tooltip: 'Actions awaiting human approval before an AI Employee can proceed.' },
]

function buildChart(days: number, base: number, variance: number): ChartPoint[] {
  const points: ChartPoint[] = []
  const now = new Date('2026-08-17T00:00:00Z')
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const wobble = Math.sin(i / 2.3) * variance + Math.random() * variance * 0.6
    points.push({
      date: date.toISOString(),
      value: Math.max(0, Math.round(base + wobble)),
      secondaryValue: Math.max(0, Math.round(base * 0.55 + wobble * 0.6)),
    })
  }
  return points
}

export const activityChart7d: ChartPoint[] = buildChart(7, 320, 60)
export const activityChart30d: ChartPoint[] = buildChart(30, 300, 90)

export interface NeedsAttentionItem {
  id: string
  type: 'escalation' | 'integration' | 'approval' | 'warning'
  title: string
  description: string
  timestamp: string
  href: string
}

export const needsAttentionItems: NeedsAttentionItem[] = [
  {
    id: 'na1',
    type: 'escalation',
    title: 'Call escalated to human agent',
    description: 'Customer requested a refund exception — outside AI Voice Employee authority.',
    timestamp: '2026-08-17T08:55:00Z',
    href: '/app/inbox',
  },
  {
    id: 'na2',
    type: 'integration',
    title: 'Calendar integration expired',
    description: 'Google Calendar token expired — HR interview scheduling is paused.',
    timestamp: '2026-08-17T07:20:00Z',
    href: '/app/integrations',
  },
  {
    id: 'na3',
    type: 'approval',
    title: '3 approvals awaiting review',
    description: 'Includes 1 high-risk action requested by AI Voice Employee.',
    timestamp: '2026-08-16T19:10:00Z',
    href: '/app/approvals',
  },
  {
    id: 'na4',
    type: 'warning',
    title: 'Knowledge source out of date',
    description: '"Returns & Exchange Policy" has not synced in 14 days.',
    timestamp: '2026-08-15T11:00:00Z',
    href: '/app/knowledge',
  },
]

export const recentActivity: ActivityEvent[] = [
  { id: 'ev1', type: 'candidate_progressed', employeeType: 'hr', title: 'Meera Krishnan moved to AI Interview', description: 'Senior Product Designer · Job #JD-1042', timestamp: '2026-08-17T09:52:00Z', href: '/app/employees/hr/candidates' },
  { id: 'ev2', type: 'call_completed', employeeType: 'voice', title: 'Call completed — Booking confirmed', description: '+91 98765 43210 · 4m 12s · Jewellery Support', timestamp: '2026-08-17T09:30:00Z', href: '/app/inbox' },
  { id: 'ev3', type: 'approval_requested', employeeType: 'voice', title: 'Approval requested — Cancel order #A4471', description: 'AI Voice Employee flagged a high-value cancellation.', timestamp: '2026-08-17T09:05:00Z', href: '/app/approvals' },
  { id: 'ev4', type: 'interview_completed', employeeType: 'hr', title: 'AI Interview completed — Arjun Verma', description: 'Backend Engineer · Score 82/100', timestamp: '2026-08-17T08:40:00Z', href: '/app/employees/hr/candidates' },
  { id: 'ev5', type: 'call_escalated', employeeType: 'voice', title: 'Call escalated to human agent', description: 'Low confidence on complaint handling.', timestamp: '2026-08-17T08:55:00Z', href: '/app/inbox' },
  { id: 'ev6', type: 'knowledge_synced', title: 'Company Brain synced — Product Catalog 2026', description: '212 documents indexed successfully.', timestamp: '2026-08-17T06:15:00Z', href: '/app/knowledge' },
  { id: 'ev7', type: 'integration_failed', title: 'Integration sync failed — Google Calendar', description: 'Token expired, reconnect required.', timestamp: '2026-08-17T07:20:00Z', href: '/app/integrations' },
  { id: 'ev8', type: 'employee_status_changed', employeeType: 'hr', title: 'AI HR Employee activated', description: 'Rubric v3 and interview template approved.', timestamp: '2026-08-16T14:00:00Z', href: '/app/employees/hr' },
]
