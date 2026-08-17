import { useState } from 'react'
import { Plug, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useIntegrations } from '@/hooks/useIntegrations'
import { useToast } from '@/hooks/useToast'
import { integrationsService } from '@/services/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'
import { IntegrationCard } from '@/components/integrations/IntegrationCard'
import type { Integration, IntegrationCategory } from '@/types'

const CATEGORY_LABEL: Record<IntegrationCategory, string> = {
  calendar: 'Calendar', ats: 'ATS', crm: 'CRM', telephony: 'Telephony', email: 'Email', custom_api: 'Custom API',
}
const CATEGORY_ORDER: IntegrationCategory[] = ['calendar', 'ats', 'crm', 'telephony', 'email', 'custom_api']

export default function IntegrationsPage() {
  useSetBreadcrumbs([{ label: 'Integrations' }])
  const integrations = useIntegrations()
  const { show } = useToast()

  const [connectTarget, setConnectTarget] = useState<Integration | null>(null)
  const [disconnectTarget, setDisconnectTarget] = useState<Integration | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: (integrations.data ?? []).filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0)

  async function handleConnect() {
    if (!connectTarget) return
    setConnecting(true)
    setConnectError(null)
    const result = await integrationsService.connect(connectTarget.id)
    setConnecting(false)
    if (result.success) {
      setConnectTarget(null)
      show({ tone: 'success', title: `${connectTarget.name} connected`, description: 'Your AI Employees can now use this integration.' })
      integrations.refetch()
    } else {
      setConnectError(`Could not connect to ${connectTarget.name}. Check that you granted the requested permissions and try again.`)
    }
  }

  async function handleReconnect(integration: Integration) {
    await integrationsService.reconnect(integration.id)
    show({ tone: 'success', title: `${integration.name} reconnected` })
    integrations.refetch()
  }

  async function handleDisconnect() {
    if (!disconnectTarget) return
    await integrationsService.disconnect(disconnectTarget.id)
    show({ tone: 'info', title: `${disconnectTarget.name} disconnected` })
    setDisconnectTarget(null)
    integrations.refetch()
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={<Plug className="size-5" />} title="Integrations" description="Connect the business systems your AI Employees need to take real action." />

      {integrations.loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-7">
          {grouped.map((group) => (
            <div key={group.category}>
              <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-ink-500">{CATEGORY_LABEL[group.category]}</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onConnect={() => setConnectTarget(integration)}
                    onConfigure={() => show({ tone: 'info', title: 'Configuration', description: `Opening settings for ${integration.name}…` })}
                    onReconnect={() => handleReconnect(integration)}
                    onDisconnect={() => setDisconnectTarget(integration)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(connectTarget)}
        onClose={() => {
          setConnectTarget(null)
          setConnectError(null)
        }}
        title={`Connect ${connectTarget?.name ?? ''}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setConnectTarget(null)} disabled={connecting}>
              Cancel
            </Button>
            <Button onClick={handleConnect} loading={connecting}>
              Authorize & Connect
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-[13px] text-ink-600">{connectTarget?.description}</p>
          <div className="rounded-lg bg-ink-25 p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-ink-800">
              <ShieldCheck className="size-3.5 text-ink-400" />
              This will grant AIVRA permission to:
            </p>
            <ul className="space-y-1.5 pl-1 text-[13px] text-ink-600">
              <li>• Read and write records relevant to configured AI Employees</li>
              <li>• Sync data on a regular schedule to keep information current</li>
              <li>• Log every action taken through this integration for audit</li>
            </ul>
          </div>
          {connectError && (
            <div className="flex items-start gap-2 rounded-lg border border-danger-100 bg-danger-50 px-3.5 py-2.5 text-[13px] text-danger-700">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {connectError}
            </div>
          )}
          {!connectError && !connecting && (
            <div className="flex items-start gap-2 rounded-lg border border-success-100 bg-success-50 px-3.5 py-2.5 text-[13px] text-success-700">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              You'll be redirected to {connectTarget?.name} to authorize access, then returned here.
            </div>
          )}
        </div>
      </Modal>

      <ConfirmationDialog
        open={Boolean(disconnectTarget)}
        onClose={() => setDisconnectTarget(null)}
        onConfirm={handleDisconnect}
        destructive
        title={`Disconnect ${disconnectTarget?.name ?? ''}?`}
        description={`Any AI Employee using this integration will lose access immediately. ${disconnectTarget?.usedByEmployees.length ? 'This may interrupt live conversations.' : ''}`}
        confirmLabel="Disconnect"
      />
    </div>
  )
}
