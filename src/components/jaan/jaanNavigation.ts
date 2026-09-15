import {
  Home,
  Bot,
  BarChart3,
  Megaphone,
  Workflow,
  ScrollText,
  ShieldCheck,
  FlaskConical,
  PhoneCall,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface JaanNavLeaf {
  label: string
  href: string
  matchPrefix?: boolean
  badge?: 'Beta' | 'Enterprise'
}

export interface JaanNavGroup {
  id: string
  label: string
  icon: LucideIcon
  href?: string
  badge?: 'Beta' | 'Enterprise'
  children?: JaanNavLeaf[]
}

// Jaan's own deep information architecture — separate from the general
// JEXA.AI app sidebar (src/app/navigation.ts). AppShell swaps to this one
// whenever the route is under /app/jaan.
export const JAAN_NAV: JaanNavGroup[] = [
  { id: 'home', label: 'Home', icon: Home, href: '/app/jaan' },
  {
    id: 'agents',
    label: 'Agents',
    icon: Bot,
    children: [
      { label: 'Agents', href: '/app/jaan/agents', matchPrefix: true },
      { label: 'Tools', href: '/app/jaan/tools' },
      { label: 'Tables', href: '/app/jaan/tables', matchPrefix: true },
      { label: 'Library', href: '/app/jaan/library' },
      { label: 'Pronunciation', href: '/app/jaan/pronunciation' },
    ],
  },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/app/jaan/analytics' },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone, href: '/app/jaan/campaigns', },
  { id: 'workflows', label: 'Workflows', icon: Workflow, href: '/app/jaan/workflows', badge: 'Beta' },
  {
    id: 'logs',
    label: 'Logs',
    icon: ScrollText,
    children: [
      { label: 'Conversations', href: '/app/jaan/logs/conversations', matchPrefix: true },
      { label: 'Tools', href: '/app/jaan/logs/tools' },
      { label: 'API & Webhook', href: '/app/jaan/logs/api-webhook' },
      { label: 'Library', href: '/app/jaan/logs/library' },
      { label: 'Audio Ingestion', href: '/app/jaan/logs/audio-ingestion' },
    ],
  },
  {
    id: 'monitor',
    label: 'Monitor & QA',
    icon: ShieldCheck,
    children: [
      { label: 'Metrics', href: '/app/jaan/monitor/metrics' },
      { label: 'Runs', href: '/app/jaan/monitor/runs' },
      { label: 'Reviews', href: '/app/jaan/monitor/reviews' },
      { label: 'Alerts', href: '/app/jaan/monitor/alerts' },
      { label: 'Reports', href: '/app/jaan/monitor/reports' },
    ],
  },
  { id: 'simulations', label: 'Simulations', icon: FlaskConical, href: '/app/jaan/simulations', badge: 'Enterprise' },
  {
    id: 'telephony',
    label: 'Telephony',
    icon: PhoneCall,
    children: [
      { label: 'Numbers', href: '/app/jaan/telephony/numbers' },
      { label: 'Telephony', href: '/app/jaan/telephony' },
      { label: 'Compliance', href: '/app/jaan/telephony/compliance' },
      { label: 'DND', href: '/app/jaan/telephony/dnd' },
    ],
  },
]
