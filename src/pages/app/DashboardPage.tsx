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
  Settings2,
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
import { formatDate } from '@/utils/format'

const ATTENTION_CONFIG = {
  escalation: { icon: PhoneMissed, tone: 'danger' as const },
  integration: { icon: PlugZap, tone: 'warning' as const },
  approval: { icon: CheckSquare, tone: 'warning' as const },
  warning: { icon: AlertTriangle, tone: 'neutral' as const },
}

const QUICK_ACTIONS = [
  { label: 'Configure HR Employee', description: 'Update rubric, interview or scheduling', icon: Settings2, href: '/app/employees/hr/setup' },
  { label: 'Configure Voice Employee', description: 'Update business profile or capabilities', icon: Mic, href: '/app/employees/voice/setup' },
  { label: 'Upload Knowledge', description: 'Add a file, URL or connected source', icon: UploadCloud, href: '/app/knowledge' },
  { label: 'Connect Integration', description: 'Calendar, CRM, telephony and more', icon: Plug, href: '/app/integrations' },
]

export default function DashboardPage() {
  useSetBreadcrumbs([{ label: 'Dashboard' }])
  const { currentUser, organization, employees, loading: appLoading } = useAppData()
  const kpis = useDashboardKpis()
  const chart = useActivityChart()
  const attention = useNeedsAttention()
  const activity = useRecentActivity()

  if (!appLoading && employees.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center">
        <EmptyState
          icon={<Sparkles className="size-6" />}
          title={`Welcome to AIVRA, ${currentUser?.name?.split(' ')[0] ?? 'there'}`}
          description="Your AI workforce is empty. Deploy your first AI Employee to start screening candidates or handling customer calls."
          action={
            <Link to="/app/employees">
              <Button icon={<Sparkles className="size-4" />}>Deploy your first AI Employee</Button>
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
              value={kpi.value}
              tooltip={kpi.tooltip}
              trend={kpi.trend}
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

      {/* AI Employees */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-ink-900">Your AI Employees</h2>
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
            {employees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} compact />
            ))}
          </div>
        )}
      </div>

      {/* Activity + Needs Attention */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
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
                      <stop offset="0%" stopColor="#6D3EF2" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#6D3EF2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#eeeef3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) => formatDate(v, chart.range === '7d' ? 'EEE' : 'MMM d')}
                    tick={{ fontSize: 11, fill: '#9d9db3' }}
                    axisLine={false}
                    tickLine={false}
                    interval={chart.range === '30d' ? 4 : 0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#9d9db3' }} axisLine={false} tickLine={false} width={40} />
                  <RTooltip
                    labelFormatter={(v) => (typeof v === 'string' ? formatDate(v, 'MMM d, yyyy') : v)}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e0e0e9', fontSize: 12.5 }}
                  />
                  <Area type="monotone" dataKey="value" name="Tasks Completed" stroke="#6D3EF2" strokeWidth={2.25} fill="url(#taskFill)" />
                  <Area type="monotone" dataKey="secondaryValue" name="Conversations" stroke="#c7c7d6" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader title="Needs Attention" description="Escalations, failures and approvals" />
          <CardBody className="flex-1 space-y-1 p-2">
            {attention.loading ? (
              <div className="space-y-3 p-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : attention.data?.length === 0 ? (
              <EmptyState compact title="All clear" description="Nothing needs your attention right now." />
            ) : (
              attention.data?.map((item) => {
                const config = ATTENTION_CONFIG[item.type]
                return (
                  <Link key={item.id} to={item.href} className="block rounded-lg transition-colors duration-150 hover:bg-ink-50">
                    <ActivityItem icon={<config.icon className="size-4" />} tone={config.tone} title={item.title} description={item.description} timestamp={item.timestamp} />
                  </Link>
                )
              })
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent activity + quick actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent Activity" description="Latest events across your AI workforce" />
          <CardBody className="space-y-1 p-2">
            {activity.loading ? (
              <div className="space-y-3 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              activity.data?.map((event) => (
                <Link key={event.id} to={event.href ?? '#'} className="block rounded-lg transition-colors duration-150 hover:bg-ink-50">
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

        <Card>
          <CardHeader title="Quick Actions" />
          <CardBody className="space-y-2 p-3">
            {QUICK_ACTIONS.map((action) => (
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
      </div>
    </div>
  )
}
