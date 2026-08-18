import { useState } from 'react'
import { Maximize2, RotateCcw, Sparkles } from 'lucide-react'
import type { SectionProps } from '../BuilderTypes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label, Switch, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'

const VARIABLE_CHIPS = ['customer_name', 'customer_id', 'order_id', 'booking_id', 'customer_type', 'language']

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export default function PromptSection({ agent, patch }: SectionProps) {
  const [expanded, setExpanded] = useState(false)
  const config = agent.promptConfig

  function set<K extends keyof typeof config>(key: K, value: (typeof config)[K]) {
    patch('promptConfig', { ...config, [key]: value })
  }

  function insertVariable(name: string) {
    set('systemPrompt', `${config.systemPrompt}\${${name}}`)
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Intro Message"
          description={<>The opening line your agent speaks as-is when the call connects. Use <code className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[11px]">{'${variable}'}</code> to insert dynamic values.</>}
        />
        <CardBody className="space-y-4">
          <Textarea value={config.introMessage} onChange={(e) => set('introMessage', e.target.value)} className="min-h-20" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Delay before speaking: {config.delayBeforeSpeakingSeconds.toFixed(1)}s</Label>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={config.delayBeforeSpeakingSeconds}
                onChange={(e) => set('delayBeforeSpeakingSeconds', Number(e.target.value))}
                className="w-full accent-brand-600"
              />
              <p className="mt-1 text-xs text-ink-500">Time the agent waits before delivering the intro message.</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-ink-200 p-3.5">
              <div>
                <p className="text-[13px] font-medium text-ink-800">Allow interruptions</p>
                <p className="text-xs text-ink-500">Callers can interrupt the intro message.</p>
              </div>
              <Switch checked={config.allowIntroInterruptions} onChange={(v) => set('allowIntroInterruptions', v)} />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Prompt"
          description="Instructions for how the agent should behave, speak, and handle conversations."
          actions={
            <Button variant="ghost" size="sm" icon={<Maximize2 className="size-3.5" />} onClick={() => setExpanded(true)}>
              Expand
            </Button>
          }
        />
        <CardBody className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-ink-500">Insert variable:</span>
            {VARIABLE_CHIPS.map((v) => (
              <button key={v} onClick={() => insertVariable(v)} className="rounded-full bg-ink-100 px-2.5 py-1 font-mono text-[11px] text-ink-600 hover:bg-brand-100 hover:text-brand-700">
                {'${' + v + '}'}
              </button>
            ))}
          </div>
          <Textarea value={config.systemPrompt} onChange={(e) => set('systemPrompt', e.target.value)} className="min-h-96 font-mono text-[12.5px]" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-400">{wordCount(config.systemPrompt)} words · {config.systemPrompt.length} characters</span>
            <Button variant="ghost" size="sm" icon={<RotateCcw className="size-3.5" />} onClick={() => set('systemPrompt', agent.promptConfig.systemPrompt)} disabled>
              Reset
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="border-brand-100 bg-brand-50/40">
        <CardBody className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-600" />
          <p className="text-[13px] leading-relaxed text-ink-700">
            Cover: agent role & persona, tone & communication style, business rules, knowledge boundaries, escalation
            behavior and edge cases. <Badge tone="neutral" className="ml-1">Mock — no prompt-generation backend</Badge>
          </p>
        </CardBody>
      </Card>

      <Modal open={expanded} onClose={() => setExpanded(false)} size="xl" title="Prompt — Expanded Editor">
        <Textarea value={config.systemPrompt} onChange={(e) => set('systemPrompt', e.target.value)} className="min-h-[60vh] font-mono text-[12.5px]" />
      </Modal>
    </div>
  )
}
