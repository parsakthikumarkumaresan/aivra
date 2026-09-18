import {
  LayoutDashboard,
  Target,
  Building2,
  Bot,
  PhoneCall,
  BarChart3,
  Gauge,
  Wallet,
  Receipt,
  FileSpreadsheet,
  Rocket,
  Plug,
  ShieldCheck,
  LifeBuoy,
  ScrollText,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface AdminNavItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
  /** True once the section has a real, backend-wired page — see Section 43 audit. */
  implemented: boolean
  /** Shown on the "coming soon" placeholder for not-yet-implemented sections. */
  description?: string
  phase?: string
}

// JEXA Admin — internal operations console (spec section 42). Distinct
// route tree and RBAC from the customer /app/jaan console; see AdminRoute.
export const ADMIN_NAV: AdminNavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/admin', implemented: true },
  { id: 'leads', label: 'Leads', icon: Target, href: '/admin/leads', implemented: true },
  {
    id: 'customers',
    label: 'Customers',
    icon: Building2,
    href: '/admin/customers',
    implemented: true,
  },
  {
    id: 'agents',
    label: 'Agents',
    icon: Bot,
    href: '/admin/agents',
    implemented: false,
    phase: 'Phase 7',
    description:
      'Cross-customer agent listing needs a platform-role-scoped variant of the existing (org-scoped) /internal/voice-agents API. The Agent Workspace itself is already real and will be reused, not rebuilt.',
  },
  { id: 'deployments', label: 'Deployments', icon: Rocket, href: '/admin/deployments', implemented: true },
  {
    id: 'calls',
    label: 'Calls',
    icon: PhoneCall,
    href: '/admin/calls',
    implemented: false,
    phase: 'Phase 7',
    description: 'Cross-customer call search needs an admin-scoped call listing endpoint (today\'s /voice/calls is org-scoped by design for tenant isolation).',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/admin/analytics',
    implemented: false,
    phase: 'Phase 7',
    description: 'Platform-wide analytics needs a cross-tenant rollup of the existing real per-org /analytics/voice queries.',
  },
  {
    id: 'usage',
    label: 'Usage',
    icon: Gauge,
    href: '/admin/usage',
    implemented: true,
  },
  {
    id: 'credits',
    label: 'Credits',
    icon: Wallet,
    href: '/admin/credits',
    implemented: true,
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: Receipt,
    href: '/admin/billing',
    implemented: false,
    phase: 'Phase 5',
    description: 'Recharge orders and invoices view, once the recharge/billing architecture (Phase 5) exists.',
  },
  {
    id: 'quotes',
    label: 'Quotes',
    icon: FileSpreadsheet,
    href: '/admin/quotes',
    implemented: false,
    phase: 'Phase 8',
    description: 'The quote calculator needs new quotes/quote_items models and pricing-component backend — not built yet.',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Plug,
    href: '/admin/integrations',
    implemented: false,
    phase: 'Phase 10',
    description: 'No admin-side integrations management exists yet; the customer-facing Integrations page is also currently mock-backed.',
  },
  {
    id: 'telephony',
    label: 'Telephony',
    icon: PhoneCall,
    href: '/admin/telephony',
    implemented: false,
    phase: 'Phase 10',
    description: 'Infrastructure-level telephony (carrier accounts, SIP trunks) already has real DB CRUD via /internal/telephony — this page will surface it once scoped for cross-customer admin use.',
  },
  {
    id: 'monitor',
    label: 'Monitor & QA',
    icon: ShieldCheck,
    href: '/admin/monitor',
    implemented: false,
    phase: 'Phase 10',
    description: 'Agent latency, STT/TTS/LLM/tool/webhook failure tracking needs a new monitoring data pipeline — none exists yet.',
  },
  {
    id: 'support',
    label: 'Support',
    icon: LifeBuoy,
    href: '/admin/support',
    implemented: false,
    phase: 'Phase 10',
    description: 'Support ticketing has no backend model yet.',
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    icon: ScrollText,
    href: '/admin/audit-logs',
    implemented: false,
    phase: 'Phase 9',
    description: 'Needs a generic audit_logs table (actor/action/entity/before/after) — not built yet.',
  },
  {
    id: 'settings',
    label: 'Admin Settings',
    icon: Settings,
    href: '/admin/settings',
    implemented: false,
    phase: 'Phase 10',
    description: 'Admin-of-admins settings (recharge package pricing, roles) land alongside the credit/billing phases.',
  },
]
