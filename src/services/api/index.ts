// API boundary — the ONLY place that decides whether the app talks to
// mock services or a real backend. Hooks and components import from here,
// never from services/mock or services/api/* directly.
//
// organizationService, hrService, voiceAgentBuilderService and voiceService
// are wired to the real FastAPI backend (app/organizations,
// app/ai_employees/hr, app/ai_employees/voice) — see
// services/api/*.service.ts for the HTTP calls. Everything else here is
// still mock; swap the same way once a real backend module exists with a
// matching shape.

export { organizationService } from '@/services/api/organization.service'
export { employeesService } from '@/services/mock/employees.service'
export { subscriptionService } from '@/services/mock/subscription.service'
export { leadsService } from '@/services/mock/leads.service'
export { voiceAgentBuilderService } from '@/services/api/voiceAgentBuilder.service'
export { telephonyService } from '@/services/mock/telephony.service'
export { dashboardService } from '@/services/mock/dashboard.service'
export { hrService } from '@/services/api/hr.service'
export type { CandidateFilters } from '@/services/api/hr.service'
export { authService } from '@/services/api/auth.service'
export { voiceService } from '@/services/api/voice.service'
export type { CallFilters } from '@/services/api/voice.service'
export { knowledgeService } from '@/services/mock/knowledge.service'
export { inboxService } from '@/services/mock/inbox.service'
export { approvalsService } from '@/services/mock/approvals.service'
export { integrationsService } from '@/services/mock/integrations.service'

// JEXA Admin Console (AIVRA-internal, platform-role gated) — real backend,
// reusing the existing Leads + Voice Project pipeline (app/leads).
export { adminService } from '@/services/api/admin.service'
export type {
  AdminLead,
  AdminLeadList,
  AdminLeadVoiceProject,
  AdminVoiceProject,
  AdminRequirement,
  LeadStatus,
  LeadType,
  VoiceProjectStatus,
} from '@/services/api/admin.service'
export { adminCreditsService } from '@/services/api/admin-credits.service'
export type { AdminCreditsSummary, AdminAddCreditsInput } from '@/services/api/admin-credits.service'
export { adminOrganizationsService } from '@/services/api/admin-organizations.service'
export type {
  AdminOrganizationSummary,
  AdminOrganizationList,
  AdminOrganizationDetail,
  AdminEmployeeProvisionSummary,
  AdminVoiceProjectSummary,
  AdminOrganizationMember,
} from '@/services/api/admin-organizations.service'

// Jaan (Voice AI Workforce console) — voiceAgentBuilderService and
// voiceService above are now real (agent CRUD/versioning/publish, provider
// catalog, start-test-call, call list/detail, analytics); telephonyService
// and everything below (except creditsService) are still mock. The console
// also uses these Jaan-specific mock domains.
export { jaanCampaignsService } from '@/services/mock/jaanCampaigns.service'
export { jaanWorkflowsService } from '@/services/mock/jaanWorkflows.service'
export { jaanTablesService } from '@/services/mock/jaanTables.service'
export { jaanMonitorService } from '@/services/mock/jaanMonitor.service'
export { jaanSimulationsService } from '@/services/mock/jaanSimulations.service'
export { jaanPronunciationService } from '@/services/mock/jaanPronunciation.service'
export { jaanLogsService } from '@/services/mock/jaanLogs.service'

// Jaan Voice Credits (Phase 4) — real backend (app/ai_employees/voice's
// credit ledger), replacing the old mock jaanBalanceService entirely.
export { creditsService } from '@/services/api/credits.service'
export type {
  CreditBalance,
  CreditTransaction as VoiceCreditTransaction,
  CreditTransactionType as VoiceCreditTransactionType,
  RechargePackage,
  RechargeOrder,
  RechargeOrderStatus,
} from '@/services/api/credits.service'

// JEXA Admin Quotes & Calculator (Phase 7) — real backend (app/quotes)
export { quotesService } from '@/services/api/quotes.service'
export type {
  Quote,
  QuoteList,
  QuoteStatus,
  QuoteLineItem,
  QuoteLineItemCategory,
  QuoteLineItemInput,
  QuoteCalculatorInput,
  QuoteCalculationEstimate,
  QuoteCreatePayload,
  QuoteUpdatePayload,
  QuoteSendResponse,
} from '@/services/api/quotes.service'
