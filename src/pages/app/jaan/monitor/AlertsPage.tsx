import { Bell } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useAlertRules } from '@/hooks/useJaan'
import { jaanMonitorService } from '@/services/api'
import { useToast } from '@/hooks/useToast'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { ALERT_CATEGORY_LABEL } from '@/types'
import { formatDateTime } from '@/utils/format'

export default function AlertsPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Monitor & QA' }, { label: 'Alerts' }])
  const alerts = useAlertRules()
  const { show } = useToast()

  async function toggle(id: string, enabled: boolean) {
    await jaanMonitorService.toggleAlertRule(id, enabled)
    alerts.refetch()
    show({ tone: 'success', title: enabled ? 'Alert enabled' : 'Alert disabled' })
  }

  return (
    <div className="mx-auto max-w-[1000px] space-y-5 p-6">
      <PageHeader title="Alerts" description="Get notified about latency spikes, failures, tool errors and spend." />
      {(alerts.data ?? []).length === 0 ? (
        <EmptyState icon={<Bell className="size-6" />} title="No alert rules yet" description="Set up alerts for high latency, failures or spend spikes." />
      ) : (
        <Card>
          <div className="divide-y divide-ink-100">
            {(alerts.data ?? []).map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div>
                  <p className="text-[13px] font-medium text-ink-800">{a.label} <span className="ml-1.5 rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">{ALERT_CATEGORY_LABEL[a.category]}</span></p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {a.thresholdLabel} · via {a.channel}
                    {a.lastTriggeredAt && ` · last triggered ${formatDateTime(a.lastTriggeredAt)}`}
                  </p>
                </div>
                <Switch checked={a.enabled} onChange={(v) => toggle(a.id, v)} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
