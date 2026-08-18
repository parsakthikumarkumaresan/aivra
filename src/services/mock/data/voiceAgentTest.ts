import type { ReplayConversation, TestDebugSnapshot } from '@/types'

// Keyword-matched canned test responses — mirrors the existing Voice
// Simulator's scenario approach (services/mock/data/voice/scenarios.ts).
// Not a real LLM call; a believable, inspectable stand-in so "Test" feels
// real without building agent inference.
export interface TestScenario {
  keywords: string[]
  agentReply: string
  debug: TestDebugSnapshot
}

export const jewelleryTestScenarios: TestScenario[] = [
  {
    keywords: ['diamond', 'ring', 'product', 'gold', 'necklace', 'price'],
    agentReply: 'Yes, we have several diamond rings under ₹1,00,000 — including our Aurora Solitaire and Belle Collection bands. Would you like me to check current availability at your nearest store?',
    debug: { currentNodeName: 'Product Info', toolCalled: 'Search Products', knowledgeRetrieved: 'Product Catalog 2026', contextSnapshot: { customer_name: 'Priya', customer_type: 'premium', language: 'en-IN' } },
  },
  {
    keywords: ['book', 'appointment', 'visit', 'consultation', 'bridal'],
    agentReply: "I'd be happy to book a consultation. I have a slot this Saturday at 3 PM at our Anna Nagar store — would that work for you?",
    debug: { currentNodeName: 'Availability', toolCalled: 'Check Availability', knowledgeRetrieved: undefined, contextSnapshot: { customer_name: 'Priya', booking_id: 'pending', language: 'en-IN' } },
  },
  {
    keywords: ['complaint', 'problem', 'issue', 'refund', 'wrong', 'broken'],
    agentReply: "I'm sorry to hear that. I can see this needs a closer look — let me connect you with one of our team members right away.",
    debug: { currentNodeName: 'Human Transfer', toolCalled: 'Transfer Call', knowledgeRetrieved: undefined, contextSnapshot: { customer_name: 'Priya', order_id: 'ORD-10293', customer_type: 'premium' } },
  },
  {
    keywords: ['hours', 'location', 'store', 'where', 'open'],
    agentReply: 'Our Anna Nagar store is open 10 AM to 8 PM, all days. Would you like directions or the contact number?',
    debug: { currentNodeName: 'Understand Intent', toolCalled: undefined, knowledgeRetrieved: 'Store Locations & Hours', contextSnapshot: { language: 'en-IN' } },
  },
]

export const DEFAULT_TEST_SCENARIO: TestScenario = {
  keywords: [],
  agentReply: "Thanks for sharing that — could you tell me a bit more about what you're looking for today?",
  debug: { currentNodeName: 'Understand Intent', toolCalled: undefined, knowledgeRetrieved: undefined, contextSnapshot: { language: 'en-IN' } },
}

