import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { RouteLoading } from './RouteLoading'
import { RootLayout } from './RootLayout'
import { AppShell } from '@/components/layout/AppShell'
import { EmployeeAccessGate } from '@/components/employees/EmployeeAccessGate'
import { VoiceAdvancedSetupGate } from '@/components/employees/voice/VoiceAdvancedSetupGate'
import { InternalGate } from '@/components/internal/InternalGate'

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
        // AIVRA-internal Voice Agent Builder + Telephony console. Top-level
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
                path: 'schedule',
                element: lazyPage(() => import('@/pages/app/employees/hr/SchedulingPage')),
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
                // AIVRA-internal technical configuration — not linked from any
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
