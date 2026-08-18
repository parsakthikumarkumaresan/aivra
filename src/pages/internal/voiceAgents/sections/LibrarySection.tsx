import { Link } from 'react-router-dom'
import { BookOpen, ExternalLink } from 'lucide-react'
import type { SectionProps } from '../BuilderTypes'
import { useKnowledgeSources } from '@/hooks/useKnowledge'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatRelativeTime } from '@/utils/format'

const STATUS_TONE = { synced: 'success', syncing: 'info', failed: 'danger', stale: 'warning' } as const

export default function LibrarySection({ agent, patch }: SectionProps) {
  const sources = useKnowledgeSources()
  const included = agent.library.knowledgeSourceIds

  function toggle(id: string, checked: boolean) {
    const knowledgeSourceIds = checked ? [...included, id] : included.filter((x) => x !== id)
    patch('library', { knowledgeSourceIds })
  }

  const voiceEligible = (sources.data ?? []).filter((s) => s.employeeAccess.includes('voice'))

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Knowledge Library"
          description="Sources this agent can retrieve from. Shared with Company Brain — manage documents and sync there."
          actions={
            <Link to="/app/knowledge">
              <Button variant="outline" size="sm" iconRight={<ExternalLink className="size-3.5" />}>Open Company Brain</Button>
            </Link>
          }
        />
        {sources.loading ? (
          <CardBody><Skeleton className="h-40 w-full" /></CardBody>
        ) : voiceEligible.length === 0 ? (
          <CardBody><EmptyState compact icon={<BookOpen className="size-6" />} title="No voice-eligible sources" description="Add a source in Company Brain and scope it to the Voice employee to use it here." /></CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {voiceEligible.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                <Checkbox checked={included.includes(s.id)} onChange={(v) => toggle(s.id, v)} id={`lib-${s.id}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-ink-800">{s.name}</p>
                  <p className="text-xs text-ink-500">{s.documentCount} documents · Synced {formatRelativeTime(s.lastSyncAt)}</p>
                </div>
                <Badge tone={STATUS_TONE[s.status]} dot className="capitalize">{s.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Included in this agent" description={`${included.length} of ${voiceEligible.length} available sources`} />
        <CardBody className="flex flex-wrap gap-2">
          {included.length === 0 ? (
            <p className="text-[13px] text-ink-500">No sources selected — the agent will have no knowledge to retrieve from.</p>
          ) : (
            included.map((id) => {
              const s = voiceEligible.find((x) => x.id === id)
              return s ? <Badge key={id} tone="brand">{s.name}</Badge> : null
            })
          )}
        </CardBody>
      </Card>
    </div>
  )
}
