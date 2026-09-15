import { ShieldCheck, ShieldOff } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useComplianceSettings } from '@/hooks/useTelephony'
import { telephonyService } from '@/services/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Field'
import type { ComplianceSetting } from '@/types'

export default function JaanCompliancePage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Telephony' }, { label: 'Compliance' }])
  const compliance = useComplianceSettings()

  async function toggle(setting: ComplianceSetting, enabled: boolean) {
    await telephonyService.toggleCompliance(setting.id, enabled)
    compliance.refetch()
  }

  return (
    <div className="mx-auto max-w-[1000px] space-y-5 p-6">
      <PageHeader title="Compliance" description="Recording consent, retention and regional call-handling requirements." />
      {compliance.loading ? (
        <Card><CardBody><p className="text-sm text-ink-500">Loading…</p></CardBody></Card>
      ) : (
        <Card>
          <div className="divide-y divide-ink-100">
            {(compliance.data ?? []).map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
                <div className="flex items-start gap-2.5">
                  {c.enabled ? <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success-600" /> : <ShieldOff className="mt-0.5 size-4 shrink-0 text-ink-400" />}
                  <div>
                    <p className="text-[13.5px] font-medium text-ink-800">{c.label} <Badge tone="neutral" className="ml-1.5">{c.region}</Badge></p>
                    <p className="text-xs text-ink-500">{c.description}</p>
                  </div>
                </div>
                <Switch checked={c.enabled} onChange={(v) => toggle(c, v)} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
