import type { ReactNode } from 'react'
import { LogOut, Settings, HelpCircle, UserCircle } from 'lucide-react'
import { useAppData } from '@/app/AppDataProvider'
import { Avatar } from '@/components/ui/Avatar'
import { Popover, PopoverItem } from '@/components/ui/Popover'

interface UserMenuProps {
  trigger: (props: { toggle: () => void; name: string; title?: string }) => ReactNode
  align?: 'left' | 'right'
  panelClassName?: string
}

export function UserMenu({ trigger, align = 'right', panelClassName }: UserMenuProps) {
  const { currentUser } = useAppData()

  return (
    <Popover
      align={align}
      panelClassName={panelClassName ?? 'w-60'}
      trigger={({ toggle }) => trigger({ toggle, name: currentUser?.name ?? 'Loading…', title: currentUser?.title })}
    >
      {(close) => (
        <>
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <Avatar name={currentUser?.name ?? 'User'} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-ink-800">{currentUser?.name ?? 'Loading…'}</p>
              <p className="truncate text-[11px] text-ink-400">{currentUser?.email ?? ''}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-ink-100" />
          <PopoverItem icon={<UserCircle className="size-4" />} onClick={close}>
            Account
          </PopoverItem>
          <PopoverItem icon={<Settings className="size-4" />} onClick={close}>
            Preferences
          </PopoverItem>
          <PopoverItem icon={<HelpCircle className="size-4" />} onClick={close}>
            Help & Support
          </PopoverItem>
          <div className="my-1 h-px bg-ink-100" />
          <PopoverItem icon={<LogOut className="size-4" />} tone="danger" onClick={close}>
            Log out
          </PopoverItem>
        </>
      )}
    </Popover>
  )
}
