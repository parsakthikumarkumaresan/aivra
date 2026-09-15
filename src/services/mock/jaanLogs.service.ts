import type { JaanToolLogEntry, ApiWebhookLogEntry, LibraryLogEntry, AudioIngestionEntry } from '@/types'
import { mockToolLogs, mockApiWebhookLogs, mockLibraryLogs, mockAudioIngestionEntries } from './data/jaan/logs'
import { delay } from './utils'

export const jaanLogsService = {
  listToolLogs(): Promise<JaanToolLogEntry[]> {
    return delay(mockToolLogs)
  },
  listApiWebhookLogs(): Promise<ApiWebhookLogEntry[]> {
    return delay(mockApiWebhookLogs)
  },
  listLibraryLogs(): Promise<LibraryLogEntry[]> {
    return delay(mockLibraryLogs)
  },
  listAudioIngestionLogs(): Promise<AudioIngestionEntry[]> {
    return delay(mockAudioIngestionEntries)
  },
}
