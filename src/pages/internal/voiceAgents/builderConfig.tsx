import {
  MessagesSquare,
  Workflow,
  Database,
  BookOpen,
  Wrench,
  Mic2,
  AudioLines,
  PhoneOff,
  PhoneForwarded,
  BarChart3,
  Zap,
  Cpu,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SectionId } from './BuilderTypes'

export interface SectionMeta {
  id: SectionId
  label: string
  icon: LucideIcon
  guideTitle: string
  guideBody: string[]
  internalOnly?: boolean
}

export const BUILDER_SECTIONS: SectionMeta[] = [
  {
    id: 'prompt', label: 'Prompt', icon: MessagesSquare,
    guideTitle: 'Configure personality & behavior',
    guideBody: [
      'Intro Message — the first thing callers hear. Make it welcoming and set clear expectations.',
      "Prompt — the core instruction set: the agent's role and persona, tone, knowledge boundaries, and how to handle edge cases.",
      'Pro tip: include examples of ideal responses and define clear escalation criteria.',
    ],
  },
  {
    id: 'flow', label: 'Flow', icon: Workflow,
    guideTitle: 'Design the conversation path',
    guideBody: [
      'Each node represents one step the agent can take — a prompt, a condition, a tool call, a transfer, or the end of the call.',
      'Branches let the agent take different paths depending on detected intent.',
      'Every non-END node should have a clear next step or fallback.',
    ],
  },
  {
    id: 'context', label: 'Context', icon: Database,
    guideTitle: 'Data available during the call',
    guideBody: [
      'Variables can come from a CRM lookup, be collected during the call, or come from a previous conversation.',
      'Reference any variable in Prompt or Flow with ${variable_name}.',
      'Mark a variable Required only if the agent should always try to collect it.',
    ],
  },
  {
    id: 'library', label: 'Library', icon: BookOpen,
    guideTitle: 'Knowledge the agent can use',
    guideBody: [
      'Sources are shared with Company Brain — the same documents can power both this agent and other AI Employees.',
      'Only sources scoped to Voice are retrievable by this agent.',
      'Stale or failed sources should be re-indexed before going live.',
    ],
  },
  {
    id: 'tools', label: 'Tools', icon: Wrench,
    guideTitle: 'Actions the agent can execute',
    guideBody: [
      'Each tool is one real action — an API call, an internal action, or a transfer.',
      'Credentials are always masked here — never paste a real secret into this prototype.',
      'Test a tool before enabling it in a live flow node.',
    ],
  },
  {
    id: 'voice', label: 'Voice', icon: Mic2,
    guideTitle: 'How the agent sounds',
    guideBody: [
      'Match the voice to the brand — tone, language and gender all shape first impressions.',
      'Text normalization cleans up text before it is spoken (emojis, currency symbols, script conversion).',
      'Preview the voice before assigning it to a live agent.',
    ],
  },
  {
    id: 'transcription', label: 'Transcription', icon: AudioLines,
    guideTitle: 'How the agent listens',
    guideBody: [
      'Turn settings control how confidently the agent decides the caller has finished speaking.',
      'Higher interruption sensitivity feels more natural but can cause the agent to cut in too early.',
      'Enable noise reduction for high-ambient-noise environments like retail floors.',
    ],
  },
  {
    id: 'call-end', label: 'Call End', icon: PhoneOff,
    guideTitle: 'What happens after the call',
    guideBody: [
      'Summary generation and intent extraction run automatically once the call ends.',
      'Post-call webhooks let external systems react the moment a call completes.',
    ],
  },
  {
    id: 'call-transfer', label: 'Call Transfer', icon: PhoneForwarded,
    guideTitle: 'When to hand off to a human',
    guideBody: [
      'Enable only the conditions that make sense for this business — too many transfer triggers undermines the agent.',
      'Business-hours-only transfer requires a fallback message for after-hours calls.',
    ],
  },
  {
    id: 'analysis', label: 'Analysis', icon: BarChart3,
    guideTitle: 'Post-call AI analysis',
    guideBody: [
      'Built-in analyses (intent, sentiment, resolution, summary) run on every call automatically.',
      'Custom fields let you extract business-specific signals, like purchase intent strength.',
    ],
  },
  {
    id: 'call-actions', label: 'Call Actions', icon: Zap,
    guideTitle: 'External systems to notify',
    guideBody: [
      'Actions run automatically when their trigger fires — most commonly "After Call End" or a specific outcome.',
      'Keep payloads minimal — only send what the destination system actually needs.',
    ],
  },
  {
    id: 'advanced', label: 'Advanced', icon: Cpu,
    guideTitle: 'AIVRA internal — runtime configuration',
    guideBody: [
      'These settings affect cost, latency and reliability directly — change with care.',
      'Debug mode adds verbose logging and should be off in production.',
    ],
    internalOnly: true,
  },
]

export function getSectionMeta(id: string): SectionMeta {
  return BUILDER_SECTIONS.find((s) => s.id === id) ?? BUILDER_SECTIONS[0]
}
