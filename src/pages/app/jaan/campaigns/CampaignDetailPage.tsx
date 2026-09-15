import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Pause, Play } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useCampaign, useCampaignSummary, useCampaignTasks } from '@/hooks/useJaan'
import { PageHeader } from '@/components/ui/PageHeader'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import type { DataTableColumn } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import type { CampaignTask } from '@/types'
import { CAMPAIGN_STATUS_LABEL } from '@/types'
import { formatDateTime, formatDuration } from '@/utils/format'

const TASK_STATUS_TONE: Record<CampaignTask['status'], BadgeTone> = { completed: 'success', connected: 'success', voicemail: 'info', failed: 'danger', pending: 'neutral', attempted: 'warning' }

export default function CampaignDetailPage() {
  const { id = '' } = useParams()
  const campaign = useCampaign(id)
  const summary = useCampaignSummary(id)
  const tasks = useCampaignTasks(id)
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Campaigns', href: '/app/jaan/campaigns' }, { label: campaign.data?.name ?? '…' }])

  if (campaign.loading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>
  if (!campaign.data) return <div className="p-6"><ErrorState title="Campaign not found" onRetry={campaign.refetch} /></div>

  const c = campaign.data
  const s = summary.data

  const columns: DataTableColumn<CampaignTask>[] = [
    { key: 'contact', header: 'Contact', render: (t) => <span className="font-medium text-ink-900">{t.contactName}</span> },
    { key: 'number', header: 'Number', render: (t) => <span className="font-mono text-[12.5px] text-ink-600">{t.contactNumber}</span> },
    { key: 'status', header: 'Status', render: (t) => <Badge tone={TASK_STATUS_TONE[t.status]} dot>{t.status}</Badge> },
    { key: 'attempts', header: 'Attempts', render: (t) => <span className="text-[13px] text-ink-600">{t.attempts}</span> },
    { key: 'duration', header: 'Duration', render: (t) => <span className="text-[13px] text-ink-600">{t.durationSeconds ? formatDuration(t.durationSeconds) : '—'}</span> },
    { key: 'last', header: 'Last Attempt', render: (t) => <span className="text-[13px] text-ink-500">{t.lastAttemptAt ? formatDateTime(t.lastAttemptAt) : '—'}</span> },
  ]

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-6">
      <Link to="/app/jaan/campaigns" className="flex w-fit items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" /> Campaigns
      </Link>
      <PageHeader
        title={c.name}
        description={`${c.agentName} · ${CAMPAIGN_STATUS_LABEL[c.status]}`}
        actions={
          c.status === 'running' ? <Button variant="outline" icon={<Pause className="size-3.5" />}>Pause</Button> : <Button icon={<Play className="size-3.5" />}>Start</Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        <KpiCard label="Total Contacts" value={String(c.totalContacts)} />
        <KpiCard label="Attempts" value={String(s?.attempts ?? 0)} />
        <KpiCard label="Connected" value={String(s?.connected ?? 0)} />
        <KpiCard label="Completed" value={String(s?.completed ?? 0)} />
        <KpiCard label="Failed" value={String(s?.failed ?? 0)} trendGood="down" />
        <KpiCard label="Voicemail" value={String(s?.voicemail ?? 0)} />
        <KpiCard label="Cost" value={`₹${(s?.cost ?? 0).toFixed(2)}`} />
      </div>

      <Card>
        <CardHeader title="Contacts" description="Call attempts for this campaign" />
        <DataTable columns={columns} data={tasks.data ?? []} keyExtractor={(t) => t.id} loading={tasks.loading} className="border-0" />
      </Card>
    </div>
  )
}
