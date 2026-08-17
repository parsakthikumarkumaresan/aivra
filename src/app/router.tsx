import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { RouteLoading } from './RouteLoading'
import { AppShell } from '@/components/layout/AppShell'

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
    path: '/',
    element: lazyPage(() => import('@/pages/marketing/HomePage')),
  },
  {
    path: '/login',
    element: lazyPage(() => import('@/pages/auth/LoginPage')),
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
        element: lazyPage(() => import('@/pages/app/employees/hr/HrOverviewPage')),
      },
      {
        path: 'employees/hr/setup',
        element: lazyPage(() => import('@/pages/app/employees/hr/HrSetupWizardPage')),
      },
      {
        path: 'employees/hr/jobs',
        element: lazyPage(() => import('@/pages/app/employees/hr/JobsListPage')),
      },
      {
        path: 'employees/hr/candidates',
        element: lazyPage(() => import('@/pages/app/employees/hr/CandidatePipelinePage')),
      },
      {
        path: 'employees/hr/candidates/:id',
        element: lazyPage(() => import('@/pages/app/employees/hr/CandidateDetailPage')),
      },
      {
        path: 'employees/hr/interview',
        element: lazyPage(() => import('@/pages/app/employees/hr/InterviewSimulatorPage')),
      },
      {
        path: 'employees/hr/schedule',
        element: lazyPage(() => import('@/pages/app/employees/hr/SchedulingPage')),
      },
      {
        path: 'employees/voice',
        element: lazyPage(() => import('@/pages/app/employees/voice/VoiceOverviewPage')),
      },
      {
        path: 'employees/voice/setup',
        element: lazyPage(() => import('@/pages/app/employees/voice/VoiceSetupWizardPage')),
      },
      {
        path: 'employees/voice/simulator',
        element: lazyPage(() => import('@/pages/app/employees/voice/VoiceSimulatorPage')),
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
    ],
  },
])
