import type { BillingAccount, Invoice } from '@/types'

export const mockBillingAccount: BillingAccount = {
  organizationId: 'org_acme',
  paymentMethod: {
    brand: 'Visa',
    last4: '4242',
    expiry: '08/28',
  },
}

export const mockInvoices: Invoice[] = [
  { id: 'inv_1001', employeeType: 'hr', amount: 24999, currency: 'INR', status: 'paid', issuedAt: '2026-07-18T00:00:00Z', periodLabel: 'Jul 18 – Aug 17, 2026' },
  { id: 'inv_1000', employeeType: 'hr', amount: 24999, currency: 'INR', status: 'paid', issuedAt: '2026-06-18T00:00:00Z', periodLabel: 'Jun 18 – Jul 17, 2026' },
  { id: 'inv_0999', employeeType: 'hr', amount: 24999, currency: 'INR', status: 'paid', issuedAt: '2026-05-18T00:00:00Z', periodLabel: 'May 18 – Jun 17, 2026' },
]
