import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'
import type { JdMatchBreakdown } from '@/types'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'

const LABEL_TONE: Record<JdMatchBreakdown['matchLabel'], BadgeTone> = {
  'Strong Match': 'success',
  'Good Match': 'brand',
  'Moderate Match': 'warning',
  'Weak Match': 'danger',
}

export function JdMatchCard({ match, jobTitle }: { match: JdMatchBreakdown; jobTitle: string }) {
  return (
    <Card>
      <CardHeader title="JD Match" description={`Assessed against ${jobTitle}`} />
      <CardBody className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex size-16 shrink-0 items-center justify-center">
            <svg width={64} height={64} className="-rotate-90">
              <circle cx={32} cy={32} r={27} strokeWidth={5} fill="none" className="stroke-ink-100" />
              <circle
                cx={32} cy={32} r={27} strokeWidth={5} fill="none"
                stroke={match.overallScore >= 85 ? '#178350' : match.overallScore >= 70 ? '#6D3EF2' : match.overallScore >= 50 ? '#c8850c' : '#d33d3d'}
                strokeDasharray={2 * Math.PI * 27}
                strokeDashoffset={2 * Math.PI * 27 * (1 - match.overallScore / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[17px] font-bold text-ink-900">{match.overallScore}%</span>
          </div>
          <div>
            <Badge tone={LABEL_TONE[match.matchLabel]}>{match.matchLabel}</Badge>
            <p className="mt-1.5 text-xs text-ink-500">Overall JD match score</p>
          </div>
        </div>

        <div className="space-y-2.5">
          <MatchRow label="Skills Match" value={match.skillsMatch} />
          <MatchRow label="Experience Match" value={match.experienceMatch} />
          <MatchRow label="Education Match" value={match.educationMatch} />
          <MatchRow label="Role Relevance" value={match.roleRelevance} />
        </div>

        {match.matchedSkills.length > 0 && (
          <div>
            <p className="mb-2 text-[13px] font-semibold text-ink-800">Required Skills</p>
            <div className="space-y-2">
              {match.matchedSkills.map((s) => (
                <div key={s.skill} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-xs text-ink-600">{s.skill}</span>
                  <ProgressBar value={s.matchPercent} tone={s.matchPercent >= 75 ? 'success' : s.matchPercent >= 50 ? 'warning' : 'danger'} />
                  <span className="w-9 shrink-0 text-right text-xs font-semibold text-ink-700">{s.matchPercent}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          {match.strengths.map((s, i) => (
            <p key={i} className="flex items-start gap-2 text-[13px] text-ink-700">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success-600" />
              {s}
            </p>
          ))}
        </div>
        <div className="space-y-1.5">
          {match.gaps.map((g, i) => (
            <p key={i} className="flex items-start gap-2 text-[13px] text-ink-700">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning-600" />
              {g}
            </p>
          ))}
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-ink-25 px-3 py-2.5 text-[12px] leading-relaxed text-ink-500">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-ink-400" />
          AI-generated candidate assessment. Final hiring decisions remain with authorized HR personnel.
        </div>
      </CardBody>
    </Card>
  )
}

function MatchRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-xs text-ink-600">{label}</span>
      <ProgressBar value={value} tone={value >= 75 ? 'success' : value >= 50 ? 'warning' : 'danger'} />
      <span className="w-9 shrink-0 text-right text-xs font-semibold text-ink-700">{value}%</span>
    </div>
  )
}
