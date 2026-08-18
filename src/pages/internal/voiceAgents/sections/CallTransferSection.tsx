import type { SectionProps } from '../BuilderTypes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input, Label, Switch, Textarea } from '@/components/ui/Field'

export default function CallTransferSection({ agent, patch }: SectionProps) {
  const config = agent.transferConfig
  function set<K extends keyof typeof config>(key: K, value: (typeof config)[K]) {
    patch('transferConfig', { ...config, [key]: value })
  }
  function toggleCondition(id: string, enabled: boolean) {
    set('conditions', config.conditions.map((c) => (c.id === id ? { ...c, enabled } : c)))
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Human Escalation" description="Enable transferring calls to a human." actions={<Switch checked={config.enabled} onChange={(v) => set('enabled', v)} />} />
      </Card>

      {config.enabled && (
        <>
          <Card>
            <CardHeader title="Transfer Conditions" description="Only enable the ones that make sense for this business." />
            <CardBody className="space-y-2.5">
              {config.conditions.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-ink-200 p-3.5">
                  <div>
                    <p className="text-[13px] font-medium text-ink-800">{c.label}</p>
                    <p className="text-xs text-ink-500">{c.description}</p>
                  </div>
                  <Switch checked={c.enabled} onChange={(v) => toggleCondition(c.id, v)} />
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Destination & Timing" />
            <CardBody className="space-y-4">
              <div>
                <Label>Transfer destination</Label>
                <Input value={config.destination} onChange={(e) => set('destination', e.target.value)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-ink-200 p-3.5">
                <div>
                  <p className="text-[13px] font-medium text-ink-800">Business hours only</p>
                  <p className="text-xs text-ink-500">Outside business hours, use the fallback message instead.</p>
                </div>
                <Switch checked={config.businessHoursOnly} onChange={(v) => set('businessHoursOnly', v)} />
              </div>
              <div>
                <Label>Timeout before fallback: {config.timeoutSeconds}s</Label>
                <input type="range" min={10} max={60} step={5} value={config.timeoutSeconds} onChange={(e) => set('timeoutSeconds', Number(e.target.value))} className="w-full accent-brand-600" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Messages" />
            <CardBody className="space-y-4">
              <div>
                <Label>Transfer message</Label>
                <Textarea value={config.transferMessage} onChange={(e) => set('transferMessage', e.target.value)} className="min-h-16" />
              </div>
              <div>
                <Label>Fallback message (no one available)</Label>
                <Textarea value={config.fallbackMessage} onChange={(e) => set('fallbackMessage', e.target.value)} className="min-h-16" />
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
