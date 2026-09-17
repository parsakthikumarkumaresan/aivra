import { Card, CardHeader } from '@/components/ui/Card'
import { formatNumber, formatPercent } from '@/utils/format'
import type { VoiceVoicemailStats } from '@/types'

interface VoicemailCardProps {
  stats: VoiceVoicemailStats
}

export function VoicemailCard({ stats }: VoicemailCardProps) {
  return (
    <Card>
      <CardHeader title="Voicemail handling" />
      <div className="grid grid-cols-2 gap-4 px-5 py-4">
        <div>
          <p className="text-xs font-medium text-ink-500">Voicemail calls</p>
          <p className="mt-1 text-[22px] font-bold text-ink-900">{formatNumber(stats.voicemailCalls)}</p>
          <p className="text-xs text-ink-400">{formatPercent(stats.pctOfConnected, 1)} of connected</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-500">Duration spent</p>
          <p className="mt-1 text-[22px] font-bold text-ink-900">{Math.round(stats.durationSeconds)}s</p>
        </div>
      </div>
      <div className="border-t border-ink-100 px-5 py-4">
        {stats.voicemailCalls === 0 ? (
          <p className="text-[13px] text-ink-400">No voicemail calls in this range.</p>
        ) : null}
        <p className="mt-1.5 text-xs text-ink-400">{stats.description}</p>
      </div>
    </Card>
  )
}
