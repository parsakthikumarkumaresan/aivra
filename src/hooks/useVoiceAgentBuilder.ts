import { voiceAgentBuilderService } from '@/services/api'
import { useAsync } from './useAsync'

export function useVoiceAgents() {
  return useAsync(() => voiceAgentBuilderService.listVoiceAgents(), [])
}

export function useVoiceAgent(id: string) {
  return useAsync(() => voiceAgentBuilderService.getVoiceAgent(id), [id])
}

export function useReplayConversations(agentId: string) {
  return useAsync(() => voiceAgentBuilderService.listReplayConversations(agentId), [agentId])
}

export function useReplayConversation(id: string) {
  return useAsync(() => voiceAgentBuilderService.getReplayConversation(id), [id])
}
