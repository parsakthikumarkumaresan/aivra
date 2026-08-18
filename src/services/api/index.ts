// API boundary — the ONLY place that decides whether the app talks to
// mock services or a real backend. Hooks and components import from here,
// never from services/mock or services/api/* directly.
//
// To connect the real FastAPI backend later: implement matching modules
// under services/api/ (e.g. organization.api.ts) with the same exported
// function signatures, then swap the re-export below. No UI/hook changes
// required — every screen depends on these signatures, not on how they
// are fulfilled.

export { organizationService } from '@/services/mock/organization.service'
export { employeesService } from '@/services/mock/employees.service'
export { subscriptionService } from '@/services/mock/subscription.service'
export { leadsService } from '@/services/mock/leads.service'
export { voiceAgentBuilderService } from '@/services/mock/voiceAgentBuilder.service'
export { telephonyService } from '@/services/mock/telephony.service'
export { dashboardService } from '@/services/mock/dashboard.service'
export { hrService } from '@/services/mock/hr.service'
export type { CandidateFilters } from '@/services/mock/hr.service'
export { voiceService } from '@/services/mock/voice.service'
export type { CallFilters } from '@/services/mock/voice.service'
export { knowledgeService } from '@/services/mock/knowledge.service'
export { inboxService } from '@/services/mock/inbox.service'
export { approvalsService } from '@/services/mock/approvals.service'
export { integrationsService } from '@/services/mock/integrations.service'
