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
      <div className={cn('flex h-16 shrink-0 items-center border-b border-ink-100', collapsed ? 'justify-center px-0' : 'justify-between px-5')}>
        {collapsed ? <LogoMark size={28} /> : <Logo markSize={36} />}
        {onToggleCollapsed && !collapsed && (
          <button
            onClick={onToggleCollapsed}
            aria-label="Collapse sidebar"
            className="hidden rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 lg:flex"
          >
            <PanelLeftClose className="size-4" />
          </button>
        )}
      </div>

      <nav className={cn('flex-1 space-y-1 overflow-y-auto py-4', collapsed ? 'px-2' : 'px-3')}>
        {onToggleCollapsed && collapsed && (
          <button
            onClick={onToggleCollapsed}
            aria-label="Expand sidebar"
            className="mb-2 hidden w-full items-center justify-center rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-700 lg:flex"
          >
            <PanelLeftOpen className="size-4" />
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
                  'flex items-center gap-3 rounded-lg py-2.5 text-[13.5px] font-medium transition-colors duration-150',
                  collapsed ? 'justify-center px-0' : 'px-3',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
                )
              }
            >
              <item.icon className="size-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
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

      <div className={cn('shrink-0 space-y-1 border-t border-ink-100 py-3', collapsed ? 'px-2' : 'px-3')}>
        <Popover
          align="left"
          className="w-full"
          panelClassName="w-64 bottom-full top-auto mb-2"
          trigger={({ toggle }) => (
            <button
              onClick={toggle}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg py-2 text-left hover:bg-ink-100',
                collapsed ? 'justify-center px-0' : 'px-2.5',
              )}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-100 text-[11px] font-bold text-brand-700">
                {organization?.name?.slice(0, 1) ?? 'A'}
              </span>
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ink-800">{organization?.name ?? 'Loading…'}</span>
                    <span className="block truncate text-[11px] capitalize text-ink-400">{organization?.plan ?? ''} plan</span>
                  </span>
                  <ChevronsUpDown className="size-3.5 shrink-0 text-ink-400" />
                </>
              )}
            </button>
          )}
        >
          {(close) => (
            <>
              <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Organizations</p>
              <PopoverItem
                icon={<span className="flex size-5 items-center justify-center rounded bg-brand-100 text-[10px] font-bold text-brand-700">A</span>}
                onClick={close}
              >
                <span className="flex flex-1 items-center justify-between">
                  {organization?.name ?? 'Acme Corporation'}
                  <Check className="size-3.5 text-brand-600" />
                </span>
              </PopoverItem>
              <div className="my-1 h-px bg-ink-100" />
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
                'flex w-full items-center gap-2.5 rounded-lg py-2 text-left hover:bg-ink-100',
                collapsed ? 'justify-center px-0' : 'px-2.5',
              )}
            >
              <Avatar name={name} size="xs" />
              {!collapsed && (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-ink-800">{name}</span>
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
