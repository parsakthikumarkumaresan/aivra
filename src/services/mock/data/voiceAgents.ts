import type { VoiceAgent } from '@/types'

// Two agents across different industries, seeded to demonstrate the builder
// is genuinely industry-agnostic (section 23 of the brief) — same shell,
// same 12 sections, entirely different Prompt/Flow/Context/Library/Tools/
// Voice/Business rules per agent.

const jewelleryAgent: VoiceAgent = {
  id: 'va_acme_jewellery',
  organizationId: 'org_acme',
  employeeId: 'emp_voice',
  name: 'Acme Jewellery AI Customer Assistant',
  industry: 'Jewellery & Retail',
  status: 'live',
  environment: 'production',
  version: 3,
  lastUpdatedAt: '2026-08-17T14:30:00Z',
  assignedPhoneNumberId: 'num_1',
  promptConfig: {
    introMessage: "Hi ${customer_name}, I'm Maya from Acme Jewellery — how can I help you today?",
    delayBeforeSpeakingSeconds: 0,
    allowIntroInterruptions: true,
    systemPrompt: `You are Maya, the AI customer assistant for Acme Jewellery, a premium jewellery retailer with 6 stores across South India.

Role & Persona:
- Warm, knowledgeable jewellery consultant — never pushy.
- Speak like a trusted in-store advisor, not a call-centre script.

Tone & Communication Style:
- Friendly, reassuring, concise. Use ₹ (rupees) for all prices.
- Mirror the customer's language — switch to Hindi if they do.

Business Rules:
- Never quote a final price without confirming current gold rate with the Check Availability tool.
- Custom/bridal orders always require a store visit — offer to book one.

Knowledge Boundaries:
- Only answer from Product Catalog 2026, Store Locations & Hours and the Bridal & Custom Design FAQ.
- If asked about resale value, investment advice or anything outside the catalog, say you're not certain and offer a human follow-up.

Escalation Behavior:
- Any complaint, refund request above ₹50,000, or a customer asking for a human — transfer immediately.

Edge Cases:
- If the caller is verifying an existing order, always confirm order ID and phone number before sharing details.`,
  },
  flowConfig: {
    startNodeId: 'n_greeting',
    nodes: [
      { id: 'n_greeting', type: 'greeting', name: 'Greeting', prompt: 'Deliver the intro message and confirm the caller can hear clearly.', nextNodeIds: ['n_intent'], column: 0, row: 1 },
      { id: 'n_intent', type: 'condition', name: 'Understand Intent', condition: 'Classify: product enquiry, booking, or complaint.', nextNodeIds: ['n_product', 'n_booking', 'n_complaint'], column: 1, row: 1 },
      { id: 'n_product', type: 'prompt', name: 'Product', prompt: 'Ask what category / budget / occasion the customer is looking for.', nextNodeIds: ['n_product_info'], column: 2, row: 0 },
      { id: 'n_booking', type: 'prompt', name: 'Booking', prompt: 'Ask preferred store, date and purpose (bridal, repair, custom design).', nextNodeIds: ['n_availability'], column: 2, row: 1 },
      { id: 'n_complaint', type: 'prompt', name: 'Complaint', prompt: 'Acknowledge and ask for the order ID or issue details.', nextNodeIds: ['n_troubleshoot'], column: 2, row: 2 },
      { id: 'n_product_info', type: 'tool', name: 'Product Info', toolId: 'tool_search_products', prompt: 'Search the catalog and present 2-3 matching options with prices.', nextNodeIds: ['n_end'], column: 3, row: 0 },
      { id: 'n_availability', type: 'tool', name: 'Availability', toolId: 'tool_check_availability', prompt: 'Check store slot availability for the requested date.', nextNodeIds: ['n_confirm'], column: 3, row: 1 },
      { id: 'n_troubleshoot', type: 'prompt', name: 'Troubleshooting', prompt: 'Attempt to resolve; if unresolved or high value, escalate.', nextNodeIds: ['n_transfer'], fallbackNodeId: 'n_transfer', column: 3, row: 2 },
      { id: 'n_end', type: 'end', name: 'End', prompt: 'Thank the customer and close the call.', nextNodeIds: [], column: 4, row: 0 },
      { id: 'n_confirm', type: 'api_action', name: 'Confirm', toolId: 'tool_create_booking', prompt: 'Create the booking and read back the confirmation.', nextNodeIds: [], column: 4, row: 1 },
      { id: 'n_transfer', type: 'transfer', name: 'Human Transfer', prompt: "Let the customer know you're connecting them to a team member.", nextNodeIds: [], column: 4, row: 2 },
    ],
  },
  contextConfig: {
    variables: [
      { id: 'ctx_1', name: 'customer_name', type: 'string', description: "Caller's name, matched from CRM by phone number.", source: 'CRM lookup', required: false, sampleValue: 'Priya' },
      { id: 'ctx_2', name: 'customer_id', type: 'string', description: 'Internal customer record identifier.', source: 'CRM lookup', required: false, sampleValue: 'CUST-88213' },
      { id: 'ctx_3', name: 'order_id', type: 'string', description: 'Order being referenced, if any.', source: 'Collected during call', required: false, sampleValue: 'ORD-10293' },
      { id: 'ctx_4', name: 'booking_id', type: 'string', description: 'Store visit or consultation booking reference.', source: 'Create Booking tool', required: false, sampleValue: 'BKG-4471' },
      { id: 'ctx_5', name: 'customer_type', type: 'string', description: 'Loyalty tier — standard, premium or VIP.', source: 'CRM lookup', required: false, sampleValue: 'premium' },
      { id: 'ctx_6', name: 'language', type: 'string', description: "Caller's preferred language, detected or selected.", source: 'Transcription', required: true, sampleValue: 'hi-IN' },
      { id: 'ctx_7', name: 'previous_intent', type: 'string', description: 'Intent detected on the last call with this customer.', source: 'Call history', required: false, sampleValue: 'booking' },
    ],
  },
  library: { knowledgeSourceIds: ['ks_1', 'ks_2', 'ks_4'] },
  tools: [
    {
      id: 'tool_search_products', name: 'Search Products', description: 'Search the product catalog by category, budget and occasion.', kind: 'api', method: 'GET',
      endpoint: 'https://api.acmecorp.com/v1/products/search', authType: 'api_key', maskedCredential: 'sk_live_••••••••4f2a',
      inputs: [{ name: 'category', type: 'string', required: false }, { name: 'max_price', type: 'number', required: false }, { name: 'occasion', type: 'string', required: false }],
      outputs: [{ name: 'products', type: 'array', required: false }, { name: 'total_matches', type: 'number', required: false }],
      enabled: true,
    },
    {
      id: 'tool_check_availability', name: 'Check Availability', description: 'Check store consultation slot availability for a date.', kind: 'api', method: 'GET',
      endpoint: 'https://api.acmecorp.com/v1/availability', authType: 'bearer', maskedCredential: 'Bearer ••••••••91cd',
      inputs: [{ name: 'date', type: 'date', required: true }, { name: 'location', type: 'string', required: true }, { name: 'service_type', type: 'string', required: false }],
      outputs: [{ name: 'available', type: 'boolean', required: false }, { name: 'slots', type: 'array', required: false }],
      enabled: true,
    },
    {
      id: 'tool_create_booking', name: 'Create Booking', description: 'Book a store consultation or bridal appointment.', kind: 'api', method: 'POST',
      endpoint: 'https://api.acmecorp.com/v1/bookings', authType: 'bearer', maskedCredential: 'Bearer ••••••••91cd',
      inputs: [{ name: 'customer_id', type: 'string', required: true }, { name: 'slot_id', type: 'string', required: true }],
      outputs: [{ name: 'booking_id', type: 'string', required: false }, { name: 'confirmation_sent', type: 'boolean', required: false }],
      enabled: true,
    },
    {
      id: 'tool_cancel_booking', name: 'Cancel Booking', description: 'Cancel an existing store consultation booking.', kind: 'api', method: 'POST',
      endpoint: 'https://api.acmecorp.com/v1/bookings/cancel', authType: 'bearer', maskedCredential: 'Bearer ••••••••91cd',
      inputs: [{ name: 'booking_id', type: 'string', required: true }],
      outputs: [{ name: 'cancelled', type: 'boolean', required: false }],
      enabled: true,
    },
    {
      id: 'tool_create_ticket', name: 'Create Support Ticket', description: 'Log a complaint or issue for human follow-up.', kind: 'api', method: 'POST',
      endpoint: 'https://api.acmecorp.com/v1/tickets', authType: 'api_key', maskedCredential: 'sk_live_••••••••4f2a',
      inputs: [{ name: 'customer_id', type: 'string', required: true }, { name: 'summary', type: 'string', required: true }, { name: 'priority', type: 'string', required: false }],
      outputs: [{ name: 'ticket_id', type: 'string', required: false }],
      enabled: true,
    },
    {
      id: 'tool_send_sms', name: 'Send SMS', description: 'Send a confirmation or follow-up SMS to the caller.', kind: 'internal', method: 'POST',
      endpoint: 'internal://notifications/sms', authType: 'none',
      inputs: [{ name: 'phone_number', type: 'string', required: true }, { name: 'message', type: 'string', required: true }],
      outputs: [{ name: 'delivered', type: 'boolean', required: false }],
      enabled: true,
    },
    {
      id: 'tool_transfer_call', name: 'Transfer Call', description: 'Transfer the live call to a human agent.', kind: 'transfer', method: 'POST',
      endpoint: 'internal://telephony/transfer', authType: 'none',
      inputs: [{ name: 'destination', type: 'string', required: true }],
      outputs: [{ name: 'transferred', type: 'boolean', required: false }],
      enabled: true,
    },
  ],
  voiceConfig: {
    mode: 'custom',
    realtimeProvider: 'openai',
    realtimeModel: 'gpt-realtime',
    realtimeVoice: 'marin',
    provider: 'elevenlabs',
    model: 'eleven_flash_v2_5',
    language: 'hi-IN',
    gender: 'female',
    voiceName: 'Anika — Reassuring',
    introRing: false,
    backgroundSound: false,
    backgroundSoundId: 'office_ambience',
    backgroundSoundVolume: 0.3,
    textNormalizationPresets: ['emojis', 'symbols', 'devnagari'],
  },
  transcriptionConfig: {
    provider: 'openai',
    model: 'gpt-4o-transcribe',
    languages: ['en-IN', 'hi-IN'],
    turnMode: 'Heuristic',
    fixedSilenceSeconds: 1.0,
    turnSensitivity: 'Medium (ideal for regular conversations)',
    interruptionEnabled: true,
    interruptionSensitivity: 'Medium (ideal for regular conversations)',
    noiseReduction: false,
    languageSwitching: false,
  },
  callEndConfig: {
    endMessage: 'Thank you for calling Acme Jewellery. Have a wonderful day!',
    generateSummary: true,
    extractIntent: true,
    determineOutcome: true,
    updateCrm: true,
    sendNotification: true,
    webhookUrl: 'https://hooks.acmecorp.com/voice-call-end',
  },
  transferConfig: {
    enabled: true,
    conditions: [
      { id: 'tc_1', label: 'Customer requests human', description: 'Caller explicitly asks to speak with a person.', enabled: true },
      { id: 'tc_2', label: 'Agent cannot answer', description: 'Question falls outside knowledge boundaries.', enabled: true },
      { id: 'tc_3', label: 'High-risk request', description: 'Refunds or cancellations above ₹50,000.', enabled: true },
      { id: 'tc_4', label: 'Complaint', description: 'Sentiment analysis detects frustration.', enabled: true },
      { id: 'tc_5', label: 'VIP customer', description: 'customer_type = VIP always routes to a human.', enabled: false },
      { id: 'tc_6', label: 'Business rule', description: 'Custom/bridal orders require a human for final pricing.', enabled: true },
    ],
    destination: '+91 80 4718 2200 (Support Desk)',
    businessHoursOnly: true,
    fallbackMessage: "Our team is currently unavailable — please leave your number and we'll call you back within the hour.",
    timeoutSeconds: 30,
    transferMessage: "I'll connect you with one of our team members now.",
  },
  analysisConfig: {
    intentDetection: true,
    sentimentAnalysis: true,
    resolutionDetection: true,
    summary: true,
    keyTopics: true,
    customFields: [
      { id: 'af_1', name: 'Purchase Intent Strength', description: 'How likely the caller is to purchase within 30 days.', outputType: 'enum' },
      { id: 'af_2', name: 'Mentioned Competitor', description: 'Whether a competing jeweller was mentioned.', outputType: 'boolean' },
    ],
  },
  callActionsConfig: {
    actions: [
      { id: 'ca_1', name: 'Create CRM Ticket', trigger: 'After Call End', destination: 'POST /tickets', payloadFields: ['customer_id', 'summary', 'intent', 'priority'], enabled: true },
      { id: 'ca_2', name: 'Send Booking SMS', trigger: 'Booking Confirmed', destination: 'internal://notifications/sms', payloadFields: ['phone_number', 'booking_id', 'slot_time'], enabled: true },
      { id: 'ca_3', name: 'Update CRM Record', trigger: 'After Call End', destination: 'PUT /crm/customers/{customer_id}', payloadFields: ['customer_id', 'last_contact_reason'], enabled: true },
      { id: 'ca_4', name: 'Notify Store Manager', trigger: 'High-Value Enquiry', destination: 'internal://notifications/email', payloadFields: ['store_id', 'customer_id', 'estimated_value'], enabled: false },
    ],
  },
  advancedConfig: {
    llmProvider: 'OpenAI',
    llmModel: 'gpt-4o-mini',
    temperature: 0.2,
    contextWindowTokens: 128000,
    latencyMode: 'low_latency',
    vadEnabled: true,
    turnDetectionMode: 'Server VAD',
    retryPolicy: 'Exponential backoff, 3 attempts',
    debugMode: false,
    webhookUrl: 'https://hooks.aivra.internal/agent-events',
    environment: 'production',
    runtimeVersion: 'v2.4.1',
  },
  callLimits: {
    voicemailDetectionEnabled: true,
    maxCallDurationSeconds: 600,
    noResponseTimeoutSeconds: 12,
    noResponseMessage: "Sorry, I didn't catch that — are you still there?",
  },
}

