export interface Balance {
  amount: number
  currency: string
  lowBalanceThreshold: number
  autoRechargeEnabled: boolean
}

export type CreditTransactionType = 'purchase' | 'usage' | 'refund' | 'adjustment'

export interface CreditTransaction {
  id: string
  type: CreditTransactionType
  amount: number
  currency: string
  description: string
  createdAt: string
}
