import type { QaMetric, EvaluationRun, Review, AlertRule, Report } from '@/types'

function trend(base: number, spread: number) {
  return Array.from({ length: 14 }).map((_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
    value: Math.round((base + (Math.sin(i / 2) * spread) + (Math.random() - 0.5) * spread * 0.4) * 10) / 10,
  }))
}

export const mockQaMetrics: QaMetric[] = [
  { id: 'm_quality', label: 'Call Quality Score', unit: '/100', current: 91.4, target: 90, trend: trend(90, 3) },
  { id: 'm_latency', label: 'End-to-End Latency', unit: 'ms', current: 612, target: 700, trend: trend(620, 60) },
  { id: 'm_stt', label: 'STT Accuracy', unit: '%', current: 96.8, target: 95, trend: trend(96, 1.2) },
  { id: 'm_tts', label: 'TTS Latency', unit: 'ms', current: 184, target: 250, trend: trend(190, 25) },
  { id: 'm_llm', label: 'LLM Latency', unit: 'ms', current: 340, target: 400, trend: trend(345, 35) },
  { id: 'm_tool', label: 'Tool Latency', unit: 'ms', current: 268, target: 350, trend: trend(270, 40) },
  { id: 'm_completion', label: 'Completion Rate', unit: '%', current: 87.2, target: 85, trend: trend(87, 2.5) },
  { id: 'm_transfer', label: 'Transfer Rate', unit: '%', current: 9.4, trend: trend(9.5, 1.5) },
  { id: 'm_error', label: 'Error Rate', unit: '%', current: 1.8, target: 2, trend: trend(1.8, 0.5) },
  { id: 'm_cost', label: 'Cost per Call', unit: '₹', current: 3.42, trend: trend(3.4, 0.4) },
]

export const mockEvaluationRuns: EvaluationRun[] = [
  { id: 'run_1', agentId: 'va_acme_jewellery', agentName: 'Acme Jewellery AI Customer Assistant', datasetName: 'Bridal Enquiry Regression Set', status: 'completed', startedAt: '2026-09-13T09:00:00Z', completedAt: '2026-09-13T09:12:00Z', successRate: 94.2, score: 88, avgLatencyMs: 640, cost: 4.2 },
  { id: 'run_2', agentId: 'va_acme_jewellery', agentName: 'Acme Jewellery AI Customer Assistant', datasetName: 'Complaint Handling Set', status: 'completed', startedAt: '2026-09-10T09:00:00Z', completedAt: '2026-09-10T09:20:00Z', successRate: 81.5, score: 76, avgLatencyMs: 710, cost: 5.1 },
  { id: 'run_3', agentId: 'va_grand_hotel', agentName: 'Grand Hotel Booking Assistant', datasetName: 'Booking Flow Regression Set', status: 'running', startedAt: '2026-09-14T10:00:00Z' },
  { id: 'run_4', agentId: 'va_grand_hotel', agentName: 'Grand Hotel Booking Assistant', datasetName: 'Group Booking Escalation Set', status: 'failed', startedAt: '2026-09-09T09:00:00Z', completedAt: '2026-09-09T09:05:00Z', successRate: 52.0, score: 48, avgLatencyMs: 890, cost: 1.8 },
]

export const mockReviews: Review[] = [
  { id: 'rev_1', conversationId: 'call_1', agentName: 'Acme Jewellery AI Customer Assistant', reviewerName: 'Ananya Rao', score: 92, notes: 'Handled the bridal enquiry smoothly, correctly booked a consultation.', tags: ['booking', 'positive'], verdict: 'pass', reviewedAt: '2026-09-13T12:00:00Z' },
  { id: 'rev_2', conversationId: 'call_2', agentName: 'Acme Jewellery AI Customer Assistant', reviewerName: 'Ananya Rao', score: 61, notes: 'Missed an opportunity to offer the loyalty discount for a VIP caller.', tags: ['missed-opportunity'], verdict: 'fail', reviewedAt: '2026-09-12T15:30:00Z' },
  { id: 'rev_3', conversationId: 'call_3', agentName: 'Grand Hotel Booking Assistant', reviewerName: 'Vikram Shah', score: 0, notes: '', tags: [], verdict: 'pending' },
]

export const mockAlertRules: AlertRule[] = [
  { id: 'al_1', category: 'high_latency', label: 'End-to-end latency above 1200ms', thresholdLabel: '> 1200ms for 5 min', enabled: true, channel: 'email', lastTriggeredAt: '2026-09-11T04:00:00Z' },
  { id: 'al_2', category: 'high_failure_rate', label: 'Failure rate above 15%', thresholdLabel: '> 15% over 1 hour', enabled: true, channel: 'email' },
  { id: 'al_3', category: 'tool_failure', label: 'Tool failure spike', thresholdLabel: '> 5 failures in 10 min', enabled: true, channel: 'webhook', lastTriggeredAt: '2026-09-09T18:22:00Z' },
  { id: 'al_4', category: 'high_spend', label: 'Daily spend above ₹5,000', thresholdLabel: '> ₹5,000 / day', enabled: false, channel: 'email' },
  { id: 'al_5', category: 'call_volume_spike', label: 'Call volume 3x above baseline', thresholdLabel: '> 3x rolling average', enabled: true, channel: 'sms' },
  { id: 'al_6', category: 'webhook_failure', label: 'Webhook delivery failures', thresholdLabel: '> 3 consecutive failures', enabled: true, channel: 'webhook' },
]

export const mockReports: Report[] = [
  { id: 'rep_1', name: 'Weekly Calls Summary', type: 'calls', dateRangeLabel: 'Sep 8 – Sep 14, 2026', generatedAt: '2026-09-14T06:00:00Z', scheduled: true, format: 'pdf' },
  { id: 'rep_2', name: 'Agent Performance — August', type: 'agents', dateRangeLabel: 'Aug 1 – Aug 31, 2026', generatedAt: '2026-09-01T06:00:00Z', scheduled: true, format: 'pdf' },
  { id: 'rep_3', name: 'Campaign Cost Breakdown', type: 'costs', dateRangeLabel: 'Aug 1 – Aug 31, 2026', generatedAt: '2026-09-02T09:00:00Z', scheduled: false, format: 'csv' },
  { id: 'rep_4', name: 'Quality & QA Review', type: 'quality', dateRangeLabel: 'Sep 1 – Sep 14, 2026', generatedAt: '2026-09-14T06:00:00Z', scheduled: false, format: 'pdf' },
]
