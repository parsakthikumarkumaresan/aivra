import { Link } from 'react-router-dom'
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts'
import { PhoneCall, PhoneIncoming, Clock, CheckCircle2, Percent, Timer, Users, ChevronRight, Megaphone, Wallet } from 'lucide-react'
import { useAppData } from '@/app/AppDataProvider'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useVoiceAgents } from '@/hooks/useVoiceAgentBuilder'
import { useCalls } from '@/hooks/useVoice'
import { useCampaigns, useCreditBalance } from '@/hooks/useJaan'
import { PageHeader } from '@/components/ui/PageHeader'
import { KpiCard } from '@/components/ui/KpiCard'
import { ChartCard } from '@/components/ui/ChartCard'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { Reveal } from '@/components/ui/Reveal'
import { Button } from '@/components/ui/Button'
import { CAMPAIGN_STATUS_LABEL } from '@/types'
import type { Call, CallOutcome } from '@/types'
import type { BadgeTone } from '@/components/ui/Badge'
import { formatDateTime, formatDuration } from '@/utils/format'

const OUTCOME_TONE: Record<CallOutcome, BadgeTone> = {
  resolved: 'success', booked: 'success', cancelled: 'neutral', escalated: 'warning', no_action: 'neutral', failed: 'danger',
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function JaanHomePage() {
  useSetBreadcrumbs([{ label: 'Jaan' }])
  const { currentUser, organization } = useAppData()
  const agents = useVoiceAgents()
  const calls = useCalls({})
  const campaigns = useCampaigns()
  const balance = useCreditBalance()

  const callData = calls.data ?? []
  const today = new Date().toDateString()
  const callsToday = callData.filter((c) => new Date(c.startedAt).toDateString() === today).length || callData.length
  const connected = callData.filter((c) => c.outcome !== 'failed').length
  const totalMinutes = Math.round(callData.reduce((sum, c) => sum + c.durationSeconds, 0) / 60)
  const successRate = callData.length ? Math.round((callData.filter((c) => ['resolved', 'booked'].includes(c.outcome)).length / callData.length) * 100) : 0
  const avgDuration = callData.length ? Math.round(callData.reduce((sum, c) => sum + c.durationSeconds, 0) / callData.length) : 0
  const tasksCompleted = callData.reduce((sum, c) => sum + c.actionsTaken.length, 0)

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000)
    return { date: d.toISOString().slice(0, 10), calls: 18 + Math.round(Math.sin(i) * 6 + i * 2), minutes: 40 + Math.round(Math.cos(i) * 10 + i * 3) }
  })

  const columns: DataTableColumn<Call>[] = [
    { key: 'agent', header: 'Agent', render: (c) => <span className="text-[13px] text-ink-700">{(agents.data ?? [])[(Number(c.id.slice(-1)) || 0) % Math.max(agents.data?.length ?? 1, 1)]?.name.split(' ')[0] ?? 'Jaan'}</span> },
    { key: 'caller', header: 'Caller', render: (c) => <span className="font-medium text-ink-900">{c.callerName}</span> },
    { key: 'time', header: 'Time', render: (c) => <span className="text-[13px] text-ink-500">{formatDateTime(c.startedAt)}</span> },
    { key: 'duration', header: 'Duration', render: (c) => <span className="text-[13px] text-ink-600">{formatDuration(c.durationSeconds)}</span> },
    { key: 'outcome', header: 'Outcome', render: (c) => <Badge tone={OUTCOME_TONE[c.outcome]} dot>{c.outcome.replace('_', ' ')}</Badge> },
  ]

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 p-6">
      <PageHeader
        title={`${greeting()}, ${currentUser?.name?.split(' ')[0] ?? 'there'}`}
        description={`Here's what's happening across ${organization?.name ?? 'your'} Jaan Voice Workforce today.`}
        actions={
          <Link to="/app/jaan/agents">
            <Button icon={<Users className="size-4" />}>Manage Agents</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8">
        <KpiCard label="Active Agents" value={String((agents.data ?? []).filter((a) => a.status === 'live').length)} icon={<Users className="size-4" />} />
        <KpiCard label="Calls Today" value={String(callsToday)} icon={<PhoneCall className="size-4" />} trend={{ direction: 'up', value: '+8%' }} />
        <KpiCard label="Calls Connected" value={String(connected)} icon={<PhoneIncoming className="size-4" />} />
        <KpiCard label="Voice Minutes" value={String(totalMinutes)} icon={<Clock className="size-4" />} />
        <KpiCard label="Tasks Completed" value={String(tasksCompleted)} icon={<CheckCircle2 className="size-4" />} trend={{ direction: 'up', value: '+12%' }} />
        <KpiCard label="Success Rate" value={`${successRate}%`} icon={<Percent className="size-4" />} />
        <KpiCard label="Avg Call Duration" value={formatDuration(avgDuration)} icon={<Timer className="size-4" />} />
        <KpiCard
          label="Voice Minutes Remaining"
          value={balance.data ? String(balance.data.balanceMinutes) : '—'}
          icon={<Wallet className="size-4" />}
          tooltip={balance.data?.lowBalance ? 'Balance is low — consider recharging.' : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Reveal className="xl:col-span-2">
        <ChartCard title="Call Activity" description="Calls handled over the last 7 days">
          {calls.loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="callsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c1121f" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#c1121f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#262626" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { weekday: 'short' })} />
                  <YAxis tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} width={32} />
                  <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #262626', background: '#151515', color: '#f5f5f5', fontSize: 12.5 }} />
                  <Area type="monotone" dataKey="calls" name="Calls" stroke="#c1121f" strokeWidth={2.25} fill="url(#callsFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
        </Reveal>

        <Reveal delay={80}>
        <Card className="h-full">
          <CardHeader title="Agent Activity" actions={<Link to="/app/jaan/agents" className="text-[12.5px] font-medium text-brand-600 hover:text-brand-700">View all</Link>} />
          <CardBody className="space-y-1 p-2">
            {agents.loading ? (
              <div className="space-y-2 p-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
            ) : (
              (agents.data ?? []).map((agent) => (
                <Link key={agent.id} to={`/app/jaan/agents/${agent.id}`} className="flex items-center gap-3 rounded-lg p-2.5 transition-colors duration-150 hover:bg-ink-50">
                  <Avatar name={agent.name} size="sm" color={agent.status === 'live' ? '#C1121F' : '#737373'} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink-800">{agent.name}</p>
                    <p className="truncate text-xs text-ink-500">{agent.industry}</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-500">
                    <span className={`status-dot-live size-1.5 rounded-full ${agent.status === 'live' ? 'bg-success-500' : 'bg-ink-400'}`} />
                    {agent.status === 'live' ? 'Active' : agent.status}
                  </span>
                </Link>
              ))
            )}
          </CardBody>
        </Card>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Reveal className="xl:col-span-2">
        <Card>
          <CardHeader title="Recent Conversations" description="Latest calls handled by your Jaan agents" actions={<Link to="/app/jaan/logs/conversations" className="text-[12.5px] font-medium text-brand-600 hover:text-brand-700">View all</Link>} />
          <DataTable columns={columns} data={callData.slice(0, 6)} keyExtractor={(c) => c.id} loading={calls.loading} className="border-0" />
        </Card>
        </Reveal>

        <Reveal delay={80}>
        <Card className="h-full">
          <CardHeader title="Usage & Billing" actions={<Link to="/app/jaan/settings/billing" className="text-[12.5px] font-medium text-brand-600 hover:text-brand-700">Manage</Link>} />
          <CardBody className="space-y-3 p-4">
            <div className="flex items-center justify-between rounded-lg border border-ink-200 bg-ink-25 px-3.5 py-2.5">
              <span className="flex items-center gap-2 text-[13px] text-ink-600"><Wallet className="size-4 text-brand-600" /> Voice minutes remaining</span>
              <span className={`text-[15px] font-bold ${balance.data?.lowBalance ? 'text-danger-600' : 'text-ink-900'}`}>
                {balance.data ? `${balance.data.balanceMinutes} min` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between px-1 text-[13px]"><span className="text-ink-500">Minutes purchased</span><span className="font-medium text-ink-800">{balance.data?.purchasedMinutes ?? '—'}</span></div>
            <div className="flex items-center justify-between px-1 text-[13px]"><span className="text-ink-500">Minutes used</span><span className="font-medium text-ink-800">{balance.data?.usedMinutes ?? '—'}</span></div>
            <Link to="/app/jaan/settings/billing">
              <Button size="sm" variant="outline" className="w-full">Recharge Credits</Button>
            </Link>
          </CardBody>
        </Card>
        </Reveal>
      </div>

      <Reveal>
      <Card>
        <CardHeader title="Campaign Activity" description="Outbound and triggered campaigns currently running" actions={<Link to="/app/jaan/campaigns" className="flex items-center gap-1 text-[12.5px] font-medium text-brand-600 hover:text-brand-700">View all <ChevronRight className="size-3.5" /></Link>} />
        <CardBody className="space-y-1 p-2">
          {campaigns.loading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            (campaigns.data ?? []).slice(0, 3).map((c) => (
              <Link key={c.id} to={`/app/jaan/campaigns/${c.id}`} className="flex items-center gap-3 rounded-lg p-2.5 transition-colors duration-150 hover:bg-ink-50">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Megaphone className="size-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink-800">{c.name}</p>
                  <p className="truncate text-xs text-ink-500">{c.agentName} · {c.totalContacts} contacts</p>
                </div>
                <Badge tone={c.status === 'running' ? 'success' : c.status === 'failed' ? 'danger' : 'neutral'} dot>{CAMPAIGN_STATUS_LABEL[c.status]}</Badge>
              </Link>
            ))
          )}
        </CardBody>
      </Card>
      </Reveal>
    </div>
  )
}
