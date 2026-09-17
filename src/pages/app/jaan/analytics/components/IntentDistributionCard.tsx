import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip } from 'recharts'
import { ChartCard } from '@/components/ui/ChartCard'
import type { VoiceIntentRow } from '@/types'

const INTENT_COLORS = ['#c1121f', '#3b82f6', '#22c55e', '#eab308', '#14b8a6', '#a3a3a3']

interface IntentDistributionCardProps {
  rows: VoiceIntentRow[]
}

export function IntentDistributionCard({ rows }: IntentDistributionCardProps) {
  const data = rows.map((r) => ({ name: r.intent, value: r.calls }))

  return (
    <ChartCard title="Intent distribution" description="What customers are calling about">
      {data.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-ink-400">No intent data recorded yet.</p>
      ) : (
        <>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={INTENT_COLORS[i % INTENT_COLORS.length]} />
                  ))}
                </Pie>
                <RTooltip contentStyle={{ borderRadius: 10, border: '1px solid #262626', background: '#151515', color: '#f5f5f5', fontSize: 12.5 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
            {data.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-ink-600">
                <span className="size-2 rounded-full" style={{ backgroundColor: INTENT_COLORS[i % INTENT_COLORS.length] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </>
      )}
    </ChartCard>
  )
}
