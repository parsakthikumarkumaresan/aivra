import { Users, Mic, Settings2, Plug, RefreshCw, Unlink } from 'lucide-react'
import type { Integration } from '@/types'
import { Card, CardBody } from '@/components/ui/Card'
import { IntegrationStatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/utils/format'

const EMPLOYEE_ICON = { hr: Users, voice: Mic }

interface IntegrationCardProps {
  integration: Integration
  onConnect: () => void
  onConfigure: () => void
  onReconnect: () => void
  onDisconnect: () => void
}

export function IntegrationCard({ integration, onConnect, onConfigure, onReconnect, onDisconnect }: IntegrationCardProps) {
  return (
    <Card>
      <CardBody className="space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold text-white"
              style={{ backgroundColor: integration.accentColor }}
            >
              {integration.logoInitial}
            </span>
            <div>
              <p className="text-[13.5px] font-semibold text-ink-900">{integration.name}</p>
              <p className="mt-0.5 text-xs text-ink-500">{integration.description}</p>
            </div>
          </div>
          <IntegrationStatusBadge status={integration.status} />
        </div>

        {integration.status === 'connected' && integration.accountLabel && (
          <p className="text-xs text-ink-500">
            Connected as <span className="font-medium text-ink-700">{integration.accountLabel}</span>
            {integration.connectedAt && ` · since ${formatDate(integration.connectedAt)}`}
          </p>
        )}
        {integration.status === 'expired' && (
          <p className="text-xs text-danger-600">Access expired {integration.expiresAt ? formatDate(integration.expiresAt) : ''} — reconnect to restore functionality.</p>
        )}

        <div className="flex items-center justify-between border-t border-ink-100 pt-3.5">
          <div className="flex items-center gap-1.5">
            {integration.usedByEmployees.length === 0 ? (
              <span className="text-xs text-ink-400">Not used by any employee</span>
            ) : (
              integration.usedByEmployees.map((type) => {
                const Icon = EMPLOYEE_ICON[type]
                return (
                  <span key={type} className="flex items-center gap-1 rounded-full bg-ink-100 px-2 py-1 text-xs text-ink-600">
                    <Icon className="size-3" />
                    {type.toUpperCase()}
                  </span>
                )
              })
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {integration.status === 'not_connected' && (
              <Button size="sm" icon={<Plug className="size-3.5" />} onClick={onConnect}>
                Connect
              </Button>
            )}
            {integration.status === 'connected' && (
              <>
                <Button size="sm" variant="outline" icon={<Settings2 className="size-3.5" />} onClick={onConfigure}>
                  Configure
                </Button>
                <Button size="sm" variant="ghost" icon={<Unlink className="size-3.5" />} onClick={onDisconnect}>
                  Disconnect
                </Button>
              </>
            )}
            {integration.status === 'expired' && (
              <Button size="sm" icon={<RefreshCw className="size-3.5" />} onClick={onReconnect}>
                Reconnect
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
