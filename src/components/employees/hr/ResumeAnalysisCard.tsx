import { FileText, GraduationCap, Award, Briefcase, ScanText } from 'lucide-react'
import type { ExtractedResumeProfile } from '@/types'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime } from '@/utils/format'

export function ResumeAnalysisCard({ profile }: { profile: ExtractedResumeProfile }) {
  return (
    <Card>
      <CardHeader
        title="Resume Analysis"
        description={
          <span className="flex items-center gap-1.5">
            <ScanText className="size-3.5" />
            Extracted from {profile.fileName} · parsed {formatDateTime(profile.parsedAt)}
          </span>
        }
      />
      <CardBody className="space-y-4">
        <p className="text-[13.5px] leading-relaxed text-ink-700">{profile.summary}</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Experience" value={`${profile.yearsExperience} yrs`} />
          <Stat label="Companies" value={String(profile.previousCompanies.length)} />
          <Stat label="Skills Found" value={String(profile.skills.length)} />
          <Stat label="Certifications" value={String(profile.certifications.length)} />
        </div>

        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink-800">
            <FileText className="size-3.5 text-ink-400" />
            Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <Badge key={skill} tone="brand">{skill}</Badge>
            ))}
          </div>
        </div>

        {profile.technicalSkills.length > 0 && (
          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-ink-800">Technical Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.technicalSkills.map((skill) => (
                <Badge key={skill} tone="neutral">{skill}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink-800">
              <GraduationCap className="size-3.5 text-ink-400" />
              Education
            </p>
            {profile.education.length === 0 ? (
              <p className="text-xs text-ink-400">None found</p>
            ) : (
              profile.education.map((e, i) => (
                <p key={i} className="text-[13px] text-ink-600">{e.degree} — {e.institution}</p>
              ))
            )}
          </div>
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink-800">
              <Briefcase className="size-3.5 text-ink-400" />
              Previous Companies
            </p>
            {profile.previousCompanies.length === 0 ? (
              <p className="text-xs text-ink-400">None found</p>
            ) : (
              <p className="text-[13px] text-ink-600">{profile.previousCompanies.join(', ')}</p>
            )}
          </div>
        </div>

        {profile.certifications.length > 0 && (
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink-800">
              <Award className="size-3.5 text-ink-400" />
              Certifications
            </p>
            <p className="text-[13px] text-ink-600">{profile.certifications.join(', ')}</p>
          </div>
        )}

        {profile.projects.length > 0 && (
          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-ink-800">Projects</p>
            <ul className="space-y-1">
              {profile.projects.map((p, i) => (
                <li key={i} className="text-[13px] text-ink-600">• {p}</li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink-25 px-3 py-2.5">
      <p className="text-[17px] font-bold leading-none text-ink-900">{value}</p>
      <p className="mt-1 text-[11px] leading-tight text-ink-500">{label}</p>
    </div>
  )
}
