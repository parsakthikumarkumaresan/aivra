import type { PronunciationEntry, TextNormalizationRule } from '@/types'

export const mockPronunciationEntries: PronunciationEntry[] = [
  { id: 'pr_1', word: 'JEXA', pronunciation: 'JEK-suh', language: 'en-IN', notes: 'Company/platform name.' },
  { id: 'pr_2', word: 'Jaan', pronunciation: 'JAAN (rhymes with "on")', language: 'en-IN', notes: 'Voice AI employee name.' },
  { id: 'pr_3', word: 'Muthu', pronunciation: 'MOO-thoo', language: 'ta-IN' },
  { id: 'pr_4', word: 'Kathiravan', pronunciation: 'KA-thi-ra-van', language: 'ta-IN' },
  { id: 'pr_5', word: 'GST', pronunciation: 'G S T (spelled out)', language: 'en-IN', notes: 'Acronym — always spell out, never read as a word.' },
]

export const mockTextNormalizationRules: TextNormalizationRule[] = [
  { id: 'tn_1', category: 'dates', label: 'Spoken date format', example: '14/09/2026 → "fourteenth of September, twenty twenty-six"', enabled: true, isPreset: true },
  { id: 'tn_2', category: 'times', label: '24-hour to spoken time', example: '18:30 → "half past six in the evening"', enabled: true, isPreset: true },
  { id: 'tn_3', category: 'currency', label: 'Rupee amounts', example: '₹52,000 → "fifty-two thousand rupees"', enabled: true, isPreset: true },
  { id: 'tn_4', category: 'amounts', label: 'Large numbers', example: '1,20,000 → "one lakh twenty thousand"', enabled: true, isPreset: true },
  { id: 'tn_5', category: 'phone_numbers', label: 'Digit-by-digit phone numbers', example: '9876543210 → "nine eight seven six five four three two one zero"', enabled: true, isPreset: true },
  { id: 'tn_6', category: 'acronyms', label: 'Spell out acronyms', example: 'EMI → "E M I"', enabled: true, isPreset: true },
  { id: 'tn_7', category: 'addresses', label: 'Address abbreviation expansion', example: 'St. → "Street"', enabled: false, isPreset: true },
  { id: 'tn_8', category: 'custom', label: 'Replace "Acme Corp" with "Acme Jewellery"', example: 'Acme Corp → Acme Jewellery', enabled: true, isPreset: false },
]
