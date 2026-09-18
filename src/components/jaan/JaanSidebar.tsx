import { useMemo, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronsUpDown, BookOpen, Wallet, Plus, Check, Settings } from 'lucide-react'
import { JAAN_NAV } from './jaanNavigation'
import type { JaanNavGroup, JaanNavLeaf } from './jaanNavigation'
import { useAppData } from '@/app/AppDataProvider'
import { useCreditBalance } from '@/hooks/useJaan'
import { LogoMark } from '@/components/ui/Logo'
import { Tooltip } from '@/components/ui/Tooltip'
import { Popover, PopoverItem } from '@/components/ui/Popover'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

function isGroupActive(group: JaanNavGroup, pathname: string): boolean {
  if (group.href) return group.href === '/app/jaan' ? pathname === '/app/jaan' : pathname.startsWith(group.href)
  return (group.children ?? []).some((c) => (c.matchPrefix ? pathname.startsWith(c.href) : pathname === c.href))
}

function isLeafActive(leaf: JaanNavLeaf, pathname: string): boolean {
  return leaf.matchPrefix ? pathname.startsWith(leaf.href) : pathname === leaf.href
}

// Active state: 2px red left border + subtle red tint background
const activeItemClasses =
  'border-l-2 border-l-brand-600 bg-brand-100/70 text-brand-700 pl-2.5'
// Inactive state: transparent left border for spacing alignment
const inactiveItemClasses =
  'border-l-2 border-l-transparent pl-2.5 text-ink-500 hover:bg-ink-200 hover:text-ink-800'

function NavBadge({ badge }: { badge?: 'Beta' | 'Enterprise' }) {
  if (!badge) return null
  return (
    <span
      className={cn(
        'ml-auto rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide',
        badge === 'Beta' ? 'bg-info-100 text-info-600' : 'bg-brand-100 text-brand-700',
      )}
    >
      {badge}
    </span>
  )
}

