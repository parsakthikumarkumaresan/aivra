import type { Integration } from '@/types'
import { mockIntegrations } from './data/integrations'
import { delay, maybeFail } from './utils'

export const integrationsService = {
  listIntegrations(): Promise<Integration[]> {
    return delay(mockIntegrations)
  },
  connect(id: string): Promise<{ success: boolean; integration?: Integration }> {
    const integration = mockIntegrations.find((i) => i.id === id)
    if (!integration) return delay({ success: false }, 900)
    const failed = maybeFail(0.15)
    if (!failed) {
      integration.status = 'connected'
      integration.connectedAt = new Date().toISOString()
      integration.expiresAt = undefined
    }
    return delay({ success: !failed, integration }, 1100)
  },
  disconnect(id: string): Promise<Integration | undefined> {
    const integration = mockIntegrations.find((i) => i.id === id)
    if (integration) {
      integration.status = 'not_connected'
      integration.connectedAt = undefined
      integration.expiresAt = undefined
      integration.usedByEmployees = []
    }
    return delay(integration, 600)
  },
  reconnect(id: string): Promise<Integration | undefined> {
    const integration = mockIntegrations.find((i) => i.id === id)
    if (integration) {
      integration.status = 'connected'
      integration.connectedAt = new Date().toISOString()
      integration.expiresAt = undefined
    }
    return delay(integration, 900)
  },
}