const hotelAgent: VoiceAgent = {
  id: 'va_grand_hotel',
  organizationId: 'org_acme',
  employeeId: 'emp_voice',
  name: 'Grand Hotel Booking Assistant',
  industry: 'Hotels & Hospitality',
  status: 'draft',
  environment: 'staging',
  version: 1,
  lastUpdatedAt: '2026-08-10T11:00:00Z',
  promptConfig: {
    introMessage: 'Thanks for calling Grand Hotel, this is Arjun — are you looking to book a stay or check an existing reservation?',
    delayBeforeSpeakingSeconds: 0.5,
    allowIntroInterruptions: true,
    systemPrompt: `You are Arjun, the AI booking assistant for Grand Hotel.

Role & Persona: Professional hotel concierge — efficient and courteous.
Tone: Warm but businesslike. Confirm dates and room types precisely.
Business Rules: Never confirm a booking without checking availability first. Group bookings (5+ rooms) always transfer to a human.
Knowledge Boundaries: Room types, amenities, cancellation policy only.
Escalation Behavior: Complaints, group bookings, and billing disputes transfer immediately.`,
  },
  flowConfig: {
    startNodeId: 'n_greeting',
    nodes: [
      { id: 'n_greeting', type: 'greeting', name: 'Greeting', prompt: 'Deliver the intro message.', nextNodeIds: ['n_intent'], column: 0, row: 0 },
      { id: 'n_intent', type: 'condition', name: 'Understand Intent', condition: 'New booking vs. existing reservation.', nextNodeIds: ['n_booking', 'n_lookup'], column: 1, row: 0 },
      { id: 'n_booking', type: 'prompt', name: 'Collect Stay Details', prompt: 'Ask check-in/out dates, room type and guest count.', nextNodeIds: ['n_availability'], column: 2, row: 0 },
      { id: 'n_lookup', type: 'collect_information', name: 'Lookup Reservation', prompt: 'Ask for booking reference or phone number.', nextNodeIds: ['n_end'], column: 2, row: 1 },
      { id: 'n_availability', type: 'tool', name: 'Check Availability', toolId: 'tool_hotel_availability', prompt: 'Check room availability for the requested dates.', nextNodeIds: ['n_confirm'], column: 3, row: 0 },
      { id: 'n_confirm', type: 'api_action', name: 'Confirm Booking', toolId: 'tool_hotel_booking', prompt: 'Create the booking and read back confirmation.', nextNodeIds: ['n_end'], column: 4, row: 0 },
      { id: 'n_end', type: 'end', name: 'End', prompt: 'Thank the guest and close the call.', nextNodeIds: [], column: 5, row: 0 },
    ],
  },
  contextConfig: {
    variables: [
      { id: 'ctx_1', name: 'guest_name', type: 'string', description: "Caller's name.", source: 'PMS lookup', required: false, sampleValue: 'Arvind' },
      { id: 'ctx_2', name: 'booking_id', type: 'string', description: 'Existing reservation reference.', source: 'Collected during call', required: false, sampleValue: 'GH-3391' },
      { id: 'ctx_3', name: 'room_type', type: 'string', description: 'Requested or booked room category.', source: 'Collected during call', required: false, sampleValue: 'Deluxe Suite' },
      { id: 'ctx_4', name: 'check_in_date', type: 'date', description: 'Requested check-in date.', source: 'Collected during call', required: false, sampleValue: '2026-09-14' },
    ],
  },
  library: { knowledgeSourceIds: [] },
  tools: [
    {
      id: 'tool_hotel_availability', name: 'Check Availability', description: 'Check room availability across dates.', kind: 'api', method: 'GET',
      endpoint: 'https://api.grandhotel.example/v1/availability', authType: 'api_key', maskedCredential: 'sk_live_••••••••7b19',
      inputs: [{ name: 'check_in', type: 'date', required: true }, { name: 'check_out', type: 'date', required: true }, { name: 'room_type', type: 'string', required: false }],
      outputs: [{ name: 'available', type: 'boolean', required: false }, { name: 'rate', type: 'number', required: false }],
      enabled: true,
    },
    {
      id: 'tool_hotel_booking', name: 'Create Booking', description: 'Create a hotel reservation.', kind: 'api', method: 'POST',
      endpoint: 'https://api.grandhotel.example/v1/bookings', authType: 'bearer', maskedCredential: 'Bearer ••••••••2e04',
      inputs: [{ name: 'guest_name', type: 'string', required: true }, { name: 'check_in', type: 'date', required: true }, { name: 'check_out', type: 'date', required: true }],
      outputs: [{ name: 'booking_id', type: 'string', required: false }],
      enabled: true,
    },
  ],
  voiceConfig: {
    mode: 'custom',
    realtimeProvider: 'openai',
    realtimeModel: 'gpt-realtime',
    realtimeVoice: 'cedar',
    provider: 'openai',
    model: 'gpt-4o-mini-tts',
    language: 'en-IN',
    gender: 'male',
    voiceName: 'onyx',
    introRing: true,
    backgroundSound: false,
    backgroundSoundId: 'office_ambience',
    backgroundSoundVolume: 0.3,
    textNormalizationPresets: ['symbols'],
  },
  transcriptionConfig: {
    provider: 'openai',
    model: 'gpt-4o-mini-transcribe',
    languages: ['en-IN'],
    turnMode: 'Heuristic',
    fixedSilenceSeconds: 1.0,
    turnSensitivity: 'Low (ideal for noisy environments)',
    interruptionEnabled: true,
    interruptionSensitivity: 'Low (ideal for noisy environments)',
    noiseReduction: true,
    languageSwitching: false,
  },
  callEndConfig: {
    endMessage: 'Thank you for choosing Grand Hotel — we look forward to hosting you.',
    generateSummary: true,
    extractIntent: true,
    determineOutcome: true,
    updateCrm: false,
    sendNotification: true,
    webhookUrl: '',
  },
  transferConfig: {
    enabled: true,
    conditions: [
      { id: 'tc_1', label: 'Customer requests human', description: 'Caller explicitly asks to speak with a person.', enabled: true },
      { id: 'tc_2', label: 'Agent cannot answer', description: 'Question falls outside knowledge boundaries.', enabled: true },
      { id: 'tc_3', label: 'High-risk request', description: 'Billing disputes or refunds.', enabled: true },
      { id: 'tc_4', label: 'Complaint', description: 'Sentiment analysis detects frustration.', enabled: true },
      { id: 'tc_5', label: 'VIP customer', description: 'Loyalty tier is Platinum.', enabled: false },
      { id: 'tc_6', label: 'Business rule', description: 'Group bookings of 5+ rooms.', enabled: true },
    ],
    destination: '+91 44 2891 0000 (Front Desk)',
    businessHoursOnly: false,
    fallbackMessage: 'All our team members are currently assisting other guests — please leave a message.',
    timeoutSeconds: 25,
    transferMessage: "Let me connect you with our front desk team.",
  },
  analysisConfig: {
    intentDetection: true,
    sentimentAnalysis: true,
    resolutionDetection: true,
    summary: true,
    keyTopics: false,
    customFields: [],
  },
  callActionsConfig: {
    actions: [
      { id: 'ca_1', name: 'Send Booking Confirmation Email', trigger: 'Booking Confirmed', destination: 'internal://notifications/email', payloadFields: ['guest_email', 'booking_id', 'check_in_date'], enabled: true },
    ],
  },
  advancedConfig: {
    llmProvider: 'OpenAI',
    llmModel: 'gpt-4o-mini',
    temperature: 0.3,
    contextWindowTokens: 64000,
    latencyMode: 'balanced',
    vadEnabled: true,
    turnDetectionMode: 'Server VAD',
    retryPolicy: 'Exponential backoff, 2 attempts',
    debugMode: true,
    webhookUrl: '',
    environment: 'staging',
    runtimeVersion: 'v2.4.1',
  },
  callLimits: {
    voicemailDetectionEnabled: false,
    maxCallDurationSeconds: 480,
    noResponseTimeoutSeconds: 15,
    noResponseMessage: 'Are you still on the line?',
  },
}

export const mockVoiceAgents: VoiceAgent[] = [jewelleryAgent, hotelAgent]
