import { useState } from 'react'
import { Play, X } from 'lucide-react'
import type { SectionProps } from '../BuilderTypes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label, Select, Switch } from '@/components/ui/Field'
import { useToast } from '@/hooks/useToast'

const PROVIDERS = ['elevenlabs', 'azure', 'google', 'cartesia']
const MODELS = ['Realistic (Flash)', 'Realistic (Turbo)', 'Neural', 'Standard']
const LANGUAGES = ['en-IN', 'hi-IN', 'ta-IN', 'te-IN', 'en-US']
const GENDERS = ['female', 'male', 'neutral'] as const
const VOICES = ['Anika — Reassuring', 'Arjun — Professional', 'Meera — Friendly', 'Rohan — Calm']
const NORMALIZATION_OPTIONS = ['emojis', 'symbols', 'devnagari', 'currency', 'abbreviations']

export default function VoiceSection({ agent, patch }: SectionProps) {
  const config = agent.voiceConfig
  const { show } = useToast()
  const [playing, setPlaying] = useState(false)

  function set<K extends keyof typeof config>(key: K, value: (typeof config)[K]) {
    patch('voiceConfig', { ...config, [key]: value })
  }

  function playPreview() {
    setPlaying(true)
    show({ tone: 'info', title: 'Playing voice preview…', description: config.voiceName })
    window.setTimeout(() => setPlaying(false), 1800)
  }

  function toggleNormalization(preset: string) {
    const next = config.textNormalizationPresets.includes(preset)
      ? config.textNormalizationPresets.filter((p) => p !== preset)
      : [...config.textNormalizationPresets, preset]
    set('textNormalizationPresets', next)
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Voice" description="Choose your agent's voice and language." />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
              <Label>Language</Label>
              <Select value={config.language} onChange={(e) => set('language', e.target.value)}>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={config.gender} onChange={(e) => set('gender', e.target.value as typeof config.gender)}>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </Select>
            </div>
          </div>

          <div>
            <Label>Voice</Label>
            <div className="flex items-center gap-2">
              <Select value={config.voiceName} onChange={(e) => set('voiceName', e.target.value)} className="flex-1">
                {VOICES.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
              <Button variant="outline" size="icon" icon={playing ? <X className="size-4" /> : <Play className="size-4" />} onClick={playPreview} aria-label="Preview voice" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-ink-200 p-3.5">
            <div>
              <p className="text-[13px] font-medium text-ink-800">Intro ring</p>
              <p className="text-xs text-ink-500">Play a ringing tone before the agent's intro message.</p>
            </div>
            <Switch checked={config.introRing} onChange={(v) => set('introRing', v)} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Text Normalization" description="Clean up text before it is spoken aloud." />
        <CardBody className="space-y-3">
          <div>
            <Label>Preset</Label>
            <p className="mb-2 text-xs text-ink-500">Remove emojis, symbols and diacritics before speaking.</p>
            <div className="flex flex-wrap gap-1.5">
              {NORMALIZATION_OPTIONS.map((opt) => {
                const active = config.textNormalizationPresets.includes(opt)
                return (
                  <button
                    key={opt}
                    onClick={() => toggleNormalization(opt)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${active ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-500 hover:bg-ink-200'}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Background Sound" description="Add subtle ambient sound behind your agent's voice." />
        <CardBody>
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-ink-600">Off by default — a call center hum will be added when this is on.</p>
            <Switch checked={config.backgroundSound} onChange={(v) => set('backgroundSound', v)} />
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
