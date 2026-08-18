import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import type { EmployeeType } from '@/types'
import { HireEmployeeModal } from '@/components/employees/HireEmployeeModal'

interface HireFlowContextValue {
  openHireFlow: (employeeType: EmployeeType) => void
}

const HireFlowContext = createContext<HireFlowContextValue | null>(null)

export function HireFlowProvider({ children }: { children: ReactNode }) {
  const [employeeType, setEmployeeType] = useState<EmployeeType | null>(null)

  return (
    <HireFlowContext.Provider value={{ openHireFlow: setEmployeeType }}>
      {children}
      <HireEmployeeModal employeeType={employeeType} onClose={() => setEmployeeType(null)} />
    </HireFlowContext.Provider>
  )
}

export function useHireFlow() {
  const ctx = useContext(HireFlowContext)
  if (!ctx) throw new Error('useHireFlow must be used within HireFlowProvider')
  return ctx
}
