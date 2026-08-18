import { telephonyService } from '@/services/api'
import { useAsync } from './useAsync'

export function usePhoneNumbers() {
  return useAsync(() => telephonyService.listNumbers(), [])
}

export function useTelephonyProviders() {
  return useAsync(() => telephonyService.listProviders(), [])
}

export function useSipTrunks() {
  return useAsync(() => telephonyService.listSipTrunks(), [])
}

export function useComplianceSettings() {
  return useAsync(() => telephonyService.listCompliance(), [])
}

export function useDndEntries() {
  return useAsync(() => telephonyService.listDnd(), [])
}

export function useRoutingRules() {
  return useAsync(() => telephonyService.listRoutingRules(), [])
}
