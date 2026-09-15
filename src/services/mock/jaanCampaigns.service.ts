import type { Campaign, CampaignSummary, CampaignTask } from '@/types'
import { mockCampaigns, mockCampaignSummaries, makeCampaignTasks } from './data/jaan/campaigns'
import { delay, nextId } from './utils'

export const jaanCampaignsService = {
  listCampaigns(): Promise<Campaign[]> {
    return delay(mockCampaigns)
  },
  getCampaign(id: string): Promise<Campaign | undefined> {
    return delay(mockCampaigns.find((c) => c.id === id))
  },
  getCampaignSummary(id: string): Promise<CampaignSummary | undefined> {
    return delay(mockCampaignSummaries[id])
  },
  listCampaignTasks(id: string): Promise<CampaignTask[]> {
    return delay(makeCampaignTasks(id))
  },
  createCampaign(input: Omit<Campaign, 'id' | 'createdAt' | 'status'>): Promise<Campaign> {
    const campaign: Campaign = { ...input, id: nextId('camp'), status: 'draft', createdAt: new Date().toISOString() }
    mockCampaigns.unshift(campaign)
    mockCampaignSummaries[campaign.id] = { attempts: 0, connected: 0, completed: 0, failed: 0, voicemail: 0, retries: 0, cost: 0, avgDurationSeconds: 0 }
    return delay(campaign, 500)
  },
  setCampaignStatus(id: string, status: Campaign['status']): Promise<Campaign> {
    const campaign = mockCampaigns.find((c) => c.id === id)
    if (!campaign) return Promise.reject(new Error(`Campaign not found: ${id}`))
    campaign.status = status
    return delay(campaign, 350)
  },
}
