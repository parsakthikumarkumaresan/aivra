import type { CriterionEvidence } from '@/types'
import { ScoreRing, ProgressBar } from '@/components/ui/ProgressBar'

interface CandidateScoreCardProps {
  overallScore: number | null
  evidence: CriterionEvidence[]
}

export function CandidateScoreCard({ overallScore, evidence }: CandidateScoreCardProps) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5">
      <div className="flex items-center gap-4">
        {overallScore !== null ? (
          <ScoreRing value={overallScore} size={56} />
        ) : (
          <span className="flex size-14 items-center justify-center rounded-full border border-dashed border-ink-300 text-xs text-ink-400">—</span>
        )}
        <div>
          <p className="text-[13px] font-medium text-ink-500">Overall Evidence Score</p>
          <p className="text-xs text-ink-400">{overallScore !== null ? 'Backed by resume and interview evidence below' : 'Awaiting AI screening'}</p>
        </div>
      </div>
      {evidence.length > 0 && (
        <div className="mt-4 space-y-2.5 border-t border-ink-100 pt-4">
          {evidence.map((e) => (
            <div key={e.criterionId} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-xs text-ink-600">{e.criterionLabel}</span>
              <ProgressBar value={e.score} tone={e.score >= 75 ? 'success' : e.score >= 50 ? 'warning' : 'danger'} />
              <span className="w-7 shrink-0 text-right text-xs font-semibold text-ink-700">{e.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
