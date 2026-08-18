import { useCallback, useState } from 'react'
import { subscriptionService } from '@/services/api'
import type { BillingCycle, EmployeeType } from '@/types'
import { useAsync } from './useAsync'
import { useAppData } from '@/app/AppDataProvider'

export function useSubscriptions() {
  return useAsync(() => subscriptionService.listSubscriptions(), [])
}

export function useSubscription(employeeType: EmployeeType) {
  return useAsync(() => subscriptionService.getSubscription(employeeType), [employeeType])
}

export function usePlan(employeeType: EmployeeType) {
  return useAsync(() => subscriptionService.getPlan(employeeType), [employeeType])
}

export function useBillingAccount() {
  return useAsync(() => subscriptionService.getBillingAccount(), [])
}

export function useInvoices() {
  return useAsync(() => subscriptionService.listInvoices(), [])
}

// Whether the current organization can access an AI Employee's operational
// screens (candidate pipeline, calls, configuration, etc). Only a fully
// active subscription grants access — hired-but-activating, paused, past-due,
// cancelled and never-hired all route to the access guard / product page.
export function useEmployeeAccess(employeeType: EmployeeType) {
  const { employees, loading } = useAppData()
  const employee = employees.find((e) => e.type === employeeType)
  return {
    loading,
    employee,
    hasAccess: employee?.status === 'active',
  }
}

export type HireStage = 'idle' | 'creating' | 'activating' | 'active'

// Drives the hire → subscribe → activate lifecycle used by the checkout flow.
// hire() creates a pending_activation subscription, waits for the simulated
// activation delay, then flips it to active and refetches the org's employee
// list so every screen (dashboard, catalog, sidebar counts) updates together.
export function useHireEmployee() {
  const { refetchEmployees } = useAppData()
  const [stage, setStage] = useState<HireStage>('idle')

  const hire = useCallback(
    async (employeeType: EmployeeType, billingCycle: BillingCycle) => {
      setStage('creating')
      await subscriptionService.hireEmployee(employeeType, billingCycle)
      setStage('activating')
      await subscriptionService.completeActivation(employeeType)
      setStage('active')
      refetchEmployees()
    },
    [refetchEmployees],
  )

  const reset = useCallback(() => setStage('idle'), [])

  return { stage, hire, reset }
}
