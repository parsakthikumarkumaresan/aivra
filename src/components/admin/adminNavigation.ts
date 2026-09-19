import {
  LayoutDashboard,
  Bot,
  Building2,
  Target,
  Receipt,
  BarChart3,
  Settings,
  Mic,
  Users,
  FileSpreadsheet,
  ScrollText,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface AdminNavChild {
  id: string
  label: string
  icon: LucideIcon
  href: string
  implemented: boolean
  description?: string
}

export interface AdminNavItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
  /** True once the section has a real, backend-wired page. */
  implemented: boolean
  /** Shown on the "coming soon" placeholder for not-yet-implemented sections. */
  description?: string
  /** Sub-items rendered nested under this entry (e.g. AI Employees → Jaan/HR AI). */
  children?: AdminNavChild[]
}

// JEXA Admin — internal operations console, restructured around the JEXA
// BUSINESS (customers, AI Employee products, revenue) rather than Jaan
// engineering internals. Technical/operational pages (Agents, Calls,
// Telephony, Credits, Usage, Deployments, Monitor, Audit Logs, Support)
// still exist and are still real — they're reached contextually (from the
// relevant AI Employee or Customer page) rather than cluttering this
// primary list. See each business page for the "quick links" out to them.
export const ADMIN_NAV: AdminNavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/admin', implemented: true },
  {
    id: 'ai-employees',
    label: 'AI Employees',
    icon: Bot,
    href: '/admin/ai-employees',
    implemented: true,
    children: [
      { id: 'ai-employees-jaan', label: 'Jaan', icon: Mic, href: '/admin/ai-employees/jaan', implemented: true },
      { id: 'ai-employees-hr', label: 'HR AI', icon: Users, href: '/admin/ai-employees/hr', implemented: true },
    ],
  },
  { id: 'customers', label: 'Customers', icon: Building2, href: '/admin/customers', implemented: true },
  {
    id: 'sales',
    label: 'Sales',
    icon: Target,
    href: '/admin/sales',
    implemented: true,
    children: [
      { id: 'sales-leads', label: 'Leads', icon: Target, href: '/admin/leads', implemented: true },
      { id: 'sales-quotes', label: 'Quotes', icon: FileSpreadsheet, href: '/admin/quotes', implemented: true },
    ],
  },
  { id: 'billing', label: 'Billing & Revenue', icon: Receipt, href: '/admin/billing', implemented: true },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/analytics', implemented: true },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/admin/settings',
    implemented: true,
    children: [
      { id: 'settings-audit-logs', label: 'Audit Logs', icon: ScrollText, href: '/admin/audit-logs', implemented: true },
    ],
  },
]
