import type { SimulatorResult, SimulatorScenario } from '@/types'

export const mockScenarioResults: Record<SimulatorScenario, SimulatorResult> = {
  faq: {
    outcome: 'pass',
    transcript: [
      { id: 's1', speaker: 'customer', text: 'Hi, do you offer BIS hallmark certification on all your gold jewellery?', timestamp: '2026-08-17T10:00:00Z' },
      { id: 's2', speaker: 'ai', text: 'Yes, every gold piece we sell is BIS hallmarked with purity certification included at the time of purchase.', timestamp: '2026-08-17T10:00:06Z' },
      { id: 's3', speaker: 'customer', text: 'Perfect, thank you!', timestamp: '2026-08-17T10:00:12Z' },
    ],
  },
  booking: {
    outcome: 'pass',
    transcript: [
      { id: 's1', speaker: 'customer', text: "I'd like to book a bridal consultation this weekend.", timestamp: '2026-08-17T10:00:00Z' },
      { id: 's2', speaker: 'ai', text: 'I have a slot this Saturday at 3 PM at our Anna Nagar store — would that work?', timestamp: '2026-08-17T10:00:08Z' },
      { id: 's3', speaker: 'customer', text: 'Yes, that works.', timestamp: '2026-08-17T10:00:14Z' },
      { id: 's4', speaker: 'ai', text: "Booked! You'll receive an SMS confirmation shortly.", timestamp: '2026-08-17T10:00:20Z' },
    ],
  },
  cancellation: {
    outcome: 'pass',
    transcript: [
      { id: 's1', speaker: 'customer', text: 'I need to cancel order A4501, it hasn\'t shipped yet.', timestamp: '2026-08-17T10:00:00Z' },
      { id: 's2', speaker: 'ai', text: 'I\'ve confirmed order A4501 has not shipped. Cancelling now and initiating your refund.', timestamp: '2026-08-17T10:00:10Z' },
      { id: 's3', speaker: 'customer', text: 'Great, thanks.', timestamp: '2026-08-17T10:00:16Z' },
    ],
  },
  unknown_question: {
    outcome: 'needs_review',
    transcript: [
      { id: 's1', speaker: 'customer', text: 'Can you tell me the resale value trend for platinum over the last decade?', timestamp: '2026-08-17T10:00:00Z' },
      { id: 's2', speaker: 'ai', text: "I'm not fully sure about that — let me connect you with a team member who can help.", timestamp: '2026-08-17T10:00:12Z' },
    ],
    failedStep: 'Intent recognized, but no knowledge source covers historical platinum pricing trends.',
    configurationSuggestion: 'Add a market pricing knowledge source, or scope this question type to an explicit fallback response.',
  },
  api_failure: {
    outcome: 'needs_review',
    transcript: [
      { id: 's1', speaker: 'customer', text: 'Can you check the status of order A4290?', timestamp: '2026-08-17T10:00:00Z' },
      { id: 's2', speaker: 'ai', text: 'One moment while I look that up…', timestamp: '2026-08-17T10:00:05Z' },
      { id: 's3', speaker: 'ai', text: "I'm having trouble accessing order records right now — let me connect you with a team member who can help.", timestamp: '2026-08-17T10:00:14Z' },
    ],
    failedStep: 'Tool call "Check Order Status" timed out after 8s.',
    toolResult: 'Error: order-service request timed out (simulated failure)',
    configurationSuggestion: 'Add a retry policy for the order lookup tool, or lower the escalation timeout threshold.',
  },
  human_escalation: {
    outcome: 'pass',
    transcript: [
      { id: 's1', speaker: 'customer', text: 'I want to speak to a real person, please.', timestamp: '2026-08-17T10:00:00Z' },
      { id: 's2', speaker: 'ai', text: "Of course — transferring you to our customer care team now.", timestamp: '2026-08-17T10:00:06Z' },
    ],
  },
}
