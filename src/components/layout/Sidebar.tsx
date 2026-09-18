import { NavLink } from 'react-router-dom'
import { ChevronsUpDown, Settings, Check, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { PRIMARY_NAV } from '@/app/navigation'
import { useAppData } from '@/app/AppDataProvider'
import { Logo, LogoMark } from '@/components/ui/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { Popover, PopoverItem } from '@/components/ui/Popover'
import { Tooltip } from '@/components/ui/Tooltip'
import { UserMenu } from './UserMenu'
import { cn } from '@/utils/cn'

interface SidebarProps {
  collapsed?: boolean
  onToggleCollapsed?: () => void
  onNavigate?: () => void
}

export function Sidebar({ collapsed = false, onToggleCollapsed, onNavigate }: SidebarProps) {
  const { organization } = useAppData()

  return (
    <div className="flex h-full flex-col bg-ink-50">
      {/* Logo / brand header */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b border-ink-200',
          collapsed ? 'justify-center px-0' : 'justify-between px-4',
        )}
      >
        {collapsed ? <LogoMark size={26} /> : <Logo markSize={32} />}
        {onToggleCollapsed && !collapsed && (
          <button
            onClick={onToggleCollapsed}
            aria-label="Collapse sidebar"
            className="hidden rounded-md p-1.5 text-ink-400 transition-colors hover:bg-ink-200 hover:text-ink-700 lg:flex"
          >
            <PanelLeftClose className="size-[15px]" />
          </button>
        )}
      </div>

      {/* Navigation items */}
      <nav className={cn('flex-1 space-y-0.5 overflow-y-auto py-3', collapsed ? 'px-2' : 'px-2.5')}>
        {onToggleCollapsed && collapsed && (
          <button
            onClick={onToggleCollapsed}
            aria-label="Expand sidebar"
            className="mb-2 hidden w-full items-center justify-center rounded-lg p-2 text-ink-400 transition-colors hover:bg-ink-200 hover:text-ink-700 lg:flex"
          >
            <PanelLeftOpen className="size-[15px]" />
          </button>
        )}
        {PRIMARY_NAV.map((item) => {
          const linkContent = (
            <NavLink
              key={item.href}
              to={item.href}
              end={!item.matchPrefix}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-2.5 rounded-lg py-2 text-[13px] font-medium transition-colors duration-150',
                  collapsed ? 'justify-center px-0' : 'px-2.5',
                  isActive
                    ? 'bg-brand-100 text-brand-700'
                    : 'text-ink-500 hover:bg-ink-200 hover:text-ink-800',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Left accent bar on active item — the JEXA red indicator */}
                  {!collapsed && (
                    <span
                      className={cn(
                        '-ml-2.5 mr-0 h-4 w-0.5 rounded-r-full transition-all duration-150',
                        isActive ? 'bg-brand-600 opacity-100' : 'opacity-0',
                      )}
                    />
                  )}
                  <item.icon
                    className={cn(
                      'size-[16px] shrink-0 transition-colors duration-150',
                      isActive ? 'text-brand-600' : 'text-ink-400 group-hover:text-ink-700',
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          )
          return collapsed ? (
            <Tooltip key={item.href} content={item.label} side="right">
              {linkContent}
            </Tooltip>
          ) : (
            linkContent
          )
        })}
      </nav>

      {/* Bottom: org switcher + user menu */}
      <div
        className={cn(
          'shrink-0 space-y-0.5 border-t border-ink-200 py-3',
          collapsed ? 'px-2' : 'px-2.5',
        )}
      >
        <Popover
          align="left"
          className="w-full"
          panelClassName="w-64 bottom-full top-auto mb-2"
          trigger={({ toggle }) => (
            <button
              onClick={toggle}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg py-2 text-left transition-colors hover:bg-ink-200',
                collapsed ? 'justify-center px-0' : 'px-2.5',
              )}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-100 text-[10px] font-bold text-brand-700">
                {organization?.name?.slice(0, 1) ?? 'A'}
              </span>
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-semibold text-ink-800">
                      {organization?.name ?? 'Loading…'}
                    </span>
                    <span className="block truncate text-[11px] capitalize text-ink-400">
                      {organization?.plan ?? ''} plan
                    </span>
                  </span>
                  <ChevronsUpDown className="size-3 shrink-0 text-ink-400" />
                </>
              )}
            </button>
          )}
        >
          {(close) => (
            <>
              <p className="px-2.5 pb-1.5 pt-1 text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">
                Organization
              </p>
              <PopoverItem
                icon={
                  <span className="flex size-5 items-center justify-center rounded-md bg-brand-100 text-[9px] font-bold text-brand-700">
                    {organization?.name?.slice(0, 1) ?? 'A'}
                  </span>
                }
                onClick={close}
              >
                <span className="flex flex-1 items-center justify-between">
                  {organization?.name ?? 'Acme Corporation'}
                  <Check className="size-3.5 text-brand-600" />
                </span>
              </PopoverItem>
              <div className="my-1 h-px bg-ink-200" />
              <PopoverItem icon={<Settings className="size-4" />} onClick={close}>
                Organization settings
              </PopoverItem>
            </>
          )}
        </Popover>

        <UserMenu
          align="left"
          panelClassName="w-60 bottom-full top-auto mb-2"
          trigger={({ toggle, name, title }) => (
            <button
              onClick={toggle}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg py-2 text-left transition-colors hover:bg-ink-200',
                collapsed ? 'justify-center px-0' : 'px-2.5',
              )}
            >
              <Avatar name={name} size="xs" />
              {!collapsed && (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold text-ink-800">{name}</span>
                  <span className="block truncate text-[11px] text-ink-400">{title ?? ''}</span>
                </span>
              )}
            </button>
          )}
        />
      </div>
    </div>
  )
}
