import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts'
import {
  Users,
  CheckSquare,
  MessagesSquare,
  Clock,
  PhoneMissed,
  PlugZap,
  AlertTriangle,
  Brain,
  Mic,
  UploadCloud,
  Plug,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useAppData } from '@/app/AppDataProvider'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useDashboardKpis, useActivityChart, useNeedsAttention, useRecentActivity } from '@/hooks/useDashboard'
import { PageHeader } from '@/components/ui/PageHeader'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { PillTabs } from '@/components/ui/Tabs'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { ActivityItem } from '@/components/ui/ActivityItem'
import { Button } from '@/components/ui/Button'
import { EmployeeCard } from '@/components/employees/EmployeeCard'
import { Reveal } from '@/components/ui/Reveal'
import { formatDate } from '@/utils/format'

const ATTENTION_CONFIG = {
  escalation: { icon: PhoneMissed, tone: 'danger' as const },
  integration: { icon: PlugZap, tone: 'warning' as const },
  approval: { icon: CheckSquare, tone: 'warning' as const },
  warning: { icon: AlertTriangle, tone: 'neutral' as const },
}

const QUICK_ACTIONS = [
  { label: 'Upload Resumes', description: 'Add candidates for AI screening', icon: UploadCloud, href: '/app/employees/hr/candidates/upload', requiresType: 'hr' as const },
  { label: 'Open Jaan', description: 'Manage your Jaan voice agents', icon: Mic, href: '/app/jaan', requiresType: 'voice' as const },
  { label: 'Upload Knowledge', description: 'Add a file, URL or connected source', icon: Brain, href: '/app/knowledge', requiresType: undefined },
  { label: 'Connect Integration', description: 'Calendar, CRM, telephony and more', icon: Plug, href: '/app/integrations', requiresType: undefined },
]

