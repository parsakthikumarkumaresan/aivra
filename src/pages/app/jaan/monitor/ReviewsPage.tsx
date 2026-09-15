import { ClipboardCheck } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useReviews } from '@/hooks/useJaan'
import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Review, ReviewVerdict } from '@/types'
import { formatDateTime } from '@/utils/format'

const VERDICT_TONE: Record<ReviewVerdict, BadgeTone> = { pass: 'success', fail: 'danger', pending: 'neutral' }

export default function ReviewsPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Monitor & QA' }, { label: 'Reviews' }])
  const reviews = useReviews()

  const columns: DataTableColumn<Review>[] = [
    { key: 'conv', header: 'Conversation', render: (r) => <span className="font-mono text-[12.5px] text-ink-700">{r.conversationId}</span> },
    { key: 'agent', header: 'Agent', render: (r) => <span className="text-[13px] text-ink-700">{r.agentName}</span> },
    { key: 'reviewer', header: 'Reviewer', render: (r) => <span className="text-[13px] text-ink-600">{r.reviewerName}</span> },
    { key: 'score', header: 'Score', render: (r) => <span className="text-[13px] font-medium text-ink-800">{r.verdict === 'pending' ? '—' : r.score}</span> },
    { key: 'tags', header: 'Tags', render: (r) => <div className="flex flex-wrap gap-1">{r.tags.map((t) => <span key={t} className="rounded-full bg-ink-100 px-2 py-0.5 text-[10.5px] text-ink-600">{t}</span>)}</div> },
    { key: 'verdict', header: 'Verdict', render: (r) => <Badge tone={VERDICT_TONE[r.verdict]} dot>{r.verdict}</Badge> },
    { key: 'when', header: 'Reviewed', render: (r) => <span className="text-[13px] text-ink-500">{r.reviewedAt ? formatDateTime(r.reviewedAt) : 'Not yet'}</span> },
  ]

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 p-6">
      <PageHeader title="Reviews" description="Human QA review of conversations — score, tag and pass/fail agent behavior." />
      <DataTable
        columns={columns}
        data={reviews.data ?? []}
        keyExtractor={(r) => r.id}
        loading={reviews.loading}
        emptyState={<EmptyState icon={<ClipboardCheck className="size-6" />} title="No reviews yet" description="Queue conversations for human review to build a quality baseline." />}
      />
    </div>
  )
}
