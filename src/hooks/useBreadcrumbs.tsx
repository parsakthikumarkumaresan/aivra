import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

export interface Breadcrumb {
  label: string
  href?: string
}

interface BreadcrumbContextValue {
  breadcrumbs: Breadcrumb[]
  setBreadcrumbs: (items: Breadcrumb[]) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null)

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])
  return <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>{children}</BreadcrumbContext.Provider>
}

export function useBreadcrumbs() {
  const ctx = useContext(BreadcrumbContext)
  if (!ctx) throw new Error('useBreadcrumbs must be used within BreadcrumbProvider')
  return ctx.breadcrumbs
}

// Pages call this once to declare their place in the navigation trail.
export function useSetBreadcrumbs(items: Breadcrumb[], deps: unknown[] = []) {
  const ctx = useContext(BreadcrumbContext)
  if (!ctx) throw new Error('useSetBreadcrumbs must be used within BreadcrumbProvider')
  const { setBreadcrumbs } = ctx
  useEffect(() => {
    setBreadcrumbs(items)
    return () => setBreadcrumbs([])
  }, deps)
}
