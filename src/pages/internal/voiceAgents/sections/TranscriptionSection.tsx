import type { SectionProps } from '../BuilderTypes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Label, Select, Switch } from '@/components/ui/Field'
import { SUPPORTED_LANGUAGES } from '@/services/mock/data/jaan/providerCatalog'

const TURN_MODES = ['Heuristic', 'Semantic', 'Fixed Silence']
const SENSITIVITY_OPTIONS = ['Low (ideal for noisy environments)', 'Medium (ideal for regular conversations)', 'High (ideal for quiet environments)']

export default function TranscriptionSection({ agent, patch }: SectionProps) {
  const config = agent.transcriptionConfig

  function set<K extends keyof typeof config>(key: K, value: (typeof config)[K]) {
    patch('transcriptionConfig', { ...config, [key]: value })
  }

  function toggleLanguage(lang: string) {
    const next = config.languages.includes(lang) ? config.languages.filter((l) => l !== lang) : [...config.languages, lang]
    set('languages', next)
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Languages" description="Which languages this agent can recognize during a call. Provider/model live under Speech." />
        <CardBody>
          <div className="flex flex-wrap gap-1.5 rounded-lg border border-ink-200 px-2.5 py-2">
            {SUPPORTED_LANGUAGES.map((l) => {
              const active = config.languages.includes(l.code)
              return (
                <button key={l.code} onClick={() => toggleLanguage(l.code)} className={`rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors duration-150 ${active ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-500 hover:bg-ink-200'}`}>
                  {l.label}
                </button>
              )
            })}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Turn Settings" description="Control how and when the agent decides to respond." />
        <CardBody className="space-y-4">
          <div>
            <Label>Mode</Label>
            <Select value={config.turnMode} onChange={(e) => set('turnMode', e.target.value)}>
              {TURN_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </div>
          <div>
            <Label>Sensitivity</Label>
            <Select value={config.turnSensitivity} onChange={(e) => set('turnSensitivity', e.target.value)}>
              {SENSITIVITY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Interruption" description="Configure agent's interruption behaviour." actions={<Switch checked={config.interruptionEnabled} onChange={(v) => set('interruptionEnabled', v)} />} />
        {config.interruptionEnabled && (
          <CardBody>
            <Label>Sensitivity</Label>
            <Select value={config.interruptionSensitivity} onChange={(e) => set('interruptionSensitivity', e.target.value)}>
              {SENSITIVITY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </CardBody>
        )}
      </Card>

      <Card>
        <CardHeader title="Noise Reduction" description="Reduce background noise from the user's audio before transcription." actions={<Switch checked={config.noiseReduction} onChange={(v) => set('noiseReduction', v)} />} />
      </Card>

      <Card>
        <CardHeader title="Language Switch" description="Enable multilingual conversations with automatic language detection." actions={<Switch checked={config.languageSwitching} onChange={(v) => set('languageSwitching', v)} />} />
      </Card>
    </div>
  )
}