export function JaanSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const { pathname } = useLocation()
  const { organization } = useAppData()
  const balance = useCreditBalance()

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const group of JAAN_NAV) {
      if (group.children) initial[group.id] = isGroupActive(group, pathname)
    }
    return initial
  })

  function toggleGroup(id: string) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const groups = useMemo(() => JAAN_NAV, [])

  return (
    <div className="flex h-full flex-col bg-ink-50">
      {/* Back to main JEXA.AI app */}
      {collapsed ? (
        <Tooltip content="Back to JEXA.AI Dashboard" side="right">
          <Link
            to="/app"
            className="flex h-9 shrink-0 items-center justify-center border-b border-ink-200 text-ink-400 transition-colors hover:text-brand-600"
          >
            <ArrowLeft className="size-3.5" />
          </Link>
        </Tooltip>
      ) : (
        <Link
          to="/app"
          className="flex h-9 shrink-0 items-center gap-1.5 border-b border-ink-200 px-4 text-[11.5px] font-medium text-ink-400 transition-colors duration-150 hover:text-brand-600"
        >
          <ArrowLeft className="size-3" /> JEXA.AI Dashboard
        </Link>
      )}

      {/* Jaan workspace header */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center gap-2.5 border-b border-ink-200',
          collapsed ? 'justify-center px-0' : 'px-4',
        )}
      >
        <LogoMark size={24} />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-bold leading-tight text-ink-900">Jaan</p>
            <p className="truncate text-[10.5px] leading-tight text-ink-500">Voice AI Employee</p>
          </div>
        )}
      </div>

      {/* Navigation groups */}
      <nav className={cn('flex-1 space-y-0.5 overflow-y-auto py-3', collapsed ? 'px-2' : 'px-2.5')}>
        {groups.map((group) => {
          const Icon = group.icon
          const active = isGroupActive(group, pathname)

          // Flat (no children) nav item
          if (!group.children) {
            const content = (
              <NavLink
                to={group.href!}
                end={group.href === '/app/jaan'}
                className={cn(
                  'flex items-center gap-2.5 rounded-r-md py-2 text-[13px] font-medium transition-colors duration-150',
                  collapsed ? 'justify-center rounded-l-md px-0' : '',
                  active ? activeItemClasses : inactiveItemClasses,
                )}
              >
                <Icon className="size-[15px] shrink-0" />
                {!collapsed && <span className="truncate">{group.label}</span>}
                {!collapsed && <NavBadge badge={group.badge} />}
              </NavLink>
            )
            return collapsed ? (
              <Tooltip key={group.id} content={group.label} side="right">
                {content}
              </Tooltip>
            ) : (
              <div key={group.id}>{content}</div>
            )
          }

          const open = collapsed ? true : Boolean(openGroups[group.id])

          return (
            <div key={group.id}>
              {collapsed ? (
                <Tooltip content={group.label} side="right">
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-md py-2',
                      active ? 'text-brand-600' : 'text-ink-500',
                    )}
                  >
                    <Icon className="size-[15px]" />
                  </div>
                </Tooltip>
              ) : (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium transition-colors duration-150',
                    active ? 'text-ink-800' : 'text-ink-500 hover:text-ink-800',
                  )}
                >
                  <Icon className="size-[15px] shrink-0" />
                  <span className="truncate">{group.label}</span>
                  <NavBadge badge={group.badge} />
                  <ChevronDown
                    className={cn(
                      'size-3 shrink-0 text-ink-400 transition-transform duration-200',
                      open && 'rotate-180',
                    )}
                  />
                </button>
              )}

              {/* Accordion children */}
              {!collapsed && (
                <div
                  className={cn(
                    'grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out',
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="min-h-0">
                    <div className="ml-[18px] mt-0.5 space-y-0.5 border-l border-ink-200 pl-2">
                      {group.children.map((leaf) => (
                        <NavLink
                          key={leaf.href}
                          to={leaf.href}
                          end={!leaf.matchPrefix}
                          className={cn(
                            'block rounded-r-md py-1.5 text-[12.5px] font-medium transition-colors duration-150',
                            isLeafActive(leaf, pathname)
                              ? activeItemClasses
                              : inactiveItemClasses,
                          )}
                        >
                          <span className="flex items-center gap-1.5">
                            {leaf.label}
                            <NavBadge badge={leaf.badge} />
                          </span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom utility section */}
      <div
        className={cn('shrink-0 space-y-1.5 border-t border-ink-200 py-3', collapsed ? 'px-2' : 'px-2.5')}
      >
        <JaanBottomLink
          collapsed={collapsed}
          icon={Settings}
          label="Settings"
          href="/app/jaan/settings"
          active={pathname.startsWith('/app/jaan/settings')}
        />
        <JaanBottomLink
          collapsed={collapsed}
          icon={BookOpen}
          label="Docs"
          href="/app/jaan/docs"
          active={pathname.startsWith('/app/jaan/docs')}
        />

        {/* Voice Minutes balance widget */}
        {!collapsed ? (
          <Link
            to="/app/jaan/settings/billing"
            className="flex items-center justify-between gap-2 rounded-lg border border-ink-300 bg-surface px-3 py-2.5 transition-all duration-150 hover:border-brand-600/40"
          >
            <span className="flex items-center gap-2 text-ink-500">
              <Wallet className="size-3.5" />
              <span className="text-[12px] font-medium">Voice Minutes</span>
            </span>
            <span
              className={cn(
                'text-[12.5px] font-bold tabular-nums',
                balance.data?.lowBalance ? 'text-danger-600' : 'text-ink-900',
              )}
            >
              {balance.data ? `${balance.data.balanceMinutes} min` : '—'}
            </span>
          </Link>
        ) : (
          <Tooltip content="Voice Minutes" side="right">
            <Link
              to="/app/jaan/settings/billing"
              className="flex items-center justify-center rounded-md py-2 text-ink-500 transition-colors hover:text-brand-600"
            >
              <Wallet className="size-3.5" />
            </Link>
          </Tooltip>
        )}

        {!collapsed && (
          <Link to="/app/jaan/settings/billing">
            <Button size="sm" variant="outline" className="w-full" icon={<Plus className="size-3.5" />}>
              Recharge Credits
            </Button>
          </Link>
        )}

        {/* Workspace switcher */}
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
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-100 text-[9px] font-bold text-brand-700">
                {organization?.name?.slice(0, 1) ?? 'A'}
              </span>
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-semibold text-ink-800">
                      {organization?.name ?? 'Loading…'}
                    </span>
                    <span className="block truncate text-[10.5px] text-ink-400">Workspace</span>
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
                Workspace
              </p>
              <PopoverItem icon={<Check className="size-3.5 text-brand-600" />} onClick={close}>
                {organization?.name ?? 'Acme Corporation'}
              </PopoverItem>
              <div className="my-1 h-px bg-ink-200" />
              <Link to="/app/jaan/settings">
                <PopoverItem icon={<Settings className="size-4" />} onClick={close}>
                  Jaan settings
                </PopoverItem>
              </Link>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

function JaanBottomLink({
  collapsed,
  icon: Icon,
  label,
  href,
  active,
}: {
  collapsed: boolean
  icon: typeof Settings
  label: string
  href: string
  active: boolean
}) {
  const content = (
    <NavLink
      to={href}
      className={cn(
        'flex items-center gap-2.5 rounded-md py-1.5 text-[12.5px] font-medium transition-colors duration-150',
        collapsed ? 'justify-center px-0' : 'px-2.5',
        active ? 'bg-ink-200 text-ink-900' : 'text-ink-500 hover:bg-ink-200 hover:text-ink-900',
      )}
    >
      <Icon className="size-[14px] shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  )
  return collapsed ? (
    <Tooltip content={label} side="right">
      {content}
    </Tooltip>
  ) : (
    content
  )
}
