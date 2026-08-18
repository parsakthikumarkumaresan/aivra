import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import type { EmployeeType } from '@/types'
import { DemoRequestModal } from '@/components/leads/DemoRequestModal'
import { CustomizationRequestModal } from '@/components/leads/CustomizationRequestModal'

interface LeadFlowContextValue {
  openDemoRequest: (employeeType: EmployeeType) => void
  openCustomizationRequest: () => void
}

const LeadFlowContext = createContext<LeadFlowContextValue | null>(null)

export function LeadFlowProvider({ children }: { children: ReactNode }) {
  const [demoFor, setDemoFor] = useState<EmployeeType | null>(null)
  const [customizationOpen, setCustomizationOpen] = useState(false)

  return (
    <LeadFlowContext.Provider value={{ openDemoRequest: setDemoFor, openCustomizationRequest: () => setCustomizationOpen(true) }}>
      {children}
      <DemoRequestModal employeeType={demoFor} onClose={() => setDemoFor(null)} />
      <CustomizationRequestModal open={customizationOpen} onClose={() => setCustomizationOpen(false)} />
    </LeadFlowContext.Provider>
  )
}

export function useLeadFlow() {
  const ctx = useContext(LeadFlowContext)
  if (!ctx) throw new Error('useLeadFlow must be used within LeadFlowProvider')
  return ctx
}
