import type { Balance, CreditTransaction } from '@/types'

export const mockBalance: Balance = {
  amount: 530.0,
  currency: '₹',
  lowBalanceThreshold: 100,
  autoRechargeEnabled: false,
}

export const mockCreditTransactions: CreditTransaction[] = [
  { id: 'tx_1', type: 'usage', amount: -142.5, currency: '₹', description: 'Diwali Collection Follow-up — campaign usage', createdAt: '2026-09-14T06:00:00Z' },
  { id: 'tx_2', type: 'purchase', amount: 1000, currency: '₹', description: 'Credit top-up', createdAt: '2026-09-05T10:00:00Z' },
  { id: 'tx_3', type: 'usage', amount: -486.2, currency: '₹', description: 'Grand Hotel Winter Promo — campaign usage', createdAt: '2026-08-03T18:00:00Z' },
  { id: 'tx_4', type: 'adjustment', amount: 25.0, currency: '₹', description: 'Goodwill credit — support case #4021', createdAt: '2026-07-20T09:00:00Z' },
]
