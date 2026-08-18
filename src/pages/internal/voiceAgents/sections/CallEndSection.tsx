import type { SectionProps } from '../BuilderTypes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input, Label, Switch, Textarea } from '@/components/ui/Field'

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-ink-200 p-3.5">
      <div>
        <p className="text-[13px] font-medium text-ink-800">{label}</p>
        <p className="text-xs text-ink-500">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  )
}

export default function CallEndSection({ agent, patch }: SectionProps) {
  const config = agent.callEndConfig
  function set<K extends keyof typeof config>(key: K, value: (typeof config)[K]) {
    patch('callEndConfig', { ...config, [key]: value })
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="End Message" description="What the agent says just before hanging up." />
        <CardBody>
          <Label>Message</Label>
          <Textarea value={config.endMessage} onChange={(e) => set('endMessage', e.target.value)} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="After the call" description="What runs automatically once the call ends." />
        <CardBody className="space-y-3">
          <ToggleRow label="Generate Summary" description="Produce a short written summary of the call." checked={config.generateSummary} onChange={(v) => set('generateSummary', v)} />
          <ToggleRow label="Extract Customer Intent" description="Classify why the customer called." checked={config.extractIntent} onChange={(v) => set('extractIntent', v)} />
          <ToggleRow label="Determine Outcome" description="Resolved, escalated, booked, or failed." checked={config.determineOutcome} onChange={(v) => set('determineOutcome', v)} />
          <ToggleRow label="Update CRM" description="Write the outcome and summary back to the CRM." checked={config.updateCrm} onChange={(v) => set('updateCrm', v)} />
          <ToggleRow label="Send Notification" description="Notify the relevant team once the call ends." checked={config.sendNotification} onChange={(v) => set('sendNotification', v)} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Post-call Webhook" description="Optional — notify an external system the moment a call completes." />
        <CardBody>
          <Label>Webhook URL</Label>
          <Input value={config.webhookUrl} onChange={(e) => set('webhookUrl', e.target.value)} placeholder="https://your-system.com/webhooks/call-end" className="font-mono text-[12.5px]" />
        </CardBody>
      </Card>
    </div>
  )
}
