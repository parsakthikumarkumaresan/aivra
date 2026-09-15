import type { SectionProps } from '@/pages/internal/voiceAgents/BuilderTypes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Label, Input, Switch, Textarea } from '@/components/ui/Field'

// Customer-facing "Advanced" — call-handling limits only. Turn/interruption/
// noise/language-switching live in the reused Transcription section, and
// LLM/runtime internals stay JEXA.AI-internal (see AdvancedSection.tsx).
export default function JaanAdvancedSection({ agent, patch }: SectionProps) {
  const limits = agent.callLimits

  function set<K extends keyof typeof limits>(key: K, value: (typeof limits)[K]) {
    patch('callLimits', { ...limits, [key]: value })
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Voicemail Detection"
          description="Detect voicemail and end the call automatically instead of leaving a message to an answering machine."
          actions={<Switch checked={limits.voicemailDetectionEnabled} onChange={(v) => set('voicemailDetectionEnabled', v)} />}
        />
      </Card>

      <Card>
        <CardHeader title="Max Call Duration" description="Automatically end the call after this many seconds." />
        <CardBody className="max-w-xs">
          <Label>Seconds</Label>
          <Input type="number" min={30} value={limits.maxCallDurationSeconds} onChange={(e) => set('maxCallDurationSeconds', Number(e.target.value))} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="No Response Handling" description="What happens when the caller goes silent." />
        <CardBody className="space-y-4">
          <div className="max-w-xs">
            <Label>Timeout (seconds)</Label>
            <Input type="number" min={3} value={limits.noResponseTimeoutSeconds} onChange={(e) => set('noResponseTimeoutSeconds', Number(e.target.value))} />
          </div>
          <div>
            <Label>Prompt to say</Label>
            <Textarea rows={2} value={limits.noResponseMessage} onChange={(e) => set('noResponseMessage', e.target.value)} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Agent Version" description="Read-only — every save creates a new version." />
        <CardBody>
          <p className="text-[13px] font-medium text-ink-800">v{agent.version} · Last updated {new Date(agent.lastUpdatedAt).toLocaleString()}</p>
        </CardBody>
      </Card>
    </div>
  )
}
