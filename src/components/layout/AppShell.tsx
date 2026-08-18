import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { TopHeader } from './TopHeader'
import { Drawer } from '@/components/ui/Drawer'
import { BreadcrumbProvider } from '@/hooks/useBreadcrumbs'
import { cn } from '@/utils/cn'

const SIDEBAR_COLLAPSED_KEY = 'aivra:sidebar-collapsed'

export function AppShell() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
      return next
    })
  }

  return (
    <BreadcrumbProvider>
      <div className="flex h-screen overflow-hidden bg-ink-25">
        <aside
          className={cn(
            'hidden shrink-0 border-r border-ink-200 transition-[width] duration-150 lg:block',
            collapsed ? 'w-[72px]' : 'w-64',
          )}
        >
          <Sidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
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
            <Sidebar onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </Drawer>

        <div className="flex min-w-0 flex-1 flex-col">
          <TopHeader onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  )
}
