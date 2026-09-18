// Real client for the Jaan Voice Credits admin API
// (app/ai_employees/voice/api/admin_credits_routes.py, prefix
// /internal/voice/admin) — platform-role gated server-side. Separate file
// from admin.service.ts because this surface is Jaan-Voice-specific, not
// the generic leads/deployments admin surface.
import { httpClient } from './httpClient'
import type {
  CreditTransaction as VoiceCreditTransaction,
  CreditTransactionType as VoiceCreditTransactionType,
  RechargePackage,
  RechargeOrder,
} from './credits.service'

export interface AdminCreditsSummary {
  organizationId: string
  balanceMinutes: number
  purchasedMinutes: number
  usedMinutes: number
  usagePercent: number
  lastRechargeAt: string | null
}

export interface AdminAddCreditsInput {
  type: VoiceCreditTransactionType
  minutes: number
  reason: string
  reference?: string
}

export const adminCreditsService = {
  getOrganizationCredits(organizationId: string): Promise<AdminCreditsSummary> {
    return httpClient.get<AdminCreditsSummary>(`/internal/voice/admin/organizations/${organizationId}/credits`)
  },
  listOrganizationTransactions(organizationId: string): Promise<VoiceCreditTransaction[]> {
    return httpClient.get<VoiceCreditTransaction[]>(
      `/internal/voice/admin/organizations/${organizationId}/credits/transactions`,
    )
  },
  adjustOrganizationCredits(organizationId: string, input: AdminAddCreditsInput): Promise<VoiceCreditTransaction> {
    return httpClient.post<VoiceCreditTransaction>(
      `/internal/voice/admin/organizations/${organizationId}/credits/adjust`,
      input,
    )
  },
  listOrganizationRechargeOrders(organizationId: string): Promise<RechargeOrder[]> {
    return httpClient.get<RechargeOrder[]>(`/internal/voice/admin/organizations/${organizationId}/recharge-orders`)
  },
  listAllRechargePackages(): Promise<RechargePackage[]> {
    return httpClient.get<RechargePackage[]>('/internal/voice/admin/recharge-packages')
  },
  createRechargePackage(input: {
    label: string
    minutes: number
    amount: number
    currency: string
    displayOrder?: number
  }): Promise<RechargePackage> {
    return httpClient.post<RechargePackage>('/internal/voice/admin/recharge-packages', input)
  },
  updateRechargePackage(
    packageId: string,
    patch: Partial<Pick<RechargePackage, 'label' | 'minutes' | 'amount' | 'currency' | 'isActive' | 'displayOrder'>>,
  ): Promise<RechargePackage> {
    return httpClient.patch<RechargePackage>(`/internal/voice/admin/recharge-packages/${packageId}`, patch)
  },
}
