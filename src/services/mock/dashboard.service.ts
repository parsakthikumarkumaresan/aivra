import type { AnalyticsMetric, ChartPoint } from '@/types'
import { activityChart7d, activityChart30d, dashboardKpis, needsAttentionItems, recentActivity } from './data/dashboard'
import type { NeedsAttentionItem } from './data/dashboard'
import { delay } from './utils'

export const dashboardService = {
  getKpis(): Promise<AnalyticsMetric[]> {
    return delay(dashboardKpis)
  },
  getActivityChart(range: '7d' | '30d'): Promise<ChartPoint[]> {
    return delay(range === '7d' ? activityChart7d : activityChart30d, 350)
  },
  getNeedsAttention(): Promise<NeedsAttentionItem[]> {
    return delay(needsAttentionItems)
  },
  getRecentActivity(): Promise<typeof recentActivity> {
    return delay(recentActivity)
  },
}
