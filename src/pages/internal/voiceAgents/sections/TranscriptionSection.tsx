import type { SectionProps } from '../BuilderTypes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Label, Select, Switch } from '@/components/ui/Field'

const PROVIDERS = ['soniox', 'deepgram', 'assemblyai', 'whisper']
const MODELS = ['stt-rt-v5', 'nova-3', 'universal-2', 'large-v3']
const LANGUAGE_OPTIONS = ['en-IN', 'hi-IN', 'ta-IN', 'te-IN', 'en-US']
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
        <CardHeader title="Transcription" description="Configure how the agent converts user speech to text." />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label>Provider</Label>
              <Select value={config.provider} onChange={(e) => set('provider', e.target.value)}>
                {PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>
            <div>
              <Label>Model</Label>
              <Select value={config.model} onChange={(e) => set('model', e.target.value)}>
                {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
              </Select>
            </div>
            <div>
              <Label>Languages</Label>
              <div className="flex flex-wrap gap-1.5 rounded-lg border border-ink-200 px-2.5 py-2">
                {LANGUAGE_OPTIONS.map((l) => {
                  const active = config.languages.includes(l)
                  return (
                    <button key={l} onClick={() => toggleLanguage(l)} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${active ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-500'}`}>
                      {l}
                    </button>
                  )
                })}
              </div>
            </div>
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
