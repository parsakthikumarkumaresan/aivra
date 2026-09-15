import { useEffect } from 'react'
import type { SectionProps } from '@/pages/internal/voiceAgents/BuilderTypes'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input, Switch } from '@/components/ui/Field'
import type { CallAction } from '@/types'

const FIXED_EVENTS = ['Call Start', 'Call End', 'Call End Connected', 'Call End Not Connected', 'Transfer Initiated', 'Transfer Connected', 'Transfer Ended']

// Events & Webhook — a fixed set of lifecycle events, each optionally
// posting to a webhook URL. Stored as ordinary CallAction entries (trigger =
// event name) so it reuses the same callActionsConfig the rest of the
// builder already saves/loads — no new config surface.
export default function JaanEventsSection({ agent, patch }: SectionProps) {
  const actions = agent.callActionsConfig.actions

  useEffect(() => {
    const missing = FIXED_EVENTS.filter((event) => !actions.some((a) => a.trigger === event))
    if (missing.length === 0) return
    const seeded: CallAction[] = [
      ...actions,
      ...missing.map((event, i) => ({ id: `evt_${event.replace(/\s+/g, '_').toLowerCase()}_${i}`, name: event, trigger: event, destination: '', payloadFields: [], enabled: false })),
    ]
    patch('callActionsConfig', { actions: seeded })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateEvent(trigger: string, patchFields: Partial<CallAction>) {
    patch('callActionsConfig', { actions: actions.map((a) => (a.trigger === trigger ? { ...a, ...patchFields } : a)) })
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Events & Webhook" description="Fire a webhook when any of these call lifecycle events happen." />
        <div className="divide-y divide-ink-100">
          {FIXED_EVENTS.map((event) => {
            const action = actions.find((a) => a.trigger === event)
            return (
              <div key={event} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <div className="flex min-w-[180px] items-center gap-2.5">
                  <Switch checked={action?.enabled ?? false} onChange={(v) => updateEvent(event, { enabled: v })} />
                  <span className="text-[13px] font-medium text-ink-800">{event}</span>
                </div>
                <Input
                  placeholder="https://your-webhook-endpoint.com"
                  className="max-w-sm flex-1"
                  value={action?.destination ?? ''}
                  onChange={(e) => updateEvent(event, { destination: e.target.value })}
                  disabled={!action?.enabled}
                />
              </div>
            )
          })}
        </div>
      </Card>
      <p className="px-1 text-xs text-ink-400">Post-call analysis (summary, outcome, extracted information) is configured under Analysis.</p>
    </div>
  )
}
