import { Sparkles } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import type { SectionMeta } from '@/pages/internal/voiceAgents/builderConfig'

export function BuilderGuidePanel({ section }: { section: SectionMeta }) {
  return (
    <Card className="h-fit xl:sticky xl:top-6">
      <CardBody className="space-y-3">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-ink-900">
          <Sparkles className="size-3.5 text-brand-600" />
          Guide
        </div>
        <p className="text-[13px] font-medium text-ink-800">{section.guideTitle}</p>
        <ul className="space-y-2.5">
          {section.guideBody.map((line) => (
            <li key={line} className="text-[12.5px] leading-relaxed text-ink-500">{line}</li>
          ))}
        </ul>
        {section.internalOnly && (
          <p className="rounded-lg bg-warning-50 px-2.5 py-2 text-[11.5px] font-medium text-warning-700">
            AIVRA internal — never exposed to customers.
          </p>
        )}
      </CardBody>
    </Card>
  )
}
