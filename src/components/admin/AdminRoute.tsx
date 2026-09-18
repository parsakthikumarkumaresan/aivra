import { useSyncExternalStore } from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { tokenStore } from '@/services/api/tokenStore'
import { isPlatformAdminRole } from '@/services/api/roles'
import { Button } from '@/components/ui/Button'

// Real RBAC guard for /admin — gates on the platformRole the backend
// actually issued at login/refresh (app/shared/rbac/roles.py PlatformRole),
// never on email or any client-only flag. This is a UX convenience only:
// every /admin page's data comes from endpoints (e.g. /leads,
// /internal/voice-projects) that independently re-check
// require_platform_role() server-side, so a customer who bypasses this
// guard still gets a real 403 from the API, not real data.
export function AdminRoute() {
  const session = useSyncExternalStore(tokenStore.subscribe, tokenStore.get)
  const location = useLocation()

  if (!session.accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!isPlatformAdminRole(session.platformRole)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink-25 px-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-danger-100 text-danger-600">
          <ShieldAlert className="size-6" />
        </div>
        <h1 className="mt-4 text-[19px] font-bold text-ink-900">Restricted area</h1>
        <p className="mt-2 max-w-sm text-[13.5px] text-ink-600">
          The JEXA Admin console is limited to AIVRA staff accounts. Your account doesn't have that access.
        </p>
        <Link to="/app" className="mt-6">
          <Button variant="outline">Return to JEXA.AI</Button>
        </Link>
      </div>
    )
  }

  return <Outlet />
}
