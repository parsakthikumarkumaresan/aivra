export interface PronunciationEntry {
  id: string
  word: string
  pronunciation: string
  language: string
  notes?: string
}

export type TextNormalizationCategory = 'dates' | 'times' | 'currency' | 'amounts' | 'phone_numbers' | 'addresses' | 'acronyms' | 'custom'

export const TEXT_NORMALIZATION_CATEGORY_LABEL: Record<TextNormalizationCategory, string> = {
  dates: 'Dates',
  times: 'Times',
  currency: 'Currency',
  amounts: 'Amounts',
  phone_numbers: 'Phone Numbers',
  addresses: 'Addresses',
  acronyms: 'Acronyms',
  custom: 'Custom Replacements',
}

export interface TextNormalizationRule {
  id: string
  category: TextNormalizationCategory
  label: string
  example: string
  enabled: boolean
  isPreset: boolean
}
