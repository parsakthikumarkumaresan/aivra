import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { JaanSidebar } from '@/components/jaan/JaanSidebar'
import { TopHeader } from './TopHeader'
import { PageTransition } from './PageTransition'
import { Drawer } from '@/components/ui/Drawer'
import { BreadcrumbProvider } from '@/hooks/useBreadcrumbs'
import { useEmployeeAccess } from '@/hooks/useSubscription'
import { cn } from '@/utils/cn'

const SIDEBAR_COLLAPSED_KEY = 'aivra:sidebar-collapsed'
const JAAN_SIDEBAR_COLLAPSED_KEY = 'jaan:sidebar-collapsed'

export function AppShell() {
  const { pathname } = useLocation()
  const isJaanRoute = pathname.startsWith('/app/jaan')
  // The Jaan sidebar/shell is a customer's AI Employee workspace — it must
  // never render (even as a wrapper around the "Subscribe to Jaan" gate) for
  // an organization that hasn't actually subscribed, per the global-vs-Jaan
  // shell separation. Path alone isn't enough; check real access too.
  const { hasAccess: hasJaanAccess } = useEmployeeAccess('voice')
  const isJaan = isJaanRoute && hasJaanAccess
  const collapsedKey = isJaan ? JAAN_SIDEBAR_COLLAPSED_KEY : SIDEBAR_COLLAPSED_KEY
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(collapsedKey) === 'true')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // The main app sidebar and the Jaan sidebar persist their collapsed state
  // separately (different keys) — re-sync when crossing between them
  // in-session, since AppShell itself never remounts.
  useEffect(() => {
    setCollapsed(localStorage.getItem(collapsedKey) === 'true')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJaan])

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(collapsedKey, String(next))
      return next
    })
  }

  return (
    <BreadcrumbProvider>
      <div className="flex h-screen overflow-hidden bg-ink-25">
        <aside
          className={cn(
            'hidden shrink-0 border-r border-ink-200 transition-[width] duration-150 lg:block',
            collapsed ? 'w-16' : 'w-60',
          )}
        >
          {isJaan ? <JaanSidebar collapsed={collapsed} /> : <Sidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />}
        </aside>

        <Drawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} side="left" width="272px">
          <div className="relative -mx-6 -my-5 h-[calc(100%+2.5rem)]">
            <button
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
            >
              <X className="size-4" />
            </button>
            {isJaan ? <JaanSidebar /> : <Sidebar onNavigate={() => setMobileNavOpen(false)} />}
          </div>
        </Drawer>

        <div className="flex min-w-0 flex-1 flex-col">
          <TopHeader onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            {isJaan ? (
              <PageTransition />
            ) : (
              <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
                <PageTransition />
              </div>
            )}
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  )
}
