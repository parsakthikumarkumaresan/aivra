import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAsync } from '@/hooks/useAsync'
import { authService } from '@/services/api'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'

const PLATFORM_ROLE_LABEL: Record<string, string> = {
  aivra_admin: 'AIVRA Admin',
  aivra_engineer: 'AIVRA Engineer',
}

export function AdminTopHeader() {
  const navigate = useNavigate()
  const me = useAsync(() => authService.me(), [])

  async function handleLogout() {
    await authService.logout()
    navigate('/login')
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ink-200 bg-ink-25 px-4 sm:px-5">
      <div className="min-w-0 flex-1">
        <span className="text-[14px] font-semibold text-ink-800">JEXA Admin Console</span>
      </div>

      {me.data?.platformRole && (
        <Badge tone="brand">
          {PLATFORM_ROLE_LABEL[me.data.platformRole] ?? me.data.platformRole}
        </Badge>
      )}

      <div className="flex items-center gap-2.5">
        <Avatar name={me.data?.fullName ?? 'Admin'} size="sm" />
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-[13px] font-semibold text-ink-800">{me.data?.fullName ?? 'Loading…'}</p>
          <p className="truncate text-[11px] text-ink-400">{me.data?.email ?? ''}</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        aria-label="Log out"
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-200 hover:text-danger-600"
      >
        <LogOut className="size-[16px]" />
      </button>
    </header>
  )
}
