import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Mic,
  Settings2,
  Pause,
  Play,
  ArrowUpRight,
  Phone,
  MessageSquare,
  Mail,
  Globe,
  Upload,
  CreditCard,
  Loader2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import type { AIEmployee, Channel } from '@/types'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmployeeStatusBadge } from '@/components/ui/StatusBadge'
import { formatRelativeTime } from '@/utils/format'
import { useAppData } from '@/app/AppDataProvider'
import { useHireFlow } from '@/app/HireFlowContext'
import { useToast } from '@/hooks/useToast'
import { subscriptionService } from '@/services/api'

// Jexa HR opens its own tab inside the general app shell; Jaan is its own
// workspace/shell (see AppShell + JaanSidebar) reached only via this link —
// never a global sidebar item.
const EMPLOYEE_WORKSPACE_HREF: Record<AIEmployee['type'], string> = {
  hr: '/app/employees/hr',
  voice: '/app/jaan',
}

const TYPE_ICON = { hr: Users, voice: Mic }

const CHANNEL_ICON: Record<Channel, typeof Phone> = {
  voice: Phone,
  chat: MessageSquare,
  email: Mail,
  sms: MessageSquare,
  web: Globe,
}

interface EmployeeCardProps {
  employee: AIEmployee
  onTogglePause?: (employee: AIEmployee) => void
  compact?: boolean
}

