import { Card } from '@/components/ui/Card'
import type { VoiceCallDurationStats } from '@/types'

function seconds(value: number): string {
  return `${Math.round(value)}s`
}

interface CallDurationCardProps {
  stats: VoiceCallDurationStats
}

export function CallDurationCard({ stats }: CallDurationCardProps) {
  return (
    <Card className="p-5">
      <h3 className="text-[15px] font-semibold text-ink-900">Call duration</h3>
      <p className="mt-1 text-[13px] text-ink-500">
        <span className="font-semibold text-ink-800">{stats.humanAnsweredCalls}</span> human-answered calls
      </p>
      {stats.humanAnsweredCalls === 0 ? (
        <p className="mt-6 text-center text-[13px] text-ink-400">No human-answered calls in this range yet.</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs font-medium text-ink-500">Average</p>
            <p className="mt-1 text-[20px] font-bold text-ink-900">{seconds(stats.averageSeconds)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-ink-500">Median (p50)</p>
            <p className="mt-1 text-[20px] font-bold text-ink-900">{seconds(stats.medianSeconds)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-ink-500">p90</p>
            <p className="mt-1 text-[20px] font-bold text-ink-900">{seconds(stats.p90Seconds)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-ink-500">Longest</p>
            <p className="mt-1 text-[20px] font-bold text-ink-900">{seconds(stats.longestSeconds)}</p>
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-ink-400">
        Median and p90 are computed with PostgreSQL's percentile_cont — a real percentile, not an estimate from the average.
      </p>
    </Card>
  )
}
