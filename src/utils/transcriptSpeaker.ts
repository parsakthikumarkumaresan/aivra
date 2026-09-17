import { Bot, HelpCircle, Settings, User, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface ResolvedTranscriptSpeaker {
  /** Normalized speaker category — stable across every raw vocabulary variant. */
  kind: 'ai' | 'human' | 'system' | 'tool' | 'unknown'
  label: string
  icon: LucideIcon
  align: 'left' | 'right'
  bubbleClass: string
  avatarClass: string
}

const AI_ALIASES = new Set(['ai', 'assistant', 'agent', 'bot'])
const HUMAN_ALIASES = new Set(['customer', 'user', 'candidate', 'caller', 'human'])
const SYSTEM_ALIASES = new Set(['system'])
const TOOL_ALIASES = new Set(['tool', 'function', 'function_call'])

const AI_CONFIG: Omit<ResolvedTranscriptSpeaker, 'label'> = {
  kind: 'ai',
  icon: Bot,
  align: 'left',
  bubbleClass: 'bg-ink-100 text-ink-800',
  avatarClass: 'bg-brand-100 text-brand-600',
}

const HUMAN_CONFIG: Omit<ResolvedTranscriptSpeaker, 'label'> = {
  kind: 'human',
  icon: User,
  align: 'right',
  bubbleClass: 'bg-brand-600 text-white',
  avatarClass: 'bg-ink-100 text-ink-600',
}

const SYSTEM_CONFIG: Omit<ResolvedTranscriptSpeaker, 'label'> = {
  kind: 'system',
  icon: Settings,
  align: 'left',
  bubbleClass: 'bg-warning-50 text-warning-700',
  avatarClass: 'bg-warning-100 text-warning-600',
}

const TOOL_CONFIG: Omit<ResolvedTranscriptSpeaker, 'label'> = {
  kind: 'tool',
  icon: Wrench,
  align: 'left',
  bubbleClass: 'bg-ink-50 text-ink-600',
  avatarClass: 'bg-ink-100 text-ink-500',
}

// Deliberately distinct from every known category so an unrecognized or
// missing role is always visibly "unusual" rather than silently mis-styled
// as one of the real categories — and, crucially, never crashes.
const UNKNOWN_CONFIG: Omit<ResolvedTranscriptSpeaker, 'label'> = {
  kind: 'unknown',
  icon: HelpCircle,
  align: 'left',
  bubbleClass: 'bg-ink-50 text-ink-500 border border-dashed border-ink-200',
  avatarClass: 'bg-ink-100 text-ink-400',
}

/**
 * Normalizes the many raw speaker vocabularies actually emitted across the
 * platform (Jaan's live worker: "assistant"/"customer"; its historical
 * duplicate-turn bug: "user"; the simulator: "agent"; HR's own mapper:
 * "ai"/"candidate"/"system") into one resolved, render-safe shape. Every
 * branch — including a completely unknown or missing value — returns a
 * real config object, so callers never need an optional-chaining guard and
 * a call's real messages are never hidden.
 */
export function resolveTranscriptSpeaker(
  rawSpeaker: string | null | undefined,
): ResolvedTranscriptSpeaker {
  const normalized = (rawSpeaker ?? '').trim().toLowerCase()

  if (AI_ALIASES.has(normalized)) return { ...AI_CONFIG, label: 'AI' }
  if (HUMAN_ALIASES.has(normalized)) return { ...HUMAN_CONFIG, label: 'Caller' }
  if (SYSTEM_ALIASES.has(normalized)) return { ...SYSTEM_CONFIG, label: 'System' }
  if (TOOL_ALIASES.has(normalized)) return { ...TOOL_CONFIG, label: 'Tool' }

  return {
    ...UNKNOWN_CONFIG,
    label: rawSpeaker ? `Unknown (${rawSpeaker})` : 'Unknown speaker',
  }
}
