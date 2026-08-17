import { Link } from 'react-router-dom'
import { Users, Mic, Settings2, FlaskConical, Pause, Play, ArrowUpRight, Phone, MessageSquare, Mail, Globe } from 'lucide-react'
import type { AIEmployee, Channel } from '@/types'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { EmployeeStatusBadge } from '@/components/ui/StatusBadge'
import { formatRelativeTime } from '@/utils/format'

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
  onTest?: (employee: AIEmployee) => void
  compact?: boolean
}

export function EmployeeCard({ employee, onTogglePause, onTest, compact = false }: EmployeeCardProps) {
  const TypeIcon = TYPE_ICON[employee.type]
  const employeeHref = `/app/employees/${employee.type}`
  const isPaused = employee.status === 'paused'

  return (
    <Card className="flex flex-col p-5">
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
        <Link to={`${employeeHref}/setup`}>
          <Button variant="outline" size="sm" icon={<Settings2 className="size-3.5" />}>
            Configure
          </Button>
        </Link>
        <Button variant="outline" size="sm" icon={<FlaskConical className="size-3.5" />} onClick={() => onTest?.(employee)}>
          Test
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={isPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          onClick={() => onTogglePause?.(employee)}
        >
          {isPaused ? 'Resume' : 'Pause'}
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
