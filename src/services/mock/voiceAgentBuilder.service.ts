import type { ReplayConversation, TestDebugSnapshot, TranscriptTurn, VoiceAgent } from '@/types'
import { mockVoiceAgents } from './data/voiceAgents'
import { DEFAULT_TEST_SCENARIO, jewelleryTestScenarios, mockReplayConversations } from './data/voiceAgentTest'
import { delay, nextId } from './utils'

function findScenario(agentId: string, text: string) {
  const scenarios = agentId === 'va_acme_jewellery' ? jewelleryTestScenarios : []
  const lower = text.toLowerCase()
  return scenarios.find((s) => s.keywords.some((k) => lower.includes(k))) ?? DEFAULT_TEST_SCENARIO
}

export const voiceAgentBuilderService = {
  listVoiceAgents(): Promise<VoiceAgent[]> {
    return delay(mockVoiceAgents)
  },
  getVoiceAgent(id: string): Promise<VoiceAgent | undefined> {
    return delay(mockVoiceAgents.find((a) => a.id === id))
  },
  // Shallow merge on the top-level section keys — every section of the
  // builder saves its own slice (e.g. { promptConfig: {...} }), consistent
  // with how the rest of the mock layer patches records in place.
  updateVoiceAgent(id: string, patch: Partial<VoiceAgent>): Promise<VoiceAgent> {
    const agent = mockVoiceAgents.find((a) => a.id === id)
    if (!agent) return Promise.reject(new Error(`Voice agent not found: ${id}`))
    Object.assign(agent, patch, { version: agent.version + 1, lastUpdatedAt: new Date().toISOString() })
    return delay(agent, 500)
  },

  // -------------------------------------------------------------------
  // Test — a scripted, keyword-matched stand-in for a live agent call.
  // -------------------------------------------------------------------
  sendTestMessage(agentId: string, userText: string): Promise<{ userTurn: TranscriptTurn; agentTurn: TranscriptTurn; debug: TestDebugSnapshot }> {
    const scenario = findScenario(agentId, userText)
    const now = new Date().toISOString()
    const userTurn: TranscriptTurn = { id: nextId('tt'), speaker: 'customer', text: userText, timestamp: now }
    const agentTurn: TranscriptTurn = { id: nextId('tt'), speaker: 'ai', text: scenario.agentReply, timestamp: now }
    return delay({ userTurn, agentTurn, debug: scenario.debug }, 900)
  },

  // -------------------------------------------------------------------
  // Replay — historical conversations for this agent.
  // -------------------------------------------------------------------
  listReplayConversations(agentId: string): Promise<ReplayConversation[]> {
    return delay(mockReplayConversations.filter((c) => c.agentId === agentId))
  },
  getReplayConversation(id: string): Promise<ReplayConversation | undefined> {
    return delay(mockReplayConversations.find((c) => c.id === id))
  },
}
