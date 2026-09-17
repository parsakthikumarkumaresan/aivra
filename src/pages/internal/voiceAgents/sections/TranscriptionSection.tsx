import type { SectionProps } from '../BuilderTypes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input, Label, Select, Switch } from '@/components/ui/Field'
import { useProviderCatalog } from '@/hooks/useVoiceAgentBuilder'
import { Skeleton } from '@/components/ui/Skeleton'

const LANGUAGE_OPTIONS = [
  { code: 'en-IN', label: 'English (IN)' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'ml-IN', label: 'Malayalam' },
]

const TURN_MODES = ['Heuristic', 'Semantic', 'Fixed Silence']
const SENSITIVITY_OPTIONS = ['Low (ideal for noisy environments)', 'Medium (ideal for regular conversations)', 'High (ideal for quiet environments)']

// STT provider/model options come from the real backend catalog (see
// VoiceSection.tsx and app/ai_employees/voice/providers/catalog.py) — this
// section is disabled whenever voiceConfig.mode === 'realtime' since
// OpenAI Realtime is speech-to-speech and has no separate STT step.
export default function TranscriptionSection({ agent, patch }: SectionProps) {
  const config = agent.transcriptionConfig
  const isRealtime = agent.voiceConfig.mode === 'realtime'
  const catalogQuery = useProviderCatalog()

  function set<K extends keyof typeof config>(key: K, value: (typeof config)[K]) {
    patch('transcriptionConfig', { ...config, [key]: value })
  }

  function toggleLanguage(lang: string) {
    const next = config.languages.includes(lang) ? config.languages.filter((l) => l !== lang) : [...config.languages, lang]
    set('languages', next)
  }

  if (catalogQuery.loading || !catalogQuery.data) {
    return <Skeleton className="h-96 w-full rounded-xl" />
  }
  const sttProviders = catalogQuery.data.providers.filter((p) => p.capabilities.includes('stt'))
  const selectedSttProvider = sttProviders.find((p) => p.id === config.provider) ?? sttProviders[0]
  const turnModeNormalized = config.turnMode

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Languages" description="Which languages this agent can recognize during a call." />
        <CardBody>
          <div className="flex flex-wrap gap-1.5 rounded-lg border border-ink-200 px-2.5 py-2">
            {LANGUAGE_OPTIONS.map((l) => {
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

      <Card className={isRealtime ? 'opacity-50' : undefined}>
        <CardHeader title="Speech-to-Text" description={isRealtime ? 'Disabled — handled by OpenAI Realtime speech-to-speech.' : 'How the agent transcribes what the caller says.'} />
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>STT Provider</Label>
              <Select
                disabled={isRealtime}
                value={selectedSttProvider.id}
                onChange={(e) => {
                  const next = sttProviders.find((p) => p.id === e.target.value)!
                  patch('transcriptionConfig', { ...config, provider: next.id, model: next.sttModels[0] ?? '' })
                }}
              >
                {sttProviders.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Model</Label>
              <Select disabled={isRealtime} value={config.model} onChange={(e) => set('model', e.target.value)}>
                {selectedSttProvider.sttModels.map((m) => <option key={m} value={m}>{m}</option>)}
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Turn Settings" description="Control how and when the agent decides to respond." />
        <CardBody className="space-y-4">
          <div>
            <Label>Mode</Label>
            <Select value={turnModeNormalized} onChange={(e) => set('turnMode', e.target.value)}>
              {TURN_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </div>
          {turnModeNormalized === 'Fixed Silence' && (
            <div>
              <Label>Silence threshold (seconds)</Label>
              <Input
                type="number"
                min={0.1}
                max={10}
                step={0.1}
                value={config.fixedSilenceSeconds}
                onChange={(e) => set('fixedSilenceSeconds', Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-ink-500">How long the caller must be silent before the agent responds.</p>
            </div>
          )}
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
