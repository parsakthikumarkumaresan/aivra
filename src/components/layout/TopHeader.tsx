import { Link } from 'react-router-dom'
import { Menu, Search, Bell, HelpCircle, ChevronRight, CheckSquare, PhoneMissed, FileWarning } from 'lucide-react'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { Avatar } from '@/components/ui/Avatar'
import { Popover } from '@/components/ui/Popover'
import { ActivityItem } from '@/components/ui/ActivityItem'
import { UserMenu } from './UserMenu'

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    icon: <CheckSquare className="size-4" />,
    tone: 'warning' as const,
    title: 'New approval requested',
    description: 'Jexa HR needs approval to send an offer.',
    timestamp: '2026-08-17T09:40:00Z',
  },
  {
    id: 'n2',
    icon: <PhoneMissed className="size-4" />,
    tone: 'danger' as const,
    title: 'Call escalated to human',
    description: 'A customer requested a human agent.',
    timestamp: '2026-08-17T08:55:00Z',
  },
  {
    id: 'n3',
    icon: <FileWarning className="size-4" />,
    tone: 'neutral' as const,
    title: 'Knowledge source sync failed',
    description: 'Returns Policy PDF failed to re-index.',
    timestamp: '2026-08-16T17:10:00Z',
  },
]

export function TopHeader({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const breadcrumbs = useBreadcrumbs()

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ink-200 bg-ink-25 px-4 sm:px-5">
      {/* Mobile nav toggle */}
      <button
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-200 lg:hidden"
      >
        <Menu className="size-[18px]" />
      </button>

      {/* Breadcrumb */}
      <div className="min-w-0 flex-1">
        {breadcrumbs.length > 0 ? (
          <nav
            className="flex items-center gap-1 overflow-x-auto text-[12.5px]"
            aria-label="Breadcrumb"
          >
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1
              return (
                <span key={crumb.label} className="flex shrink-0 items-center gap-1">
                  {i > 0 && <ChevronRight className="size-3 text-ink-400" />}
                  {crumb.href && !isLast ? (
                    <Link
                      to={crumb.href}
                      className="text-ink-400 transition-colors hover:text-ink-700"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'font-semibold text-ink-800' : 'text-ink-400'}>
                      {crumb.label}
                    </span>
                  )}
                </span>
              )
            })}
          </nav>
        ) : (
          <span className="text-[14px] font-semibold text-ink-800">JEXA.AI</span>
        )}
      </div>

      {/* Search */}
      <div className="hidden items-center sm:flex">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-400" />
          <input
            placeholder="Search…"
            className="h-8 w-48 rounded-lg border border-ink-300 bg-ink-100 pl-8 pr-3 text-[13px] text-ink-800 placeholder:text-ink-400 transition-colors duration-150 focus:border-brand-600 focus:bg-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-600/20 lg:w-64"
          />
        </div>
      </div>

      {/* Notifications */}
      <Popover
        align="right"
        panelClassName="w-80"
        trigger={({ toggle }) => (
          <button
            onClick={toggle}
            aria-label="Notifications"
            className="relative flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-200"
          >
            <Bell className="size-[16px]" />
            {/* Unread dot — danger-500 red, always small and unobtrusive */}
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-danger-500" />
          </button>
        )}
      >
        {() => (
          <>
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-[13px] font-semibold text-ink-900">Notifications</p>
              <button className="text-[12px] font-medium text-brand-600 transition-colors hover:text-brand-700">
                Mark all read
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {MOCK_NOTIFICATIONS.map((n) => (
                <ActivityItem
                  key={n.id}
                  icon={n.icon}
                  tone={n.tone}
                  title={n.title}
                  description={n.description}
                  timestamp={n.timestamp}
                />
              ))}
            </div>
          </>
        )}
      </Popover>

      {/* Help */}
      <button
        aria-label="Help"
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-200"
      >
        <HelpCircle className="size-[16px]" />
      </button>

      {/* User avatar */}
      <UserMenu
        trigger={({ toggle, name }) => (
          <button
            onClick={toggle}
            aria-label="Account menu"
            className="shrink-0 rounded-full ring-2 ring-transparent transition-all hover:ring-ink-300"
          >
            <Avatar name={name} size="sm" />
          </button>
        )}
      />
    </header>
  )
}
