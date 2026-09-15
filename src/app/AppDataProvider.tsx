import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useRef } from 'react'
import type { AIEmployee, Organization, User } from '@/types'
import { useOrganization, useCurrentUser } from '@/hooks/useOrganization'
import { useEmployees } from '@/hooks/useEmployees'
import { getScenarioForOrgSlug } from '@/services/mock/data/subscriptions'
import { reseedSubscriptionsForScenario } from '@/services/mock/subscription.service'
import { setMockScenario } from '@/services/mock/scenario'
import { tokenStore } from '@/services/api/tokenStore'

interface AppDataContextValue {
  organization?: Organization
  currentUser?: User
  employees: AIEmployee[]
  loading: boolean
  refetchEmployees: () => void
  refetchOrganization: () => void
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const org = useOrganization()
  const user = useCurrentUser()
  const employees = useEmployees()

  // AppDataProvider is mounted once at the RootLayout level, above both the
  // public "/login" route and the authenticated "/app" tree, so it's already
  // mounted (and org/user already fetched-and-rejected, pre-login) by the
  // time a user actually signs in. useOrganization()/useCurrentUser() only
  // fetch once on mount, so without this they'd never re-fetch after login —
  // org.data would stay undefined forever and the scenario-detection effect
  // below would never see a real slug. Re-run both fetches whenever the
  // authenticated/unauthenticated boundary is actually crossed (login or
  // logout), not on every token refresh.
  const wasAuthenticated = useRef(tokenStore.isAuthenticated())
  useEffect(() => {
    return tokenStore.subscribe(() => {
      const isAuthed = tokenStore.isAuthenticated()
      if (isAuthed === wasAuthenticated.current) return
      wasAuthenticated.current = isAuthed
      org.refetch()
      user.refetch()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Demo accounts (see aivra-backend/scripts/seed_demo_users.py) are
  // recognized by their real organization slug and automatically get the
  // matching mock AI Employee subscription state on login — no manual
  // Settings → Developer scenario switch needed. Runs once per distinct
  // slug seen; a manual override via the Developer panel afterwards still
  // works normally until the next login/org-slug change.
  const appliedForSlug = useRef<string | null>(null)
  useEffect(() => {
    const slug = org.data?.slug
    if (!slug || appliedForSlug.current === slug) return
    const scenario = getScenarioForOrgSlug(slug)
    if (!scenario) return
    appliedForSlug.current = slug
    setMockScenario(scenario)
    reseedSubscriptionsForScenario(scenario)
    employees.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org.data?.slug])

  const value: AppDataContextValue = {
    organization: org.data,
    currentUser: user.data,
    employees: employees.data ?? [],
    loading: org.loading || user.loading || employees.loading,
    refetchEmployees: employees.refetch,
    refetchOrganization: org.refetch,
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
