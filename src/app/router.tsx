import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { RouteLoading } from './RouteLoading'
import { RootLayout } from './RootLayout'
import { AppShell } from '@/components/layout/AppShell'
import { EmployeeAccessGate } from '@/components/employees/EmployeeAccessGate'
import { VoiceAdvancedSetupGate } from '@/components/employees/voice/VoiceAdvancedSetupGate'
import { InternalGate } from '@/components/internal/InternalGate'
import { JaanAccessGate } from '@/components/jaan/JaanAccessGate'
import { AdminRoute } from '@/components/admin/AdminRoute'
import { AdminShell } from '@/components/admin/AdminShell'

function lazyPage(factory: () => Promise<{ default: React.ComponentType }>) {
  const Component = lazy(factory)
  return (
    <Suspense fallback={<RouteLoading />}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: lazyPage(() => import('@/pages/marketing/HomePage')),
      },
      {
        path: '/login',
        element: lazyPage(() => import('@/pages/auth/LoginPage')),
      },
      {
        path: '/ai-employees/hr',
        element: lazyPage(() => import('@/pages/marketing/HrEmployeePage')),
      },
      {
        path: '/ai-employees/voice',
        element: lazyPage(() => import('@/pages/marketing/VoiceEmployeePage')),
      },
      {
        // JEXA.AI-internal Voice Agent Builder + Telephony console. Top-level
        // sibling routes (not nested under /app's AppShell), reached only via
        // the internal/developer entry point — never linked from customer nav.
        // Gated by InternalGate (the isInternalModeEnabled() dev flag), same
        // mechanism as VoiceAdvancedSetupGate above.
        path: '/internal',
        element: <InternalGate />,
        children: [
          {
            path: 'voice-agents',
            element: lazyPage(() => import('@/pages/internal/voiceAgents/VoiceAgentsListPage')),
          },
          {
            path: 'voice-agents/:id',
            element: lazyPage(() => import('@/pages/internal/voiceAgents/VoiceAgentBuilderPage')),
          },
          {
            path: 'telephony',
            element: lazyPage(() => import('@/pages/internal/telephony/TelephonyPage')),
          },
        ],
      },
      {
        // JEXA Admin console — AIVRA-internal operations, real platform-role
        // RBAC (AdminRoute), fully separate shell from the customer /app
        // tree so customer sessions never render admin chrome. See
        // src/components/admin and app/leads (backend) for what's real.
        path: '/admin',
        element: <AdminRoute />,
        children: [
          {
            element: <AdminShell />,
            children: [
              { index: true, element: lazyPage(() => import('@/pages/admin/AdminOverviewPage')) },
              { path: 'leads', element: lazyPage(() => import('@/pages/admin/leads/AdminLeadsPage')) },
              { path: 'leads/:leadId', element: lazyPage(() => import('@/pages/admin/leads/AdminLeadDetailPage')) },
              { path: 'deployments', element: lazyPage(() => import('@/pages/admin/deployments/AdminDeploymentsPage')) },
              { path: 'customers', element: lazyPage(() => import('@/pages/admin/customers/AdminCustomersPage')) },
              { path: 'customers/:id', element: lazyPage(() => import('@/pages/admin/customers/AdminCustomerDetailPage')) },
              { path: 'agents', element: lazyPage(() => import('@/pages/admin/AdminComingSoonPage')) },
              { path: 'calls', element: lazyPage(() => import('@/pages/admin/AdminComingSoonPage')) },
              { path: 'analytics', element: lazyPage(() => import('@/pages/admin/AdminComingSoonPage')) },
              { path: 'usage', element: lazyPage(() => import('@/pages/admin/usage/AdminUsagePage')) },
              { path: 'credits', element: lazyPage(() => import('@/pages/admin/credits/AdminCreditsPage')) },
              { path: 'billing', element: lazyPage(() => import('@/pages/admin/AdminComingSoonPage')) },
              { path: 'quotes', element: lazyPage(() => import('@/pages/admin/AdminComingSoonPage')) },
              { path: 'integrations', element: lazyPage(() => import('@/pages/admin/AdminComingSoonPage')) },
              { path: 'telephony', element: lazyPage(() => import('@/pages/admin/AdminComingSoonPage')) },
              { path: 'monitor', element: lazyPage(() => import('@/pages/admin/AdminComingSoonPage')) },
              { path: 'support', element: lazyPage(() => import('@/pages/admin/AdminComingSoonPage')) },
              { path: 'audit-logs', element: lazyPage(() => import('@/pages/admin/AdminComingSoonPage')) },
              { path: 'settings', element: lazyPage(() => import('@/pages/admin/AdminComingSoonPage')) },
              { path: '*', element: lazyPage(() => import('@/pages/app/NotFoundPage')) },
            ],
          },
        ],
      },
      {
        // Catches every unmatched top-level path (public URLs, typos, stale
        // links). /app has its own catch-all below so app-shell 404s keep
        // the sidebar/header chrome instead of falling through to this one.
        path: '*',
        element: lazyPage(() => import('@/pages/marketing/NotFoundPage')),
      },
      {
        path: '/app',
        element: <AppShell />,
        children: [
          {
            index: true,
            element: lazyPage(() => import('@/pages/app/DashboardPage')),
          },
          {
            path: 'employees',
            element: lazyPage(() => import('@/pages/app/employees/EmployeesCatalogPage')),
          },
          {
            path: 'employees/hr',
            element: <EmployeeAccessGate type="hr" />,
            children: [
              {
                index: true,
                element: lazyPage(() => import('@/pages/app/employees/hr/HrOverviewPage')),
              },
              {
                path: 'setup',
                element: lazyPage(() => import('@/pages/app/employees/hr/HrSetupWizardPage')),
              },
              {
                path: 'jobs',
                element: lazyPage(() => import('@/pages/app/employees/hr/JobsListPage')),
              },
              {
                path: 'jobs/:id',
                element: lazyPage(() => import('@/pages/app/employees/hr/JobDetailPage')),
              },
              {
                path: 'candidates',
                element: lazyPage(() => import('@/pages/app/employees/hr/CandidatePipelinePage')),
              },
              {
                path: 'candidates/upload',
                element: lazyPage(() => import('@/pages/app/employees/hr/ResumeUploadPage')),
              },
              {
                path: 'candidates/:id',
                element: lazyPage(() => import('@/pages/app/employees/hr/CandidateDetailPage')),
              },
              {
                path: 'screenings',
                element: lazyPage(() => import('@/pages/app/employees/hr/ScreeningsListPage')),
              },
              {
                path: 'screenings/:candidateId',
                element: lazyPage(() => import('@/pages/app/employees/hr/ScreeningCallPage')),
              },
              {
                path: 'interviews',
                element: lazyPage(() => import('@/pages/app/employees/hr/InterviewsListPage')),
              },
              {
                path: 'interviews/:candidateId',
                element: lazyPage(() => import('@/pages/app/employees/hr/InterviewDetailPage')),
              },
              {
                path: 'reports',
                element: lazyPage(() => import('@/pages/app/employees/hr/ReportsPage')),
              },
              {
                path: 'configuration',
                element: lazyPage(() => import('@/pages/app/employees/hr/ConfigurationPage')),
              },
              {
                path: 'configuration/testing',
                element: lazyPage(() => import('@/pages/app/employees/hr/TestingPreviewPage')),
              },
            ],
          },
          {
            path: 'employees/voice',
            element: <EmployeeAccessGate type="voice" />,
            children: [
              {
                index: true,
                element: lazyPage(() => import('@/pages/app/employees/voice/VoiceOverviewPage')),
              },
              {
                path: 'setup',
                element: lazyPage(() => import('@/pages/app/employees/voice/VoiceBasicSettingsPage')),
              },
              {
                // JEXA.AI-internal technical configuration — not linked from any
                // customer-facing nav, and gated behind VoiceAdvancedSetupGate
                // so a customer landing here directly sees a clear "internal
                // only" blocker instead of the technical wizard.
                path: 'setup/advanced',
                element: <VoiceAdvancedSetupGate />,
                children: [
                  {
                    index: true,
                    element: lazyPage(() => import('@/pages/app/employees/voice/VoiceSetupWizardPage')),
                  },
                ],
              },
              {
                path: 'simulator',
                element: lazyPage(() => import('@/pages/app/employees/voice/VoiceSimulatorPage')),
              },
            ],
          },
          {
            path: 'jaan',
            element: <JaanAccessGate />,
            children: [
              { index: true, element: lazyPage(() => import('@/pages/app/jaan/JaanHomePage')) },
              { path: 'onboarding', element: lazyPage(() => import('@/pages/app/jaan/JaanOnboardingPage')) },
              { path: 'agents', element: lazyPage(() => import('@/pages/app/jaan/agents/AgentsListPage')) },
              { path: 'agents/:id', element: lazyPage(() => import('@/pages/app/jaan/agents/AgentWorkspacePage')) },
              { path: 'tools', element: lazyPage(() => import('@/pages/app/jaan/tools/JaanToolsPage')) },
              { path: 'tables', element: lazyPage(() => import('@/pages/app/jaan/tables/TablesPage')) },
              { path: 'tables/:id', element: lazyPage(() => import('@/pages/app/jaan/tables/TableDetailPage')) },
              { path: 'library', element: lazyPage(() => import('@/pages/app/jaan/library/JaanLibraryPage')) },
              { path: 'pronunciation', element: lazyPage(() => import('@/pages/app/jaan/pronunciation/PronunciationPage')) },
              { path: 'analytics', element: lazyPage(() => import('@/pages/app/jaan/analytics/JaanAnalyticsPage')) },
              { path: 'campaigns', element: lazyPage(() => import('@/pages/app/jaan/campaigns/CampaignsListPage')) },
              { path: 'campaigns/:id', element: lazyPage(() => import('@/pages/app/jaan/campaigns/CampaignDetailPage')) },
              { path: 'workflows', element: lazyPage(() => import('@/pages/app/jaan/workflows/WorkflowsPage')) },
              { path: 'logs/conversations', element: lazyPage(() => import('@/pages/app/jaan/logs/ConversationsLogPage')) },
              {
                path: 'logs/conversations/:id',
                element: lazyPage(() => import('@/pages/app/jaan/logs/ConversationDetailPage')),
                errorElement: lazyPage(() => import('@/pages/app/jaan/logs/ConversationDetailErrorBoundary')),
              },
              { path: 'logs/tools', element: lazyPage(() => import('@/pages/app/jaan/logs/ToolLogsPage')) },
              { path: 'logs/api-webhook', element: lazyPage(() => import('@/pages/app/jaan/logs/ApiWebhookLogsPage')) },
              { path: 'logs/library', element: lazyPage(() => import('@/pages/app/jaan/logs/LibraryLogsPage')) },
              { path: 'logs/audio-ingestion', element: lazyPage(() => import('@/pages/app/jaan/logs/AudioIngestionLogsPage')) },
              { path: 'monitor/metrics', element: lazyPage(() => import('@/pages/app/jaan/monitor/MetricsPage')) },
              { path: 'monitor/runs', element: lazyPage(() => import('@/pages/app/jaan/monitor/RunsPage')) },
              { path: 'monitor/reviews', element: lazyPage(() => import('@/pages/app/jaan/monitor/ReviewsPage')) },
              { path: 'monitor/alerts', element: lazyPage(() => import('@/pages/app/jaan/monitor/AlertsPage')) },
              { path: 'monitor/reports', element: lazyPage(() => import('@/pages/app/jaan/monitor/ReportsPage')) },
              { path: 'simulations', element: lazyPage(() => import('@/pages/app/jaan/simulations/SimulationsPage')) },
              { path: 'telephony/numbers', element: lazyPage(() => import('@/pages/app/jaan/telephony/JaanNumbersPage')) },
              { path: 'telephony', element: lazyPage(() => import('@/pages/app/jaan/telephony/JaanTelephonyPage')) },
              { path: 'telephony/compliance', element: lazyPage(() => import('@/pages/app/jaan/telephony/JaanCompliancePage')) },
              { path: 'telephony/dnd', element: lazyPage(() => import('@/pages/app/jaan/telephony/JaanDndPage')) },
              { path: 'settings', element: lazyPage(() => import('@/pages/app/jaan/settings/JaanSettingsPage')) },
              { path: 'settings/billing', element: lazyPage(() => import('@/pages/app/jaan/settings/JaanSettingsPage')) },
              { path: 'docs', element: lazyPage(() => import('@/pages/app/jaan/JaanDocsPage')) },
              { path: '*', element: lazyPage(() => import('@/pages/app/NotFoundPage')) },
            ],
          },
          {
            path: 'knowledge',
            element: lazyPage(() => import('@/pages/app/knowledge/CompanyBrainPage')),
          },
          {
            path: 'inbox',
            element: lazyPage(() => import('@/pages/app/inbox/InboxPage')),
          },
          {
            path: 'inbox/calls/:id',
            element: lazyPage(() => import('@/pages/app/inbox/CallDetailPage')),
          },
          {
            path: 'approvals',
            element: lazyPage(() => import('@/pages/app/approvals/ApprovalsPage')),
          },
          {
            path: 'analytics',
            element: lazyPage(() => import('@/pages/app/analytics/AnalyticsPage')),
          },
          {
            path: 'integrations',
            element: lazyPage(() => import('@/pages/app/integrations/IntegrationsPage')),
          },
          {
            path: 'settings',
            element: lazyPage(() => import('@/pages/app/settings/SettingsPage')),
          },
          {
            // Catches unmatched paths anywhere under /app, including nested
            // ones under employees/hr/* and employees/voice/* — since those
            // branches simply fail to match rather than partially matching,
            // this is the single fallback for the whole authenticated shell.
            path: '*',
            element: lazyPage(() => import('@/pages/app/NotFoundPage')),
          },
        ],
      },
    ],
  },
])
