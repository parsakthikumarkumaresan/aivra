import { NavLink, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ADMIN_NAV } from './adminNavigation'
import { LogoMark } from '@/components/ui/Logo'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

export function AdminSidebar() {
  const { pathname } = useLocation()

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
          <p className="truncate text-[10.5px] leading-tight text-ink-500">Business Control Center</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon
          const childActive = item.children?.some((c) => pathname.startsWith(c.href)) ?? false
          return (
            <div key={item.id}>
              <NavLink
                to={item.href}
                end={item.href === '/admin'}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-2.5 rounded-r-md border-l-2 py-2 pl-2.5 text-[13px] font-medium transition-colors duration-150',
                    isActive || childActive
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
                        isActive || childActive ? 'text-brand-600' : 'text-ink-400 group-hover:text-ink-700',
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
              {item.children && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-ink-200 pl-2">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon
                    return (
                      <NavLink
                        key={child.id}
                        to={child.href}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2 rounded-md py-1.5 pl-2 text-[12.5px] font-medium transition-colors duration-150',
                            isActive
                              ? 'bg-brand-100/70 text-brand-700'
                              : 'text-ink-500 hover:bg-ink-200 hover:text-ink-800',
                          )
                        }
                      >
                        <ChildIcon className="size-3.5 shrink-0" />
                        <span className="truncate">{child.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
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
