import { voiceAgentBuilderService } from '@/services/api'
import { useAsync } from './useAsync'

export function useVoiceAgents() {
  return useAsync(() => voiceAgentBuilderService.listVoiceAgents(), [])
}

/** Real, curated provider/model/voice catalog (OpenAI Realtime, OpenAI/
 * ElevenLabs/Sarvam custom STT+TTS) — see
 * app/ai_employees/voice/providers/catalog.py. Replaces the previous
 * hardcoded fake catalog (services/mock/data/jaan/providerCatalog.ts). */
export function useProviderCatalog() {
  return useAsync(() => voiceAgentBuilderService.getProviderCatalog(), [])
}

/** Real outbound caller ID(s) configured for this deployment — see
 * app/ai_employees/voice/api/builder_routes.py's GET /outbound-numbers.
 * Empty (never fabricated) when VOICE_OUTBOUND_CALLER_ID isn't set. */
export function useOutboundNumbers() {
  return useAsync(() => voiceAgentBuilderService.getOutboundNumbers(), [])
}

export function useVoiceAgent(id: string) {
  return useAsync(() => voiceAgentBuilderService.getVoiceAgent(id), [id])
}

export function useReplayConversations(agentId: string) {
  return useAsync(() => voiceAgentBuilderService.listReplayConversations(agentId), [agentId])
}

export function useReplayConversation(id: string, agentId: string) {
  return useAsync(() => voiceAgentBuilderService.getReplayConversation(id, agentId), [id, agentId])
}
