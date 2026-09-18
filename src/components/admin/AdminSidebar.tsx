import { NavLink } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ADMIN_NAV } from './adminNavigation'
import { LogoMark } from '@/components/ui/Logo'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

export function AdminSidebar() {
  return (
    <div className="flex h-full flex-col bg-ink-50">
      {/* Exit admin back to customer app */}
      <a
        href="/app"
        className="flex h-9 shrink-0 items-center gap-1.5 border-b border-ink-200 px-4 text-[11.5px] font-medium text-ink-400 transition-colors duration-150 hover:text-brand-600"
      >
        <ArrowLeft className="size-3" /> Exit Admin
      </a>

      {/* Admin workspace header */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-ink-200 px-4">
        <LogoMark size={24} />
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-bold leading-tight text-ink-900">JEXA Admin</p>
          <p className="truncate text-[10.5px] leading-tight text-ink-500">Internal Operations</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.id}
              to={item.href}
              end={item.href === '/admin'}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-2.5 rounded-r-md border-l-2 py-2 pl-2.5 text-[13px] font-medium transition-colors duration-150',
                  isActive
                    ? 'border-l-brand-600 bg-brand-100/70 text-brand-700'
                    : 'border-l-transparent text-ink-500 hover:bg-ink-200 hover:text-ink-800',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'size-[15px] shrink-0 transition-colors',
                      isActive ? 'text-brand-600' : 'text-ink-400 group-hover:text-ink-700',
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                  {!item.implemented && (
                    <Badge tone="neutral" className="ml-auto shrink-0 !px-1.5 !py-0.5 !text-[9px]">
                      Soon
                    </Badge>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Staff-only indicator */}
      <div className="shrink-0 border-t border-ink-200 px-4 py-3">
        <Badge tone="danger" dot>
          AIVRA Staff Only
        </Badge>
      </div>
    </div>
  )
}
