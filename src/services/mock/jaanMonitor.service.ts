import type { QaMetric, EvaluationRun, Review, AlertRule, Report } from '@/types'
import { mockQaMetrics, mockEvaluationRuns, mockReviews, mockAlertRules, mockReports } from './data/jaan/monitor'
import { delay } from './utils'

export const jaanMonitorService = {
  listMetrics(): Promise<QaMetric[]> {
    return delay(mockQaMetrics)
  },
  listRuns(): Promise<EvaluationRun[]> {
    return delay(mockEvaluationRuns)
  },
  listReviews(): Promise<Review[]> {
    return delay(mockReviews)
  },
  submitReview(id: string, patch: Partial<Review>): Promise<Review> {
    const review = mockReviews.find((r) => r.id === id)
    if (!review) return Promise.reject(new Error(`Review not found: ${id}`))
    Object.assign(review, patch, { reviewedAt: new Date().toISOString() })
    return delay(review, 350)
  },
  listAlertRules(): Promise<AlertRule[]> {
    return delay(mockAlertRules)
  },
  toggleAlertRule(id: string, enabled: boolean): Promise<AlertRule> {
    const rule = mockAlertRules.find((a) => a.id === id)
    if (!rule) return Promise.reject(new Error(`Alert rule not found: ${id}`))
    rule.enabled = enabled
    return delay(rule, 300)
  },
  listReports(): Promise<Report[]> {
    return delay(mockReports)
  },
}
