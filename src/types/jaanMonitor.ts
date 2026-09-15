// Monitor & QA — enterprise-tier observability on top of the basic call
// logs: quality metrics, evaluation runs, human review, alerting, reports.

export interface QaMetricPoint {
  date: string
  value: number
}

export interface QaMetric {
  id: string
  label: string
  unit: string
  current: number
  target?: number
  trend: QaMetricPoint[]
}

export type EvaluationRunStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface EvaluationRun {
  id: string
  agentId: string
  agentName: string
  datasetName: string
  status: EvaluationRunStatus
  startedAt: string
  completedAt?: string
  successRate?: number
  score?: number
  avgLatencyMs?: number
  cost?: number
}

export type ReviewVerdict = 'pass' | 'fail' | 'pending'

export interface Review {
  id: string
  conversationId: string
  agentName: string
  reviewerName: string
  score: number
  notes: string
  tags: string[]
  verdict: ReviewVerdict
  reviewedAt?: string
}

export type AlertCategory = 'high_latency' | 'high_failure_rate' | 'agent_error' | 'tool_failure' | 'low_quality' | 'high_spend' | 'call_volume_spike' | 'webhook_failure'

export const ALERT_CATEGORY_LABEL: Record<AlertCategory, string> = {
  high_latency: 'High Latency',
  high_failure_rate: 'High Failure Rate',
  agent_error: 'Agent Errors',
  tool_failure: 'Tool Failures',
  low_quality: 'Low Quality',
  high_spend: 'High Spending',
  call_volume_spike: 'Call Volume Spike',
  webhook_failure: 'Webhook Failures',
}

export interface AlertRule {
  id: string
  category: AlertCategory
  label: string
  thresholdLabel: string
  enabled: boolean
  channel: 'email' | 'sms' | 'webhook'
  lastTriggeredAt?: string
}

export type ReportType = 'calls' | 'agents' | 'campaigns' | 'costs' | 'quality' | 'operations'

export interface Report {
  id: string
  name: string
  type: ReportType
  dateRangeLabel: string
  generatedAt: string
  scheduled: boolean
  format: 'pdf' | 'csv'
}
