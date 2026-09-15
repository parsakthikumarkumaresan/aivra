import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AppDataProvider } from '@/app/AppDataProvider'
import { HireFlowProvider } from '@/app/HireFlowContext'
import { LeadFlowProvider } from '@/app/LeadFlowContext'
import { PageTransition } from '@/components/layout/PageTransition'

// Client-side navigation to a route + hash (e.g. a footer link on another
// page pointing to "/#platform") doesn't auto-scroll the way a plain <a>
// same-page anchor does — react-router only updates the URL. This makes
// those links actually land on the right section instead of just changing
// the address bar.
function useScrollToHash() {
  const location = useLocation()
  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.slice(1)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.pathname, location.hash])
}

// Mounted above every route — public marketing pages and the authenticated
// app both need the mock org/employee data and the hire/lead modals (a
// customer can purchase HR or request the Voice Employee before "logging in").
export function RootLayout() {
  useScrollToHash()
  return (
    <AppDataProvider>
      <HireFlowProvider>
        <LeadFlowProvider>
          <PageTransition />
        </LeadFlowProvider>
      </HireFlowProvider>
    </AppDataProvider>
  )
}
