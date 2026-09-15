import type { SttProviderOption, TtsProviderOption, SupportedLanguage } from '@/types'

// Data-driven provider/model/voice catalog — add a provider, model or voice
// here and it appears in the Speech/Voice pickers with no UI code changes.

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en-IN', label: 'English (IN)' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'ml-IN', label: 'Malayalam' },
]

export const STT_PROVIDERS: SttProviderOption[] = [
  { id: 'soniox', name: 'Soniox', models: [{ id: 'stt-rt-v4', label: 'stt-rt-v4' }, { id: 'stt-rt-v5', label: 'stt-rt-v5' }] },
  { id: 'sarvam', name: 'Sarvam', models: [{ id: 'saaras', label: 'Saaras' }, { id: 'sarika', label: 'Sarika' }] },
  { id: 'deepgram', name: 'Deepgram', models: [{ id: 'nova-2', label: 'Nova-2' }, { id: 'nova-3', label: 'Nova-3' }] },
  {
    id: 'navana', name: 'Navana', models: [
      { id: 'hi-general-v2-8khz', label: 'hi-general-v2-8khz' },
      { id: 'ta-general-v2-8khz', label: 'ta-general-v2-8khz' },
      { id: 'kn-general-v2-8khz', label: 'kn-general-v2-8khz' },
      { id: 'te-general-v2-8khz', label: 'te-general-v2-8khz' },
      { id: 'ml-general-v2-8khz', label: 'ml-general-v2-8khz' },
    ],
  },
  { id: 'elevenlabs-stt', name: 'ElevenLabs', models: [{ id: 'scribe_v2_realtime', label: 'scribe_v2_realtime' }] },
  { id: 'assemblyai', name: 'AssemblyAI', models: [{ id: 'universal', label: 'Universal' }] },
]

const ELEVENLABS_VOICE_NAMES = [
  'Raju', 'Raju - Hinglish', 'Niraj', 'Shiv', 'Muthu', 'Rohit', 'Ramaa', 'Kathiravan', 'Bhuvan', 'Arjun', 'Samay',
  'Vedant', 'Sundar - Malaysian', 'Aarush', 'Parth', 'Vikram', 'Anant - BFSI', 'Vihan - BFSI', 'Viraj', 'Raj',
  'Zeeshan', 'Adarsh - BFSI', 'Krishna', 'Anika', 'Riya', 'Naina', 'Anushri', 'Aaira', 'Zina', 'Sia', 'Aisha',
  'Zara', 'Arfha', 'Monika', 'Priya', 'Danielle', 'Samitha', 'Ivanna', 'Alexandra', 'Anika - Reassuring',
  'Sushmita', 'Maya - Malaysian', 'Saavi', 'Nisha', 'Sia - Friendly', 'Zara - Calm', 'Shakuntala', 'Tia Mirza',
  'Shruti M', 'Kanika', 'Karthika', 'Anika - BFSI', 'Gargi - Ecommerce',
]

const MALE_HINTS = ['Raju', 'Niraj', 'Shiv', 'Muthu', 'Rohit', 'Kathiravan', 'Bhuvan', 'Arjun', 'Samay', 'Vedant', 'Sundar', 'Aarush', 'Parth', 'Vikram', 'Anant', 'Vihan', 'Viraj', 'Raj', 'Zeeshan', 'Adarsh', 'Krishna']

function inferGender(name: string): 'female' | 'male' {
  return MALE_HINTS.some((hint) => name.startsWith(hint)) ? 'male' : 'female'
}

function inferStyle(name: string): string | undefined {
  const match = name.match(/ - (.+)$/)
  return match ? match[1] : undefined
}

export const TTS_PROVIDERS: TtsProviderOption[] = [
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    voices: ELEVENLABS_VOICE_NAMES.map((name, i) => ({
      id: `el_${i}`,
      name,
      language: 'en-IN',
      gender: inferGender(name),
      style: inferStyle(name),
    })),
  },
  { id: 'soniox-tts', name: 'Soniox', voices: [] },
  { id: 'murf', name: 'Murf', voices: [{ id: 'murf_1', name: 'Aditi', language: 'en-IN', gender: 'female' }, { id: 'murf_2', name: 'Rahul', language: 'en-IN', gender: 'male' }] },
  { id: 'sarvam-tts', name: 'Sarvam', voices: [{ id: 'sarvam_1', name: 'Meera', language: 'hi-IN', gender: 'female' }] },
  { id: 'google', name: 'Google', voices: [{ id: 'google_1', name: 'Wavenet A', language: 'en-IN', gender: 'female' }, { id: 'google_2', name: 'Wavenet B', language: 'en-IN', gender: 'male' }] },
  { id: 'polly', name: 'Polly', voices: [{ id: 'polly_1', name: 'Aditi', language: 'en-IN', gender: 'female' }] },
  { id: 'cartesia', name: 'Cartesia', voices: [{ id: 'cartesia_1', name: 'Sonic', language: 'en-IN', gender: 'neutral' }] },
]
