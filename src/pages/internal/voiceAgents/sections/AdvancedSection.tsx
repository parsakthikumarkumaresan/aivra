import { ShieldAlert } from 'lucide-react'
import type { SectionProps } from '../BuilderTypes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input, Label, Select, Switch } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'

const LLM_PROVIDERS = ['Google', 'OpenAI', 'Anthropic']
const LLM_MODELS: Record<string, string[]> = {
  Google: ['Gemini 2.5 Flash', 'Gemini 2.5 Pro'],
  OpenAI: ['GPT-4.1 Mini', 'GPT-4.1'],
  Anthropic: ['Claude Haiku 4.5', 'Claude Sonnet 5'],
}
const LATENCY_MODES = ['low_latency', 'balanced', 'high_quality'] as const
const TURN_DETECTION_MODES = ['Server VAD', 'Client VAD', 'Push to Talk']
const RETRY_POLICIES = ['No retry', 'Fixed, 2 attempts', 'Exponential backoff, 3 attempts']

export default function AdvancedSection({ agent, patch }: SectionProps) {
  const config = agent.advancedConfig
  function set<K extends keyof typeof config>(key: K, value: (typeof config)[K]) {
    patch('advancedConfig', { ...config, [key]: value })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-warning-800">
        <ShieldAlert className="size-4 shrink-0" />
        <p className="text-[13px] font-semibold">AIVRA Internal — technical runtime configuration. Never exposed to customers.</p>
      </div>

      <Card>
        <CardHeader title="LLM" description="The model that drives the agent's reasoning and responses." />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Provider</Label>
              <Select value={config.llmProvider} onChange={(e) => set('llmProvider', e.target.value)}>
                {LLM_PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>
            <div>
              <Label>Model</Label>
              <Select value={config.llmModel} onChange={(e) => set('llmModel', e.target.value)}>
                {(LLM_MODELS[config.llmProvider] ?? []).map((m) => <option key={m} value={m}>{m}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <Label>Temperature: {config.temperature.toFixed(1)}</Label>
            <input type="range" min={0} max={1} step={0.1} value={config.temperature} onChange={(e) => set('temperature', Number(e.target.value))} className="w-full accent-brand-600" />
            <p className="mt-1 text-xs text-ink-500">Lower = more consistent, focused responses. Higher = more creative, varied replies.</p>
          </div>
          <div>
            <Label>Context window (tokens)</Label>
            <Input type="number" value={config.contextWindowTokens} onChange={(e) => set('contextWindowTokens', Number(e.target.value))} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Latency & Turn Detection" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Latency mode</Label>
            <Select value={config.latencyMode} onChange={(e) => set('latencyMode', e.target.value as typeof config.latencyMode)}>
              {LATENCY_MODES.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
            </Select>
          </div>
          <div>
            <Label>Turn detection mode</Label>
            <Select value={config.turnDetectionMode} onChange={(e) => set('turnDetectionMode', e.target.value)}>
              {TURN_DETECTION_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-ink-200 p-3.5 sm:col-span-2">
            <div>
              <p className="text-[13px] font-medium text-ink-800">Voice Activity Detection (VAD)</p>
              <p className="text-xs text-ink-500">Detects when the caller starts and stops speaking.</p>
            </div>
            <Switch checked={config.vadEnabled} onChange={(v) => set('vadEnabled', v)} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Reliability & Runtime" />
        <CardBody className="space-y-4">
          <div>
            <Label>Retry policy</Label>
            <Select value={config.retryPolicy} onChange={(e) => set('retryPolicy', e.target.value)}>
              {RETRY_POLICIES.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </div>
          <div>
            <Label>Webhook URL</Label>
            <Input value={config.webhookUrl} onChange={(e) => set('webhookUrl', e.target.value)} className="font-mono text-[12.5px]" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label>Environment</Label>
              <Select value={config.environment} onChange={(e) => set('environment', e.target.value as typeof config.environment)}>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </Select>
            </div>
            <div>
              <Label>Runtime version</Label>
              <div className="flex h-9 items-center"><Badge tone="neutral" className="font-mono">{config.runtimeVersion}</Badge></div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[13px] font-medium text-ink-800">Debug mode</p>
                <p className="text-xs text-ink-500">Verbose logging — off in production.</p>
              </div>
              <Switch checked={config.debugMode} onChange={(v) => set('debugMode', v)} />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
