// Speech provider/model catalog — deliberately data-driven (see
// services/mock/data/jaan/providerCatalog.ts) rather than hardcoded into the
// UI, so a new STT/TTS provider or model is a data change, not a code change.

export interface SttModelOption {
  id: string
  label: string
}

export interface SttProviderOption {
  id: string
  name: string
  models: SttModelOption[]
}

export type VoiceGender = 'female' | 'male' | 'neutral'

export interface TtsVoiceOption {
  id: string
  name: string
  language: string
  gender: VoiceGender
  style?: string
  previewUrl?: string
}

export interface TtsProviderOption {
  id: string
  name: string
  voices: TtsVoiceOption[]
}

export interface SupportedLanguage {
  code: string
  label: string
}