// Renders one AI Employee card. "My Workforce" passes every catalog entry
// (subscribed or not) so a customer can see what's available and subscribe;
// the global Dashboard's "My AI Workforce" only ever passes already-active
// ones — see EmployeesCatalogPage / DashboardPage for the respective filters.
export function EmployeeCard({ employee, onTogglePause, compact = false }: EmployeeCardProps) {
  const TypeIcon = TYPE_ICON[employee.type]
  const employeeHref = EMPLOYEE_WORKSPACE_HREF[employee.type]
  const { openHireFlow } = useHireFlow()

  // Not yet subscribed (or churned) — a compact catalog tile with a single
  // Subscribe action, not the full operational card.
  if (['not_hired', 'cancelled', 'expired'].includes(employee.status)) {
    return (
      <Card className="flex flex-col p-5">
        <div className="flex items-start gap-3">
          <Avatar name={employee.name} color={employee.avatarColor} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-semibold text-ink-900">{employee.name}</p>
              <TypeIcon className="size-3.5 text-ink-400" />
            </div>
            <p className="text-[13px] text-ink-500">{employee.tagline}</p>
          </div>
        </div>
        {!compact && <p className="mt-3.5 text-[13.5px] leading-relaxed text-ink-600">{employee.description}</p>}
        <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4">
          <Badge tone="neutral">Not Subscribed</Badge>
          <Button size="sm" icon={<Sparkles className="size-3.5" />} onClick={() => openHireFlow(employee.type)}>
            {employee.status === 'not_hired' ? 'Subscribe' : 'Resubscribe'}
          </Button>
        </div>
      </Card>
    )
  }

  const header = (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <Avatar name={employee.name} color={employee.avatarColor} size="lg" />
        <div>
          <div className="flex items-center gap-2">
            <Link to={employeeHref} className="text-[15px] font-semibold text-ink-900 hover:text-brand-700">
              {employee.name}
            </Link>
            <TypeIcon className="size-3.5 text-ink-400" />
          </div>
          <p className="text-[13px] text-ink-500">{employee.configuredLabel ?? employee.tagline}</p>
        </div>
      </div>
      <EmployeeStatusBadge status={employee.status} />
    </div>
  )

  // Payment just went through (HR) or JEXA.AI is deploying it (Voice).
  if (employee.status === 'pending_activation') {
    return (
      <Card className="flex flex-col p-5">
        {header}
        <div className="mt-4 flex items-center gap-2.5 rounded-lg bg-info-50 px-3.5 py-3 text-info-700">
          <Loader2 className="size-4 shrink-0 animate-spin" />
          <p className="text-[13px] font-medium">
            {employee.type === 'voice' ? 'Being configured by JEXA.AI — deployment in progress.' : 'Activating — provisioning your AI Employee now.'}
          </p>
        </div>
      </Card>
    )
  }

  // Paused — subscription active but employee stopped taking new work.
  if (employee.status === 'paused') {
    return (
      <Card className="flex flex-col p-5">
        {header}
        <div className="mt-5 flex items-center gap-2 border-t border-ink-100 pt-4">
          <Button size="sm" icon={<Play className="size-3.5" />} onClick={() => onTogglePause?.(employee)}>
            Resume Employee
          </Button>
          <Link to="/app/settings?section=billing">
            <Button variant="outline" size="sm">Manage Subscription</Button>
          </Link>
        </div>
      </Card>
    )
  }

  // Past due — payment failed, access blocked until resolved.
  if (employee.status === 'past_due') {
    return (
      <Card className="flex flex-col p-5">
        {header}
        <p className="mt-3.5 text-[13px] text-ink-600">Your subscription payment needs attention.</p>
        <div className="mt-4 border-t border-ink-100 pt-4">
          <UpdatePaymentButton employee={employee} />
        </div>
      </Card>
    )
  }

  // Active — full operational card.
  const isHr = employee.type === 'hr'
  const isPaused = false

  return (
    <Card className="flex flex-col p-5">
      {header}

      {!compact && <p className="mt-3.5 text-[13.5px] leading-relaxed text-ink-600">{employee.description}</p>}

      <div className="mt-4 grid grid-cols-2 gap-3">
        {employee.kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg bg-ink-25 px-3 py-2.5">
            <p className="text-[17px] font-bold leading-none text-ink-900">{kpi.value}</p>
            <p className="mt-1 text-[11px] leading-tight text-ink-500">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-ink-400">
        <div className="flex items-center gap-2">
          {employee.channels.map((channel) => {
            const Icon = CHANNEL_ICON[channel]
            return (
              <span key={channel} className="flex items-center gap-1 rounded-full bg-ink-100 px-2 py-1 capitalize text-ink-600">
                <Icon className="size-3" />
                {channel}
              </span>
            )
          })}
        </div>
        <span>Active {formatRelativeTime(employee.lastActivityAt)}</span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
        {isHr && (
          <Link to={`${employeeHref}/candidates/upload`}>
            <Button variant="outline" size="sm" icon={<Upload className="size-3.5" />}>
              Upload Resumes
            </Button>
          </Link>
        )}
        <Link to={isHr ? `${employeeHref}/configuration` : `${employeeHref}/settings`}>
          <Button variant="ghost" size="sm" icon={<Settings2 className="size-3.5" />}>
            {isHr ? 'Configure' : 'Settings'}
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          icon={isPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          onClick={() => onTogglePause?.(employee)}
        >
          Pause
        </Button>
        <Link to={employeeHref} className="ml-auto">
          <Button size="sm" iconRight={<ArrowUpRight className="size-3.5" />}>
            Open
          </Button>
        </Link>
      </div>
    </Card>
  )
}

function UpdatePaymentButton({ employee }: { employee: AIEmployee }) {
  const [busy, setBusy] = useState(false)
  const { refetchEmployees } = useAppData()
  const { show } = useToast()

  async function updatePayment() {
    setBusy(true)
    await subscriptionService.updatePaymentMethod(employee.type)
    setBusy(false)
    refetchEmployees()
    show({ tone: 'success', title: 'Payment method updated', description: `${employee.name} is active again.` })
  }

  return (
    <Button variant="danger" size="sm" loading={busy} icon={<CreditCard className="size-3.5" />} iconRight={!busy ? <ArrowRight className="size-3.5" /> : undefined} onClick={updatePayment}>
      Update Payment
    </Button>
  )
}
