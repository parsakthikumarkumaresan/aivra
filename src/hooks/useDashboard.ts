import { useState } from 'react'
import { dashboardService } from '@/services/api'
import { useAsync } from './useAsync'

export function useDashboardKpis() {
  return useAsync(() => dashboardService.getKpis(), [])
}

export function useActivityChart() {
  const [range, setRange] = useState<'7d' | '30d'>('7d')
  const state = useAsync(() => dashboardService.getActivityChart(range), [range])
  return { ...state, range, setRange }
}

export function useNeedsAttention() {
  return useAsync(() => dashboardService.getNeedsAttention(), [])
}

export function useRecentActivity() {
  return useAsync(() => dashboardService.getRecentActivity(), [])
}
