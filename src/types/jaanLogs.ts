// Cross-cutting log views (Logs > Tools / API & Webhook / Library / Audio
// Ingestion). Conversation logs reuse the existing Call/TranscriptTurn types
// from types/voice.ts and types/hr.ts rather than duplicating them.

export interface JaanToolLogEntry {
  id: string
  toolName: string
  agentId: string
  agentName: string
  timestamp: string
  validArgs: boolean
  duplicate: boolean
  success: boolean
  latencyMs: number
  conversationId: string
  callSid: string
  requestArgs: string
  response: string
  error?: string
  retryCount: number
}

export type WebhookDeliveryStatus = 'delivered' | 'failed' | 'retrying'

export interface ApiWebhookLogEntry {
  id: string
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  timestamp: string
  statusCode: number
  latencyMs: number
  request: string
  response: string
  agentId: string
  agentName: string
  conversationId?: string
  deliveryStatus: WebhookDeliveryStatus
  retries: number
  error?: string
}

export type LibraryLogOperation = 'upload' | 'index' | 'reindex' | 'delete' | 'retrieve'
export type LibraryLogStatus = 'success' | 'processing' | 'failed'

export interface LibraryLogEntry {
  id: string
  documentName: string
  operation: LibraryLogOperation
  agentName: string
  timestamp: string
  status: LibraryLogStatus
  chunks?: number
  embeddings?: number
  retrievalLatencyMs?: number
  error?: string
}

export type AudioIngestionStatus = 'processing' | 'completed' | 'failed'

export interface AudioIngestionEntry {
  id: string
  source: string
  conversationId: string
  timestamp: string
  durationSeconds: number
  format: string
  processingStatus: AudioIngestionStatus
  transcriptionStatus: AudioIngestionStatus
  latencyMs: number
  error?: string
}
