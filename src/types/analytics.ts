export interface ChartPoint {
  date: string
  value: number
  secondaryValue?: number
}

export interface AnalyticsMetric {
  id: string
  label: string
  value: string
  trend?: { direction: 'up' | 'down' | 'flat'; value: string }
  tooltip: string
}

export interface FunnelStage {
  label: string
  value: number
}

export interface DistributionSlice {
  label: string
  value: number
  color: string
}
