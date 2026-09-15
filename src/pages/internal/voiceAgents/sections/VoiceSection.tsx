import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, X, SlidersHorizontal } from 'lucide-react'
import type { SectionProps } from '../BuilderTypes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label, Select, Switch } from '@/components/ui/Field'
import { useToast } from '@/hooks/useToast'
import { STT_PROVIDERS, TTS_PROVIDERS, SUPPORTED_LANGUAGES } from '@/services/mock/data/jaan/providerCatalog'

const GENDERS = ['female', 'male', 'neutral'] as const
const NORMALIZATION_OPTIONS = ['emojis', 'symbols', 'devnagari', 'currency', 'abbreviations']

// Speech (STT + TTS) — provider/model/voice options come entirely from the
// data-driven catalog in services/mock/data/jaan/providerCatalog.ts, so
// adding a new provider, model or voice is a data change, not a code change.
export default function VoiceSection({ agent, patch }: SectionProps) {
  const voice = agent.voiceConfig
  const transcription = agent.transcriptionConfig
  const { show } = useToast()
  const [playing, setPlaying] = useState(false)

  function setVoice<K extends keyof typeof voice>(key: K, value: (typeof voice)[K]) {
    patch('voiceConfig', { ...voice, [key]: value })
  }
  function setTranscription<K extends keyof typeof transcription>(key: K, value: (typeof transcription)[K]) {
    patch('transcriptionConfig', { ...transcription, [key]: value })
  }

  const ttsProvider = TTS_PROVIDERS.find((p) => p.id === voice.provider) ?? TTS_PROVIDERS[0]
  const sttProvider = STT_PROVIDERS.find((p) => p.id === transcription.provider) ?? STT_PROVIDERS[0]

  function playPreview() {
    setPlaying(true)
    show({ tone: 'info', title: 'Playing voice preview…', description: voice.voiceName })
    window.setTimeout(() => setPlaying(false), 1800)
  }

  function toggleNormalization(preset: string) {
    const next = voice.textNormalizationPresets.includes(preset)
      ? voice.textNormalizationPresets.filter((p) => p !== preset)
      : [...voice.textNormalizationPresets, preset]
    setVoice('textNormalizationPresets', next)
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Text-to-Speech" description="Choose the provider, voice and language your agent speaks with." />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label>TTS Provider</Label>
              <Select
                value={ttsProvider.id}
                onChange={(e) => {
                  const next = TTS_PROVIDERS.find((p) => p.id === e.target.value)
                  patch('voiceConfig', { ...voice, provider: e.target.value, voiceName: next?.voices[0]?.name ?? voice.voiceName })
                }}
              >
                {TTS_PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Language</Label>
              <Select value={voice.language} onChange={(e) => setVoice('language', e.target.value)}>
                {SUPPORTED_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </Select>
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={voice.gender} onChange={(e) => setVoice('gender', e.target.value as typeof voice.gender)}>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </Select>
            </div>
          </div>

          <div>
            <Label>Voice {ttsProvider.voices.length > 0 && <span className="font-normal text-ink-400">({ttsProvider.voices.length} available)</span>}</Label>
            <div className="flex items-center gap-2">
              <Select value={voice.voiceName} onChange={(e) => setVoice('voiceName', e.target.value)} className="flex-1">
                {ttsProvider.voices.length === 0 && <option value={voice.voiceName}>{voice.voiceName}</option>}
                {ttsProvider.voices.map((v) => (
                  <option key={v.id} value={v.name}>{v.name}{v.style ? ` — ${v.style}` : ''}</option>
                ))}
              </Select>
              <Button variant="outline" size="icon" icon={playing ? <X className="size-4" /> : <Play className="size-4" />} onClick={playPreview} aria-label="Preview voice" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-ink-200 p-3.5">
            <div>
              <p className="text-[13px] font-medium text-ink-800">Intro ring</p>
              <p className="text-xs text-ink-500">Play a ringing tone before the agent's intro message.</p>
            </div>
            <Switch checked={voice.introRing} onChange={(v) => setVoice('introRing', v)} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Speech-to-Text" description="How the agent transcribes what the caller says." />
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>STT Provider</Label>
              <Select
                value={sttProvider.id}
                onChange={(e) => {
                  const next = STT_PROVIDERS.find((p) => p.id === e.target.value)
                  setTranscription('provider', e.target.value)
                  setTranscription('model', next?.models[0]?.id ?? '')
                }}
              >
                {STT_PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Model</Label>
              <Select value={transcription.model} onChange={(e) => setTranscription('model', e.target.value)}>
                {sttProvider.models.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Text Normalization"
          description="Clean up text before it is spoken aloud."
          actions={
            <Link to="/app/jaan/pronunciation" className="flex items-center gap-1 text-[12px] font-medium text-brand-600 hover:text-brand-700">
              <SlidersHorizontal className="size-3.5" /> Advanced rules
            </Link>
          }
        />
        <CardBody className="space-y-3">
          <div>
            <Label>Preset</Label>
            <p className="mb-2 text-xs text-ink-500">Remove emojis, symbols and diacritics before speaking.</p>
            <div className="flex flex-wrap gap-1.5">
              {NORMALIZATION_OPTIONS.map((opt) => {
                const active = voice.textNormalizationPresets.includes(opt)
                return (
                  <button
                    key={opt}
                    onClick={() => toggleNormalization(opt)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-150 ${active ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-500 hover:bg-ink-200'}`}
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
        <CardHeader title="Ambient Sound" description="Add subtle background audio behind your agent's voice." />
        <CardBody>
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-ink-600">Off by default — a soft call-center ambience will play when this is on.</p>
            <Switch checked={voice.backgroundSound} onChange={(v) => setVoice('backgroundSound', v)} />
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
