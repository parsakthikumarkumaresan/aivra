import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/ui/ChartCard'
import { PillTabs } from '@/components/ui/Tabs'
import { formatDate } from '@/utils/format'
import type { VoiceCallsOverTimePoint } from '@/types'

const SERIES: { key: keyof VoiceCallsOverTimePoint; label: string; color: string }[] = [
  { key: 'attempted', label: 'Attempted', color: '#c1121f' },
  { key: 'dialled', label: 'Dialled', color: '#3b82f6' },
  { key: 'connected', label: 'Connected', color: '#eab308' },
  { key: 'humanAnswered', label: 'Human answered', color: '#f97373' },
  { key: 'engaged', label: 'Engaged', color: '#22c55e' },
]

interface CallsOverTimeChartProps {
  points: VoiceCallsOverTimePoint[]
  bucket: string
}

export function CallsOverTimeChart({ points, bucket }: CallsOverTimeChartProps) {
  const [mode, setMode] = useState<'count' | 'pct'>('count')
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  const chartData = useMemo(() => {
    return points.map((p) => {
      const row: Record<string, string | number> = {
        bucketStart: p.bucketStart,
        label: formatDate(p.bucketStart, bucket === 'hour' ? 'h a' : bucket === 'week' ? 'MMM d' : 'MMM d'),
      }
      for (const s of SERIES) {
        const raw = p[s.key] as number
        row[s.key] = mode === 'pct' ? (p.attempted > 0 ? Math.round((raw / p.attempted) * 1000) / 10 : 0) : raw
      }
      return row
    })
  }, [points, mode, bucket])

  const toggleSeries = (key: string) => {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <ChartCard
      title="Calls over time"
      description={`Bucketed by ${bucket}`}
      actions={
        <PillTabs
          items={[
            { value: 'count', label: '#' },
            { value: 'pct', label: '%' },
          ]}
          value={mode}
          onChange={(v) => setMode(v as 'count' | 'pct')}
        />
      }
    >
      <div className="mb-3 flex flex-wrap gap-3">
        {SERIES.map((s) => (
          <button
            key={s.key}
            onClick={() => toggleSeries(s.key)}
            className={`flex items-center gap-1.5 text-xs font-medium ${hidden.has(s.key) ? 'text-ink-500 opacity-50' : 'text-ink-700'}`}
          >
            <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </button>
        ))}
      </div>
      {points.length === 0 ? (
        <p className="py-16 text-center text-[13px] text-ink-400">No calls in this range.</p>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={{ stroke: '#262626' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#a3a3a3' }} axisLine={false} tickLine={false} allowDecimals={mode === 'pct'} />
              <RTooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #262626', background: '#151515', color: '#f5f5f5', fontSize: 12.5 }}
                formatter={(value, name) => [mode === 'pct' ? `${value}%` : value, name]}
              />
              {SERIES.filter((s) => !hidden.has(s.key)).map((s) => (
                <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={points.length <= 14} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  )
}
