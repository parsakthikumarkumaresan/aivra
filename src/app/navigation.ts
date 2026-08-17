import {
  LayoutDashboard,
  Users,
  Brain,
  Inbox,
  CheckSquare,
  BarChart3,
  Plug,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  matchPrefix?: boolean
}

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { label: 'AI Employees', href: '/app/employees', icon: Users, matchPrefix: true },
  { label: 'Company Brain', href: '/app/knowledge', icon: Brain, matchPrefix: true },
  { label: 'Inbox', href: '/app/inbox', icon: Inbox, matchPrefix: true },
  { label: 'Approvals', href: '/app/approvals', icon: CheckSquare, matchPrefix: true },
  { label: 'Analytics', href: '/app/analytics', icon: BarChart3, matchPrefix: true },
  { label: 'Integrations', href: '/app/integrations', icon: Plug, matchPrefix: true },
  { label: 'Settings', href: '/app/settings', icon: Settings, matchPrefix: true },
]
