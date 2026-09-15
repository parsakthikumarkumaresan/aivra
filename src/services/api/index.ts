// API boundary — the ONLY place that decides whether the app talks to
// mock services or a real backend. Hooks and components import from here,
// never from services/mock or services/api/* directly.
//
// organizationService and hrService are wired to the real FastAPI backend
// (app/organizations, app/ai_employees/hr) — see services/api/*.service.ts
// for the HTTP calls and services/api/mappers/hr.ts for the backend<->
// frontend contract translation. Everything else here is still mock; swap
// the same way once a real backend module exists with a matching shape.

export { organizationService } from '@/services/api/organization.service'
export { employeesService } from '@/services/mock/employees.service'
export { subscriptionService } from '@/services/mock/subscription.service'
export { leadsService } from '@/services/mock/leads.service'
export { voiceAgentBuilderService } from '@/services/mock/voiceAgentBuilder.service'
export { telephonyService } from '@/services/mock/telephony.service'
export { dashboardService } from '@/services/mock/dashboard.service'
export { hrService } from '@/services/api/hr.service'
export type { CandidateFilters } from '@/services/api/hr.service'
export { authService } from '@/services/api/auth.service'
export { voiceService } from '@/services/mock/voice.service'
export type { CallFilters } from '@/services/mock/voice.service'
export { knowledgeService } from '@/services/mock/knowledge.service'
export { inboxService } from '@/services/mock/inbox.service'
export { approvalsService } from '@/services/mock/approvals.service'
export { integrationsService } from '@/services/mock/integrations.service'

// Jaan (Voice AI Workforce console) — all mock for now; the console reuses
// voiceAgentBuilderService/telephonyService/voiceService above for agents,
// telephony and call data, plus these Jaan-specific domains.
export { jaanCampaignsService } from '@/services/mock/jaanCampaigns.service'
export { jaanWorkflowsService } from '@/services/mock/jaanWorkflows.service'
export { jaanTablesService } from '@/services/mock/jaanTables.service'
export { jaanMonitorService } from '@/services/mock/jaanMonitor.service'
export { jaanSimulationsService } from '@/services/mock/jaanSimulations.service'
export { jaanPronunciationService } from '@/services/mock/jaanPronunciation.service'
export { jaanBalanceService } from '@/services/mock/jaanBalance.service'
export { jaanLogsService } from '@/services/mock/jaanLogs.service'
