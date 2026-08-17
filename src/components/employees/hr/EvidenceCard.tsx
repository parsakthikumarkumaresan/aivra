import { Quote } from 'lucide-react'
import type { CriterionEvidence } from '@/types'
import { ScoreRing } from '@/components/ui/ProgressBar'

export function EvidenceCard({ evidence }: { evidence: CriterionEvidence }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-[13.5px] font-semibold text-ink-900">{evidence.criterionLabel}</h4>
        <ScoreRing value={evidence.score} size={36} />
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-600">{evidence.evidence}</p>
      {evidence.sourceExcerpt && (
        <div className="mt-3 flex gap-2 rounded-lg bg-ink-25 p-3">
          <Quote className="mt-0.5 size-3.5 shrink-0 text-ink-400" />
          <p className="text-[12.5px] italic leading-relaxed text-ink-500">{evidence.sourceExcerpt}</p>
        </div>
      )}
    </div>
  )
}
