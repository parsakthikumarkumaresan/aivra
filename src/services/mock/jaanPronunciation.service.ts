import type { PronunciationEntry, TextNormalizationRule } from '@/types'
import { mockPronunciationEntries, mockTextNormalizationRules } from './data/jaan/pronunciation'
import { delay, nextId } from './utils'

export const jaanPronunciationService = {
  listEntries(): Promise<PronunciationEntry[]> {
    return delay(mockPronunciationEntries)
  },
  addEntry(input: Omit<PronunciationEntry, 'id'>): Promise<PronunciationEntry> {
    const entry: PronunciationEntry = { ...input, id: nextId('pr') }
    mockPronunciationEntries.push(entry)
    return delay(entry, 350)
  },
  removeEntry(id: string): Promise<void> {
    const i = mockPronunciationEntries.findIndex((e) => e.id === id)
    if (i !== -1) mockPronunciationEntries.splice(i, 1)
    return delay(undefined, 250)
  },
  listNormalizationRules(): Promise<TextNormalizationRule[]> {
    return delay(mockTextNormalizationRules)
  },
  toggleNormalizationRule(id: string, enabled: boolean): Promise<TextNormalizationRule> {
    const rule = mockTextNormalizationRules.find((r) => r.id === id)
    if (!rule) return Promise.reject(new Error(`Rule not found: ${id}`))
    rule.enabled = enabled
    return delay(rule, 250)
  },
}
