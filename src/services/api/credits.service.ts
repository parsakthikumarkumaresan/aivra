// Real client for Jaan Voice Credits (app/ai_employees/voice/api/credits_routes.py,
// prefix /jaan). Org-scoped via the authenticated session — no organizationId
// is ever passed from the client. HR has no equivalent concept; this
// service is Jaan-Voice-only.
import { httpClient } from './httpClient'

export type CreditTransactionType =
  | 'initial_allocation'
  | 'usage_debit'
  | 'recharge'
  | 'complimentary'
  | 'admin_adjustment'
  | 'refund'

export interface CreditBalance {
  balanceMinutes: number
  lowBalance: boolean
  lowBalanceThresholdMinutes: number
  purchasedMinutes: number
  usedMinutes: number
  lastRechargeAt: string | null
}

export interface CreditTransaction {
  id: string
  type: CreditTransactionType
  minutes: number
  amount: number | null
  currency: string | null
  reference: string | null
  reason: string | null
  callId: string | null
  rechargeOrderId: string | null
  createdByUserId: string | null
  createdAt: string
}

export interface RechargePackage {
  id: string
  label: string
  minutes: number
  amount: number
  currency: string
  isActive: boolean
  displayOrder: number
}

export type RechargeOrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'

export interface RechargeOrder {
  id: string
  packageId: string | null
  minutes: number
  amount: number
  currency: string
  status: RechargeOrderStatus
  checkoutUrl?: string | null
  createdAt: string
  paidAt: string | null
}

export const creditsService = {
  getBalance(): Promise<CreditBalance> {
    return httpClient.get<CreditBalance>('/jaan/credits')
  },
  listTransactions(): Promise<CreditTransaction[]> {
    return httpClient.get<CreditTransaction[]>('/jaan/credits/transactions')
  },
  listRechargePackages(): Promise<RechargePackage[]> {
    return httpClient.get<RechargePackage[]>('/jaan/recharge/packages')
  },
  createRecharge(packageId: string): Promise<RechargeOrder> {
    return httpClient.post<RechargeOrder>('/jaan/recharge', { packageId })
  },
  getRechargeOrder(orderId: string): Promise<RechargeOrder> {
    return httpClient.get<RechargeOrder>(`/jaan/recharge/${orderId}`)
  },
  listRechargeOrders(): Promise<RechargeOrder[]> {
    return httpClient.get<RechargeOrder[]>('/jaan/recharge')
  },
}
