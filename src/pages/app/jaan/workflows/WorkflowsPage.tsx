import { useState } from 'react'
import { Workflow as WorkflowIcon, Plus, ArrowRight } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useWorkflows } from '@/hooks/useJaan'
import { jaanWorkflowsService } from '@/services/api'
import { useToast } from '@/hooks/useToast'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { WORKFLOW_NODE_TYPE_LABEL } from '@/types'
import type { WorkflowStatus } from '@/types'
import { formatDateTime } from '@/utils/format'

const STATUS_TONE: Record<WorkflowStatus, BadgeTone> = { active: 'success', paused: 'neutral', draft: 'neutral' }

export default function WorkflowsPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Workflows' }])
  const workflows = useWorkflows()
  const { show } = useToast()
  const [expanded, setExpanded] = useState<string | null>(null)

  async function toggleStatus(id: string, active: boolean) {
    await jaanWorkflowsService.setWorkflowStatus(id, active ? 'active' : 'paused')
    workflows.refetch()
    show({ tone: 'success', title: active ? 'Workflow activated' : 'Workflow paused' })
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-5 p-6">
      <PageHeader
        title={<span className="flex items-center gap-2">Workflows <Badge tone="info">Beta</Badge></span>}
        description="Automate what happens before, during and after a call — triggers, conditions and actions."
        actions={<Button icon={<Plus className="size-3.5" />}>Create Workflow</Button>}
      />

      {workflows.loading ? (
        <div className="space-y-3"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>
      ) : (workflows.data ?? []).length === 0 ? (
        <EmptyState icon={<WorkflowIcon className="size-6" />} title="No workflows yet" description="Automate a follow-up, escalation or report using a workflow." action={<Button icon={<Plus className="size-4" />}>Create Workflow</Button>} />
      ) : (
        <div className="space-y-3">
          {(workflows.data ?? []).map((w) => (
            <Card key={w.id}>
              <CardHeader
                title={w.name}
                description={w.description}
                actions={
                  <div className="flex items-center gap-3">
                    <Badge tone={STATUS_TONE[w.status]} dot>{w.status}</Badge>
                    <Switch checked={w.status === 'active'} onChange={(v) => toggleStatus(w.id, v)} />
                  </div>
                }
              />
              <CardBody>
                <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">Trigger</p>
                <p className="mt-0.5 text-[13px] text-ink-700">{w.triggerLabel}</p>
                <button onClick={() => setExpanded(expanded === w.id ? null : w.id)} className="mt-3 text-[12.5px] font-medium text-brand-600 hover:text-brand-700">
                  {expanded === w.id ? 'Hide steps' : `View ${w.nodes.length} steps`}
                </button>
                {expanded === w.id && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {w.nodes.map((n, i) => (
                      <div key={n.id} className="flex items-center gap-2">
                        <span className="rounded-lg border border-ink-200 bg-ink-25 px-3 py-2 text-[12.5px]">
                          <span className="block font-semibold text-ink-800">{n.name}</span>
                          <span className="block text-[10.5px] text-ink-500">{WORKFLOW_NODE_TYPE_LABEL[n.type]}</span>
                        </span>
                        {i < w.nodes.length - 1 && <ArrowRight className="size-3.5 shrink-0 text-ink-400" />}
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs text-ink-400">{w.runsCount} runs{w.lastRunAt ? ` · last run ${formatDateTime(w.lastRunAt)}` : ''}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
