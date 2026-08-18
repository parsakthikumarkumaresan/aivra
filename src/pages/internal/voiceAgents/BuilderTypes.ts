import type { VoiceAgent } from '@/types'

/** Shared prop contract every builder section component receives. */
export interface SectionProps {
  agent: VoiceAgent
  patch: <K extends keyof VoiceAgent>(key: K, value: VoiceAgent[K]) => void
}

export type SectionId =
  | 'prompt'
  | 'flow'
  | 'context'
  | 'library'
  | 'tools'
  | 'voice'
  | 'transcription'
  | 'call-end'
  | 'call-transfer'
  | 'analysis'
  | 'call-actions'
  | 'advanced'
