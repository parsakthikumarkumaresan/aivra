import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/ui/ChartCard'
import { formatPercent } from '@/utils/format'
import type { VoiceConnectRateResponse } from '@/types'

interface ConnectRateCardProps {
  data: VoiceConnectRateResponse
}

export function ConnectRateCard({ data }: ConnectRateCardProps) {
  const chartData = data.byAttempt.map((a) => ({
    attempt: `Attempt ${a.attemptNumber}`,
    connectRate: a.connectRate,
    dialled: a.dialled,
    connected: a.connected,
  }))

  return (
    <ChartCard title="Connect rate by attempt" description="Width = calls dialled; height = connect rate">
      <div className="mb-4">
        <span className="text-[28px] font-bold leading-none text-ink-900">{formatPercent(data.connectRate, 1)}</span>
        <p className="mt-1 text-[13px] text-ink-500">
          {data.connected} connected / {data.dialled} dialled
        </p>
      </div>
      {chartData.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-ink-400">No dialled calls in this range.</p>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="attempt" tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={{ stroke: '#262626' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
              <RTooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #262626', background: '#151515', color: '#f5f5f5', fontSize: 12.5 }}
                formatter={(value) => [`${value}%`, 'Connect rate']}
              />
              <Bar dataKey="connectRate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="mt-2 text-xs text-ink-400">Jaan does not yet retry unanswered calls — every call today is attempt #1.</p>
    </ChartCard>
  )
}
