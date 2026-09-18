import { httpClient } from './httpClient'

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

export type QuoteLineItemCategory =
  | 'implementation'
  | 'platform'
  | 'voice_credits'
  | 'integrations'
  | 'development'
  | 'other'

export interface QuoteLineItem {
  id: string
  category: QuoteLineItemCategory
  description: string
  quantity: number
  unit: string
  unitPrice: number
  amount: number
  displayOrder: number
}

export interface QuoteLineItemInput {
  category: QuoteLineItemCategory
  description: string
  quantity: number
  unit: string
  unitPrice: number
}

export interface QuoteCalculatorInput {
  monthlyCalls: number
  avgCallDurationMinutes: number
  languagesCount: number
  workflowComplexity: string
  integrationsCount: number
  customToolsCount: number
  knowledgeDocsCount: number
  telephonyNumbersCount: number
  supportTier: string
  currency: string
  // Configurable baseline pricing parameters (Admin controlled)
  targetMinuteRate?: number | null
  baseImplementationFee?: number | null
  basePlatformMonthlyFee?: number | null
  feePerAdditionalLanguage?: number | null
  feePerIntegration?: number | null
}

export interface QuoteCalculationEstimate {
  estimatedSetupFee: number
  estimatedRecurringFee: number
  estimatedTotalMonthlyMinutes: number
  recommendedIncludedMinutes: number
  indicativeMinuteRate: number
  suggestedLineItems: {
    category: QuoteLineItemCategory
    description: string
    quantity: number
    unit: string
    unitPrice: number
    amount: number
  }[]
  calculationBreakdown: Record<string, unknown>
  disclaimer: string
}

export interface Quote {
  id: string
  organizationId: string
  leadId: string | null
  voiceProjectId: string | null
  quoteNumber: string
  title: string
  status: QuoteStatus
  currency: string
  subtotal: number
  discount: number
  taxRate: number
  taxAmount: number
  total: number
  validUntil: string
  notes: string | null
  terms: string | null
  estimatedSetupFee: number | null
  estimatedRecurringFee: number | null
  includedVoiceMinutes: number
  additionalMinuteRate: number
  calculationSnapshot: Record<string, unknown> | null
  createdByUserId: string | null
  sentAt: string | null
  acceptedAt: string | null
  rejectedAt: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
  lineItems: QuoteLineItem[]
}

export interface QuoteList {
  items: Quote[]
  total: number
  page: number
  pageSize: number
}

export interface QuoteCreatePayload {
  organizationId: string
  title: string
  validUntil: string
  currency?: string
  leadId?: string | null
  voiceProjectId?: string | null
  notes?: string | null
  terms?: string | null
  discount?: number
  taxRate?: number
  includedVoiceMinutes?: number
  additionalMinuteRate?: number
  estimatedSetupFee?: number | null
  estimatedRecurringFee?: number | null
  calculationSnapshot?: Record<string, unknown> | null
  lineItems: QuoteLineItemInput[]
}

export interface QuoteUpdatePayload {
  title?: string
  validUntil?: string
  notes?: string | null
  terms?: string | null
  discount?: number
  taxRate?: number
  includedVoiceMinutes?: number
  additionalMinuteRate?: number
  lineItems?: QuoteLineItemInput[]
}

export interface QuoteSendResponse {
  quote: Quote
  emailSent: boolean
  emailError: string | null
}

export const quotesService = {
  list(params: {
    organizationId?: string
    leadId?: string
    voiceProjectId?: string
    status?: QuoteStatus
    search?: string
    page?: number
    pageSize?: number
  } = {}): Promise<QuoteList> {
    const q = new URLSearchParams()
    if (params.organizationId) q.set('organizationId', params.organizationId)
    if (params.leadId) q.set('leadId', params.leadId)
    if (params.voiceProjectId) q.set('voiceProjectId', params.voiceProjectId)
    if (params.status) q.set('status', params.status)
    if (params.search) q.set('search', params.search)
    q.set('page', String(params.page ?? 1))
    q.set('pageSize', String(params.pageSize ?? 20))
    return httpClient.get<QuoteList>(`/internal/quotes?${q.toString()}`)
  },

  get(quoteId: string): Promise<Quote> {
    return httpClient.get<Quote>(`/internal/quotes/${quoteId}`)
  },

  calculate(input: QuoteCalculatorInput): Promise<QuoteCalculationEstimate> {
    return httpClient.post<QuoteCalculationEstimate>('/internal/quotes/calculate', input)
  },

  create(payload: QuoteCreatePayload): Promise<Quote> {
    return httpClient.post<Quote>('/internal/quotes', payload)
  },

  update(quoteId: string, payload: QuoteUpdatePayload): Promise<Quote> {
    return httpClient.put<Quote>(`/internal/quotes/${quoteId}`, payload)
  },

  send(quoteId: string, payload: { recipientEmail?: string; recipientName?: string }): Promise<QuoteSendResponse> {
    return httpClient.post<QuoteSendResponse>(`/internal/quotes/${quoteId}/send`, payload)
  },

  transition(quoteId: string, payload: { targetStatus: QuoteStatus; rejectionReason?: string }): Promise<Quote> {
    return httpClient.post<Quote>(`/internal/quotes/${quoteId}/transition`, payload)
  },
}
