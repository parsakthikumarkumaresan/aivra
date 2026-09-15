import type { JaanToolLogEntry, ApiWebhookLogEntry, LibraryLogEntry, AudioIngestionEntry } from '@/types'

export const mockToolLogs: JaanToolLogEntry[] = [
  { id: 'tl_1', toolName: 'Search Products', agentId: 'va_acme_jewellery', agentName: 'Acme Jewellery AI Customer Assistant', timestamp: '2026-09-14T09:12:00Z', validArgs: true, duplicate: false, success: true, latencyMs: 320, conversationId: 'call_1', callSid: 'CA1a2b3c', requestArgs: '{"category":"necklace","max_price":80000}', response: '{"products":[...],"total_matches":6}', retryCount: 0 },
  { id: 'tl_2', toolName: 'Check Availability', agentId: 'va_acme_jewellery', agentName: 'Acme Jewellery AI Customer Assistant', timestamp: '2026-09-14T09:20:00Z', validArgs: true, duplicate: false, success: false, latencyMs: 1420, conversationId: 'call_2', callSid: 'CA4d5e6f', requestArgs: '{"date":"2026-09-20","location":"Chennai"}', response: '', error: 'Upstream timeout after 1400ms', retryCount: 2 },
  { id: 'tl_3', toolName: 'Check Availability', agentId: 'va_grand_hotel', agentName: 'Grand Hotel Booking Assistant', timestamp: '2026-09-13T15:02:00Z', validArgs: true, duplicate: true, success: true, latencyMs: 210, conversationId: 'call_3', callSid: 'CA7g8h9i', requestArgs: '{"check_in":"2026-10-01","check_out":"2026-10-03"}', response: '{"available":true,"rate":8500}', retryCount: 0 },
  { id: 'tl_4', toolName: 'Create Booking', agentId: 'va_grand_hotel', agentName: 'Grand Hotel Booking Assistant', timestamp: '2026-09-13T15:04:00Z', validArgs: false, duplicate: false, success: false, latencyMs: 85, conversationId: 'call_3', callSid: 'CA7g8h9i', requestArgs: '{"guest_name":""}', response: '', error: 'Missing required field: guest_name', retryCount: 0 },
]

export const mockApiWebhookLogs: ApiWebhookLogEntry[] = [
  { id: 'wh_1', endpoint: 'https://hooks.acmecorp.com/voice-call-end', method: 'POST', timestamp: '2026-09-14T09:14:00Z', statusCode: 200, latencyMs: 180, request: '{"call_id":"call_1","outcome":"resolved"}', response: '{"ok":true}', agentId: 'va_acme_jewellery', agentName: 'Acme Jewellery AI Customer Assistant', conversationId: 'call_1', deliveryStatus: 'delivered', retries: 0 },
  { id: 'wh_2', endpoint: 'https://hooks.acmecorp.com/voice-call-end', method: 'POST', timestamp: '2026-09-13T15:06:00Z', statusCode: 502, latencyMs: 2200, request: '{"call_id":"call_3","outcome":"booked"}', response: '', agentId: 'va_grand_hotel', agentName: 'Grand Hotel Booking Assistant', conversationId: 'call_3', deliveryStatus: 'retrying', retries: 2, error: 'Bad Gateway' },
  { id: 'wh_3', endpoint: 'https://hooks.aivra.internal/agent-events', method: 'POST', timestamp: '2026-09-12T11:00:00Z', statusCode: 200, latencyMs: 95, request: '{"event":"agent_published"}', response: '{"ok":true}', agentId: 'va_acme_jewellery', agentName: 'Acme Jewellery AI Customer Assistant', deliveryStatus: 'delivered', retries: 0 },
]

export const mockLibraryLogs: LibraryLogEntry[] = [
  { id: 'll_1', documentName: 'Product Catalog 2026.pdf', operation: 'index', agentName: 'Acme Jewellery AI Customer Assistant', timestamp: '2026-09-01T10:00:00Z', status: 'success', chunks: 312, embeddings: 312, retrievalLatencyMs: 48 },
  { id: 'll_2', documentName: 'Store Locations & Hours.docx', operation: 'reindex', agentName: 'Acme Jewellery AI Customer Assistant', timestamp: '2026-09-05T08:00:00Z', status: 'success', chunks: 12, embeddings: 12, retrievalLatencyMs: 22 },
  { id: 'll_3', documentName: 'Bridal & Custom Design FAQ.pdf', operation: 'upload', agentName: 'Acme Jewellery AI Customer Assistant', timestamp: '2026-09-10T14:00:00Z', status: 'processing' },
  { id: 'll_4', documentName: 'Cancellation Policy.txt', operation: 'index', agentName: 'Grand Hotel Booking Assistant', timestamp: '2026-08-15T09:00:00Z', status: 'failed', error: 'Unsupported encoding' },
]

export const mockAudioIngestionEntries: AudioIngestionEntry[] = [
  { id: 'ai_1', source: 'Live Call — LiveKit SIP', conversationId: 'call_1', timestamp: '2026-09-14T09:11:00Z', durationSeconds: 184, format: 'PCM 16kHz', processingStatus: 'completed', transcriptionStatus: 'completed', latencyMs: 640 },
  { id: 'ai_2', source: 'Live Call — LiveKit SIP', conversationId: 'call_2', timestamp: '2026-09-14T09:19:00Z', durationSeconds: 96, format: 'PCM 16kHz', processingStatus: 'completed', transcriptionStatus: 'failed', latencyMs: 1120, error: 'STT provider returned empty transcript' },
  { id: 'ai_3', source: 'Live Call — Twilio', conversationId: 'call_3', timestamp: '2026-09-13T15:00:00Z', durationSeconds: 231, format: 'μ-law 8kHz', processingStatus: 'processing', transcriptionStatus: 'processing', latencyMs: 0 },
]
