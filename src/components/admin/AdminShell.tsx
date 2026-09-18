import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopHeader } from './AdminTopHeader'

// Top-level layout for /admin — deliberately its own shell, not a mode of
// AppShell, so a customer session can never render admin chrome even
// transiently (AdminRoute gates entry before this ever mounts).
export function AdminShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-ink-25">
      <aside className="hidden w-60 shrink-0 border-r border-ink-200 lg:block">
        <AdminSidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
