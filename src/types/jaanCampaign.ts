export type CampaignType = 'outbound' | 'realtime' | 'batch'
export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed'

export const CAMPAIGN_TYPE_LABEL: Record<CampaignType, string> = {
  outbound: 'Outbound',
  realtime: 'Realtime / Triggered',
  batch: 'Batch',
}

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  running: 'Running',
  paused: 'Paused',
  completed: 'Completed',
  failed: 'Failed',
}

export interface CampaignRetryPolicy {
  maxAttempts: number
  retryDelayMinutes: number
}

export interface Campaign {
  id: string
  name: string
  type: CampaignType
  agentId: string
  agentName: string
  status: CampaignStatus
  contactListName: string
  totalContacts: number
  startTime: string
  endTime?: string
  retryPolicy: CampaignRetryPolicy
  taskExpiryMinutes: number
  concurrency: number
  callerId: string
  voicemailBehavior: 'hang_up' | 'leave_message' | 'retry_later'
  createdAt: string
}

export interface CampaignTask {
  id: string
  campaignId: string
  contactName: string
  contactNumber: string
  status: 'pending' | 'attempted' | 'connected' | 'completed' | 'failed' | 'voicemail'
  attempts: number
  lastAttemptAt?: string
  durationSeconds?: number
  cost?: number
}

export interface CampaignSummary {
  attempts: number
  connected: number
  completed: number
  failed: number
  voicemail: number
  retries: number
  cost: number
  avgDurationSeconds: number
}