export default function DashboardPage() {
  useSetBreadcrumbs([{ label: 'Dashboard' }])
  const { currentUser, organization, employees, loading: appLoading } = useAppData()
  const kpis = useDashboardKpis()
  const chart = useActivityChart()
  const attention = useNeedsAttention()
  const activity = useRecentActivity()

  // "My AI Workforce" — only employees actually provisioned to this
  // customer's account. Discovering and hiring new ones happens on the
  // public JEXA.AI website, not inside the authenticated dashboard.
  const workforce = employees.filter((e) => !['not_hired', 'cancelled', 'expired'].includes(e.status))
  const activeCount = employees.filter((e) => e.status === 'active').length
  const activeTypes = new Set(employees.filter((e) => e.status === 'active').map((e) => e.type))
  const quickActions = QUICK_ACTIONS.filter((a) => !a.requiresType || workforce.some((e) => e.type === a.requiresType))
  // Keep the feed general: an item calling out a specific AI Employee (e.g.
  // Jaan) only belongs here for accounts that actually have that employee active.
  const attentionData = attention.data?.filter((item) => !item.employeeType || activeTypes.has(item.employeeType))
  const activityData = activity.data?.filter((event) => !event.employeeType || activeTypes.has(event.employeeType))

  if (!appLoading && workforce.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center">
        <EmptyState
          icon={<Sparkles className="size-6" />}
          title={`Welcome to JEXA.AI, ${currentUser?.name?.split(' ')[0] ?? 'there'}`}
          description="Build your AI workforce. You haven't added an AI Employee to your workforce yet — discover what JEXA.AI offers on our website."
          action={
            <Link to="/">
              <Button icon={<Sparkles className="size-4" />}>Explore AI Employees</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good morning, ${currentUser?.name?.split(' ')[0] ?? ''}`}
        description={`Here's what's happening across ${organization?.name ?? 'your organization'}'s AI workforce today.`}
      />

      {/* KPI row */}
      {kpis.loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px] rounded-xl" />
          ))}
        </div>
      ) : kpis.error ? (
        <ErrorState compact onRetry={kpis.refetch} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.data?.map((kpi) => (
            <KpiCard
              key={kpi.id}
              label={kpi.label}
              value={kpi.id === 'active_employees' ? String(activeCount) : kpi.value}
              tooltip={kpi.tooltip}
              trend={kpi.id === 'active_employees' ? undefined : kpi.trend}
              trendGood={kpi.id === 'pending_approvals' ? 'down' : 'up'}
              icon={
                kpi.id === 'active_employees' ? <Users className="size-4" /> :
                kpi.id === 'tasks_completed' ? <CheckSquare className="size-4" /> :
                kpi.id === 'conversations' ? <MessagesSquare className="size-4" /> :
                <Clock className="size-4" />
              }
            />
          ))}
        </div>
      )}

      {/* My AI Workforce */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-ink-900">My AI Workforce</h2>
          <Link to="/app/employees" className="flex items-center gap-1 text-[13px] font-medium text-brand-600 hover:text-brand-700">
            View all <ChevronRight className="size-3.5" />
          </Link>
        </div>
        {appLoading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {workforce.map((employee, i) => (
              <Reveal key={employee.id} delay={i * 70}>
                <EmployeeCard employee={employee} compact />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* Activity + Needs Attention */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-ink-900">Activity Overview</h3>
              <p className="mt-0.5 text-[13px] text-ink-500">Tasks completed and conversations handled</p>
            </div>
            <PillTabs
              items={[
                { value: '7d', label: '7 Days' },
                { value: '30d', label: '30 Days' },
              ]}
              value={chart.range}
              onChange={(v) => chart.setRange(v as '7d' | '30d')}
            />
          </div>
          <div className="mt-4 h-64">
            {chart.loading ? (
              <Skeleton className="h-full w-full" />
            ) : chart.error ? (
              <ErrorState compact onRetry={chart.refetch} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart.data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="taskFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c1121f" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#c1121f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#262626" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) => formatDate(v, chart.range === '7d' ? 'EEE' : 'MMM d')}
                    tick={{ fontSize: 11, fill: '#a3a3a3' }}
                    axisLine={false}
                    tickLine={false}
                    interval={chart.range === '30d' ? 4 : 0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} width={40} />
                  <RTooltip
                    labelFormatter={(v) => (typeof v === 'string' ? formatDate(v, 'MMM d, yyyy') : v)}
                    contentStyle={{ borderRadius: 10, border: '1px solid #262626', background: '#151515', color: '#f5f5f5', fontSize: 12.5 }}
                  />
                  <Area type="monotone" dataKey="value" name="Tasks Completed" stroke="#c1121f" strokeWidth={2.25} fill="url(#taskFill)" />
                  <Area type="monotone" dataKey="secondaryValue" name="Conversations" stroke="#a3a3a3" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        </Reveal>

        <Reveal delay={100}>
        <Card className="flex flex-col h-full">
          <CardHeader title="Needs Attention" description="Escalations, failures and approvals" />
          <CardBody className="flex-1 space-y-1 p-2">
            {attention.loading ? (
              <div className="space-y-3 p-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : attentionData?.length === 0 ? (
              <EmptyState compact title="All clear" description="Nothing needs your attention right now." />
            ) : (
              attentionData?.map((item, i) => {
                const config = ATTENTION_CONFIG[item.type]
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="row-fade-in block rounded-lg transition-colors duration-150 hover:bg-ink-50"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <ActivityItem icon={<config.icon className="size-4" />} tone={config.tone} title={item.title} description={item.description} timestamp={item.timestamp} />
                  </Link>
                )
              })
            )}
          </CardBody>
        </Card>
        </Reveal>
      </div>

      {/* Recent activity + quick actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
        <Card>
          <CardHeader title="Recent Activity" description="Latest events across your AI workforce" />
          <CardBody className="space-y-1 p-2">
            {activity.loading ? (
              <div className="space-y-3 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              activityData?.map((event, i) => (
                <Link
                  key={event.id}
                  to={event.href ?? '#'}
                  className="row-fade-in block rounded-lg transition-colors duration-150 hover:bg-ink-50"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <ActivityItem
                    icon={<Clock className="size-4" />}
                    tone={event.type.includes('escalat') || event.type.includes('failed') ? 'danger' : event.type.includes('approval') ? 'warning' : 'brand'}
                    title={event.title}
                    description={event.description}
                    timestamp={event.timestamp}
                  />
                </Link>
              ))
            )}
          </CardBody>
        </Card>
        </Reveal>

        <Reveal delay={100}>
        <Card>
          <CardHeader title="Quick Actions" />
          <CardBody className="space-y-2 p-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className="flex items-start gap-3 rounded-lg p-2.5 transition-colors duration-150 hover:bg-ink-50"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <action.icon className="size-4" />
                </span>
                <span>
                  <span className="block text-[13px] font-semibold text-ink-800">{action.label}</span>
                  <span className="block text-xs text-ink-500">{action.description}</span>
                </span>
              </Link>
            ))}
          </CardBody>
        </Card>
        </Reveal>
      </div>
    </div>
  )
}
