import { describe, it, expect } from 'vitest'
import {
  QUOTE_STATUS_LABEL,
  QUOTE_STATUS_TONE,
  QUOTE_CATEGORY_LABEL,
} from './quoteStatusMeta'

describe('Quote Status Metadata', () => {
  it('defines restrained badge tones for every quote lifecycle stage', () => {
    expect(QUOTE_STATUS_TONE.draft).toBe('neutral')
    expect(QUOTE_STATUS_TONE.sent).toBe('info')
    expect(QUOTE_STATUS_TONE.accepted).toBe('success')
    expect(QUOTE_STATUS_TONE.rejected).toBe('danger')
    expect(QUOTE_STATUS_TONE.expired).toBe('neutral')
  })

  it('defines readable labels for all statuses', () => {
    expect(QUOTE_STATUS_LABEL.draft).toBe('Draft')
    expect(QUOTE_STATUS_LABEL.sent).toBe('Sent')
    expect(QUOTE_STATUS_LABEL.accepted).toBe('Accepted')
    expect(QUOTE_STATUS_LABEL.rejected).toBe('Rejected')
    expect(QUOTE_STATUS_LABEL.expired).toBe('Expired')
  })

  it('provides descriptive commercial category names', () => {
    expect(QUOTE_CATEGORY_LABEL.implementation).toContain('Implementation')
    expect(QUOTE_CATEGORY_LABEL.platform).toContain('Platform')
    expect(QUOTE_CATEGORY_LABEL.voice_credits).toContain('Voice Usage')
    expect(QUOTE_CATEGORY_LABEL.integrations).toContain('Integrations')
    expect(QUOTE_CATEGORY_LABEL.development).toContain('Engineering')
  })
})
