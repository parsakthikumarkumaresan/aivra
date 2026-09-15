import type { Balance, CreditTransaction } from '@/types'
import { mockBalance, mockCreditTransactions } from './data/jaan/balance'
import { delay } from './utils'

export const jaanBalanceService = {
  getBalance(): Promise<Balance> {
    return delay(mockBalance)
  },
  listTransactions(): Promise<CreditTransaction[]> {
    return delay(mockCreditTransactions)
  },
  addCredits(amount: number): Promise<Balance> {
    mockBalance.amount += amount
    mockCreditTransactions.unshift({
      id: `tx_${Date.now()}`,
      type: 'purchase',
      amount,
      currency: mockBalance.currency,
      description: 'Credit top-up',
      createdAt: new Date().toISOString(),
    })
    return delay(mockBalance, 500)
  },
}
