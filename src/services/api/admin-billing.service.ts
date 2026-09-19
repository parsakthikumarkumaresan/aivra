// Real client for JEXA Admin — Billing (Phase 10): a read-only cross-
// customer view over JEXA subscription billing
// (app/subscriptions/api/admin_billing.py, prefix
// /internal/subscriptions/admin) — platform-role gated server-side. Kept
// explicitly separate from Jaan Voice Credits (admin-credits.service.ts,
// Phase 4's canonical credit ledger) and Quotes (Phase 7) — no second
// billing system.
import { httpClient } from './httpClient'

export interface AdminSubscription {
  id: string
  employeeType: string
  status: string
  billingCycle: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

export interface AdminInvoice {
  id: string
  status: string
  amount: number
  currency: string
  periodStart: string
  periodEnd: string
  issuedAt: string | null
  hostedInvoiceUrl: string | null
}

export const adminBillingService = {
  listSubscriptions(organizationId: string): Promise<AdminSubscription[]> {
    return httpClient.get<AdminSubscription[]>(
      `/internal/subscriptions/admin/organizations/${organizationId}/subscriptions`,
    )
  },
  listInvoices(organizationId: string): Promise<AdminInvoice[]> {
    return httpClient.get<AdminInvoice[]>(
      `/internal/subscriptions/admin/organizations/${organizationId}/invoices`,
    )
  },
}
