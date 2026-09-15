import { Outlet } from 'react-router-dom'
import type { EmployeeType } from '@/types'
import { useEmployeeAccess } from '@/hooks/useSubscription'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmployeeDetailPage } from '@/pages/app/employees/EmployeeDetailPage'

const EMPLOYEE_LABEL: Record<EmployeeType, string> = { hr: 'Jexa HR', voice: 'Jaan' }

// Layout-route guard mounted at employees/hr and employees/voice. Only a fully
// active subscription renders the operational child routes (Outlet) — every
// other state (never hired, activating, paused, past due, cancelled) falls
// back to the product detail page, which also carries the relevant CTA.
export function EmployeeAccessGate({ type }: { type: EmployeeType }) {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: EMPLOYEE_LABEL[type] }])
  const { hasAccess, loading } = useEmployeeAccess(type)

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!hasAccess) {
    return <EmployeeDetailPage type={type} />
  }

  return <Outlet />
}
