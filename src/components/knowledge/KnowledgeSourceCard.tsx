import { FileText, Link2, Plug, Users, Mic } from 'lucide-react'
import type { KnowledgeSource } from '@/types'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'

const TYPE_ICON = { file: FileText, url: Link2, connected_source: Plug }
const STATUS_TONE: Record<KnowledgeSource['status'], BadgeTone> = { synced: 'success', syncing: 'info', failed: 'danger', stale: 'warning' }
const STATUS_LABEL: Record<KnowledgeSource['status'], string> = { synced: 'Synced', syncing: 'Syncing', failed: 'Failed', stale: 'Stale' }
const EMPLOYEE_ICON = { hr: Users, voice: Mic }

export function KnowledgeSourceCard({ source, onClick }: { source: KnowledgeSource; onClick?: () => void }) {
  const TypeIcon = TYPE_ICON[source.type]
  return (
    <button onClick={onClick} className="flex w-full items-start gap-3 rounded-xl border border-ink-200 bg-white p-4 text-left transition-colors duration-150 hover:border-brand-300 hover:bg-brand-50/30">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <TypeIcon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-[13.5px] font-semibold text-ink-900">{source.name}</p>
          <Badge tone={STATUS_TONE[source.status]} dot>{STATUS_LABEL[source.status]}</Badge>
        </div>
        <p className="mt-0.5 text-xs text-ink-500">{source.owner} · {source.documentCount} documents</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-ink-400">{source.freshnessLabel}</span>
          <div className="flex items-center gap-1">
            {source.employeeAccess.map((type) => {
              const Icon = EMPLOYEE_ICON[type]
              return (
                <span key={type} className="flex size-5 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                  <Icon className="size-3" />
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </button>
  )
}
