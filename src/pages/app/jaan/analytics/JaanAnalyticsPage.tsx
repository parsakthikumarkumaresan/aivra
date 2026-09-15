import { useMemo, useState } from 'react'
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts'
import { PhoneCall, PhoneMissed, Clock, CheckCircle2, ArrowRightLeft, Percent, IndianRupee, Gauge } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useCalls } from '@/hooks/useVoice'
import { useVoiceAgents } from '@/hooks/useVoiceAgentBuilder'
import { PageHeader } from '@/components/ui/PageHeader'
import { KpiCard } from '@/components/ui/KpiCard'
import { ChartCard } from '@/components/ui/ChartCard'
import { FilterBar, FilterSelect } from '@/components/ui/FilterBar'
import { Skeleton } from '@/components/ui/Skeleton'
import type { CallIntent } from '@/types'

const INTENT_LABEL: Record<CallIntent, string> = { faq: 'FAQ', booking: 'Booking', cancellation: 'Cancellation', status_lookup: 'Status Lookup', complaint: 'Complaint', unknown: 'Unknown' }
const INTENT_COLORS = ['#c1121f', '#3b82f6', '#22c55e', '#eab308', '#14b8a6', '#a3a3a3']

export default function JaanAnalyticsPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Analytics' }])
  const calls = useCalls({})
  const agents = useVoiceAgents()
  const [range, setRange] = useState('7d')

  const callData = calls.data ?? []
  const connected = callData.filter((c) => c.outcome !== 'failed').length
  const missed = callData.filter((c) => c.outcome === 'failed').length
  const totalMinutes = Math.round(callData.reduce((sum, c) => sum + c.durationSeconds, 0) / 60)
  const avgDuration = callData.length ? Math.round(callData.reduce((sum, c) => sum + c.durationSeconds, 0) / callData.length) : 0
  const successRate = callData.length ? Math.round((callData.filter((c) => ['resolved', 'booked'].includes(c.outcome)).length / callData.length) * 100) : 0
  const transferRate = callData.length ? Math.round((callData.filter((c) => c.escalated).length / callData.length) * 100) : 0
  const completionRate = callData.length ? Math.round((callData.filter((c) => c.outcome !== 'no_action' && c.outcome !== 'failed').length / callData.length) * 100) : 0

  const agentComparison = useMemo(
    () => (agents.data ?? []).map((a) => ({ name: a.name.split(' ')[0], calls: 20 + Math.round(Math.random() * 60), successRate: 70 + Math.round(Math.random() * 25) })),
    [agents.data],
  )

  const intentDistribution = useMemo(
    () => (Object.keys(INTENT_LABEL) as CallIntent[]).map((intent) => ({ name: INTENT_LABEL[intent], value: callData.filter((c) => c.intent === intent).length })).filter((d) => d.value > 0),
    [callData],
  )

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 p-6">
      <PageHeader title="Analytics" description="Performance across your entire Jaan Voice Workforce." />

      <FilterBar>
        <FilterSelect label="Range" value={range} options={[{ value: '7d', label: '7 Days' }, { value: '30d', label: '30 Days' }]} onChange={setRange} />
      </FilterBar>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-7">
        <KpiCard label="Calls" value={String(callData.length)} icon={<PhoneCall className="size-4" />} />
        <KpiCard label="Connected" value={String(connected)} icon={<CheckCircle2 className="size-4" />} />
        <KpiCard label="Missed" value={String(missed)} icon={<PhoneMissed className="size-4" />} trendGood="down" />
        <KpiCard label="Voice Minutes" value={String(totalMinutes)} icon={<Clock className="size-4" />} />
        <KpiCard label="Avg Duration" value={`${avgDuration}s`} icon={<Gauge className="size-4" />} />
        <KpiCard label="Success Rate" value={`${successRate}%`} icon={<Percent className="size-4" />} />
        <KpiCard label="Transfer Rate" value={`${transferRate}%`} icon={<ArrowRightLeft className="size-4" />} trendGood="down" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard title="Agent Comparison" description="Calls handled and success rate by agent" className="xl:col-span-2">
          {agents.loading ? <Skeleton className="h-72 w-full" /> : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentComparison} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#262626" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} width={32} />
                  <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #262626', background: '#151515', color: '#f5f5f5', fontSize: 12.5 }} />
                  <Bar dataKey="calls" name="Calls" fill="#c1121f" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Intent Distribution" description="What customers are calling about">
          {calls.loading ? <Skeleton className="h-72 w-full" /> : (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={intentDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                      {intentDistribution.map((_, i) => <Cell key={i} fill={INTENT_COLORS[i % INTENT_COLORS.length]} />)}
                    </Pie>
                    <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #262626', background: '#151515', color: '#f5f5f5', fontSize: 12.5 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                {intentDistribution.map((d, i) => (
                  <span key={d.name} className="flex items-center gap-1.5 text-xs text-ink-600">
                    <span className="size-2 rounded-full" style={{ backgroundColor: INTENT_COLORS[i % INTENT_COLORS.length] }} />
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
            </>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Completion Rate" value={`${completionRate}%`} icon={<CheckCircle2 className="size-4" />} />
        <KpiCard label="Estimated Cost" value="₹1,240" icon={<IndianRupee className="size-4" />} trendGood="down" />
        <KpiCard label="Tool Success Rate" value="94%" icon={<Gauge className="size-4" />} />
      </div>
    </div>
  )
}
