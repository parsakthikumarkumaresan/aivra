import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, X, SlidersHorizontal } from 'lucide-react'
import type { SectionProps } from '../BuilderTypes'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label, Select, Switch } from '@/components/ui/Field'
import { useToast } from '@/hooks/useToast'
import { useProviderCatalog } from '@/hooks/useVoiceAgentBuilder'
import { Skeleton } from '@/components/ui/Skeleton'

const GENDERS = ['female', 'male', 'neutral'] as const
const NORMALIZATION_OPTIONS = ['emojis', 'symbols', 'devnagari', 'currency', 'abbreviations']
const LANGUAGE_OPTIONS = [
  { code: 'en-IN', label: 'English (IN)' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'ml-IN', label: 'Malayalam' },
]

// Speech (Realtime or Custom STT+TTS) — provider/model/voice options come
// from the real backend catalog (GET /internal/voice-agents/providers, see
// app/ai_employees/voice/providers/catalog.py), not a hardcoded list.
export default function VoiceSection({ agent, patch }: SectionProps) {
  const voice = agent.voiceConfig
  const catalogQuery = useProviderCatalog()
  const { show } = useToast()
  const [playing, setPlaying] = useState(false)

  function setVoice<K extends keyof typeof voice>(key: K, value: (typeof voice)[K]) {
    patch('voiceConfig', { ...voice, [key]: value })
  }

  if (catalogQuery.loading || !catalogQuery.data) {
    return <Skeleton className="h-96 w-full rounded-xl" />
  }
  const catalog = catalogQuery.data
  const openai = catalog.providers.find((p) => p.id === 'openai')!
  const ttsProviders = catalog.providers.filter((p) => p.capabilities.includes('tts'))
  const isRealtime = voice.mode === 'realtime'

  const selectedTtsProvider = ttsProviders.find((p) => p.id === voice.provider) ?? ttsProviders[0]
  const ttsModelsForProvider = selectedTtsProvider.ttsModels
  const ttsVoicesForModel =
    selectedTtsProvider.id === 'openai'
      ? selectedTtsProvider.ttsVoices
      : (selectedTtsProvider.ttsVoicesByModel[voice.model] ?? [])

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
        <CardHeader title="Mode" description="Realtime is speech-to-speech (OpenAI only) — no separate STT/TTS selection. Custom STT+TTS lets you pick independent providers." />
        <CardBody className="space-y-4">
          <div>
            <Label>Mode</Label>
            <Select
              value={voice.mode}
              onChange={(e) => setVoice('mode', e.target.value as typeof voice.mode)}
            >
              <option value="realtime">Realtime (OpenAI speech-to-speech)</option>
              <option value="custom">Custom STT + TTS</option>
            </Select>
          </div>

          {isRealtime ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label>Realtime Provider</Label>
                <Select value="openai" disabled>
                  <option value="openai">OpenAI</option>
                </Select>
              </div>
              <div>
                <Label>Realtime Model</Label>
                <Select
                  value={voice.realtimeModel}
                  onChange={(e) => setVoice('realtimeModel', e.target.value)}
                >
                  {openai.realtimeModels.map((m) => <option key={m} value={m}>{m}</option>)}
                </Select>
              </div>
              <div>
                <Label>Voice</Label>
                <Select
                  value={voice.realtimeVoice}
                  onChange={(e) => setVoice('realtimeVoice', e.target.value)}
                >
                  {openai.realtimeVoices.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}{v.description ? ` — ${v.description}` : ''}</option>
                  ))}
                </Select>
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-500">Custom mode — configure Speech-to-Text below and Text-to-Speech in this section.</p>
          )}
        </CardBody>
      </Card>

      <Card className={isRealtime ? 'opacity-50' : undefined}>
        <CardHeader title="Text-to-Speech" description={isRealtime ? 'Disabled — handled by OpenAI Realtime speech-to-speech.' : 'Choose the provider, voice and language your agent speaks with.'} />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label>TTS Provider</Label>
              <Select
                disabled={isRealtime}
                value={selectedTtsProvider.id}
                onChange={(e) => {
                  const next = ttsProviders.find((p) => p.id === e.target.value)!
                  const firstModel = next.ttsModels[0] ?? ''
                  const firstVoice = next.id === 'openai' ? next.ttsVoices[0]?.id : next.ttsVoicesByModel[firstModel]?.[0]?.id
                  patch('voiceConfig', { ...voice, provider: next.id, model: firstModel, voiceName: firstVoice ?? voice.voiceName })
                }}
              >
                {ttsProviders.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Language</Label>
              <Select disabled={isRealtime} value={voice.language} onChange={(e) => setVoice('language', e.target.value)}>
                {LANGUAGE_OPTIONS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </Select>
            </div>
            <div>
              <Label>Gender</Label>
              <Select disabled={isRealtime} value={voice.gender} onChange={(e) => setVoice('gender', e.target.value as typeof voice.gender)}>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </Select>
            </div>
          </div>

          <div>
            <Label>TTS Model</Label>
            <Select
              disabled={isRealtime}
              value={voice.model}
              onChange={(e) => {
                const firstVoice = selectedTtsProvider.id === 'openai'
                  ? selectedTtsProvider.ttsVoices[0]?.id
                  : selectedTtsProvider.ttsVoicesByModel[e.target.value]?.[0]?.id
                patch('voiceConfig', { ...voice, model: e.target.value, voiceName: firstVoice ?? voice.voiceName })
              }}
            >
              {ttsModelsForProvider.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </div>

          <div>
            <Label>Voice {ttsVoicesForModel.length > 0 && <span className="font-normal text-ink-400">({ttsVoicesForModel.length} available)</span>}</Label>
            {selectedTtsProvider.id === 'elevenlabs' && ttsVoicesForModel.length === 0 ? (
              <p className="rounded-lg border border-warning-100 bg-warning-50 px-3 py-2 text-xs text-warning-700">
                No ElevenLabs voice IDs configured yet — add one to <code className="font-mono">app/ai_employees/voice/providers/catalog.py:ELEVENLABS_VOICES</code> on the backend.
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <Select disabled={isRealtime} value={voice.voiceName} onChange={(e) => setVoice('voiceName', e.target.value)} className="flex-1">
                  {ttsVoicesForModel.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}{v.description ? ` — ${v.description}` : ''}</option>
                  ))}
                </Select>
                <Button variant="outline" size="icon" icon={playing ? <X className="size-4" /> : <Play className="size-4" />} onClick={playPreview} aria-label="Preview voice" disabled={isRealtime} />
              </div>
            )}
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
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-ink-600">Off by default.</p>
            <Switch checked={voice.backgroundSound} onChange={(v) => setVoice('backgroundSound', v)} />
          </div>
          {voice.backgroundSound && (
            <>
              <div>
                <Label>Background Sound</Label>
                <Select value={voice.backgroundSoundId} onChange={(e) => setVoice('backgroundSoundId', e.target.value)}>
                  {catalog.ambientSounds.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </div>
              <div>
                <Label>Volume: {Math.round(voice.backgroundSoundVolume * 100)}%</Label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={voice.backgroundSoundVolume}
                  onChange={(e) => setVoice('backgroundSoundVolume', Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