export const mockReplayConversations: ReplayConversation[] = [
  {
    id: 'replay_1042',
    agentId: 'va_acme_jewellery',
    customerName: 'Priya Ramanathan',
    durationSeconds: 272,
    outcome: 'booked',
    startedAt: '2026-08-17T09:30:00Z',
    transcript: [
      { id: 't1', speaker: 'ai', text: "Hi, I'm Maya from Acme Jewellery — how can I help you today?", timestamp: '2026-08-17T09:30:00Z' },
      { id: 't2', speaker: 'customer', text: "Hi, I wanted to ask about bridal collections for a wedding in October.", timestamp: '2026-08-17T09:30:08Z' },
      { id: 't3', speaker: 'ai', text: "Wonderful — congratulations! We have a dedicated bridal collection. Would you like to book a consultation to see pieces in person?", timestamp: '2026-08-17T09:30:16Z' },
      { id: 't4', speaker: 'customer', text: 'Yes, that would be great.', timestamp: '2026-08-17T09:30:24Z' },
      { id: 't5', speaker: 'ai', text: 'I have a slot this Saturday at 3 PM at our Anna Nagar store — does that work?', timestamp: '2026-08-17T09:30:30Z' },
      { id: 't6', speaker: 'customer', text: 'Perfect, please book it.', timestamp: '2026-08-17T09:30:40Z' },
      { id: 't7', speaker: 'ai', text: "Booked! You'll receive an SMS confirmation shortly. Anything else I can help with?", timestamp: '2026-08-17T09:30:48Z' },
      { id: 't8', speaker: 'customer', text: 'No, that\'s all, thank you!', timestamp: '2026-08-17T09:30:54Z' },
    ],
    toolCalls: [
      { id: 'tc1', name: 'Check Availability', input: '{"date":"2026-08-22","location":"Anna Nagar","service_type":"bridal"}', output: '{"available":true,"slots":["15:00","16:30"]}', status: 'success', timestamp: '2026-08-17T09:30:28Z' },
      { id: 'tc2', name: 'Create Booking', input: '{"customer_id":"CUST-88213","slot_id":"slot_9931"}', output: '{"booking_id":"BKG-4471","confirmation_sent":true}', status: 'success', timestamp: '2026-08-17T09:30:44Z' },
    ],
    knowledgeRetrieved: ['Bridal & Custom Design FAQ'],
    timeline: [
      { id: 'tl1', label: 'Call started', timestamp: '2026-08-17T09:30:00Z' },
      { id: 'tl2', label: 'Intent classified: booking', timestamp: '2026-08-17T09:30:10Z' },
      { id: 'tl3', label: 'Tool called: Check Availability', timestamp: '2026-08-17T09:30:28Z' },
      { id: 'tl4', label: 'Tool called: Create Booking', timestamp: '2026-08-17T09:30:44Z' },
      { id: 'tl5', label: 'Call ended — Booked', timestamp: '2026-08-17T09:30:54Z' },
    ],
  },
  {
    id: 'replay_1041',
    agentId: 'va_acme_jewellery',
    customerName: 'Karthik Subramaniam',
    durationSeconds: 145,
    outcome: 'escalated',
    startedAt: '2026-08-16T15:12:00Z',
    transcript: [
      { id: 't1', speaker: 'ai', text: "Hi, I'm Maya from Acme Jewellery — how can I help you today?", timestamp: '2026-08-16T15:12:00Z' },
      { id: 't2', speaker: 'customer', text: 'My order arrived damaged, I want a refund.', timestamp: '2026-08-16T15:12:09Z' },
      { id: 't3', speaker: 'ai', text: "I'm really sorry to hear that. This needs a closer look — let me connect you with one of our team members right away.", timestamp: '2026-08-16T15:12:18Z' },
    ],
    toolCalls: [
      { id: 'tc1', name: 'Transfer Call', input: '{"destination":"+91 80 4718 2200"}', output: '{"transferred":true}', status: 'success', timestamp: '2026-08-16T15:12:20Z' },
    ],
    knowledgeRetrieved: [],
    timeline: [
      { id: 'tl1', label: 'Call started', timestamp: '2026-08-16T15:12:00Z' },
      { id: 'tl2', label: 'Complaint detected — high-risk request', timestamp: '2026-08-16T15:12:12Z' },
      { id: 'tl3', label: 'Transferred to Support Desk', timestamp: '2026-08-16T15:12:20Z' },
    ],
  },
  {
    id: 'replay_1039',
    agentId: 'va_acme_jewellery',
    customerName: 'Deepa Rajan',
    durationSeconds: 98,
    outcome: 'resolved',
    startedAt: '2026-08-15T11:05:00Z',
    transcript: [
      { id: 't1', speaker: 'ai', text: "Hi, I'm Maya from Acme Jewellery — how can I help you today?", timestamp: '2026-08-15T11:05:00Z' },
      { id: 't2', speaker: 'customer', text: 'What are your store hours in Chennai?', timestamp: '2026-08-15T11:05:06Z' },
      { id: 't3', speaker: 'ai', text: 'Our Chennai store is open 10 AM to 8 PM, all days. Anything else I can help with?', timestamp: '2026-08-15T11:05:14Z' },
      { id: 't4', speaker: 'customer', text: 'No, thank you!', timestamp: '2026-08-15T11:05:19Z' },
    ],
    toolCalls: [],
    knowledgeRetrieved: ['Store Locations & Hours'],
    timeline: [
      { id: 'tl1', label: 'Call started', timestamp: '2026-08-15T11:05:00Z' },
      { id: 'tl2', label: 'Knowledge retrieved: Store Locations & Hours', timestamp: '2026-08-15T11:05:10Z' },
      { id: 'tl3', label: 'Call ended — Resolved', timestamp: '2026-08-15T11:05:19Z' },
    ],
  },
]
