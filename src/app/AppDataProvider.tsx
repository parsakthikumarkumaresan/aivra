import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'
import type { AIEmployee, Organization, User } from '@/types'
import { useOrganization, useCurrentUser } from '@/hooks/useOrganization'
import { useEmployees } from '@/hooks/useEmployees'

interface AppDataContextValue {
  organization?: Organization
  currentUser?: User
  employees: AIEmployee[]
  loading: boolean
  refetchEmployees: () => void
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const org = useOrganization()
  const user = useCurrentUser()
  const employees = useEmployees()

  const value: AppDataContextValue = {
    organization: org.data,
    currentUser: user.data,
    employees: employees.data ?? [],
    loading: org.loading || user.loading || employees.loading,
    refetchEmployees: employees.refetch,
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
