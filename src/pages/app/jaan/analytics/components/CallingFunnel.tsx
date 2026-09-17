import { Info } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/Tooltip'
import { formatNumber, formatPercent } from '@/utils/format'
import type { VoiceFunnelStage } from '@/types'

const STAGE_COLOR: Record<string, string> = {
  attempted: 'bg-brand-600',
  dialled: 'bg-info-500',
  connected: 'bg-warning-500',
  human_answered: 'bg-danger-500',
  engaged: 'bg-success-500',
}

interface CallingFunnelProps {
  stages: VoiceFunnelStage[]
}

export function CallingFunnel({ stages }: CallingFunnelProps) {
  return (
    <Card className="p-5">
      <h3 className="text-[15px] font-semibold text-ink-900">Calling funnel</h3>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stages.map((stage, i) => (
          <div key={stage.key} className="rounded-lg border border-ink-100 bg-ink-25 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
              <span>Stage {i + 1}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-ink-800">
              {stage.label}
              <Tooltip content={stage.description}>
                <Info className="size-3 text-ink-400" />
              </Tooltip>
            </div>
            <div className="mt-2 text-[24px] font-bold leading-none text-ink-900">{formatNumber(stage.count)}</div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
              <div
                className={`h-full rounded-full ${STAGE_COLOR[stage.key] ?? 'bg-brand-600'}`}
                style={{ width: `${Math.min(100, stage.pctOfAttempted)}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-ink-500">{formatPercent(stage.pctOfAttempted, 1)} of attempted</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
