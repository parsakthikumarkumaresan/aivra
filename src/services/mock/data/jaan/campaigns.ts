import type { Campaign, CampaignTask, CampaignSummary } from '@/types'

export const mockCampaigns: Campaign[] = [
  {
    id: 'camp_1',
    name: 'Diwali Collection Follow-up',
    type: 'outbound',
    agentId: 'va_acme_jewellery',
    agentName: 'Acme Jewellery AI Customer Assistant',
    status: 'running',
    contactListName: 'Store Visitors — Last 90 Days',
    totalContacts: 842,
    startTime: '2026-09-10T09:00:00Z',
    retryPolicy: { maxAttempts: 3, retryDelayMinutes: 60 },
    taskExpiryMinutes: 1440,
    concurrency: 10,
    callerId: '+91 80 4718 2200',
    voicemailBehavior: 'leave_message',
    createdAt: '2026-09-08T10:00:00Z',
  },
  {
    id: 'camp_2',
    name: 'Booking Reminder — Bridal Consultations',
    type: 'realtime',
    agentId: 'va_acme_jewellery',
    agentName: 'Acme Jewellery AI Customer Assistant',
    status: 'scheduled',
    contactListName: 'Upcoming Consultations',
    totalContacts: 46,
    startTime: '2026-09-16T04:00:00Z',
    retryPolicy: { maxAttempts: 2, retryDelayMinutes: 30 },
    taskExpiryMinutes: 720,
    concurrency: 5,
    callerId: '+91 80 4718 2200',
    voicemailBehavior: 'retry_later',
    createdAt: '2026-09-12T08:00:00Z',
  },
  {
    id: 'camp_3',
    name: 'Grand Hotel Winter Promo',
    type: 'batch',
    agentId: 'va_grand_hotel',
    agentName: 'Grand Hotel Booking Assistant',
    status: 'completed',
    contactListName: 'Past Guests 2025',
    totalContacts: 1204,
    startTime: '2026-08-01T05:00:00Z',
    endTime: '2026-08-03T18:00:00Z',
    retryPolicy: { maxAttempts: 3, retryDelayMinutes: 90 },
    taskExpiryMinutes: 2880,
    concurrency: 15,
    callerId: '+91 44 2891 0000',
    voicemailBehavior: 'hang_up',
    createdAt: '2026-07-28T12:00:00Z',
  },
]

export const mockCampaignSummaries: Record<string, CampaignSummary> = {
  camp_1: { attempts: 612, connected: 401, completed: 358, failed: 44, voicemail: 168, retries: 89, cost: 142.5, avgDurationSeconds: 96 },
  camp_2: { attempts: 0, connected: 0, completed: 0, failed: 0, voicemail: 0, retries: 0, cost: 0, avgDurationSeconds: 0 },
  camp_3: { attempts: 1204, connected: 887, completed: 812, failed: 92, voicemail: 289, retries: 201, cost: 486.2, avgDurationSeconds: 118 },
}

export function makeCampaignTasks(campaignId: string): CampaignTask[] {
  const names = ['Priya Sharma', 'Arvind Kumar', 'Meera Nair', 'Rahul Verma', 'Sana Iqbal', 'Divya Reddy', 'Karan Mehta', 'Fatima Sheikh']
  return names.map((name, i) => ({
    id: `${campaignId}_task_${i}`,
    campaignId,
    contactName: name,
    contactNumber: `+91 98${(10000000 + i * 137).toString().slice(0, 8)}`,
    status: (['completed', 'connected', 'voicemail', 'failed', 'pending'] as const)[i % 5],
    attempts: (i % 3) + 1,
    lastAttemptAt: '2026-09-14T0' + (i + 1) + ':00:00Z',
    durationSeconds: 40 + i * 22,
    cost: 0.12 + i * 0.03,
  }))
}
