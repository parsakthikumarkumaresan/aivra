import type { ComplianceSetting, DndEntry, PhoneNumber, RoutingRule, SipTrunk, TelephonyProviderAccount } from '@/types'
import { mockComplianceSettings, mockDndEntries, mockPhoneNumbers, mockRoutingRules, mockSipTrunks, mockTelephonyProviders } from './data/telephony'
import { delay } from './utils'

export const telephonyService = {
  listNumbers(): Promise<PhoneNumber[]> {
    return delay(mockPhoneNumbers)
  },
  listProviders(): Promise<TelephonyProviderAccount[]> {
    return delay(mockTelephonyProviders)
  },
  listSipTrunks(): Promise<SipTrunk[]> {
    return delay(mockSipTrunks)
  },
  listCompliance(): Promise<ComplianceSetting[]> {
    return delay(mockComplianceSettings)
  },
  toggleCompliance(id: string, enabled: boolean): Promise<ComplianceSetting | undefined> {
    const setting = mockComplianceSettings.find((c) => c.id === id)
    if (setting) setting.enabled = enabled
    return delay(setting, 400)
  },
  listDnd(): Promise<DndEntry[]> {
    return delay(mockDndEntries)
  },
  listRoutingRules(): Promise<RoutingRule[]> {
    return delay(mockRoutingRules)
  },
}
